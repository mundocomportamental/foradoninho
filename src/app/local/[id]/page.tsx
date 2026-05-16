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

// ── Componente RatingBar (escala 1-10, exibe número) ──────────────────
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
        <div style={{ height: '100%', width: `${v * 10}%`, background: v >= 8 ? '#33cccc' : v >= 5 ? '#f59e0b' : '#ef4444', borderRadius: 3, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}

// ── Componente SmileBar (escala 1-5, exibe carinha sem número) ─────────
const SMILE_ICONS = ['😞', '😕', '😐', '🙂', '😄']
function smileForValue(v: number): string {
  const idx = Math.min(Math.max(Math.round(v) - 1, 0), 4)
  return SMILE_ICONS[idx]
}
function SmileBar({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0
  const pct = v > 0 ? (v / 5) * 100 : 0
  const color = v >= 4 ? '#33cccc' : v >= 3 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 17, lineHeight: 1 }}>
          {value != null && v > 0 ? smileForValue(v) : '—'}
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.4s' }} />
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
                ? (value >= 8 ? '#33cccc' : value >= 5 ? '#f59e0b' : '#ef4444')
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

  // Contagem reativa de check-ins
  const [checkinCount, setCheckinCount] = useState<number>(0)

  // Lightbox de fotos
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Fluxo de denúncia/remoção
  const [reportStep, setReportStep] = useState(0)
  const [reportNome, setReportNome] = useState('')
  const [reportContato, setReportContato] = useState('')
  const [reportMotivo, setReportMotivo] = useState('')
  const [reportMsg, setReportMsg] = useState('')
  const [reportSending, setReportSending] = useState(false)
  const [reportDone, setReportDone] = useState(false)
  const [reportEhResponsavel, setReportEhResponsavel] = useState(false)

  async function sendReport() {
    setReportSending(true)
    try {
      await supabase.from('relatos').insert({
        local_id: id,
        nome: reportNome,
        contato: reportContato,
        motivo: reportMotivo,
        mensagem: reportMsg,
      })
    } catch {}
    setReportSending(false)
    setReportDone(true)
    setReportStep(4)
  }

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [{ data: localData }, { data: mediasData }, { count: realCheckinCount }] = await Promise.all([
        supabase.from('locais').select('*').eq('id', id).single(),
        supabase.from('avaliacoes_medias').select('*').eq('local_id', id).single(),
        supabase.from('checkins').select('*', { count: 'exact', head: true }).eq('local_id', id),
      ])
      if (localData) {
        setLocal(localData as Local)
        setCheckinCount(realCheckinCount ?? 0)
        // Inicializa amenidades: preferir escolha do usuário (salva por 1 dia), senão valores do DB
        try {
          const stored = localStorage.getItem(`amen_${id}`)
          if (stored) {
            const parsed = JSON.parse(stored)
            const savedAt = parsed.savedAt as number
            const oneDayMs = 24 * 60 * 60 * 1000
            if (Date.now() - savedAt < oneDayMs) {
              setAmenReportadas(parsed.data)
            } else {
              localStorage.removeItem(`amen_${id}`)
              const init: Record<string, boolean> = {}
              AMENIDADES.forEach(a => { init[a.key] = !!(localData as any)[a.key] })
              setAmenReportadas(init)
            }
          } else {
            const init: Record<string, boolean> = {}
            AMENIDADES.forEach(a => { init[a.key] = !!(localData as any)[a.key] })
            setAmenReportadas(init)
          }
        } catch {
          const init: Record<string, boolean> = {}
          AMENIDADES.forEach(a => { init[a.key] = !!(localData as any)[a.key] })
          setAmenReportadas(init)
        }
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
    try {
      const { error } = await supabase.from('checkins').insert({ local_id: id })
      if (!error) setCheckinCount(prev => prev + 1)
    } catch {}
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

      // Insere avaliação — ratings aprovados automaticamente, fotos ficam em imagens[] aguardando revisão manual
      await supabase.from('avaliacoes').insert({
        local_id: id,
        limpeza: rLimpeza || null,
        atendimento: rAtendimento || null,
        instalacoes: rInstalacoes || null,
        experiencia: rExperiencia || null,
        comentario: comment || null,   // armazenado mas não exibido publicamente
        imagens: uploadedUrls,         // fotos ficam em avaliacoes.imagens — publicar manualmente via locais.fotos_metadata
        aprovado: true,
        amenidades_reportadas: amenReportadas,
        periodo_ref: new Date().toISOString(),
      })

      // Salva amenidades no localStorage por 1 dia (o usuário vê sua própria seleção)
      try {
        localStorage.setItem(`amen_${id}`, JSON.stringify({ data: amenReportadas, savedAt: Date.now() }))
      } catch {}

      setDone(true)
      setFlowStep(0)

      // Re-busca as médias para refletir a nova avaliação imediatamente
      const { data: newMedias } = await supabase
        .from('avaliacoes_medias')
        .select('*')
        .eq('local_id', id)
        .single()
      if (newMedias) setMedias(newMedias as Medias)
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

  const fotoPrincipal = local.foto_principal
  const fotosSecundarias = (local.fotos_metadata ?? []).map((f: any) => f.url).filter(Boolean) as string[]
  const todasFotos: string[] = [
    ...(fotoPrincipal ? [fotoPrincipal] : []),
    ...fotosSecundarias.filter(u => u !== fotoPrincipal),
  ]

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
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? '#33cccc' : 'none'} stroke={isFav ? '#33cccc' : 'currentColor'} strokeWidth="2" strokeLinecap="round">
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
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#33cccc" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="9"/><polyline points="9,12 11,14 15,10"/>
              </svg>
              Certificado Fora do Ninho
            </div>
          )}
        </div>

        {/* Galeria de fotos */}
        {todasFotos.length > 0 && (
          <div style={{ margin: '0 16px 4px', overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {todasFotos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Foto ${i + 1} de ${local.nome}`}
                  onClick={() => setLightboxIndex(i)}
                  style={{
                    width: todasFotos.length === 1 ? '100%' : 200,
                    height: 160,
                    objectFit: 'cover',
                    borderRadius: 14,
                    flexShrink: 0,
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Médias de avaliação */}
        {totalRatings > 0 && (
          <div style={{ margin: '0 16px 4px' }}>
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Avaliações da comunidade</div>
              <SmileBar label="Limpeza" value={m('limpeza')} />
              <SmileBar label="Atendimento" value={m('atendimento')} />
              <SmileBar label="Instalações" value={m('instalacoes')} />
              <RatingBar label="Experiência geral" value={m('experiencia')} />
            </div>
          </div>
        )}

        {/* Comodidades */}
        {(() => {
          const hasAnyAmenity = AMENIDADES.some(a => !!local[a.key as keyof Local])
          return (
            <>
              <div className="section-title">Comodidades</div>
              {hasAnyAmenity ? (
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
              ) : (
                /* Nenhuma amenidade ainda — convite a avaliar */
                <div style={{ margin: '0 16px', background: 'var(--green-soft)', border: '1.5px solid var(--green-light)', borderRadius: 16, padding: '20px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✨</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    Seja o primeiro a avaliar
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
                    Ainda não temos informações sobre as comodidades deste local. Faça seu check-in e ajude outras famílias!
                  </div>
                  {!done && (
                    <button
                      className="btn-primary"
                      onClick={startCheckinFlow}
                      disabled={checkinDone && flowStep === 0}
                      style={{ opacity: (checkinDone && flowStep === 0) ? 0.7 : 1, maxWidth: 260, margin: '0 auto' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9"/><polyline points="9,12 11,14 15,10"/>
                      </svg>
                      {checkinDone ? 'Check-in feito!' : 'Fazer check-in e avaliar'}
                    </button>
                  )}
                </div>
              )}
            </>
          )
        })()}

        {/* Botão Check-in + Avaliar (quando já há amenidades) */}
        {AMENIDADES.some(a => !!local[a.key as keyof Local]) && (
          <div style={{ padding: '16px 16px 0' }}>
            {done ? (
              <div style={{ background: '#fff1f0', border: '1.5px solid #ef4444', borderRadius: 50, padding: '14px 20px', textAlign: 'center', fontWeight: 600, color: '#dc2626', fontSize: 14 }}>
                ❤️ Avaliação enviada! Obrigado pela contribuição.
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
        )}

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
            {checkinCount > 0
              ? `${checkinCount} check-ins confirmados`
              : 'Nenhum check-in ainda. Seja o primeiro!'
            }
          </div>
        </div>

        <div style={{ padding: '0 16px 28px', textAlign: 'center' }}>
          <button
            onClick={() => setReportStep(1)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font)', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            Reportar problema ou solicitar remoção do estabelecimento
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

      {/* ── Lightbox de fotos ── */}
      {lightboxIndex !== null && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', zIndex: 2000, display: 'flex', flexDirection: 'column' }}
          onClick={() => setLightboxIndex(null)}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxIndex(null)}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{lightboxIndex + 1} / {todasFotos.length}</span>
            <div style={{ width: 38 }} />
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }} onClick={e => e.stopPropagation()}>
            <img
              src={todasFotos[lightboxIndex]}
              alt={`Foto ${lightboxIndex + 1}`}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 10 }}
            />
          </div>

          {todasFotos.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px 36px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setLightboxIndex(i => i! > 0 ? i! - 1 : todasFotos.length - 1)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 50, padding: '10px 22px', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font)' }}
              >← Anterior</button>
              <button
                onClick={() => setLightboxIndex(i => i! < todasFotos.length - 1 ? i! + 1 : 0)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 50, padding: '10px 22px', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font)' }}
              >Próxima →</button>
            </div>
          )}
        </div>
      )}

      {/* ── Modal de denúncia / remoção ── */}
      {reportStep > 0 && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1500, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ background: 'var(--bg-card)', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '20px 20px 40px' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />

            {/* Step 1: Você é o responsável? */}
            {reportStep === 1 && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Você é responsável por este estabelecimento?</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
                  Isso nos ajuda a entender o tipo de solicitação e direcionar sua mensagem corretamente.
                </div>
                <button
                  onClick={() => { setReportEhResponsavel(true); setReportMotivo('remover'); setReportStep(2) }}
                  style={{ width: '100%', padding: '14px 16px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 14, marginBottom: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)' }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>✅ Sim, sou o responsável</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Quero solicitar alterações ou a remoção do estabelecimento</div>
                </button>
                <button
                  onClick={() => { setReportEhResponsavel(false); setReportMotivo(''); setReportStep(2) }}
                  style={{ width: '100%', padding: '14px 16px', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 14, marginBottom: 20, cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font)' }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>👤 Não, sou um visitante</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Quero reportar um problema ou informação incorreta</div>
                </button>
                <button onClick={() => setReportStep(0)} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                  Cancelar
                </button>
              </>
            )}

            {/* Step 2: Formulário */}
            {reportStep === 2 && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>Nos conta o que está acontecendo</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>Suas informações são tratadas com sigilo.</div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Seu nome *</label>
                  <input
                    value={reportNome}
                    onChange={e => setReportNome(e.target.value)}
                    placeholder="Como podemos te chamar?"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg)', fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text)', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Contato (e-mail ou WhatsApp) *</label>
                  <input
                    value={reportContato}
                    onChange={e => setReportContato(e.target.value)}
                    placeholder="Para entrarmos em contato, se necessário"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg)', fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text)', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Motivo *</label>
                  <select
                    value={reportMotivo}
                    onChange={e => setReportMotivo(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg)', fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text)', boxSizing: 'border-box' }}
                  >
                    <option value="">Selecione um motivo</option>
                    <option value="remover">Solicitar remoção do estabelecimento</option>
                    <option value="info_incorreta">Informação incorreta</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Mensagem</label>
                  <textarea
                    value={reportMsg}
                    onChange={e => setReportMsg(e.target.value)}
                    placeholder="Descreva o problema com mais detalhes..."
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg)', fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text)', boxSizing: 'border-box', minHeight: 90, resize: 'vertical' }}
                  />
                </div>

                <button
                  onClick={() => setReportStep(3)}
                  disabled={!reportNome || !reportContato || !reportMotivo}
                  style={{ width: '100%', padding: '14px', background: (!reportNome || !reportContato || !reportMotivo) ? 'var(--border)' : 'var(--green)', color: (!reportNome || !reportContato || !reportMotivo) ? 'var(--text-muted)' : 'white', border: 'none', borderRadius: 50, fontSize: 15, fontWeight: 700, cursor: (!reportNome || !reportContato || !reportMotivo) ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', marginBottom: 10 }}
                >
                  Revisar e enviar
                </button>
                <button onClick={() => setReportStep(1)} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                  Voltar
                </button>
              </>
            )}

            {/* Step 3: Confirmação */}
            {reportStep === 3 && (
              <>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Tudo certo para enviar?</div>
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Nome</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>{reportNome}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Contato</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>{reportContato}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Motivo</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: reportMsg ? 12 : 0 }}>
                    {reportMotivo === 'remover' ? 'Solicitar remoção' : reportMotivo === 'info_incorreta' ? 'Informação incorreta' : 'Outro'}
                  </div>
                  {reportMsg && (
                    <>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Mensagem</div>
                      <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{reportMsg}</div>
                    </>
                  )}
                </div>
                <button
                  onClick={sendReport}
                  disabled={reportSending}
                  style={{ width: '100%', padding: '14px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 50, fontSize: 15, fontWeight: 700, cursor: reportSending ? 'not-allowed' : 'pointer', fontFamily: 'var(--font)', marginBottom: 10, opacity: reportSending ? 0.7 : 1 }}
                >
                  {reportSending ? 'Enviando...' : 'Confirmar e enviar'}
                </button>
                <button onClick={() => setReportStep(2)} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                  Voltar
                </button>
              </>
            )}

            {/* Step 4: Sucesso */}
            {reportStep === 4 && (
              <>
                <div style={{ textAlign: 'center', padding: '20px 0 24px' }}>
                  <div style={{ fontSize: 52, marginBottom: 16 }}>
                    {reportMotivo === 'remover' ? '🥺' : '💚'}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
                    {reportMotivo === 'remover' ? 'Recebemos seu pedido' : 'Muito obrigado!'}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.65 }}>
                    {reportMotivo === 'remover'
                      ? 'É uma pena ver que você prefere sair do nosso ninho... Entraremos em contato pelo seu e-mail ou WhatsApp em até 72 horas para confirmar a remoção.'
                      : 'Muito obrigado por ajudar essa comunidade! Sua mensagem foi recebida e nossa equipe vai verificar as informações em breve.'
                    }
                  </div>
                </div>
                <button
                  onClick={() => { setReportStep(0); setReportNome(''); setReportContato(''); setReportMotivo(''); setReportMsg(''); setReportDone(false) }}
                  style={{ width: '100%', padding: '14px', background: 'var(--green)', color: 'white', border: 'none', borderRadius: 50, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}
                >
                  Fechar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
