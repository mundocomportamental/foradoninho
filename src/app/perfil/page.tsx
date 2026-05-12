'use client'
import { useState, useEffect, useRef } from 'react'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  display_name: string | null
  username: string | null
  avatar_url: string | null
  plano: string
}

function getBadge(total: number): { label: string; color: string; bg: string; icon: string } | null {
  if (total >= 10) return { label: 'Contribuidor Master', color: '#7c3aed', bg: '#f3e8ff', icon: '🏆' }
  if (total >= 5) return { label: 'Contribuidor Top', color: '#d97706', bg: '#fffbeb', icon: '⭐' }
  return null
}

function BadgeProgress({ total }: { total: number }) {
  const next = total < 5 ? 5 : total < 10 ? 10 : null
  if (!next) return null
  const progress = (total / next) * 100
  const label = next === 5 ? 'Contribuidor Top' : 'Contribuidor Master'
  return (
    <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 12, border: '1.5px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Próximo: {label}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{total}/{next} este mês</span>
      </div>
      <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: next === 5 ? '#f59e0b' : '#7c3aed', borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [checkins, setCheckins] = useState(0)
  const [avaliacoes, setAvaliacoes] = useState(0)
  const [monthlyTotal, setMonthlyTotal] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAnuncio, setShowAnuncio] = useState(false)
  const [showSobreNos, setShowSobreNos] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [offlineMsg, setOfflineMsg] = useState(false)
  const [showTermos, setShowTermos] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (data) {
          setProfile(data as Profile)
          setEditName(data.display_name || '')
          setEditUsername(data.username || '')
        }
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)
        const monthISO = startOfMonth.toISOString()

        const [c, a, cm, am] = await Promise.all([
          supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('avaliacoes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', monthISO),
          supabase.from('avaliacoes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', monthISO),
        ])
        setCheckins(c.count || 0)
        setAvaliacoes(a.count || 0)
        setMonthlyTotal((cm.count || 0) + (am.count || 0))
      } else {
        setProfile({ display_name: null, username: null, avatar_url: null, plano: 'gratis' })
      }
    }
    load()
  }, [supabase])

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  async function saveProfile() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('profiles').upsert({
        id: user.id,
        display_name: editName,
        username: editUsername.toLowerCase().replace(/[^a-z0-9_.]/g, '').slice(0, 30),
        updated_at: new Date().toISOString(),
      })
      setProfile(p => p ? { ...p, display_name: editName, username: editUsername } : p)
      setEditMode(false)
    } finally {
      setSaving(false)
    }
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const ext = file.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      await supabase.storage.from('locais-fotos').upload(path, file, { upsert: true })
      const { data: pub } = supabase.storage.from('locais-fotos').getPublicUrl(path)
      if (pub?.publicUrl) {
        await supabase.from('profiles').upsert({ id: user.id, avatar_url: pub.publicUrl })
        setProfile(p => p ? { ...p, avatar_url: pub.publicUrl } : p)
      }
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/onboarding')
  }

  if (!profile) return null

  return (
    <div className="app-shell">
      <div className="page">
        <div style={{ padding: '20px 16px 0' }}>

          {/* Avatar + nome */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div className="profile-avatar" style={{ overflow: 'hidden', background: profile.avatar_url ? 'transparent' : undefined }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initials
                }
              </div>
              {isLoggedIn && (
                <>
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploadingAvatar}
                    style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: 'var(--green)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    {uploadingAvatar
                      ? <div style={{ width: 10, height: 10, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }} />
                      : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    }
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadAvatar} />
                </>
              )}
            </div>

            {editMode ? (
              <div style={{ flex: 1 }}>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Seu nome"
                  style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--green)', borderRadius: 10, padding: '7px 12px', fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', marginBottom: 6, outline: 'none' }}
                />
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13 }}>@</span>
                  <input
                    value={editUsername}
                    onChange={e => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                    placeholder="usuario"
                    style={{ width: '100%', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, padding: '7px 12px 7px 24px', fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{ flex: 1, padding: '9px 0', fontSize: 13 }}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button onClick={() => setEditMode(false)} className="btn-outline" style={{ flex: 1, padding: '9px 0', fontSize: 13 }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>
                    {profile.display_name || (isLoggedIn ? 'Completar perfil' : 'Visitante')}
                  </div>
                  {isLoggedIn && (
                    <button onClick={() => setEditMode(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-muted)', display: 'flex' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  {profile.username ? `@${profile.username}` : isLoggedIn ? 'Toque no ✏ para adicionar @' : ''}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Grátis</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats + Badge */}
          {isLoggedIn && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <div className="stat-card"><div className="stat-value">{checkins}</div><div className="stat-label">Check-ins</div></div>
                <div className="stat-card"><div className="stat-value">{avaliacoes}</div><div className="stat-label">Avaliações</div></div>
                {(() => {
                  const badge = getBadge(monthlyTotal)
                  return badge ? (
                    <div className="stat-card" style={{ background: badge.bg, border: `1.5px solid ${badge.color}20`, flex: 1.5 }}>
                      <div style={{ fontSize: 18 }}>{badge.icon}</div>
                      <div className="stat-label" style={{ color: badge.color, fontWeight: 700, fontSize: 11 }}>{badge.label}</div>
                    </div>
                  ) : null
                })()}
              </div>
              <BadgeProgress total={monthlyTotal} />
            </div>
          )}

          {/* CTA para login */}
          {!isLoggedIn && (
            <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--green-soft)', borderRadius: 14, border: '1.5px solid var(--green-light)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--green-dark)', marginBottom: 6 }}>Entre para aproveitar tudo</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Salve favoritos, registre check-ins e avalie locais.</div>
              <Link href="/onboarding" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--green)', color: 'white', padding: '10px 20px', borderRadius: 50, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                Entrar / Criar conta
              </Link>
            </div>
          )}
        </div>

        {/* Menu */}
        <div className="card" style={{ margin: '0 16px 12px', overflow: 'hidden' }}>
          <Link href="/meus-locais" className="menu-item">
            <div className="menu-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <span className="menu-item-text">Meus locais</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
          <Link href="/planos" className="menu-item">
            <div className="menu-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <span className="menu-item-text">Planos</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        </div>

        <div className="card" style={{ margin: '0 16px 12px', overflow: 'hidden' }}>
          <button className="menu-item" style={{ width: '100%', border: 'none', background: 'none', fontFamily: 'var(--font)', cursor: 'pointer', textAlign: 'left' }} onClick={() => setShowSobreNos(true)}>
            <div className="menu-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <span className="menu-item-text">Sobre nós</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          <button className="menu-item" style={{ width: '100%', border: 'none', background: 'none', fontFamily: 'var(--font)', cursor: 'pointer', textAlign: 'left' }} onClick={() => setOfflineMsg(true)}>
            <div className="menu-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <span className="menu-item-text">Modo offline / downloads</span>
            <span style={{ fontSize: 11, fontWeight: 700, background: 'var(--border)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 20, marginLeft: 'auto', flexShrink: 0 }}>Em breve</span>
          </button>

          <button className="menu-item" style={{ width: '100%', border: 'none', background: 'none', fontFamily: 'var(--font)', cursor: 'pointer', textAlign: 'left' }} onClick={() => setShowTermos(true)}>
            <div className="menu-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className="menu-item-text">Termos e Privacidade</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          {isLoggedIn && (
            <button className="menu-item" style={{ width: '100%', border: 'none', background: 'none', fontFamily: 'var(--font)', cursor: 'pointer' }} onClick={signOut}>
              <div className="menu-item-icon" style={{ background: '#fff0f0' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </div>
              <span className="menu-item-text" style={{ color: '#ef4444' }}>Sair</span>
            </button>
          )}
        </div>

        {/* Anuncie seu serviço */}
        <div
          onClick={() => setShowAnuncio(true)}
          style={{ margin: '0 16px 12px', padding: '16px', background: 'linear-gradient(135deg, #f3e8ff 0%, #ede9fe 100%)', borderRadius: 16, border: '1.5px solid #c4b5fd', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(124,58,237,0.12)' }}>
              <span style={{ fontSize: 22 }}>👩‍⚕️</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#5b21b6', marginBottom: 2 }}>Anuncie seu serviço</div>
              <div style={{ fontSize: 12, color: '#7c3aed', lineHeight: 1.4 }}>Doula, consultora, pediatra e mais — alcance famílias e cuidadores na sua cidade</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>

      </div>

      {/* Modal Anuncie */}
      {showAnuncio && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowAnuncio(false)}>
          <div style={{ background: 'var(--bg-card)', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', padding: '20px 20px 48px' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>Anuncie seu serviço</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Alcance pais, mães e cuidadores que precisam de profissionais de confiança na sua cidade.
            </div>

            <div style={{ padding: '16px', background: '#f3e8ff', borderRadius: 16, border: '1.5px solid #7c3aed30', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#7c3aed' }}>Plano Profissional</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>R$ 89/mês</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Perfil no app, listagem em "Profissionais", até 5 fotos, contato direto via WhatsApp.</div>
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', margin: '12px 0' }}>
              Entre em contato para começar:
            </div>
            <a
              href="mailto:anuncie@pitstopbaby.com.br"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#7c3aed', color: 'white', padding: '13px 20px', borderRadius: 50, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              anuncie@pitstopbaby.com.br
            </a>
          </div>
        </div>
      )}

      {/* Modal offline */}
      {offlineMsg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} onClick={() => setOfflineMsg(false)}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, padding: 28, textAlign: 'center', maxWidth: 300 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Em breve!</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>O modo offline está sendo desenvolvido. Em breve você poderá baixar os locais da rota e acessar sem internet.</div>
            <button className="btn-primary" onClick={() => setOfflineMsg(false)}>OK, aguardo!</button>
          </div>
        </div>
      )}

      {/* Modal Termos */}
      {showTermos && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--bg-card)', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '20px 20px 40px' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Termos e Privacidade</div>

            {[
              { title: '📋 Termos de Uso', body: 'O PitStop Baby é um aplicativo colaborativo para pais, mães e cuidadores compartilharem e avaliarem locais baby-friendly em viagens. Ao usar o app, você concorda em fornecer informações verdadeiras, respeitar outros usuários e contribuir de forma construtiva.\n\nAvaliações e fotos passam por moderação. Não são permitidos conteúdos ofensivos, irrelevantes ou imagens de pessoas. O PitStop Baby pode remover conteúdo que viole estes termos.' },
              { title: '🔒 Privacidade', body: 'Coletamos apenas o necessário para o funcionamento do app: nome de perfil, email de autenticação e localização (para exibir locais próximos). Não vendemos seus dados a terceiros.\n\nSua localização é usada exclusivamente para ordenar locais por proximidade e não é armazenada permanentemente. Você pode excluir sua conta a qualquer momento pelo Perfil.' },
              { title: '📸 Fotos e Conteúdo', body: 'Fotos enviadas devem retratar o espaço físico do estabelecimento. Imagens com rostos ou pessoas identificáveis serão removidas. Ao enviar uma foto, você confirma que tem o direito de compartilhá-la.' },
            ].map(sec => (
              <div key={sec.title} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{sec.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-line' }}>{sec.body}</div>
              </div>
            ))}

            <button className="btn-primary" onClick={() => setShowTermos(false)}>Entendi</button>
          </div>
        </div>
      )}

      {/* Modal Sobre nós */}
      {showSobreNos && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--bg-card)', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '20px 20px 48px' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="29" viewBox="0 0 24 32" fill="none">
                  <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 16 9 16s9-9.25 9-16c0-4.97-4.03-9-9-9z" fill="#4caf85" stroke="white" strokeWidth="1.2"/>
                  <circle cx="12" cy="9" r="3.5" fill="white" opacity="0.9"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Sobre o PitStop Baby</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nossa história e missão</div>
              </div>
            </div>

            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
              O PitStop Baby nasceu de uma necessidade real: a de quem já esteve na estrada com um bebê no colo e não sabia onde parar com segurança. Fraldário limpo, um lugar tranquilo para amamentar, um restaurante com cadeirão — coisas simples que fazem toda a diferença.
            </div>

            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
              Mais do que um app de mapas, queremos construir uma <strong style={{ color: 'var(--green-dark)' }}>comunidade</strong> — de pais, mães e cuidadores que se ajudam nos momentos que mais precisam. Cada avaliação, cada check-in, cada foto compartilhada é um presente para quem ainda não conhece aquele local.
            </div>

            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
              Porque viajar com crianças pequenas não precisa ser estressante. Com as informações certas — e com a ajuda uns dos outros — cada parada pode ser um bom momento.
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              {[
                { icon: '🗺️', label: 'Locais mapeados\npela comunidade' },
                { icon: '🤝', label: 'Famílias que se\najudam na estrada' },
                { icon: '💚', label: 'Gratuito para\npais e cuidadores' },
              ].map(item => (
                <div key={item.label} style={{ flex: 1, background: 'var(--green-soft)', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                  <div style={{ fontSize: 11, color: 'var(--green-dark)', fontWeight: 600, lineHeight: 1.4, whiteSpace: 'pre-line' }}>{item.label}</div>
                </div>
              ))}
            </div>

            <button className="btn-primary" onClick={() => setShowSobreNos(false)}>Fechar</button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
