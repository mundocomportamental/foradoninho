'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Filho {
  id: string
  dbId?: string
  genero: 'menino' | 'menina' | 'nao_informado' | ''
  data_nascimento: string
  nome: string
}

const ROLES = [
  { key: 'mamae', label: 'Mamãe', icon: '/eagle-head.png' },
  { key: 'papai', label: 'Papai', icon: '/eagle.png' },
  { key: 'outro', label: 'Outro tipo de cuidador(a)', icon: '/bird1.png' },
]

const GENEROS = [
  { key: 'menino', label: 'Menino' },
  { key: 'menina', label: 'Menina' },
  { key: 'nao_informado', label: 'Prefiro não responder' },
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

function newFilho(): Filho {
  return { id: Math.random().toString(36).slice(2), genero: '', data_nascimento: '', nome: '' }
}

export default function CompletarPerfilPage() {
  const [role, setRole] = useState('')
  const [avatar, setAvatar] = useState('')
  const [cidade, setCidade] = useState('')
  const [idade, setIdade] = useState('')
  const [filhos, setFilhos] = useState<Filho[]>([newFilho()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/onboarding'); return }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, cidade, idade, avatar_url')
        .eq('id', user.id)
        .single()

      if (profileData) {
        if (profileData.role) setRole(profileData.role)
        if (profileData.cidade) setCidade(profileData.cidade)
        if (profileData.idade) setIdade(String(profileData.idade))
        if (profileData.avatar_url) setAvatar(profileData.avatar_url)
      }

      const { data: filhosData } = await supabase
        .from('filhos')
        .select('id, nome, genero, data_nascimento')
        .eq('user_id', user.id)
        .order('created_at')

      if (filhosData && filhosData.length > 0) {
        setFilhos(filhosData.map(f => ({
          id: Math.random().toString(36).slice(2),
          dbId: f.id,
          genero: (f.genero || '') as Filho['genero'],
          data_nascimento: f.data_nascimento || '',
          nome: f.nome || '',
        })))
      }
    }
    load()
  }, [supabase, router])

  function addFilho() {
    setFilhos(f => [...f, newFilho()])
  }

  function updateFilho(id: string, field: keyof Filho, value: string) {
    setFilhos(f => f.map(filho => filho.id === id ? { ...filho, [field]: value } : filho))
  }

  function removeFilho(id: string) {
    setFilhos(f => f.filter(filho => filho.id !== id))
  }

  async function handleSave() {
    if (!role) { setError('Selecione quem você é'); return }
    if (!cidade.trim()) { setError('Informe sua cidade'); return }
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/onboarding'); return }

      const upsertData: Record<string, unknown> = {
        id: user.id,
        role,
        cidade: cidade.trim(),
        idade: idade ? parseInt(idade) : null,
        updated_at: new Date().toISOString(),
      }
      if (avatar) upsertData.avatar_url = avatar

      const { error: profileError } = await supabase.from('profiles').upsert(upsertData)
      if (profileError) { setError(`Erro ao salvar: ${profileError.message}`); return }

      const filhosValidos = filhos.filter(f => f.genero || f.data_nascimento || f.nome)
      await supabase.from('filhos').delete().eq('user_id', user.id)

      if (filhosValidos.length > 0) {
        const { error: filhosError } = await supabase.from('filhos').insert(
          filhosValidos.map(f => ({
            user_id: user.id,
            nome: f.nome.trim() || null,
            genero: f.genero || null,
            data_nascimento: f.data_nascimento || null,
          }))
        )
        if (filhosError) { setError(`Erro ao salvar filhos: ${filhosError.message}`); return }
      }

      setSaved(true)
    } catch (e: unknown) {
      console.error('Exceção ao salvar perfil:', e)
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  // ── Tela de sucesso ──────────────────────────────────────────────────────────
  if (saved) {
    return (
      <div className="app-shell" style={{ background: 'var(--bg)' }}>
        <div className="page" style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '40px 28px', textAlign: 'center',
        }}>
          <img
            src="/love-birds.png"
            alt="Ninho pronto"
            style={{ width: 140, height: 140, objectFit: 'contain', marginBottom: 24 }}
          />
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 10, color: 'var(--text)' }}>
            Seu ninho está pronto! 🎉
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 36, maxWidth: 300 }}>
            Bem-vindo(a) ao Fora do Ninho. Agora você pode explorar, salvar locais favoritos e contribuir com a comunidade.
          </div>
          <button
            className="btn-primary"
            onClick={() => router.replace('/meus-locais')}
            style={{ maxWidth: 320, width: '100%', fontSize: 16, padding: '14px 20px' }}
          >
            Ir para Meus Locais
          </button>
        </div>
      </div>
    )
  }

  // ── Formulário ───────────────────────────────────────────────────────────────
  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      <div className="page" style={{ padding: '0 0 40px' }}>

        {/* Header */}
        <div style={{ padding: '32px 20px 20px', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--green-soft)', border: '2px solid var(--green-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', overflow: 'hidden',
          }}>
            {avatar
              ? <img src={avatar} alt="avatar" style={{ width: 52, height: 52, objectFit: 'contain' }} />
              : <img src="/love-birds.png" alt="avatar" style={{ width: 52, height: 52, objectFit: 'contain', opacity: 0.4 }} />
            }
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
            Complete seu perfil
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Essas informações ajudam a personalizar sua experiência no Fora do Ninho
          </div>
        </div>

        <div style={{ padding: '0 20px' }}>

          {/* Quem é você */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>
              Quem é você? <span style={{ color: '#ef4444', fontSize: 13 }}>*</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {ROLES.map(r => (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key)}
                  style={{
                    flex: 1, padding: '14px 8px', borderRadius: 16,
                    border: role === r.key ? '2px solid var(--green)' : '1.5px solid var(--border)',
                    background: role === r.key ? 'var(--green-soft)' : 'var(--bg-card)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', minHeight: 56,
                  }}
                >
                  <span style={{
                    fontSize: 13, fontWeight: role === r.key ? 700 : 500,
                    color: role === r.key ? 'var(--green-dark)' : 'var(--text)',
                    lineHeight: 1.3, textAlign: 'center',
                  }}>
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Escolher passarinho / avatar */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
              Seu passarinho
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4 }}>
              Escolha o avatar que vai te representar no ninho 🪺
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8,
              padding: '14px', background: 'var(--bg-card)', borderRadius: 16,
              border: '1.5px solid var(--border)',
            }}>
              {AVES.map(ave => (
                <button
                  key={ave}
                  onClick={() => setAvatar(ave)}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: 12,
                    border: avatar === ave ? '2.5px solid var(--green)' : '2px solid transparent',
                    background: avatar === ave ? 'var(--green-soft)' : 'transparent',
                    cursor: 'pointer', padding: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.12s',
                    boxShadow: avatar === ave ? '0 0 0 2px var(--green-light)' : 'none',
                  }}
                >
                  <img
                    src={ave}
                    alt="passarinho"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Cidade */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 15, fontWeight: 700, display: 'block', marginBottom: 8, color: 'var(--text)' }}>
              Sua cidade <span style={{ color: '#ef4444', fontSize: 13 }}>*</span>
            </label>
            <input
              value={cidade}
              onChange={e => setCidade(e.target.value)}
              placeholder="Ex: São Paulo, Campinas..."
              style={{
                width: '100%', padding: '13px 16px', borderRadius: 14,
                border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                fontFamily: 'var(--font)', fontSize: 15, color: 'var(--text)',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Idade */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ fontSize: 15, fontWeight: 700, display: 'block', marginBottom: 8, color: 'var(--text)' }}>
              Sua idade
            </label>
            <input
              type="number"
              value={idade}
              onChange={e => setIdade(e.target.value)}
              placeholder="Ex: 32"
              min="16" max="99"
              style={{
                width: '50%', padding: '13px 16px', borderRadius: 14,
                border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                fontFamily: 'var(--font)', fontSize: 15, color: 'var(--text)', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Meus filhos */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
              Meus filhos
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.4 }}>
              Adicione seus filhos para personalizarmos dicas e locais para a idade deles 🍼
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filhos.map((filho, idx) => (
                <div key={filho.id} style={{
                  background: 'var(--bg-card)', borderRadius: 16,
                  padding: '14px 16px', border: '1.5px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                      Filho(a) {idx + 1}
                    </div>
                    {filhos.length > 1 && (
                      <button onClick={() => removeFilho(filho.id)} style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {GENEROS.map(g => (
                      <button key={g.key} onClick={() => updateFilho(filho.id, 'genero', g.key)} style={{ flex: 1, padding: '9px 4px', borderRadius: 10, border: filho.genero === g.key ? '2px solid var(--green)' : '1.5px solid var(--border)', background: filho.genero === g.key ? 'var(--green-soft)' : 'var(--bg)', color: filho.genero === g.key ? 'var(--green-dark)' : 'var(--text)', fontSize: 12, fontWeight: filho.genero === g.key ? 700 : 400, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.12s', lineHeight: 1.3, textAlign: 'center' }}>
                        {g.label}
                      </button>
                    ))}
                  </div>

                  {filho.genero && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Qual o nome desse(a) passarinho(a)?</div>
                      <input value={filho.nome} onChange={e => updateFilho(filho.id, 'nome', e.target.value)} placeholder="Nome do filho(a)" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = 'var(--green)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                    </div>
                  )}

                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Data de nascimento</div>
                    <input type="date" value={filho.data_nascimento} onChange={e => updateFilho(filho.id, 'data_nascimento', e.target.value)} max={new Date().toISOString().split('T')[0]} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addFilho} style={{ marginTop: 12, width: '100%', padding: '11px 0', borderRadius: 50, border: '1.5px dashed var(--green)', background: 'transparent', color: 'var(--green-dark)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Adicionar filho(a)
            </button>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#fff1f0', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ fontSize: 16, padding: '14px 20px' }}>
            {saving ? 'Salvando...' : 'Salvar e continuar →'}
          </button>
        </div>
      </div>
    </div>
  )
}
