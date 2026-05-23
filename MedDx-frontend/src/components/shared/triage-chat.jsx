import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  History,
  Mic,
  Send,
  ShieldAlert,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'

import { useAuth, useSpeechRecognition } from '@/hooks'
import { useTriageChat } from '@/apis'
import { errorToast } from '@/lib'

const LANG_BCP47 = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
}

/**
 * Gemini-style conversational triage.
 *
 * Light, airy layout with a soft radial blue glow centered behind the
 * interaction zone. A big greeting / current question sits above a pill-
 * shaped chat bar that contains both a mic and text input. Voice is primary;
 * typing always works. State (idle / listening / thinking / speaking) shows
 * in the pill's accent — no separate orb, no dark mode.
 */
const TriageChat = ({ language = 'en', onResult, contextLine = null }) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { step, isLoading } = useTriageChat()

  // History tracks the LLM conversation. The first greeting bubble is
  // client-side only and excluded from what we send to the server.
  const [messages, setMessages] = useState([])
  const [textInput, setTextInput] = useState('')
  const [interim, setInterim] = useState('')
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [finalResult, setFinalResult] = useState(null)

  const inputRef = useRef(null)
  const historyScrollRef = useRef(null)
  const lastSpokenRef = useRef(null)

  // ─── TTS ────────────────────────────────────────────────────────────────
  const speakSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = useCallback(
    (text) => {
      if (!speakSupported || !ttsEnabled || !text) return
      try {
        window.speechSynthesis.cancel()
        const utter = new SpeechSynthesisUtterance(text)
        utter.lang = LANG_BCP47[language] || 'en-IN'
        const voices = window.speechSynthesis.getVoices()
        const match = voices.find((v) => v.lang === utter.lang)
        if (match) utter.voice = match
        utter.rate = 0.95
        utter.pitch = 1
        utter.onstart = () => setIsSpeaking(true)
        utter.onend = () => setIsSpeaking(false)
        utter.onerror = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utter)
      } catch {
        setIsSpeaking(false)
      }
    },
    [language, speakSupported, ttsEnabled],
  )

  useEffect(() => {
    if (!ttsEnabled && speakSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [ttsEnabled, speakSupported])

  // ─── STT ────────────────────────────────────────────────────────────────
  const handleSpeechResult = useCallback((_chunk, { final, full }) => {
    setInterim(full)
    if (final) setTextInput(full)
  }, [])

  const speech = useSpeechRecognition({
    language,
    onResult: handleSpeechResult,
  })

  // ─── Send turn ──────────────────────────────────────────────────────────
  const sendAnswer = useCallback(
    async (rawAnswer) => {
      const answer = String(rawAnswer || '').trim()
      if (!answer || isLoading || finalResult) return

      if (speech.listening) speech.stop()

      const userMsg = { role: 'user', content: answer }
      setMessages((prev) => [...prev, userMsg])
      setTextInput('')
      setInterim('')

      const historyForLlm = [...messages, userMsg]
        .map((m) => ({ role: m.role, content: m.content }))

      let response
      try {
        response = await step({ history: historyForLlm, language })
      } catch (err) {
        errorToast({
          message:
            err?.response?.data?.message ||
            t('triage_chat.error_step', {
              defaultValue:
                'Could not reach the triage assistant. Please try again.',
            }),
        })
        return
      }

      if (response?.type === 'question') {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.question },
        ])
      } else if (response?.type === 'result') {
        setFinalResult({
          triage: response.triage,
          disclaimer: response.disclaimer,
        })
        const reason =
          response.triage?.reason ||
          t('triage_chat.result_default_reason', {
            defaultValue: 'Triage complete.',
          })
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: reason, _verdict: true },
        ])
      }
    },
    [isLoading, finalResult, speech, messages, step, language, t],
  )

  // ─── Auto-speak latest assistant turn ───────────────────────────────────
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'assistant') return
    if (lastSpokenRef.current === last.content) return
    lastSpokenRef.current = last.content
    const id = setTimeout(() => speak(last.content), 60)
    return () => clearTimeout(id)
  }, [messages, speak])

  // ─── Auto-listen after assistant turn ───────────────────────────────────
  useEffect(() => {
    if (finalResult || isLoading) return
    if (!speech.isSupported) return
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'assistant') return
    const id = setTimeout(() => {
      try {
        speech.start()
      } catch {
        /* manual mic still available */
      }
    }, 1100)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, finalResult])

  // ─── Scroll history pane on update ──────────────────────────────────────
  useEffect(() => {
    if (!showHistory) return
    historyScrollRef.current?.scrollTo?.({
      top: historyScrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, showHistory])

  // ─── Bubble result up to host page ──────────────────────────────────────
  const transcript = useMemo(
    () =>
      messages
        .map((m) => {
          const tag = m.role === 'assistant' ? 'Assistant' : 'Patient'
          return `${tag}: ${m.content}`
        })
        .join('\n'),
    [messages],
  )

  const verdictHandled = useRef(false)
  useEffect(() => {
    if (!finalResult || verdictHandled.current) return
    verdictHandled.current = true
    onResult?.({
      triage: finalResult.triage,
      disclaimer: finalResult.disclaimer,
      transcript,
    })
  }, [finalResult, onResult, transcript])

  // ─── Derived ─────────────────────────────────────────────────────────────
  const firstName = (user?.name || '').split(' ')[0] || ''
  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant')

  // Big headline shown above the pill. Empty state -> personal greeting;
  // mid-conversation -> last assistant question; final -> reason.
  const headline = !messages.length
    ? firstName
      ? t('triage_chat.greeting_named', {
          defaultValue: 'Hi {{name}}, how are you feeling?',
          name: firstName,
        })
      : t('triage_chat.greeting', {
          defaultValue: 'How are you feeling today?',
        })
    : lastAssistantMsg?.content || ''

  const onMicTap = () => {
    if (!speech.isSupported) {
      errorToast({
        message: t('triage.mic_unsupported', {
          defaultValue: "Voice input isn't supported in this browser",
        }),
      })
      return
    }
    if (speech.listening) {
      speech.stop()
      if (textInput.trim()) sendAnswer(textInput)
    } else {
      setTextInput('')
      setInterim('')
      speech.start()
    }
  }

  const onSendText = (e) => {
    e?.preventDefault?.()
    sendAnswer(textInput)
  }

  const subtitle = (() => {
    if (isLoading)
      return t('triage_chat.thinking', { defaultValue: 'Thinking…' })
    if (speech.listening)
      return interim
        ? `"${interim}"`
        : t('triage_chat.listening_big', {
            defaultValue: 'Listening… tap when done',
          })
    if (isSpeaking)
      return t('triage_chat.speaking', { defaultValue: 'Speaking…' })
    if (!messages.length)
      return contextLine ||
        t('triage_chat.subtitle', {
          defaultValue: 'Tap the mic and speak. The assistant will ask a few short questions.',
        })
    return null
  })()

  const hasConversation = messages.length > 0

  return (
    <section className="relative isolate flex min-h-[calc(100vh-8rem)] flex-col">
      {/* Soft radial blue bloom (Gemini-style) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 45% at 50% 55%, oklch(0.92 0.06 240 / 0.85) 0%, oklch(0.97 0.02 240 / 0.55) 40%, transparent 75%)',
        }}
        aria-hidden
      />

      {/* Floating top-right controls */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
            showHistory
              ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25'
              : 'bg-card/80 backdrop-blur text-muted-foreground hover:text-foreground border-border'
          }`}
          title={t('triage_chat.history_toggle', {
            defaultValue: 'See full conversation',
          })}
          aria-label={t('triage_chat.history_toggle', {
            defaultValue: 'See full conversation',
          })}
        >
          <History className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setTtsEnabled((v) => !v)}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
            ttsEnabled
              ? 'bg-card/80 backdrop-blur text-foreground border-border'
              : 'bg-card/80 backdrop-blur text-muted-foreground border-border'
          }`}
          title={
            ttsEnabled
              ? t('triage_chat.tts_off', { defaultValue: 'Mute voice' })
              : t('triage_chat.tts_on', { defaultValue: 'Voice on' })
          }
          aria-label={
            ttsEnabled
              ? t('triage_chat.tts_off', { defaultValue: 'Mute voice' })
              : t('triage_chat.tts_on', { defaultValue: 'Voice on' })
          }
        >
          {ttsEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Optional context chip (top-left) */}
      {contextLine && hasConversation && (
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card/80 backdrop-blur border border-border px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
            <Sparkles className="h-3 w-3 text-primary" />
            {contextLine}
          </span>
        </div>
      )}

      {/* ─── Empty state: centered greeting + status hint ────────────────── */}
      {!hasConversation && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 sm:px-10 pt-20 pb-6 text-center">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight text-foreground max-w-3xl leading-tight">
            {headline}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-xl text-sm sm:text-base text-muted-foreground italic">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* ─── Active conversation: scrollable thread ──────────────────────── */}
      {hasConversation && (
        <div
          ref={historyScrollRef}
          className="relative z-10 flex-1 overflow-y-auto pt-20 pb-4 px-5 sm:px-10"
        >
          <div className="mx-auto w-full max-w-3xl space-y-5">
            {messages.map((m, i) => (
              <ChatTurn
                key={i}
                role={m.role}
                content={m.content}
                isLast={i === messages.length - 1}
                onReplay={() => speak(m.content)}
              />
            ))}

            {/* Interim — what the mic is picking up while user is still talking */}
            {speech.listening && interim && (
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-muted/50 px-4 py-2 text-sm italic text-muted-foreground">
                  "{interim}"
                </div>
              </div>
            )}

            {/* Thinking indicator after user sends */}
            {isLoading && (
              <div className="flex items-center gap-1.5 text-muted-foreground pl-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Composer (pinned at the bottom) ─────────────────────────────── */}
      <div className="relative z-10 px-5 sm:px-10 pb-3 pt-2">
        <form onSubmit={onSendText} className="mx-auto w-full max-w-3xl">
          <div
            className={`group relative flex items-center gap-2 rounded-full bg-card pl-5 pr-2 py-2 shadow-[0_10px_30px_-12px_rgba(60,90,200,0.25),0_2px_8px_-2px_rgba(0,0,0,0.05)] border transition-colors ${
              speech.listening
                ? 'border-primary/60 ring-2 ring-primary/20'
                : isLoading
                  ? 'border-primary/40'
                  : 'border-border/70'
            }`}
          >
            <span
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full shrink-0 ${
                speech.listening
                  ? 'bg-destructive/10 text-destructive'
                  : isLoading
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
              }`}
              aria-hidden
            >
              <Sparkles className="h-4 w-4" />
            </span>

            <input
              ref={inputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                !hasConversation
                  ? t('triage_chat.placeholder_intro', {
                      defaultValue: 'Tell us how you are feeling…',
                    })
                  : t('triage_chat.placeholder_answer', {
                      defaultValue: 'Type or speak your answer…',
                    })
              }
              disabled={isLoading || Boolean(finalResult)}
              autoComplete="off"
              className="flex-1 min-w-0 h-11 bg-transparent border-0 outline-none text-base sm:text-lg text-foreground placeholder:text-muted-foreground/70 px-1"
            />

            {textInput.trim() && (
              <button
                type="submit"
                disabled={isLoading || Boolean(finalResult)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/25 disabled:opacity-50 shrink-0"
                aria-label={t('triage_chat.send', { defaultValue: 'Send' })}
              >
                <Send className="h-4 w-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onMicTap}
              disabled={isLoading || Boolean(finalResult)}
              className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full transition-all shrink-0 ${
                speech.listening
                  ? 'bg-destructive text-white shadow-md shadow-destructive/30'
                  : 'bg-foreground text-background hover:scale-105'
              } disabled:opacity-50`}
              aria-label={
                speech.listening
                  ? t('triage.mic_listening', {
                      defaultValue: 'Listening… tap to stop',
                    })
                  : t('triage.mic_start', {
                      defaultValue: 'Speak your symptoms',
                    })
              }
            >
              {speech.listening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-destructive/40 animate-ping" />
                  <span className="absolute inset-1 rounded-full bg-destructive/30 animate-pulse" />
                </>
              )}
              <Mic className="h-4 w-4 relative" />
            </button>
          </div>

          {/* Status / helper line under the pill — replaces the floating hint */}
          <p className="mt-2 text-center text-xs text-muted-foreground/80 min-h-4">
            {hasConversation && subtitle
              ? subtitle
              : speech.isSupported
                ? t('triage_chat.pill_hint', {
                    defaultValue:
                      'Tap the mic to speak, or type. The doctor sees a summary.',
                  })
                : t('triage_chat.text_only_hint', {
                    defaultValue:
                      'Voice not available — type your answer below.',
                  })}
          </p>
        </form>
      </div>

      {/* Disclaimer pinned at very bottom */}
      <footer className="relative z-10 px-5 sm:px-7 pb-5 flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
        <ShieldAlert className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
        <span>
          {t('triage.result_disclaimer', {
            defaultValue:
              'This triage is for guidance only. It is not a diagnosis or a substitute for a doctor.',
          })}
        </span>
      </footer>
    </section>
  )
}

/** A single message in the active conversation thread.
 *  - assistant: plain left-aligned text (Gemini-style, no bubble)
 *  - user:      rounded gray bubble on the right
 */
const ChatTurn = ({ role, content, isLast, onReplay }) => {
  if (role === 'assistant') {
    return (
      <div className="flex items-start gap-3">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0 mt-1">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`whitespace-pre-wrap wrap-break-word ${
              isLast
                ? 'font-display text-lg sm:text-xl leading-snug tracking-tight text-foreground'
                : 'text-sm sm:text-base leading-relaxed text-foreground'
            }`}
          >
            {content}
          </p>
          {onReplay && (
            <button
              type="button"
              onClick={onReplay}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
              title="Replay"
            >
              <Volume2 className="h-3 w-3" />
              Replay
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-muted/70 px-4 py-2 text-sm sm:text-base leading-relaxed text-foreground">
        <p className="whitespace-pre-wrap wrap-break-word">{content}</p>
      </div>
    </div>
  )
}

export default TriageChat
