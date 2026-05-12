'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import type { Local } from '@/lib/types'
import { AMENIDADES, TIPO_LABELS } from '@/lib/types'

// ── Tipos ──────────────────────────────────────────────────────────────
interface Medias {
  limpeza_total: number | null
  atendimento_total: number | null
  instalacoes_total: number | null
  experiencia_total: number | null
  limpeza_3m: number | null
  atendimento_3m: number | null
  instalacoes_3m: number | null
  experiencia_3m: number | null
  total_historico: number
  total_3m: number
}

// ── Componente RatingBar ───────────────────────────────────────────────
function RatingBar({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: v >= 8 ? 'var(--green-dark)' : v >= 5 ? '#f59e0b' : '#ef4444' }}>
          {value != null ? v.toFixed(1) : '—'}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${v * 10}%`, background: v >= 8 ? '#4caf85' : v >= 5 ? '#f59e0b' : '#ef4444', borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

// ── ScorePicker geral (1-10, barras numéricas) ────────────────────────
function ScorePicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{label}</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: value >= 8 ? 'var(--green-dark)' : value >= 5 ? '#f59e0b' : value > 0 ? '#ef4444' : 'var(--text-muted)' }}>
          {value > 0 ? value : '—'}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>/10</span>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              flex: 1, height: 36, borderRadius: 8, border: 'none',
              background: n <= value
                ? (value >= 8 ? '#4caf85' : value >= 5 ? '#f59e0b' : '#ef4444')
                : 'var(--border)',
              cursor: 'pointer', transition: 'background 0.1s',
              fontSize: 12, fontWeight: 700,
              color: n <= value ? 'white' : 'var(--text-muted)',
            }}
          >{n}</button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Péssima</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Excepcional</span>
      </div>
    </div>
  )
}

// ── SmilePicker (1-5 com carinhas, sem números) ───────────────────────
const SMILES = ['😞', '😕', '😐', '🙂', '😄']
const SMILE_LABELS = ['Ruim', 'Regular', 'Ok', 'Bom', 'Ótimo']

function SmilePicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>{label}</span>
        {value > 0 && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{SMILE_LABELS[value - 1]}</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
        {SMILES.map((emoji, i) => {
          const n = i + 1
          const active = value === n
          return (
            <button
              key={n}
              onClick={() => onChange(n)}
              style={{
                flex: 1, height: 54, borderRadius: 12, border: active ? '2px solid var(--green)' : '1.5px solid var(--border)',
                background: active ? 'var(--green-soft)' : 'var(--bg)',
                cursor: 'pointer', transition: 'all 0.15s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                fontSize: active ? 26 : 22,
                transform: active ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              <span>{emoji}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────
export default function LocalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [local, setLocal] = useState<Local | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [medias, setMedias] = useState<Medias | null>(null)
  const [filtroPeriodo, setFiltroPeriodo] = useState<'total' | '3m'>('total')

  // Fluxo checkin + avaliação: 4 etapas
  // 0 = fechado, 1 = ratings, 2 = fotos, 3 = comentário, 4 = confirmar amenidades
  const [flowStep, setFlowStep] = useState(0)
  const [checkinDone, setCheckinDone] = useState(false)

  // Ratings (1-10)
  const [rLimpeza, setRLimpeza] = useState(0)
  const [rAtendimento, setRAtendimento] = useState(0)
  const [rInstalacoes, setRInstalacoes] = useState(0)
  const [rExperiencia, setRExperiencia] = useState(0)

  // Fotos
  const [fotos, setFotos] = useState<File[]>([])
  const [fotoURLs, setFotoURLs] = useState<string[]>([])

  // Comentário
  const [comment, setComment] = useState('')

  // Amenidades reportadas
  const [amenReportadas, setAmenReportadas] = useState<Record<string, boolean>>({})

  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: localData }, { data: mediasData }] = await Promise.all([
        supabase.from('locais').select('*').eq('id', id).single(),
        supabase.from('avaliacoes_medias').select('*').eq('local_id', id).single(),
      ])
      if (localData) {
        setLocal(localData as Local)
        // Inicializa amenidades com os valores atuais
        const init: Record<string, boolean> = {}
        AMENIDADES.forEach(a => { init[a.key] = !!(localData as any)[a.key] })
        setAmenReportadas(init)
      }
      if (mediasData) setMedias(mediasData as Medias)
      setLoading(false)
    }
    load()
    try {
      const favs = JSON.parse(localStorage.getItem('favoritos') || '[]')
      setIsFav(favs.some((f: any) => f.id === id))
    } catch {}
  }, [id, supabase])

  // ── Checkin + abre fluxo de avaliação ───────────────────────────────
  async function startCheckinFlow() {
    setCheckinDone(true)
    setFlowStep(1)
    try { await supabase.from('checkins').insert({ local_id: id }) } catch {}
  }

  // ── Upload de fotos ─────────────────────────────────────────────────
  function handleFotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    setFotos(prev => [...prev, ...files].slice(0, 5))
    files.forEach(f => {
      const url = URL.createObjectURL(f)
      setFotoURLs(prev => [...prev, url].slice(0, 5))
    })
  }

  // ── Envio final ──────────────────────────────────────────────────────
  async function sendReview() {
    setSending(true)
    try {
      // Upload das fotos para Storage (bucket 'locais-fotos')
      const uploadedUrls: string[] = []
      for (const foto of fotos) {
        const ext = foto.name.split('.').pop()
        const path = `${id}/${Date.now()}.${ext}`
        const { data: up } = await supabase.storage.from('locais-fotos').upload(path, foto, { upsert: false })
        if (up) {
          const { data: pub } = supabase.storage.from('locais-fotos').getPublicUrl(up.path)
          if (pub) uploadedUrls.push(pub.publicUrl)
        }
      }

      // Insere avaliação (aprovado=false — aguarda moderação)
      await supabase.from('avaliacoes').insert({
        local_id: id,
        limpeza: rLimpeza || null,
        atendimento: rAtendimento || null,
        instalacoes: rInstalacoes || null,
        experiencia: rExperiencia || null,
        comentario: comment || null,
        imagens: uploadedUrls,
        aprovado: false,
        amenidades_reportadas: amenReportadas,
        periodo_ref: new Date().toISOString(),
      })

      setDone(true)
      setFlowStep(0)
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  // ── Favorito ─────────────────────────────────────────────────────────
  function toggleFav() {
    if (!local) return
    try {
      const favs = JSON.parse(localStorage.getItem('favoritos') || '[]')
      if (isFav) {
        localStorage.setItem('favoritos', JSON.stringify(favs.filter((f: any) => f.id !== id)))
        setIsFav(false)
      } else {
        localStorage.setItem('favoritos', JSON.stringify([local, ...favs]))
        setIsFav(true)
      }
    } catch {}
  }

  function openMaps() {
    if (!local) return
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${local.lat},${local.lng}`, '_blank')
  }

  // ── Loading / Not found ───────────────────────────────────────────────
  if (loading) return (
    <div className="app-shell">
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>
      </div>
      <BottomNav />
    </div>
  )

  if (!local) return (
    <div className="app-shell">
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Local não encontrado</div>
      </div>
      <BottomNav />
    </div>
  )

  const totalRatings = medias?.total_historico ?? 0
  const m = (key: 'limpeza' | 'atendimento' | 'instalacoes' | 'experiencia') =>
    filtroPeriodo === '3m' ? medias?.[`${key}_3m`] ?? null : medias?.[`${key}_total`] ?? null

  return (
    <div className="app-shell">
      <div className="page">
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
          <Link href="/mapa" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={toggleFav} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? '#4caf85' : 'none'} stroke={isFav ? '#4caf85' : 'currentColor'} strokeWidth="2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Header card */}
        <div className="local-header-card">
          <div className="local-tipo-badge">{TIPO_LABELS[local.tipo] || local.tipo}</div>
          <div className="local-nome">{local.nome}</div>
          <div className="local-address">{local.endereco && `${local.endereco} · `}{local.cidade}, {local.estado}</div>

          {/* Avaliação média geral */}
          {totalRatings > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['total', '3m'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setFiltroPeriodo(p)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 20,
                      border: '1.5px solid',
                      borderColor: filtroPeriodo === p ? 'var(--green)' : 'var(--border)',
                      background: filtroPeriodo === p ? 'var(--green-soft)' : 'transparent',
                      color: filtroPeriodo === p ? 'var(--green-dark)' : 'var(--text-muted)',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font)',
                    }}
                  >
                    {p === 'total' ? 'Histórico' : 'Últimos 3 meses'}
                  </button>
                ))}
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {filtroPeriodo === '3m' ? `${medias?.total_3m ?? 0} avaliações` : `${totalRatings} avaliações`}
              </span>
            </div>
          )}

          {local.certificado_pitstop && (
            <div className="certified-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4caf85" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="9"/><polyline points="9,12 11,14 15,10"/>
              </svg>
              Certificado PitStop Baby
            </div>
          )}
        </div>

        {/* Médias de avaliação */}
        {totalRatings > 0 && (
          <div style={{ margin: '0 16px 4px' }}>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Avaliações da comunidade</div>
              <RatingBar label="Limpeza" value={m('limpeza')} />
              <RatingBar label="Atendimento" value={m('atendimento')} />
              <RatingBar label="Instalações" value={m('instalacoes')} />
              <RatingBar label="Experiência geral" value={m('experiencia')} />
            </div>
          </div>
        )}

        {/* Comodidades */}
        <div className="section-title">Comodidades</div>
        <div className="amenities-grid">
          {AMENIDADES.map(a => {
            const has = !!local[a.key as keyof Local]
            return (
              <div key={a.key} className={`amenity-chip${has ? ' has' : ''}`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {has
                    ? <><circle cx="12" cy="12" r="9"/><polyline points="9,12 11,14 15,10"/></>
                    : <><circle cx="12" cy="12" r="9"/><line x1="8" y1="12" x2="16" y2="12"/></>
                  }
                </svg>
                {a.label}
                {has && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600 }}>✓</span>}
              </div>
            )
          })}
        </div>

        {/* Botão Check-in + Avaliar */}
        <div style={{ padding: '16px 16px 0' }}>
          {done ? (
            <div style={{ background: 'var(--green-soft)', border: '1.5px solid var(--green)', borderRadius: 50, padding: '14px 20px', textAlign: 'center', fontWeight: 600, color: 'var(--green-dark)', fontSize: 14 }}>
              ✓ Avaliação enviada! Obrigado pela contribuição.
            </div>
          ) : (
            <button
              className="btn-primary"
              onClick={startCheckinFlow}
              disabled={checkinDone && flowStep === 0}
              style={{ opacity: (checkinDone && flowStep === 0) ? 0.7 : 1 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9"/><polyline points="9,12 11,14 15,10"/>
              </svg>
              {checkinDone ? 'Check-in feito!' : 'Realizar Check-in e Avaliar'}
            </button>
          )}
        </div>

        {/* Direções */}
        <div className="action-row">
          <button className="btn-outline" onClick={openMaps}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Direções
          </button>
        </div>

        {/* Check-ins */}
        <div className="section-title">Check-ins da comunidade</div>
        <div style={{ padding: '0 16px 16px' }}>
          <div className="card" style={{ padding: 16, color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
            {local.total_checkins > 0
              ? `${local.total_checkins} check-ins confirmados`
              : 'Nenhum check-in ainda. Seja o primeiro!'
            }
          </div>
        </div>

        <div style={{ padding: '0 16px 8px' }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Algo deu errado?
          </button>
        </div>
      </div>

      {/* ── Modal fluxo de avaliação ── */}
      {flowStep > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--bg-card)', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: '20px 20px 40px' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 16px' }} />

            {/* Indicador de etapa */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
              {[1,2,3,4].map(s => (
                <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= flowStep ? 'var(--green)' : 'var(--border)', transition: 'background 0.2s' }} />
              ))}
            </div>

            {/* Etapa 1: Experiência geral (1-10) + Limpeza/Atendimento/Instalações (carinhas 1-5) */}
            {flowStep === 1 && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Como foi sua experiência?</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Avalie de 1 a 10 na experiência geral e use as carinhas para o resto</div>
                <ScorePicker label="Experiência geral" value={rExperiencia} onChange={setRExperiencia} />
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0 18px' }} />
                <SmilePicker label="Limpeza" value={rLimpeza} onChange={setRLimpeza} />
                <SmilePicker label="Atendimento" value={rAtendimento} onChange={setRAtendimento} />
                <SmilePicker label="Instalações" value={rInstalacoes} onChange={setRInstalacoes} />
                <button
                  className="btn-primary"
                  style={{ marginTop: 8 }}
                  disabled={!rExperiencia || !rLimpeza || !rAtendimento || !rInstalacoes}
                  onClick={() => setFlowStep(2)}
                >
                  Próximo
                </button>
                <button className="btn-secondary" onClick={() => setFlowStep(0)}>Cancelar</button>
              </>
            )}

            {/* Etapa 2: Fotos */}
            {flowStep === 2 && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Adicionar fotos</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Fotos do estabelecimento ajudam outras famílias.
                </div>
                <div style={{ fontSize: 12, color: '#e05b4e', background: '#fff1f0', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 12px', marginBottom: 16 }}>
                  ⚠️ São permitidas apenas fotos do espaço físico. Imagens com pessoas serão removidas automaticamente.
                </div>

                {fotoURLs.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {fotoURLs.map((url, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, border: '1.5px solid var(--border)' }} />
                        <button
                          onClick={() => {
                            setFotos(p => p.filter((_, j) => j !== i))
                            setFotoURLs(p => p.filter((_, j) => j !== i))
                          }}
                          style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', border: 'none', color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >×</button>
                      </div>
                    ))}
                  </div>
                )}

                {fotos.length < 5 && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', border: '1.5px dashed var(--border)', borderRadius: 12, cursor: 'pointer', marginBottom: 16 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Adicionar fotos ({fotos.length}/5)</span>
                    <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFotoSelect} />
                  </label>
                )}

                <button className="btn-primary" onClick={() => setFlowStep(3)}>
                  {fotos.length > 0 ? 'Próximo' : 'Pular'}
                </button>
                <button className="btn-secondary" onClick={() => setFlowStep(1)}>Voltar</button>
              </>
            )}

            {/* Etapa 3: Comentário */}
            {flowStep === 3 && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Deixar um comentário</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                  Opcional. Sua avaliação escrita será revisada antes de ser publicada.
                </div>
                <div style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '8px 12px', marginBottom: 14 }}>
                  ℹ️ Comentários passam por moderação e não são publicados imediatamente.
                </div>
                <textarea
                  className="review-textarea"
                  placeholder="Como foi a experiência? Dicas para outras famílias..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  style={{ minHeight: 100 }}
                />
                <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => setFlowStep(4)}>
                  Próximo
                </button>
                <button className="btn-secondary" onClick={() => setFlowStep(2)}>Voltar</button>
              </>
            )}

            {/* Etapa 4: Confirmar amenidades */}
            {flowStep === 4 && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Confirmar comodidades</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  Marque as comodidades que você encontrou disponíveis
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                  {AMENIDADES.map(a => (
                    <label key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: amenReportadas[a.key] ? 'var(--green)' : 'var(--bg)',
                        border: amenReportadas[a.key] ? '2px solid var(--green)' : '2px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s', flexShrink: 0,
                      }}
                        onClick={() => setAmenReportadas(p => ({ ...p, [a.key]: !p[a.key] }))}
                      >
                        {amenReportadas[a.key] && (
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
                  onClick={sendReview}
                  disabled={sending}
                >
                  {sending ? 'Enviando...' : 'Enviar avaliação'}
                </button>
                <button className="btn-secondary" onClick={() => setFlowStep(3)}>Voltar</button>
              </>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
