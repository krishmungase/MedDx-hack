import { useCallback, useEffect, useRef, useState } from 'react'

const getRecognitionCtor = () => {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

// Map our i18n codes to BCP-47 tags Web Speech accepts.
const LANG_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
}

/**
 * Web Speech API wrapper. Continuous recognition with interim results so the
 * UI can stream text into a textarea as the user speaks. Stops automatically
 * after a long silence (browser default) and exposes a `toggle()` helper.
 *
 * onResult(text, { final, full }) fires for every chunk:
 *   - `text`  is the latest interim/final segment
 *   - `full`  is the entire transcript since `start()`
 *
 * Browsers without the API still let the consumer fall back gracefully —
 * `isSupported` is false and `toggle()` is a no-op.
 */
const useSpeechRecognition = ({ language = 'en', onResult } = {}) => {
  const Ctor = getRecognitionCtor()
  const isSupported = !!Ctor
  const [listening, setListening] = useState(false)
  const [error, setError] = useState(null)
  const recRef = useRef(null)
  const fullRef = useRef('')

  const stop = useCallback(() => {
    try {
      recRef.current?.stop()
    } catch {
      // noop
    }
  }, [])

  const start = useCallback(() => {
    if (!isSupported) return
    if (recRef.current) {
      try {
        recRef.current.stop()
      } catch {
        // noop
      }
    }
    const rec = new Ctor()
    rec.lang = LANG_MAP[language] || 'en-IN'
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1

    fullRef.current = ''

    rec.onresult = (e) => {
      let interim = ''
      let finalChunk = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        const text = r[0]?.transcript || ''
        if (r.isFinal) finalChunk += text
        else interim += text
      }
      if (finalChunk) {
        fullRef.current = (fullRef.current + ' ' + finalChunk).trim()
        onResult?.(finalChunk.trim(), {
          final: true,
          full: fullRef.current,
        })
      } else if (interim) {
        onResult?.(interim.trim(), {
          final: false,
          full: (fullRef.current + ' ' + interim).trim(),
        })
      }
    }
    rec.onerror = (e) => {
      setError(e?.error || 'speech-error')
      setListening(false)
    }
    rec.onend = () => {
      setListening(false)
    }

    try {
      rec.start()
      recRef.current = rec
      setListening(true)
      setError(null)
    } catch (e) {
      setError(e?.message || 'speech-start-error')
    }
  }, [Ctor, isSupported, language, onResult])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, start, stop])

  // Restart the recognizer when the user changes language mid-session.
  useEffect(() => {
    if (listening) {
      stop()
      // Tiny defer so onend fires before we start fresh.
      const id = setTimeout(start, 100)
      return () => clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  useEffect(() => () => stop(), [stop])

  return { isSupported, listening, error, start, stop, toggle }
}

export default useSpeechRecognition
