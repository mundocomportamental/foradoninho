'use client'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  display_name: string | null
  username: string | null
  avatar_url: string | null
  plano: string
  role: string | null
  cidade: string | null
  idade: number | null
}

interface Filho {
  id: string           // UUID do banco
  localId: string      // ID local para controle de UI
  nome: string
  genero: 'menino' | 'menina' | 'nao_informado' | ''
  data_nascimento: string
}

const ROLES = [
  { key: 'mamae', label: 'Mamãe', icon: '/eagle-head.png' },
  { key: 'papai', label: 'Papai', icon: '/eagle.png' },
  { key: 'outro', label: 'Outro cuidador(a)', icon: '/bird1.png' },
]

// Todos os passarinhos disponíveis como avatar
const AVES = [
  '/love-birds.png', '/eagle-head.png', '/eagle.png', '/bird1.png',
  '/bullfinch.png', '/duck.png', '/eagle (1).png', '/eagle (2).png', '/eagle (3).png',
  '/flamingo.png', '/flamingo (1).png', '/owl.png', '/owl (1).png',
  '/owl (2).png', '/owl (3).png', '/parrot (2).png', '/parrot (3).png',
  '/penguin.png', '/penguin (1).png', '/seagull.png', '/toucan.png', '/toucan (1).png',
  '/float.png',
]

const GENEROS = [
  { key: 'menino', label: 'Menino' },
  { key: 'menina', label: 'Menina' },
  { key: 'nao_informado', label: 'Prefiro não responder' },
]

function newFilho(): Filho {
  return { id: '', localId: Math.random().toString(36).slice(2), nome: '', genero: '', data_nascimento: '' }
}

function formatarIdade(data_nascimento: string): string {
  if (!data_nascimento) return ''
  const nasc = new Date(data_nascimento)
  const hoje = new Date()
  const meses = (hoje.getFullYear() - nasc.getFullYear()) * 12 + (hoje.getMonth() - nasc.getMonth())
  if (meses < 1) return 'recém-nascido(a)'
  if (meses < 24) return `${meses} ${meses === 1 ? 'mês' : 'meses'}`
  const anos = Math.floor(meses / 12)
  return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
}

// Tiers: Filhote 0-5 | Andorinha 6-15 | Gaivota 16-50 | Águia 51+
function getTierInfo(total: number): { label: string; color: string; bg: string; icon: string } {
  if (total > 50) return { label: 'Contribuidor(a) Águia',     color: '#d97706', bg: '#fffbeb', icon: '🦅' }
  if (total > 15) return { label: 'Contribuidor(a) Gaivota',   color: '#0891b2', bg: '#ecfeff', icon: '🕊️' }
  if (total > 5)  return { label: 'Contribuidor(a) Andorinha', color: '#059669', bg: '#f0fdf4', icon: '🐦' }
  return             { label: 'Contribuidor(a) Filhote',    color: '#6b7280', bg: '#f9fafb', icon: '🐣' }
}

