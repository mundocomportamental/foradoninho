'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/locais', label: 'Locais', icon: '📍' },
  { href: '/admin/profissionais', label: 'Profissionais', icon: '👩‍⚕️' },
  { href: '/admin/usuarios', label: 'Usuários', icon: '👥' },
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font)' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {status === 'checking' ? 'Verificando acesso…' : 'Acesso restrito.'}
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', background: 'var(--bg)', fontFamily: 'var(--font)' }}>
      <style>{`
        .admin-sidebar { display: none; }
        .admin-topbar { display: flex; }
        @media (min-width: 880px) {
          .admin-sidebar { display: flex; }
          .admin-topbar { display: none; }
        }
      `}</style>

      {/* Sidebar — desktop */}
      <aside className="admin-sidebar" style={{
        width: 220, flexShrink: 0, flexDirection: 'column',
        background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
        padding: '20px 14px', height: '100%',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', marginBottom: 24 }}>
          <span style={{ fontSize: 20 }}>🛠️</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>Painel Admin</span>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          {NAV.map(item => {
            const active = item.href === '/admin' ? path === '/admin' : path.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: 14, fontWeight: 700,
                textDecoration: 'none',
                background: active ? 'var(--green-soft)' : 'transparent',
                color: active ? 'var(--green-dark)' : 'var(--text-secondary)',
              }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <Link href="/perfil" style={{
          display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)',
          textDecoration: 'none', fontSize: 13, fontWeight: 600, padding: '10px 12px',
        }}>
          ← Voltar ao app
        </Link>
      </aside>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Top bar — mobile */}
        <header className="admin-topbar" style={{
          borderBottom: '1px solid var(--border)', background: 'var(--bg-card)',
          padding: '14px 16px', alignItems: 'center', gap: 16, flexWrap: 'wrap', flexShrink: 0,
        }}>
          <Link href="/perfil" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
            ← Voltar
          </Link>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>🛠️ Painel Admin</div>
          <nav style={{ display: 'flex', gap: 4, marginLeft: 'auto', flexWrap: 'wrap' }}>
            {NAV.map(item => {
              const active = item.href === '/admin' ? path === '/admin' : path.startsWith(item.href)
              return (
                <Link key={item.href} href={item.href} style={{
                  padding: '7px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 700,
                  textDecoration: 'none',
                  background: active ? 'var(--green-soft)' : 'transparent',
                  color: active ? 'var(--green-dark)' : 'var(--text-muted)',
                }}>
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </header>

        {/* Área com scroll próprio — o app inteiro roda com html/body overflow:hidden
            (padrão de PWA mobile), então essa div precisa fornecer sua própria
            barra de rolagem pra funcionar em telas de desktop com mouse/trackpad. */}
        <main style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 60px' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
