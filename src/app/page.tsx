'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Landing from '@/components/Landing'
import AppSplash from '@/components/AppSplash'

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export default function Root() {
  const router = useRouter()
  const [showLanding, setShowLanding] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function check() {
      // App instalado (PWA/TWA): mantém o fluxo direto de sempre, sem landing.
      if (isStandalone()) {
        const seen = localStorage.getItem('onboarding_done')
        router.replace(seen ? '/mapa' : '/onboarding')
        return
      }

      // Navegador (desktop ou celular): usuário já logado vai direto para o mapa.
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      if (session) {
        router.replace('/mapa')
        return
      }

      setShowLanding(true)
    }

    check()
    return () => { cancelled = true }
  }, [router])

  if (!showLanding) return <AppSplash />
  return <Landing />
}
