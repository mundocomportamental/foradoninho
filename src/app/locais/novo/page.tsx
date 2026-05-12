'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AMENIDADES, TIPO_LABELS } from '@/lib/types'

const TIPOS = Object.entries(TIPO_LABELS)

// Steps: 0=localização, 1=info básica, 2=fotos, 3=avaliação inicial, 4=amenidades
const STEP_LABELS = ['Localização', 'Sobre o local', 'Fotos', 'Avaliação', 'Comodidades']

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
            <button key={n} onClick={() => onChange(n)} style={{
              flex: 1, height: 48, borderRadius: 10,
              border: active ? '2px solid var(--green)' : '1.5px solid var(--border)',
              background: active ? 'var(--green-soft)' : 'var(--bg)',
              cursor: 'pointer', fontSize: active ? 24 : 20,
              transition: 'all 0.12s', transform: active ? 'scale(1.08)' : 'scale(1)',
            }}>{emoji}</button>
          )
        })}
      </div>
    </div>
  )
}

export default function NovoLocalPage() {
  const [step, setStep] = useState(0)
  const [authReady, setAuthReady] = useState(false)

  // Step 0: localização
  const [gpsLoading, setGpsLoading] = useState(false)
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')

  // Step 1: info básica
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [isServico, setIsServico] = useState(false)

  // Step 2: fotos
  const [fotos, setFotos] = useState<File[]>([])
  const [fotoURLs, setFotoURLs] = useState<string[]>([])

  // Step 3: avaliação
  const [rExperiencia, setRExperiencia] = useState(0)
  const [rLimpeza, setRLimpeza] = useState(0)
  const [rAtendimento, setRAtendimento] = useState(0)
  const [rInstalacoes, setRInstalacoes] = useState(0)
  const [comment, setComment] = useState('')

  // Step 4: amenidades
  const [amenidades, setAmenidades] = useState<Record<string, boolean>>({})

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

  function getGPS() {
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLat(coords.latitude)
        setLng(coords.longitude)
        setGpsLoading(false)
      },
      () => {
        setGpsLoading(false)
        setError('Não foi possível obter sua localização. Preencha manualmente.')
      }
    )
  }

  function handleFotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setFotos(prev => [...prev, ...files].slice(0, 5))
    files.forEach(f => {
      setFotoURLs(prev => [...prev, URL.createObjectURL(f)].slice(0, 5))
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    try {
      // Upload fotos
      const uploadedUrls: string[] = []
      for (const foto of fotos) {
        const ext = foto.name.split('.').pop()
        const path = `novo/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { data: up } = await supabase.storage.from('locais-fotos').upload(path, foto, { upsert: false })
        if (up) {
          const { data: pub } = supabase.storage.from('locais-fotos').getPublicUrl(up.path)
          if (pub) uploadedUrls.push(pub.publicUrl)
        }
      }

      // Create local
      const { data: novoLocal, error: localError } = await supabase.from('locais').insert({
        nome: nome.trim(),
        tipo,
        is_servico: isServico,
        endereco: endereco.trim(),
        cidade: cidade.trim(),
        estado: estado.trim(),
        lat: lat!,
        lng: lng!,
        is_active: false, // Aguarda moderação
        fotos: uploadedUrls,
        ...Object.fromEntries(AMENIDADES.map(a => [a.key, amenidades[a.key] ?? false])),
      }).select('id').single()

      if (localError || !novoLocal) throw localError || new Error('Erro ao criar local')

      // Insert first review
      if (rExperiencia > 0) {
        await supabase.from('avaliacoes').insert({
          local_id: novoLocal.id,
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

      router.replace('/mapa?novo=1')
    } catch (e: any) {
      setError('Erro ao enviar. Verifique os dados e tente novamente.')
      setSubmitting(false)
    }
  }

  if (!authReady) return (
    <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>
    </div>
  )

  return (
    <div className="app-shell" style={{ background: 'var(--bg)' }}>
      <div className="page" style={{ padding: '0 0 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 16px' }}>
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
            style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
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

        {/* Progress */}
        <div style={{ display: 'flex', gap: 4, padding: '0 20px 20px' }}>
          {STEP_LABELS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? 'var(--green)' : 'var(--border)', transition: 'background 0.2s' }} />
          ))}
        </div>

        <div style={{ padding: '0 20px' }}>

          {/* Step 0: Localização */}
          {step === 0 && (
            <>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Onde fica o local?</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Use o GPS ou preencha o endereço manualmente</div>

              <button
                onClick={getGPS}
                disabled={gpsLoading}
                className={lat ? 'btn-outline' : 'btn-primary'}
                style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>
                  <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>
                  <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>
                </svg>
                {gpsLoading ? 'Obtendo GPS...' : lat ? `GPS: ${lat.toFixed(5)}, ${lng?.toFixed(5)}` : 'Usar minha localização'}
              </button>

              {[
                { label: 'Endereço completo', value: endereco, set: setEndereco, placeholder: 'Rua, número, bairro' },
                { label: 'Cidade', value: cidade, set: setCidade, placeholder: 'Ex: Campinas' },
                { label: 'Estado (UF)', value: estado, set: setEstado, placeholder: 'Ex: SP' },
              ].map(f => (
                <div key={f.label} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>{f.label}</label>
                  <input
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}

              <button
                className="btn-primary"
                disabled={!lat || !cidade.trim() || !estado.trim()}
                onClick={() => setStep(1)}
                style={{ marginTop: 8 }}
              >
                Próximo
              </button>
            </>
          )}

          {/* Step 1: Info básica */}
          {step === 1 && (
            <>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Sobre o local</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Preencha as informações do estabelecimento</div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6, color: 'var(--text-muted)' }}>Nome do local <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Ex: Restaurante Família Feliz"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 8, color: 'var(--text-muted)' }}>Tipo <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {TIPOS.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setTipo(key)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 50,
                        border: tipo === key ? '2px solid var(--green)' : '1.5px solid var(--border)',
                        background: tipo === key ? 'var(--green-soft)' : 'var(--bg-card)',
                        color: tipo === key ? 'var(--green-dark)' : 'var(--text)',
                        fontSize: 13,
                        fontWeight: tipo === key ? 700 : 400,
                        cursor: 'pointer',
                        fontFamily: 'var(--font)',
                        transition: 'all 0.12s',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <div
                    onClick={() => setIsServico(!isServico)}
                    style={{
                      width: 22, height: 22, borderRadius: 6,
                      background: isServico ? '#7c3aed' : 'var(--bg)',
                      border: isServico ? '2px solid #7c3aed' : '2px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    {isServico && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <span style={{ fontSize: 14, color: 'var(--text)' }}>👩‍⚕️ É um serviço profissional (doula, consultora, pediatra...)</span>
                </label>
              </div>

              <button
                className="btn-primary"
                disabled={!nome.trim() || !tipo}
                onClick={() => setStep(2)}
              >
                Próximo
              </button>
            </>
          )}

          {/* Step 2: Fotos */}
          {step === 2 && (
            <>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Fotos do local</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Fotos ajudam outras famílias a conhecer o espaço</div>
              <div style={{ fontSize: 12, color: '#e05b4e', background: '#fff1f0', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', marginBottom: 16 }}>
                ⚠️ Apenas fotos do espaço físico. Imagens com pessoas serão removidas.
              </div>

              {fotoURLs.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  {fotoURLs.map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={url} alt="" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1.5px solid var(--border)' }} />
                      <button onClick={() => { setFotos(p => p.filter((_, j) => j !== i)); setFotoURLs(p => p.filter((_, j) => j !== i)) }}
                        style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {fotos.length < 5 && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', border: '1.5px dashed var(--border)', borderRadius: 12, cursor: 'pointer', marginBottom: 20 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Adicionar fotos ({fotos.length}/5)</span>
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFotoSelect} />
                </label>
              )}

              <button className="btn-primary" onClick={() => setStep(3)}>
                {fotos.length > 0 ? 'Próximo' : 'Pular'}
              </button>
            </>
          )}

          {/* Step 3: Avaliação inicial */}
          {step === 3 && (
            <>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Sua avaliação</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Como é este local para famílias?</div>

              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Experiência geral</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: rExperiencia >= 8 ? 'var(--green-dark)' : rExperiencia >= 5 ? '#f59e0b' : rExperiencia > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                    {rExperiencia > 0 ? rExperiencia : '—'}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>/10</span>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setRExperiencia(n)} style={{
                      flex: 1, height: 34, borderRadius: 8, border: 'none',
                      background: n <= rExperiencia ? (rExperiencia >= 8 ? '#4caf85' : rExperiencia >= 5 ? '#f59e0b' : '#ef4444') : 'var(--border)',
                      cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      color: n <= rExperiencia ? 'white' : 'var(--text-muted)',
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

          {/* Step 4: Amenidades */}
          {step === 4 && (
            <>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Comodidades disponíveis</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Marque o que você encontrou no local</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
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

              {error && (
                <div style={{ padding: '10px 14px', background: '#fff1f0', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
                  {error}
                </div>
              )}

              <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, lineHeight: 1.5 }}>
                ℹ️ O local será revisado pela nossa equipe antes de aparecer no mapa. Agradecemos sua contribuição!
              </div>

              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ fontSize: 15, padding: '14px 20px' }}
              >
                {submitting ? 'Enviando...' : '🗺️ Enviar para o mapa'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
