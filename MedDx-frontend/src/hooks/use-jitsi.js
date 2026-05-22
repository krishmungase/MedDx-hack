import { useEffect, useRef, useState } from 'react'

const SCRIPT_URL = 'https://meet.jit.si/external_api.js'
const DOMAIN = 'meet.jit.si'

let loadingPromise = null
const ensureScript = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'))
  if (window.JitsiMeetExternalAPI) return Promise.resolve()
  if (loadingPromise) return loadingPromise
  loadingPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT_URL
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => {
      loadingPromise = null
      reject(new Error('Failed to load Jitsi script'))
    }
    document.head.appendChild(s)
  })
  return loadingPromise
}

/**
 * Mounts a Jitsi Meet room into the given container ref.
 *
 * @param {Object} opts
 * @param {string} opts.roomName     — e.g. "meddx-<appointmentId>"
 * @param {string} opts.displayName  — user's display name in the call
 * @param {string} [opts.email]      — optional email (used for avatar)
 * @param {Function} [opts.onReady]  — called once the conference loads
 * @param {Function} [opts.onLeft]   — called when the user hangs up
 * @param {boolean} [opts.enabled]   — set false to defer mounting
 */
const useJitsi = ({
  containerRef,
  roomName,
  displayName,
  email,
  onReady,
  onLeft,
  enabled = true,
} = {}) => {
  const apiRef = useRef(null)
  const [state, setState] = useState({ loading: true, error: null })

  useEffect(() => {
    if (!enabled || !roomName || !containerRef?.current) return
    let cancelled = false

    setState({ loading: true, error: null })
    ensureScript()
      .then(() => {
        if (cancelled || !containerRef.current) return
        const api = new window.JitsiMeetExternalAPI(DOMAIN, {
          roomName,
          parentNode: containerRef.current,
          width: '100%',
          height: '100%',
          userInfo: {
            displayName: displayName || 'MedDx User',
            email: email || undefined,
          },
          configOverwrite: {
            prejoinPageEnabled: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableModeratorIndicator: true,
          },
          interfaceConfigOverwrite: {
            DEFAULT_BACKGROUND: '#0f172a',
            DISABLE_VIDEO_BACKGROUND: false,
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'chat',
              'raisehand',
              'videoquality',
              'filmstrip',
              'tileview',
            ],
          },
        })
        apiRef.current = api

        api.addEventListener('videoConferenceJoined', () => {
          if (!cancelled) {
            setState({ loading: false, error: null })
            onReady?.()
          }
        })
        api.addEventListener('readyToClose', () => {
          if (!cancelled) onLeft?.()
        })
      })
      .catch((err) => {
        if (!cancelled) setState({ loading: false, error: err.message })
      })

    return () => {
      cancelled = true
      try {
        apiRef.current?.dispose()
      } catch {
        // noop
      }
      apiRef.current = null
    }
  }, [enabled, roomName, displayName, email, containerRef])

  const hangup = () => {
    try {
      apiRef.current?.executeCommand('hangup')
    } catch {
      // noop
    }
  }

  return { ...state, hangup }
}

export default useJitsi
