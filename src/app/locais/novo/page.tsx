'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AMENIDADES, TIPO_LABELS } from '@/lib/types'

const TIPOS = Object.entries(TIPO_LABELS)

// Steps: 0=localização, 1=info básica, 2=amenidades, 3=avaliação, 4=fotos
const STEP_LABELS = ['Localização', 'Sobre o local', 'Comodidades', 'Avaliação', 'Fotos']

const SMILES = ['😞', '😕', '😐', '🙂', '😄']
const SMILE_LABELS = ['Ruim', 'Regular', 'Ok', 'Bom', 'Ótimo']

function SmilePicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
        {value > 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{SMILE_LABELS[value - 1]}</span>}
      </div>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
        {SMILES.map((emoji, i) => {
          const n = i + 1
          const active = value === n
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 10,
                border: active ? '2px solid var(--green)' : '1.5px solid var(--border)',
                background: active ? 'var(--green-soft)' : 'var(--bg)',
                cursor: 'pointer',
                fontSize: 22,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                transition: 'border 0.12s, background 0.12s',
              }}
            >
              {emoji}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function NovoLocalPage() {
  const [step, setStep] = useState(0)
  const [authReady, setAuthReady] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [newMonthlyTotal, setNewMonthlyTotal] = useState(0)

  // Step 0: localização
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsSuccess, setGpsSuccess] = useState(false)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [endereco, setEndereco] = useState('')

  // Step 1: info básica
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [tipoCustom, setTipoCustom] = useState('')
  const [isServico, setIsServico] = useState(false)

  // Step 2: avaliação
  const [rExperiencia, setRExperiencia] = useState(0)
  const [rLimpeza, setRLimpeza] = useState(0)
  const [rAtendimento, setRAtendimento] = useState(0)
  const [rInstalacoes, setRInstalacoes] = useState(0)
  const [comment, setComment] = useState('')

  // Step 3: amenidades
  const [amenidades, setAmenidades] = useState<Record<string, boolean>>({})

  // Step 4: fotos (último)
  const [fotos, setFotos] = useState<File[]>([])
  const [fotoURLs, setFotoURLs] = useState<string[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/onboarding'); return }
      setAuthReady(true)
    }
    checkAuth()
  }, [supabase, router])

  async function getGPS() {
    setGpsLoading(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setLat(coords.latitude)
        setLng(coords.longitude)
        setGpsSuccess(true)
        setGpsLoading(false)

        // Reverse geocoding com Nominatim (OpenStreetMap, gratuito, sem API key)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } }
          )
          const data = await res.json()
          if (data.address) {
            const city =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.municipality ||
              data.address.county ||
              ''
            // Mapa completo de nome → sigla para fallback quando state_code não vem
            const STATE_TO_UF: Record<string, string> = {
              'acre': 'AC', 'alagoas': 'AL', 'amapá': 'AP', 'amapa': 'AP',
              'amazonas': 'AM', 'bahia': 'BA', 'ceará': 'CE', 'ceara': 'CE',
              'distrito federal': 'DF', 'espírito santo': 'ES', 'espirito santo': 'ES',
              'goiás': 'GO', 'goias': 'GO', 'maranhão': 'MA', 'maranhao': 'MA',
              'mato grosso do sul': 'MS', 'mato grosso': 'MT',
              'minas gerais': 'MG', 'pará': 'PA', 'para': 'PA',
              'paraíba': 'PB', 'paraiba': 'PB', 'paraná': 'PR', 'parana': 'PR',
              'pernambuco': 'PE', 'piauí': 'PI', 'piaui': 'PI',
              'rio de janeiro': 'RJ', 'rio grande do norte': 'RN',
              'rio grande do sul': 'RS', 'rondônia': 'RO', 'rondonia': 'RO',
              'roraima': 'RR', 'santa catarina': 'SC',
              'são paulo': 'SP', 'sao paulo': 'SP',
              'sergipe': 'SE', 'tocantins': 'TO',
            }
            const rawCode = (data.address.state_code || '').replace('BR-', '').trim().toUpperCase()
            const stateCode = rawCode.length === 2 ? rawCode : ''
            const stateNameKey = (data.address.state || '').toLowerCase().trim()
            const stateMapped = STATE_TO_UF[stateNameKey] || ''
            const uf = stateCode || stateMapped
            if (city) setCidade(city)
            if (uf) setEstado(uf)
          }
        } catch {
          // Geocoding falhou silenciosamente — usuário preenche manualmente se quiser
        }
      },
      () => {
        setGpsLoading(false)
        setError('Não foi possível obter sua localização. Preencha manualmente.')
      }
    )
  }

  function handleFotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setFotos(prev => [...prev, ...files].slice(0, 10))
    files.forEach(f => {
      setFotoURLs(prev => [...prev, URL.createObjectURL(f)].slice(0, 10))
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      // Buscar usuário logado
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/onboarding'); return }

      const tipoFinal = tipo === 'outro' ? (tipoCustom.trim() || 'outro') : tipo

      // 1. Criar local primeiro (sem fotos ainda) para obter o ID
      const { data: novoLocal, error: localError } = await supabase.from('locais').insert({
        nome: nome.trim(),
        tipo: tipoFinal,
        is_servico: isServico,
        endereco: endereco.trim() || null,
        cidade: cidade.trim(),
        estado: estado.trim(),
        lat: lat,
        lng: lng,
        is_active: false,
        added_by: user.id,
        fotos: [],
        ...Object.fromEntries(AMENIDADES.map(a => [a.key, amenidades[a.key] ?? false])),
      }).select('id').single()

      if (localError || !novoLocal) throw localError || new Error('Erro ao criar local')

      // 2. Upload fotos na pasta locais/{id}/ — organizada por estabelecimento
      const uploadedUrls: string[] = []
      // fotos_metadata guarda: quem enviou + quando — facilita rastrear no backend
      const fotosMetadata: { url: string; user_id: string; uploaded_at: string }[] = []

      for (const foto of fotos) {
        const ext = (foto.name.split('.').pop() || 'jpg').toLowerCase()
        const uploadedAt = new Date().toISOString()
        const path = `locais/${novoLocal.id}/${Date.now()}.${ext}`
        const { data: up } = await supabase.storage
          .from('locais-fotos')
          .upload(path, foto, { upsert: false, contentType: foto.type })
        if (up) {
          const { data: pub } = supabase.storage.from('locais-fotos').getPublicUrl(up.path)
          if (pub?.publicUrl) {
            uploadedUrls.push(pub.publicUrl)
            fotosMetadata.push({ url: pub.publicUrl, user_id: user.id, uploaded_at: uploadedAt })
          }
        }
      }

      // 3. Atualizar local com as URLs das fotos + foto_principal + metadata
      if (uploadedUrls.length > 0) {
        await supabase.from('locais').update({
          fotos: uploadedUrls,
          foto_principal: uploadedUrls[0],   // Q2: 1ª foto = capa do card
          fotos_metadata: fotosMetadata,     // Q1: rastreio de quem enviou e quando
        }).eq('id', novoLocal.id)
      }

      // 4. Inserir primeira avaliação (com user_id para satisfazer RLS)
      if (rExperiencia > 0) {
        await supabase.from('avaliacoes').insert({
          local_id: novoLocal.id,
          user_id: user.id,
          experiencia: rExperiencia,
          limpeza: rLimpeza || null,
          atendimento: rAtendimento || null,
          instalacoes: rInstalacoes || null,
          comentario: comment || null,
          imagens: uploadedUrls,
          aprovado: false,
          amenidades_reportadas: amenidades,
          periodo_ref: new Date().toISOString(),
        })
      }

      // Buscar total mensal atualizado para mostrar na tela de sucesso
      try {
        if (user) {
          const startOfMonth = new Date()
          startOfMonth.setDate(1)
          startOfMonth.setHours(0, 0, 0, 0)
          const monthISO = startOfMonth.toISOString()
          const [cm, am] = await Promise.all([
            supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', monthISO),
            supabase.from('avaliacoes').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', monthISO),
          ])
          setNewMonthlyTotal((cm.count || 0) + (am.count || 0))
        }
      } catch {}

      setSubmitted(true)
    } catch (e: unknown) {
      console.error('Erro ao enviar local:', e)
      setError('Erro ao enviar. Verifique os dados e tente novamente.')
      setSubmitting(false)
    }
  }

  if (!authReady) return (
    <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>
    </div>
  )

  // ── Tela de sucesso ──────────────────────────────────────────────────────────
  if (submitted) {
    const targetStars = newMonthlyTotal >= 5 ? 10 : 5
    const progress = Math.min((newMonthlyTotal / targetStars) * 100, 100)
    const remaining = Math.max(5 - newMonthlyTotal, 0)
    const starsArr = Array.from({ length: 5 }, (_, i) => i < Math.min(newMonthlyTotal, 5))
    const reachedTop = newMonthlyTotal >= 5

    return (
      <div className="app-shell" style={{ background: 'var(--bg)' }}>
        <div className="page" style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '40px 24px', textAlign: 'center'
        }}>
          <div style={{ fontSize: 72, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Parabéns!</div>
          <div style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 28, lineHeight: 1.6, maxWidth: 320 }}>
            Você adicionou um novo local ao mapa! Ele será revisado pela nossa equipe antes de aparecer para todos. Agradecemos sua contribuição!
          </div>

          {/* +1 estrela */}
          <div style={{
            background: 'var(--green-soft)', border: '2px solid var(--green)',
            borderRadius: 20, padding: '18px 32px', marginBottom: 24, width: '100%', maxWidth: 320
          }}>
            <div style={{ fontSize: 38, fontWeight: 900, color: 'var(--green-dark)', marginBottom: 4 }}>+1 ⭐</div>
            <div style={{ fontSize: 14, color: 'var(--green-dark)' }}>adicionado ao seu perfil este mês</div>
          </div>

          {/* Progresso Contribuidor Top */}
          {!reachedTop ? (
            <div style={{
              width: '100%', maxWidth: 320, background: 'var(--bg-card)',
              border: '1.5px solid var(--border)', borderRadius: 16, padding: '16px', marginBottom: 28
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Próximo: Contribuidor Top</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                {remaining > 0
                  ? `Faltam ${remaining} contribuição${remaining > 1 ? 'ões' : ''} para ganhar o selo!`
                  : 'Você está perto!'}
              </div>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 10 }}>
                {starsArr.map((earned, i) => (
                  <span key={i} style={{ fontSize: 22, opacity: earned ? 1 : 0.2 }}>⭐</span>
                ))}
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: '#f59e0b', borderRadius: 3, transition: 'width 0.6s' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{newMonthlyTotal}/5 este mês</div>
            </div>
          ) : (
            <div style={{
              width: '100%', maxWidth: 320, background: '#fffbeb',
              border: '2px solid #f59e0b', borderRadius: 16, padding: '18px', marginBottom: 28
            }}>
              <div style={{ fontSize: 36, marginBottom: 6 }}>⭐</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#d97706' }}>Contribuidor Top!</div>
              <div style={{ fontSize: 13, color: '#92400e', marginTop: 4 }}>Você desbloqueou o selo este mês. Obrigado!</div>
            </div>
          )}

          <button
            className="btn-primary"
            onClick={() => router.replace('/mapa')}
            style={{ maxWidth: 320, width: '100%' }}
          >
            Ver no mapa
          </button>
        </div>
      </div>
    )
  }

  // ── Formulário multi-step ────────────────────────────────────────────────────
  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      <div className="page" style={{ padding: '0 0 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 16px' }}>
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '1.5px solid var(--border)', background: 'var(--bg-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Adicionar local</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{STEP_LABELS[step]} · Etapa {step + 1} de 5</div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{ display: 'flex', gap: 4, padding: '0 20px 20px' }}>
          {STEP_LABELS.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= step ? 'var(--green)' : 'var(--border)',
              transition: 'background 0.2s',
            }} />
          ))}
        </div>

        <div style={{ padding: '0 20px' }}>

          {/* ── Step 0: Localização ─────────────────────────────────────────── */}
          {step === 0 && (
            <>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Onde fica o local?</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Use o GPS ou preencha o endereço manualmente
              </div>

              {/* Botão GPS */}
              <button
                onClick={getGPS}
                disabled={gpsLoading}
                style={{
                  width: '100%', marginBottom: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '14px 20px', borderRadius: 50,
                  cursor: gpsLoading ? 'default' : 'pointer',
                  fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600,
                  border: gpsSuccess ? '2px solid var(--green)' : '2px solid var(--green)',
                  background: gpsSuccess ? 'var(--green-soft)' : 'var(--green)',
                  color: gpsSuccess ? 'var(--green-dark)' : 'white',
                  transition: 'all 0.2s',
                }}
              >
                {gpsSuccess ? (
                  <>
                    {/* Ícone de check verde */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Localização obtida com sucesso ✓
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>
                      <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
                      <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
                    </svg>
                    {gpsLoading ? 'Obtendo localização...' : 'Usar minha localização'}
                  </>
                )}
              </button>

              {/* Campos: Cidade, Estado, Endereço (opcional) */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>
                  Cidade <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  value={cidade}
                  onChange={e => setCidade(e.target.value)}
                  placeholder="Ex: Campinas"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>
                  Estado (UF) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  value={estado}
                  onChange={e => setEstado(e.target.value)}
                  placeholder="Ex: SP"
                  maxLength={2}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>
                  Endereço (opcional, apenas se você souber)
                </label>
                <input
                  value={endereco}
                  onChange={e => setEndereco(e.target.value)}
                  placeholder="Rua, número, bairro"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: '#fff1f0', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 13, marginBottom: 12 }}>
                  {error}
                </div>
              )}

              <button
                className="btn-primary"
                disabled={!cidade.trim() || !estado.trim()}
                onClick={() => { setError(''); setStep(1) }}
                style={{ marginTop: 8 }}
              >
                Próximo
              </button>
            </>
          )}

          {/* ── Step 1: Info básica ─────────────────────────────────────────── */}
          {step === 1 && (
            <>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Sobre o local</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Preencha as informações do estabelecimento</div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>
                  Nome do local <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Restaurante Família Feliz"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8, color: 'var(--text-muted)' }}>
                  Tipo <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TIPOS.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => { setTipo(key); if (key !== 'outro') setTipoCustom('') }}
                      style={{
                        padding: '8px 14px', borderRadius: 50,
                        border: tipo === key ? '2px solid var(--green)' : '1.5px solid var(--border)',
                        background: tipo === key ? 'var(--green-soft)' : 'var(--bg-card)',
                        color: tipo === key ? 'var(--green-dark)' : 'var(--text)',
                        fontSize: 13, fontWeight: tipo === key ? 700 : 400,
                        cursor: 'pointer', fontFamily: 'var(--font)', transition: 'all 0.12s',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Campo aberto para "Outro" */}
                {tipo === 'outro' && (
                  <input
                    value={tipoCustom}
                    onChange={e => setTipoCustom(e.target.value)}
                    placeholder="Qual tipo de local? (ex: Biblioteca, Clínica...)"
                    autoFocus
                    style={{
                      width: '100%', marginTop: 10, padding: '12px 14px',
                      borderRadius: 12, border: '1.5px solid var(--green)',
                      background: 'var(--bg-card)', fontFamily: 'var(--font)',
                      fontSize: 14, color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                )}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                  <div
                    onClick={() => setIsServico(!isServico)}
                    style={{
                      width: 22, height: 22, borderRadius: 6, marginTop: 2, flexShrink: 0,
                      background: isServico ? '#7c3aed' : 'var(--bg)',
                      border: isServico ? '2px solid #7c3aed' : '2px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {isServico && (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                    👩‍⚕️ É um serviço profissional infantil (consultoria de amamentação, especialista em sono do bebê, pediatra, enfermeira obstétrica, doula, osteopata infantil, musicalização para bebês, narração de histórias...)
                  </span>
                </label>
              </div>

              <button
                className="btn-primary"
                disabled={!nome.trim() || !tipo || (tipo === 'outro' && !tipoCustom.trim())}
                onClick={() => setStep(2)}
              >
                Próximo
              </button>
            </>
          )}

          {/* ── Step 2: Comodidades ─────────────────────────────────────────── */}
          {step === 2 && (
            <>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Comodidades disponíveis</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Marque o que você encontrou no local</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {AMENIDADES.map(a => (
                  <label key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <div
                      onClick={() => setAmenidades(p => ({ ...p, [a.key]: !p[a.key] }))}
                      style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: amenidades[a.key] ? 'var(--green)' : 'var(--bg)',
                        border: amenidades[a.key] ? '2px solid var(--green)' : '2px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s', flexShrink: 0,
                      }}
                    >
                      {amenidades[a.key] && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: 14 }}>{a.icon} {a.label}</span>
                  </label>
                ))}
              </div>

              <button
                className="btn-primary"
                onClick={() => setStep(3)}
                style={{ fontSize: 15, padding: '14px 20px' }}
              >
                Próximo
              </button>
            </>
          )}

          {/* ── Step 3: Avaliação ───────────────────────────────────────────── */}
          {step === 3 && (
            <>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Sua avaliação</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Como é este local para famílias?</div>

              {/* Experiência geral 1–10 */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Experiência geral</span>
                  <span style={{
                    fontSize: 22, fontWeight: 800,
                    color: rExperiencia >= 8 ? '#33CCCC' : rExperiencia >= 5 ? '#f59e0b' : rExperiencia > 0 ? '#ef4444' : 'var(--text-muted)',
                  }}>
                    {rExperiencia > 0 ? rExperiencia : '—'}
                    <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>/10</span>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setRExperiencia(n)} style={{
                      flex: 1, height: 34, borderRadius: 8, border: 'none',
                      background: n <= rExperiencia
                        ? (rExperiencia >= 8 ? '#33CCCC' : rExperiencia >= 5 ? '#f59e0b' : '#ef4444')
                        : 'var(--border)',
                      cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      color: n <= rExperiencia ? 'white' : 'var(--text-muted)',
                      transition: 'background 0.15s',
                    }}>{n}</button>
                  ))}
                </div>
              </div>

              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 16px' }} />

              <SmilePicker label="Limpeza" value={rLimpeza} onChange={setRLimpeza} />
              <SmilePicker label="Atendimento" value={rAtendimento} onChange={setRAtendimento} />
              <SmilePicker label="Instalações" value={rInstalacoes} onChange={setRInstalacoes} />

              <textarea
                placeholder="Comentário sobre o local (opcional)..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="review-textarea"
                style={{ minHeight: 80, marginTop: 8 }}
              />

              <button
                className="btn-primary"
                disabled={!rExperiencia}
                onClick={() => setStep(4)}
                style={{ marginTop: 12 }}
              >
                Próximo
              </button>
            </>
          )}

          {/* ── Step 4: Fotos (último) ──────────────────────────────────────── */}
          {step === 4 && (
            <>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Quer adicionar uma foto do local?</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                Fotos ajudam outras famílias a conhecer o espaço
              </div>
              <div style={{ fontSize: 12, color: '#e05b4e', background: '#fff1f0', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', marginBottom: 16 }}>
                ⚠️ Apenas fotos do espaço físico. Imagens com pessoas serão removidas.
              </div>

              {fotoURLs.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  {fotoURLs.map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1.5px solid var(--border)' }} />
                      <button
                        onClick={() => {
                          setFotos(p => p.filter((_, j) => j !== i))
                          setFotoURLs(p => p.filter((_, j) => j !== i))
                        }}
                        style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >×</button>
                    </div>
                  ))}
                </div