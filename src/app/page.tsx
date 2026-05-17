'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Root() {
  const router = useRouter()
  useEffect(() => {
    const seen = localStorage.getItem('onboarding_done')
    if (seen) {
      router.replace('/mapa')
    } else {
      router.replace('/onboarding')
    }
  }, [router])
  return null
}
