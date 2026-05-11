'use client'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  display_name: string | null
  username: string | null
  plano: string
}

const MENU_ITEMS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: 'Meus locais',
    count: 6,
    href: '#',
    pro: false,
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    label: 'Meus favoritos',
    count: null,
    href: '/favoritos',
    pro: false,
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    label: 'Minhas rotas salvas',
    count: null,
    href: '#',
    pro: true,
  },
]

const SETTINGS_ITEMS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    label: 'Notificações',
    href: '#',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
    label: 'Modo offline / downloads',
    href: '#',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    label: 'Conta e privacidade',
    href: '#',
  },
]

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [checkins, setCheckins] = useState(0)
  const [avaliacoes, setAvaliacoes] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) setProfile(data as Profile)

        const [c, a] = await Promise.all([
          supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('avaliacoes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        ])
        setCheckins(c.count || 0)
        setAvaliacoes(a.count || 0)
      } else {
        setProfile({ display_name: 'Henry Nasser', username: 'henrynasser', plano: 'gratis' })
        setCheckins(2)
        setAvaliacoes(1)
      }
    }
    load()
  }, [supabase])

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'HN'

  const isPro = profile?.plano === 'viajante' || profile?.plano === 'familia_pro'

  return (
    <div className="app-shell">
      <div className="page">
        <div style={{ padding: '20px 16px 0' }}>
          {/* Profile header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div className="profile-avatar">{initials}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{profile?.display_name || 'Visitante'}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>@{profile?.username || 'usuario'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                {isPro ? (
                  <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--pro)', color: '#7a5000', padding: '2px 8px', borderRadius: 20 }}>
                    {profile?.plano === 'familia_pro' ? 'Família Pro' : 'Viajante'}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Grátis</span>
                )}
                {!isPro && (
                  <Link href="/planos" style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
                    Fazer upgrade
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-value">6</div>
              <div className="stat-label">Locais</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{checkins}</div>
              <div className="stat-label">Check-ins</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{avaliacoes}</div>
              <div className="stat-label">Avaliações</div>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="card" style={{ margin: '0 16px 12px', overflow: 'hidden' }}>
          {MENU_ITEMS.map((item, i) => (
            <Link key={i} href={item.href} className="menu-item">
              <div className="menu-item-icon">{item.icon}</div>
              <span className="menu-item-text">{item.label}</span>
              {item.count !== null && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)', marginRight: 4 }}>{item.count}</span>
              )}
              {item.pro && <span className="menu-item-badge">PRO</span>}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          ))}
        </div>

        {/* Settings */}
        <div className="card" style={{ margin: '0 16px 12px', overflow: 'hidden' }}>
          {SETTINGS_ITEMS.map((item, i) => (
            <Link key={i} href={item.href} className="menu-item">
              <div className="menu-item-icon">{item.icon}</div>
              <span className="menu-item-text">{item.label}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          ))}
          <button className="menu-item" style={{ width: '100%', border: 'none', background: 'none', fontFamily: 'var(--font)', cursor: 'pointer' }}>
            <div className="menu-item-icon" style={{ background: '#fff0f0' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>
            <span className="menu-item-text" style={{ color: '#ef4444' }}>Sair</span>
          </button>
        </div>

        {/* Pro banner */}
        {!isPro && (
          <div className="pro-banner">
            <div className="pro-banner-title">
              <span className="pro-crown">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#e8b84b" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </span>
              Viaje sem limites por R$ 14,90/mês
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Mapa offline, alertas na rota, sem anúncios e locais ilimitados.
            </div>
            <Link href="/planos">
              <button className="btn-primary" style={{ marginTop: 4, fontSize: 13, padding: '11px 20px' }}>
                Ver planos
              </button>
            </Link>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
