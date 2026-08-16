'use client'
import { useEffect, useState, useCallback } from 'react'
import { track } from '@vercel/analytics'

function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIOS() {
  if (typeof window === 'undefined') return false
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

function isAndroid() {
  if (typeof window === 'undefined') return false
  return /android/i.test(window.navigator.userAgent)
}

export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    setInstalled(isStandalone())

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredEvent(e)
    }
    const onAppInstalled = () => {
      setInstalled(true)
      setDeferredEvent(null)
      track('pwa_instalado')
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredEvent) return null
    track('pwa_instalar_clicado', { plataforma: isAndroid() ? 'android' : 'desktop' })
    deferredEvent.prompt()
    const choice = await deferredEvent.userChoice
    setDeferredEvent(null)
    return choice
  }, [deferredEvent])

  return {
    installed,
    canPromptNative: !!deferredEvent,
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    promptInstall,
  }
}
