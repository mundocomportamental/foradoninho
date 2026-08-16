'use client'
import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || posthog.__loaded) return
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      // Pageviews são capturados manualmente pelo PostHogPageView — evita
      // duplicar eventos nas trocas de rota "soft" do App Router.
      capture_pageview: false,
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
