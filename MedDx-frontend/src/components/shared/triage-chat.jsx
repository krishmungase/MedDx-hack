import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Loader2,
  Mic,
  MicOff,
  Send,
  ShieldAlert,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSpeechRecognition } from '@/hooks'
import { useTriageChat } from '@/apis'
import { errorToast } from '@/lib'

const LANG_BCP47 = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
}

/**
 * Voice-first conversational triage.
 *
 * Flow:
 *   user speaks main problem → /triage-chat → server returns either a question
 *   or a final result. Question is *spoken aloud* (TTS) AND shown on screen;
 *   recognition then auto-starts (where possible) so the user just speaks.
 *
 * Falls back silently to text when SpeechRecognition / SpeechSynthesis are
 * unavailable. Used by both /patient/triage (Guided voice mode) and
 * /asha/consult/start.
 */
const TriageChat = ({ language = 'en', onResult, contextLine = null }) => {
  const { t } = useTranslation()
  const { step, isLoading } = useTriageChat()

  // Conversation history sent to the LLM. Each entry: { role, content }.
  // The very first assistant turn ("Tell me what's bothering you") is a
  // client-side greeting, not part of history — only the user's first answer
  // is what kicks the LLM off.
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      content: t('triage_chat.opening_prompt', {
        defaultValue: 'Hello — tell me what is bothering you today.',
      }),
      _greeting: true,
    },
  ])
  const [textInput, setTextInput] = useState('')
  const [interim, setInterim] = useState('')
  const [ttsEnabled, setTtsEnabled] = useState(true)
  const [finalResult, setFinalResult] = useState(null)

  const scrollRef = useRef(null)
  const lastSpokenRef = useRef(null)

  // ─── TTS helpers ────────────────────────────────────────────────────────
  const speakSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = useCallback(
    (text) => {
      if (!speakSupported || !ttsEnabled || !text) return
      try {
        window.speechSynthesis.cancel()
        const utter = new SpeechSynthesisUtterance(text)
        utter.lang = LANG_BCP47[language] || 'en-IN'
        // Pick a matching voice if the browser exposes one. If none, the
        // browser still speaks with its default voice — better than silence.
        const voices = window.speechSynthesis.getVoices()
        const match = voices.find((v) => v.lang === utter.lang)
        if (match) utter.voice = match
        utter.rate = 0.95
        utter.pitch = 1
        window.speechSynthesis.speak(utter)
      } catch {
        /* silently degrade — the on-screen text remains readable */
      }
    },
    [language, speakSupported, ttsEnabled],
  )

  // ─── STT helpers ────────────────────────────────────────────────────────
  const handleSpeechResult = useCallback((_chunk, { final, full }) => {
    setInterim(full)
    if (final) {
      // Push final chunk into the textbox so the user can edit/send.
      setTextInput(full)
    }
  }, [])

  const speech = useSpeechRecognition({
    language,
    onResult: handleSpeechResult,
  })

  // ─── Conversation step ──────────────────────────────────────────────────
  const sendAnswer = useCallback(
    async (rawAnswer) => {
      const answer = String(rawAnswer || '').trim()
      if (!answer || isLoading || finalResult) return

      // Stop any active speech recognition.
      if (speech.listening) speech.stop()

      // Optimistically append user message.
      const userMsg = { role: 'user', content: answer }
      setMessages((prev) => [...prev, userMsg])
      setTextInput('')
      setInterim('')

      // Build the LLM history — strip the client-only greeting; the LLM
      // doesn't need that signal.
      const historyForLlm = [...messages, userMsg]
        .filter((m) => !m._greeting)
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
        // Speak the reason aloud so the user hears the verdict.
        const reason =
          response.triage?.reason ||
          t('triage_chat.result_default_reason', {
            defaultValue: 'Triage complete.',
          })
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: reason,
            _verdict: true,
          },
        ])
      }
    },
    [isLoading, finalResult, speech, messages, step, language, t],
  )

  // ─── Auto-speak the latest assistant turn ───────────────────────────────
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'assistant') return
    if (lastSpokenRef.current === last.content) return
    lastSpokenRef.current = last.content
    // Wait a tick so any cancel() takes effect before speak().
    const id = setTimeout(() => speak(last.content), 60)
    return () => clearTimeout(id)
  }, [messages, speak])

  // ─── Auto-listen after assistant turn (when not done) ───────────────────
  useEffect(() => {
    if (finalResult || isLoading) return
    if (!speech.isSupported) return
    const last = messages[messages.length - 1]
    if (!last || last.role !== 'assistant') return
    // Defer ~ time it takes to start speaking the question. Browsers block
    // calling SpeechRecognition.start() in some autoplay-policy contexts,
    // so this is best-effort; the mic button is the explicit fallback.
    const id = setTimeout(() => {
      try {
        speech.start()
      } catch {
        /* user can still tap the mic manually */
      }
    }, 1100)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, finalResult])

  // ─── Scroll to bottom on new message ────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollTo?.({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, interim, isLoading])

  // ─── Final result → bubble up to host page ──────────────────────────────
  const transcript = useMemo(() => {
    return messages
      .filter((m) => !m._greeting)
      .map((m) => {
        const tag =
          m.role === 'assistant' ? 'Assistant' : 'Patient'
        return `${tag}: ${m.content}`
      })
      .join('\n')
  }, [messages])

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

  // ─── Render ─────────────────────────────────────────────────────────────
  const onSendText = (e) => {
    e?.preventDefault?.()
    sendAnswer(textInput)
  }

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
      // If we captured something, auto-send so the flow feels seamless.
      if (textInput.trim()) {
        sendAnswer(textInput)
      }
    } else {
      setTextInput('')
      setInterim('')
      speech.start()
    }
  }

  return (
    <section className="fade-up rounded-3xl border border-border/70 bg-card overflow-hidden shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-6 py-4 border-b border-border/60 bg-linear-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg sm:text-xl tracking-tight leading-none">
              {t('triage_chat.title', {
                defaultValue: 'Guided voice check',
              })}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              {contextLine ||
                t('triage_chat.subtitle', {
                  defaultValue:
                    'Tap the mic and speak. The assistant will ask a few short questions.',
                })}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTtsEnabled((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title={
            ttsEnabled
              ? t('triage_chat.tts_off', { defaultValue: 'Mute voice' })
              : t('triage_chat.tts_on', { defaultValue: 'Voice on' })
          }
        >
          {ttsEnabled ? (
            <Volume2 className="h-3.5 w-3.5" />
          ) : (
            <VolumeX className="h-3.5 w-3.5" />
          )}
          {ttsEnabled
            ? t('triage_chat.tts_label_on', { defaultValue: 'Voice' })
            : t('triage_chat.tts_label_off', { defaultValue: 'Muted' })}
        </button>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="px-4 sm:px-6 py-5 max-h-[420px] overflow-y-auto space-y-3 bg-grain"
      >
        {messages.map((m, i) => (
          <Bubble key={i} role={m.role} onReplay={() => speak(m.content)}>
            {m.content}
          </Bubble>
        ))}
        {interim && speech.listening && (
          <Bubble role="user" interim>
            {interim}
          </Bubble>
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {t('triage_chat.thinking', { defaultValue: 'Thinking…' })}
          </div>
        )}
      </div>

      {/* Composer */}
      {!finalResult && (
        <form
          onSubmit={onSendText}
          className="px-4 sm:px-6 py-4 border-t border-border/60 bg-background space-y-3"
        >
          {/* Big mic */}
          <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={onMicTap}
              disabled={isLoading}
              className={`relative inline-flex h-20 w-20 items-center justify-center rounded-full transition-all shadow-lg ${
                speech.listening
                  ? 'bg-destructive text-white shadow-destructive/30 scale-105'
                  : 'bg-primary text-primary-foreground shadow-primary/25 hover:scale-105'
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
              {speech.listening ? (
                <>
                  <span className="absolute inset-0 rounded-full bg-destructive/50 animate-ping" />
                  <MicOff className="h-7 w-7 relative" />
                </>
              ) : (
                <Mic className="h-7 w-7" />
              )}
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {speech.listening
              ? t('triage.mic_listening', {
                  defaultValue: 'Listening… tap to stop',
                })
              : speech.isSupported
                ? t('triage_chat.mic_hint', {
                    defaultValue:
                      'Tap to speak. Or type below if you prefer.',
                  })
                : t('triage_chat.text_only_hint', {
                    defaultValue:
                      "Voice not available — type your answer below.",
                  })}
          </p>

          {/* Text fallback */}
          <div className="flex items-center gap-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={t('triage_chat.input_placeholder', {
                defaultValue: 'Type your answer…',
              })}
              disabled={isLoading}
              className="h-11 rounded-full"
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={isLoading || !textInput.trim()}
              className="rounded-full h-11 px-5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {t('triage_chat.send', { defaultValue: 'Send' })}
            </Button>
          </div>
        </form>
      )}

      {/* Persistent disclaimer */}
      <footer className="px-5 sm:px-6 py-3 border-t border-border/60 bg-muted/30 flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
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

const Bubble = ({ role, children, interim = false, onReplay }) => {
  const isAssistant = role === 'assistant'
  return (
    <div
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isAssistant
            ? 'bg-card border border-border/60 text-foreground rounded-tl-sm'
            : interim
              ? 'bg-primary/10 text-primary border border-primary/20 italic rounded-tr-sm'
              : 'bg-primary text-primary-foreground rounded-tr-sm'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{children}</p>
        {isAssistant && onReplay && (
          <button
            type="button"
            onClick={onReplay}
            className="mt-1.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-primary transition-colors"
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

export default TriageChat