function BadgeProgress({ total }: { total: number }) {
  // Não mostra progresso para Águia (tier máximo)
  if (total > 50) return null

  let rangeStart = 0, rangeEnd = 5, nextLabel = 'Andorinha'
  if (total > 15) { rangeStart = 16; rangeEnd = 50; nextLabel = 'Águia' }
  else if (total > 5) { rangeStart = 6; rangeEnd = 15; nextLabel = 'Gaivota' }

  const earnedInRange = total - rangeStart
  const rangeSize = rangeEnd - rangeStart
  const progress = Math.min((earnedInRange / rangeSize) * 100, 100)
  const starsCount = Math.min(5, Math.round((earnedInRange / rangeSize) * 5))
  const starsArr = Array.from({ length: 5 }, (_, i) => i < starsCount)

  return (
    <div style={{ marginTop: 8, padding: '12px 14px', background: 'var(--bg-card)', borderRadius: 12, border: '1.5px solid var(--border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Próximo: {nextLabel}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{earnedInRange}/{rangeSize} contribuições</span>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {starsArr.map((earned, i) => (
          <span key={i} style={{ fontSize: 20, opacity: earned ? 1 : 0.2 }}>⭐</span>
        ))}
      </div>
      <div style={{ height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#f59e0b', borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        Ganhe ⭐ ao <strong>avaliar um local</strong> ou <strong>adicionar um novo local</strong> ao mapa.
      </div>
    </div>
  )
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [checkins, setCheckins] = useState(0)
  const [avaliacoes, setAvaliacoes] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // Estados do perfil público
  const [showAnuncio, setShowAnuncio] = useState(false)
  const [showSobreNos, setShowSobreNos] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [offlineMsg, setOfflineMsg] = useState(false)
  const [showTermos, setShowTermos] = useState(false)

  // Avatar / passarinho picker
  const [showBirdPicker, setShowBirdPicker] = useState(false)
  const [savingBird, setSavingBird] = useState(false)

  // Estados do "Meu Ninho" (informações privadas)
  const [ninhoMode, setNinhoMode] = useState<'view' | 'edit'>('view')
  const [editRole, setEditRole] = useState('')
  const [editCidade, setEditCidade] = useState('')
  const [editIdade, setEditIdade] = useState('')
  const [filhos, setFilhos] = useState<Filho[]>([])
  const [editFilhos, setEditFilhos] = useState<Filho[]>([])
  const [savingNinho, setSavingNinho] = useState(false)
  const [ninhoError, setNinhoError] = useState('')

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
          setEditRole(data.role || '')
          setEditCidade(data.cidade || '')
          setEditIdade(data.idade ? String(data.idade) : '')
        }

        // Carrega filhos
        const { data: filhosData } = await supabase
          .from('filhos')
          .select('id, nome, genero, data_nascimento')
          .eq('user_id', user.id)
          .order('data_nascimento', { ascending: true })

        if (filhosData) {
          const mapped = filhosData.map(f => ({
            id: f.id,
            localId: Math.random().toString(36).slice(2),
            nome: f.nome || '',
            genero: (f.genero || '') as Filho['genero'],
            data_nascimento: f.data_nascimento || '',
          }))
          setFilhos(mapped)
          setEditFilhos(mapped.map(f => ({ ...f })))
        }

        const [c, a] = await Promise.all([
          supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('avaliacoes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        ])
        setCheckins(c.count || 0)
        setAvaliacoes(a.count || 0)
      } else {
        setProfile({ display_name: null, username: null, avatar_url: null, plano: 'gratis', role: null, cidade: null, idade: null })
      }
    }
    load()
  }, [supabase])

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  // ── Selecionar passarinho ────────────────────────────────────────────────────
  async function selectBird(src: string) {
    setSavingBird(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      await supabase.from('profiles').upsert({ id: user.id, avatar_url: src, updated_at: new Date().toISOString() })
      setProfile(p => p ? { ...p, avatar_url: src } : p)
      setShowBirdPicker(false)
    } finally {
      setSavingBird(false)
    }
  }

  // ── Perfil público ───────────────────────────────────────────────────────────
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


  // ── Meu Ninho ───────────────────────────────────────────────────────────────
  function addEditFilho() {
    setEditFilhos(f => [...f, newFilho()])
  }

  function updateEditFilho(localId: string, field: keyof Filho, value: string) {
    setEditFilhos(f => f.map(filho => filho.localId === localId ? { ...filho, [field]: value } : filho))
  }

  function removeEditFilho(localId: string) {
    setEditFilhos(f => f.filter(filho => filho.localId !== localId))
  }

  function openNinhoEdit() {
    setEditRole(profile?.role || '')
    setEditCidade(profile?.cidade || '')
    setEditIdade(profile?.idade ? String(profile.idade) : '')
    setEditFilhos(filhos.map(f => ({ ...f })))
    setNinhoError('')
    setNinhoMode('edit')
  }

  function cancelNinhoEdit() {
    setNinhoMode('view')
    setNinhoError('')
  }

  async function saveNinho() {
    if (!editCidade.trim()) { setNinhoError('Informe sua cidade'); return }
    setSavingNinho(true)
    setNinhoError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Salva perfil
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        role: editRole || null,
        cidade: editCidade.trim(),
        idade: editIdade ? parseInt(editIdade) : null,
        updated_at: new Date().toISOString(),
      })
      if (profileError) { setNinhoError(`Erro: ${profileError.message}`); return }

      // Salva filhos: apaga e re-insere
      const filhosValidos = editFilhos.filter(f => f.genero || f.data_nascimento || f.nome)
      await supabase.from('filhos').delete().eq('user_id', user.id)

      let novoFilhos: Filho[] = []
      if (filhosValidos.length > 0) {
        const { data: inserted, error: filhosError } = await supabase
          .from('filhos')
          .insert(filhosValidos.map(f => ({
            user_id: user.id,
            nome: f.nome.trim() || null,
            genero: f.genero || null,
            data_nascimento: f.data_nascimento || null,
          })))
          .select('id, nome, genero, data_nascimento')

        if (filhosError) { setNinhoError(`Erro ao salvar filhos: ${filhosError.message}`); return }
        if (inserted) {
          novoFilhos = inserted.map(f => ({
            id: f.id,
            localId: Math.random().toString(36).slice(2),
            nome: f.nome || '',
            genero: (f.genero || '') as Filho['genero'],
            data_nascimento: f.data_nascimento || '',
          }))
        }
      }

      // Atualiza estado local
      setProfile(p => p ? { ...p, role: editRole || null, cidade: editCidade.trim(), idade: editIdade ? parseInt(editIdade) : null } : p)
      setFilhos(novoFilhos)
      setNinhoMode('view')
    } catch (e) {
      console.error(e)
      setNinhoError('Erro inesperado. Tente novamente.')
    } finally {
      setSavingNinho(false)
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/onboarding')
  }

  if (!profile) return null

  const roleLabel = ROLES.find(r => r.key === profile.role)?.label

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
                <button
                  onClick={() => setShowBirdPicker(true)}
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 22, height: 22, borderRadius: '50%',
                    background: 'white', border: '2px solid #33cccc',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Escolher avatar"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#33cccc" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="6" y1="1" x2="6" y2="11"/>
                    <line x1="1" y1="6" x2="11" y2="6"/>
                  </svg>
                </button>
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
                  const tier = getTierInfo(checkins + avaliacoes)
                  return (
                    <div className="stat-card" style={{ background: tier.bg, border: `1.5px solid ${tier.color}20`, flex: 1.5 }}>
                      <div style={{ fontSize: 18 }}>{tier.icon}</div>
                      <div className="stat-label" style={{ color: tier.color, fontWeight: 700, fontSize: 11 }}>{tier.label}</div>
                    </div>
                  )
                })()}
              </div>
              <BadgeProgress total={checkins + avaliacoes} />
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

        {/* ── Meu Ninho (informações privadas) ─────────────────────── */}
        {isLoggedIn && (
          <div style={{ margin: '0 16px 12px' }}>

            {/* Card Meu Ninho */}
            <div className="card" style={{ overflow: 'hidden' }}>

              {/* Header do card */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>🪺</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Meu Ninho</span>
                </div>
                {ninhoMode === 'view' && (
                  <button
                    onClick={openNinhoEdit}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green-dark)', fontSize: 13, fontWeight: 600 }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Editar
                  </button>
                )}
              </div>

              {/* Aviso de privacidade — dentro do card */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px',
                background: '#f0fdf4',
                borderBottom: ninhoMode === 'view' ? 'none' : '1px solid var(--border)',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span style={{ fontSize: 11, color: '#15803d', lineHeight: 1.4 }}>
                  Informações privadas — visíveis apenas para você, nunca compartilhadas.
                </span>
              </div>

              {/* Modo visualização */}
              {ninhoMode === 'view' && (
                <div style={{ padding: '12px 16px 16px' }}>
                  {/* Role + cidade + idade */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: filhos.length > 0 ? 14 : 0 }}>
                    {roleLabel && (
                      <span style={{
                        padding: '5px 12px', borderRadius: 20,
                        background: 'var(--green-soft)', color: 'var(--green-dark)',
                        fontSize: 13, fontWeight: 600,
                      }}>
                        {roleLabel}
                      </span>
                    )}
                    {profile.cidade && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '5px 12px', borderRadius: 20,
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        color: 'var(--text)', fontSize: 13,
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        {profile.cidade}
                      </span>
                    )}
                    {profile.idade && (
                      <span style={{
                        padding: '5px 12px', borderRadius: 20,
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        color: 'var(--text)', fontSize: 13,
                      }}>
                        {profile.idade} anos
                      </span>
                    )}
                    {!roleLabel && !profile.cidade && !profile.idade && filhos.length === 0 && (
                      <button
                        onClick={openNinhoEdit}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, padding: 0, textDecoration: 'underline' }}
                      >
                        Completar informações do ninho →
                      </button>
                    )}
                  </div>

                  {/* Filhos */}
                  {filhos.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {filhos.map(f => {
                        const idadeStr = formatarIdade(f.data_nascimento)
                        return (
                          <div key={f.id || f.localId} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 12,
                            background: 'var(--bg)', border: '1px solid var(--border)',
                          }}>
                            <img src="/egg-in-nest.png" alt="filho" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                                {f.nome || 'Sem nome'}
                              </div>
                              {idadeStr && (
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{idadeStr}</div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Modo edição */}
              {ninhoMode === 'edit' && (
                <div style={{ padding: '16px' }}>

                  {/* Quem é você */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>Quem é você?</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {ROLES.map(r => (
                        <button
                          key={r.key}
                          onClick={() => setEditRole(r.key)}
                          style={{
                            flex: 1, padding: '12px 6px', borderRadius: 14,
                            border: editRole === r.key ? '2px solid var(--green)' : '1.5px solid var(--border)',
                            background: editRole === r.key ? 'var(--green-soft)' : 'var(--bg)',
                            cursor: 'pointer', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.12s', minHeight: 48,
                          }}
                        >
                          <span style={{ fontSize: 12, fontWeight: editRole === r.key ? 700 : 500, color: editRole === r.key ? 'var(--green-dark)' : 'var(--text)', lineHeight: 1.3, textAlign: 'center' }}>
                            {r.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Cidade */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text)' }}>
                      Cidade <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      value={editCidade}
                      onChange={e => setEditCidade(e.target.value)}
                      placeholder="Ex: São Paulo, Campinas..."
                      style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg)', fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = 'var(--green)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>

                  {/* Idade */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6, color: 'var(--text)' }}>Sua idade</label>
                    <input
                      type="number"
                      value={editIdade}
                      onChange={e => setEditIdade(e.target.value)}
                      placeholder="Ex: 32"
                      min="16" max="99"
                      style={{ width: '45%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg)', fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = 'var(--green)'}
                      onBlur={e => e.target.style.borderColor = 'var(--border)'}
                    />
                  </div>

                  {/* Filhos */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>Meus filhos</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {editFilhos.map((filho, idx) => (
                        <div key={filho.localId} style={{ background: 'var(--bg)', borderRadius: 14, padding: '12px 14px', border: '1.5px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Filho(a) {idx + 1}</span>
                            {editFilhos.length > 1 && (
                              <button onClick={() => removeEditFilho(filho.localId)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Gênero */}
                          <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
                            {GENEROS.map(g => (
                              <button
                                key={g.key}
                                onClick={() => updateEditFilho(filho.localId, 'genero', g.key)}
                                style={{
                                  flex: 1, padding: '7px 3px', borderRadius: 9,
                                  border: filho.genero === g.key ? '2px solid var(--green)' : '1.5px solid var(--border)',
                                  background: filho.genero === g.key ? 'var(--green-soft)' : 'var(--bg-card)',
                                  color: filho.genero === g.key ? 'var(--green-dark)' : 'var(--text)',
                                  fontSize: 11, fontWeight: filho.genero === g.key ? 700 : 400,
                                  cursor: 'pointer', fontFamily: 'var(--font)', lineHeight: 1.3, textAlign: 'center',
                                }}
                              >
                                {g.label}
                              </button>
                            ))}
                          </div>

                          {/* Nome */}
                          {filho.genero && (
                            <div style={{ marginBottom: 10 }}>
                              <input
                                value={filho.nome}
                                onChange={e => updateEditFilho(filho.localId, 'nome', e.target.value)}
                                placeholder="Nome do filho(a)"
                                style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontFamily: 'var(--font)', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                              />
                            </div>
                          )}

                          {/* Data de nascimento */}
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5 }}>Data de nascimento</div>
                            <input
                              type="date"
                              value={filho.data_nascimento}
                              onChange={e => updateEditFilho(filho.localId, 'data_nascimento', e.target.value)}
                              max={new Date().toISOString().split('T')[0]}
                              style={{ width: '100%', padding: '9px 12px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontFamily: 'var(--font)', fontSize: 13, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={addEditFilho}
                      style={{ marginTop: 10, width: '100%', padding: '10px 0', borderRadius: 50, border: '1.5px dashed var(--green)', background: 'transparent', color: 'var(--green-dark)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Adicionar filho(a)
                    </button>
                  </div>

                  {/* Erro */}
                  {ninhoError && (
                    <div style={{ padding: '9px 13px', background: '#fff1f0', border: '1px solid #fecaca', borderRadius: 9, color: '#dc2626', fontSize: 12, marginBottom: 14 }}>
                      {ninhoError}
                    </div>
                  )}

                  {/* Botões */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={saveNinho}
                      disabled={savingNinho}
                      className="btn-primary"
                      style={{ flex: 1, padding: '11px 0', fontSize: 14 }}
                    >
                      {savingNinho ? 'Salvando...' : 'Salvar'}
                    </button>
                    <button
                      onClick={cancelNinhoEdit}
                      className="btn-outline"
                      style={{ flex: 1, padding: '11px 0', fontSize: 14 }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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

      {/* Modal Passarinho */}
      {showBirdPicker && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowBirdPicker(false)}>
          <div style={{ background: 'var(--bg-card)', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', padding: '20px 20px 48px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 16px' }} />
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Escolha seu passarinho</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Toque para selecionar seu avatar</div>

            {savingBird && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: 14 }}>Salvando...</div>
            )}

            {!savingBird && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {AVES.map(ave => {
                  const selected = profile?.avatar_url === ave
                  return (
                    <button
                      key={ave}
                      onClick={() => selectBird(ave)}
                      style={{
                        aspectRatio: '1', borderRadius: 14, padding: 8,
                        border: selected ? '2.5px solid var(--green)' : '2px solid transparent',
                        background: selected ? 'var(--green-soft)' : 'var(--bg)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.12s',
                        boxShadow: selected ? '0 0 0 3px var(--green-light)' : 'none',
                      }}
                    >
                      <img src={ave} alt="passarinho" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

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
                <div style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>R$ 34,90/mês</div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Perfil no app, listagem em "Profissionais", até 5 fotos, contato direto via WhatsApp.</div>
            </div>
            <a
              href="/cadastro-profissional"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#7c3aed', color: 'white', padding: '13px 20px', borderRadius: 50, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/>
              </svg>
              Quero anunciar meu serviço
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
              { title: '📋 Termos de Uso', body: 'O Fora do Ninho é um aplicativo colaborativo para pais, mães e cuidadores compartilharem e avaliarem locais baby-friendly em viagens. Ao usar o app, você concorda em fornecer informações verdadeiras, respeitar outros usuários e contribuir de forma construtiva.\n\nAvaliações e fotos passam por moderação. Não são permitidos conteúdos ofensivos, irrelevantes ou imagens de pessoas. O Fora do Ninho pode remover conteúdo que viole estes termos.' },
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
                <div style={{ fontSize: 20, fontWeight: 800 }}>Sobre o Fora do Ninho</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Nossa história e missão</div>
              </div>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
              O Fora do Ninho nasceu de uma necessidade real: a de quem já esteve na estrada com um bebê no colo e não sabia onde parar com segurança. Fraldário limpo, um lugar tranquilo para amamentar, um restaurante com cadeirão — coisas simples que fazem toda a diferença.
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
