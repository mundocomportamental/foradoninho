'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Bebe {
  id: string
  genero: 'menino' | 'menina' | 'nao_informado' | ''
  nascimento: string
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

function newBebe(): Bebe {
  return { id: Math.random().toString(36).slice(2), genero: '', nascimento: '', nome: '' }
}

export default function CompletarPerfilPage() {
  const [role, setRole] = useState('')
  const [cidade, setCidade] = useState('')
  const [idade, setIdade] = useState('')
  const [bebes, setBebes] = useState<Bebe[]>([newBebe()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/onboarding'); return }
      const { data } = await supabase.from('profiles').select('role, cidade, idade, bebes').eq('id', user.id).single()
      if (data) {
        if (data.role) setRole(data.role)
        if (data.cidade) setCidade(data.cidade)
        if (data.idade) setIdade(String(data.idade))
        if (data.bebes && Array.isArray(data.bebes) && data.bebes.length > 0) setBebes(data.bebes)
      }
    }
    load()
  }, [supabase, router])

  function addBebe() {
    setBebes(b => [...b, newBebe()])
  }

  function updateBebe(id: string, field: keyof Bebe, value: string) {
    setBebes(b => b.map(bebe => bebe.id === id ? { ...bebe, [field]: value } : bebe))
  }

  function removeBebe(id: string) {
    setBebes(b => b.filter(bebe => bebe.id !== id))
  }

  async function handleSave() {
    if (!role) { setError('Selecione quem você é'); return }
    if (!cidade.trim()) { setError('Informe sua cidade'); return }
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/onboarding'); return }

      const bebesFilled = bebes.filter(b => b.genero || b.nascimento || b.nome)

      const { error: saveError } = await supabase.from('profiles').upsert({
        id: user.id,
        role,
        cidade: cidade.trim(),
        idade: idade ? parseInt(idade) : null,
        bebes: bebesFilled,
        updated_at: new Date().toISOString(),
      })

      if (saveError) {
        console.error('Erro ao salvar perfil:', saveError)
        setError(`Erro ao salvar: ${saveError.message}`)
        return
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
            width: 64, height: 64, borderRadius: '50%',
            background: 'var(--green-soft)', border: '2px solid var(--green-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 28,
          }}>
            🐣
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
                    flex: 1,
                    padding: '14px 8px',
                    borderRadius: 16,
                    border: role === r.key ? '2px solid var(--green)' : '1.5px solid var(--border)',
                    background: role === r.key ? 'var(--green-soft)' : 'var(--bg-card)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.15s',
                  }}
                >
                  <img
                    src={r.icon}
                    alt={r.label}
                    style={{ width: 40, height: 40, objectFit: 'contain' }}
                  />
                  <span style={{
                    fontSize: 11,
                    fontWeight: role === r.key ? 700 : 500,
                    color: role === r.key ? 'var(--green-dark)' : 'var(--text)',
                    lineHeight: 1.3,
                    textAlign: 'center',
                  }}>
                    {r.label}
                  </span>
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
              min="16"
              max="99"
              style={{
                width: '50%', padding: '13px 16px', borderRadius: 14,
                border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                fontFamily: 'var(--font)', fontSize: 15, color: 'var(--text)', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {/* Meus bebês */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>
              Meus bebês
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.4 }}>
              Adicione seus filhos para personalizarmos dicas e locais para a idade deles 🍼
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bebes.map((bebe, idx) => (
                <div key={bebe.id} style={{
                  background: 'var(--bg-card)', borderRadius: 16,
                  padding: '14px 16px', border: '1.5px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                      Bebê {idx + 1}
                    </div>
                    {bebes.length > 1 && (
                      <button
                        onClick={() => removeBebe(bebe.id)}
                        style={{
                          width: 24, height: 24, borderRadius: '50%',
                          border: '1px solid var(--border)', background: 'var(--bg)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Gênero — sem emojis, com "Prefiro não responder" */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {GENEROS.map(g => (
                      <button
                        key={g.key}
                        onClick={() => updateBebe(bebe.id, 'genero', g.key)}
                        style={{
                          flex: 1,
                          padding: '9px 4px',
                          borderRadius: 10,
                          border: bebe.genero === g.key ? '2px solid var(--green)' : '1.5px solid var(--border)',
                          background: bebe.genero === g.key ? 'var(--green-soft)' : 'var(--bg)',
                          color: bebe.genero === g.key ? 'var(--green-dark)' : 'var(--text)',
                          fontSize: 12,
                          fontWeight: bebe.genero === g.key ? 700 : 400,
                          cursor: 'pointer',
                          fontFamily: 'var(--font)',
                          transition: 'all 0.12s',
                          lineHeight: 1.3,
                          textAlign: 'center',
                        }}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>

                  {/* Nome do passarinho — aparece ao selecionar gênero */}
                  {bebe.genero && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                        Qual o nome desse(a) passarinho(a)?
                      </div>
                      <input
                        value={bebe.nome}
                        onChange={e => updateBebe(bebe.id, 'nome', e.target.value)}
                        placeholder="Nome do bebê"
                        style={{
                          width: '100%', padding: '10px 14px', borderRadius: 10,
                          border: '1.5px solid var(--border)', background: 'var(--bg)',
                          fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)',
                          outline: 'none', boxSizing: 'border-box',
                        }}
                        onFocus={e => e.target.style.borderColor = 'var(--green)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    </div>
                  )}

                  {/* Data de nascimento */}
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>Data de nascimento</div>
                    <input
                      type="date"
                      value={bebe.nascimento}
                      onChange={e => updateBebe(bebe.id, 'nascimento', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      style={{
                        width: '100%', padding: '10px 14px', borderRadius: 10,
                        border: '1.5px solid var(--border)', background: 'var(--bg)',
                        fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)',
                        outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addBebe}
              style={{
                marginTop: 12, width: '100%', padding: '11px 0', borderRadius: 50,
                border: '1.5px dashed var(--green)', background: 'transparent',
                color: 'var(--green-dark)', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Adicionar bebê
            </button>
          </div>

          {/* Erro */}
          {error && (
            <div style={{
              padding: '10px 14px', background: '#fff1f0',
              border: '1px solid #fecaca', borderRadius: 10,
              color: '#dc2626', fontSize: 13, marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {/* Salvar */}
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ fontSize: 16, padding: '14px 20px' }}
          >
            {saving ? 'Salvando...' : 'Salvar e continuar →'}
          </button>
        </div>
      </div>
    </div>
  )
}
