'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RecentesRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/meus-locais') }, [router])
  return null
}
