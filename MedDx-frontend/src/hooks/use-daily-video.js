import { useEffect, useRef, useState } from 'react'
import DailyIframe from '@daily-co/daily-js'

/**
 * Mounts a Daily.co call iframe into the given containerRef.
 *
 * Why Daily over Jitsi:
 *   - Adaptive bitrate, automatic audio-only fallback when bandwidth tanks
 *   - No moderator-must-be-signed-in wall
 *   - URL + per-user token gates joining (token created server-side)
 */
const useDailyVideo = ({
  containerRef,
  url,
  token,
  displayName,
  onLeft,
  enabled = true,
} = {}) => {
  const callRef = useRef(null)
  const [state, setState] = useState({ loading: true, error: null })

  useEffect(() => {
    if (!enabled || !url || !containerRef?.current) return
    let cancelled = false

    setState({ loading: true, error: null })

    // Daily refuses to create a second frame inside the same parent — defensively
    // destroy any prior instance before mounting.
    try {
      callRef.current?.destroy()
    } catch {
      // noop
    }

    let call
    try {
      call = DailyIframe.createFrame(containerRef.current, {
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: '0',
          background: '#000',
        },
        showLeaveButton: true,
        showFullscreenButton: true,
      })
    } catch (err) {
      setState({ loading: false, error: err?.message || 'Could not start video' })
      return
    }
    callRef.current = call

    call.on('joined-meeting', () => {
      if (!cancelled) setState({ loading: false, error: null })
    })
    call.on('left-meeting', () => {
      if (!cancelled) onLeft?.()
    })
    call.on('error', (e) => {
      if (!cancelled) {
        setState({
          loading: false,
          error: e?.errorMsg || 'Connection error',
        })
      }
    })

    call
      .join({
        url,
        token: token || undefined,
        userName: displayName,
      })
      .then(() => {
        if (!cancelled) setState({ loading: false, error: null })
      })
      .catch((e) => {
        if (!cancelled) {
          setState({ loading: false, error: e?.message || 'Join failed' })
        }
      })

    return () => {
      cancelled = true
      try {
        call.destroy()
      } catch {
        // noop
      }
      callRef.current = null
    }
  }, [enabled, url, token, displayName, containerRef])

  const hangup = () => {
    try {
      callRef.current?.leave()
    } catch {
      // noop
    }
  }

  return { ...state, hangup }
}

export default useDailyVideo
