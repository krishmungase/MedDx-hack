import { useEffect, useRef, useState } from 'react'
import DailyIframe from '@daily-co/daily-js'

/**
 * Mounts a Daily.co call iframe into the given containerRef.
 *
 * Daily refuses to have more than one call instance alive per page
 * ("Duplicate DailyIframe instances are not allowed"). Their destroy() is
 * async — React StrictMode mounts the effect twice in dev with a synchronous
 * unmount in between, and the second mount can fire createFrame() before the
 * first destroy resolves.
 *
 * We serialize teardown → next mount via a module-level promise so any newer
 * mount always awaits the previous mount's destroy before creating its own
 * frame. Also defensively kills any stray instance that survived a prior
 * error.
 */

let pendingDestroy = null

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
    let mountedCall = null

    const mount = async () => {
      // Wait for any in-flight destroy from a previous mount/instance.
      if (pendingDestroy) {
        try {
          await pendingDestroy
        } catch {
          // noop
        }
        pendingDestroy = null
      }
      if (cancelled) return

      // Kill any stray instance left over (e.g. from a hot-reload that
      // bypassed our cleanup). Daily exposes getCallInstance() globally.
      const stray = DailyIframe.getCallInstance?.()
      if (stray) {
        try {
          await stray.destroy()
        } catch {
          // noop
        }
      }
      if (cancelled) return

      // Reset container DOM so we don't leave behind half-rendered iframes.
      if (containerRef.current) containerRef.current.innerHTML = ''

      setState({ loading: true, error: null })

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
        if (!cancelled) {
          setState({
            loading: false,
            error: err?.message || 'Could not start video',
          })
        }
        return
      }
      mountedCall = call
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

      try {
        await call.join({
          url,
          token: token || undefined,
          userName: displayName,
        })
        if (!cancelled) setState({ loading: false, error: null })
      } catch (e) {
        if (!cancelled) {
          setState({ loading: false, error: e?.message || 'Join failed' })
        }
      }
    }

    mount()

    return () => {
      cancelled = true
      const callToKill = mountedCall || callRef.current
      if (callToKill) {
        // Park the promise so the next mount can await us.
        pendingDestroy = (async () => {
          try {
            await callToKill.destroy()
          } catch {
            // noop
          }
        })()
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
