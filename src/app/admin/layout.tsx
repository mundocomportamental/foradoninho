'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/locais', label: 'Locais' },
  { href: '/admin/profissionais', label: 'Profissionais' },
  { href: '/admin/usuarios', label: 'Usuários' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'checking' | 'ok' | 'forbidden'>('checking')
  const router = useRouter()
  const path = usePathname()
  const supabase = createClient()

  useEffect(() => {
    let cancelled = false
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/onboarding'); return }
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
      if (cancelled) return
      if (data?.is_admin) {
        setStatus('ok')
      } else {
        setStatus('forbidden')
        router.replace('/perfil')
      }
    }
    check()
    return () => { cancelled = true }
  }, [supabase, router])

  if (status !== 'ok') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f19', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          {status === 'checking' ? 'Verificando acesso…' : 'Acesso restrito.'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', fontFamily: 'system-ui, -apple-system, sans-serif', paddingBottom: 40 }}>
      <header style={{ borderBottom: '1px solid #1f2937', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <Link href="/perfil" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
          ← Voltar ao app
        </Link>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>🛠️ Painel Admin</div>
        <nav style={{ display: 'flex', gap: 4, marginLeft: 'auto', flexWrap: 'wrap' }}>
          {NAV.map(item => {
            const active = item.href === '/admin' ? path === '/admin' : path.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
                textDecoration: 'none',
                background: active ? '#1f2937' : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.5)',
              }}>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </header>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
        {children}
      </main>
    </div>
  )
}
