'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FavoritosRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/meus-locais') }, [router])
  return null
}
