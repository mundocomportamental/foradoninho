'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import type { Local } from '@/lib/types'
import { AMENIDADES, TIPO_LABELS } from '@/lib/types'

export default function LocalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [local, setLocal] = useState<Local | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkinDone, setCheckinDone] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [starRating, setStarRating] = useState(0)
  const [starHover, setStarHover] = useState(0)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('locais').select('*').eq('id', id).single()
      if (data) setLocal(data as Local)
      setLoading(false)
    }
    load()
    // Check favorites
    try {
      const favs = JSON.parse(localStorage.getItem('favoritos') || '[]')
      setIsFav(favs.some((f: any) => f.id === id))
    } catch {}
  }, [id, supabase])

  async function doCheckin() {
    setCheckinDone(true)
    try {
      await supabase.from('checkins').insert({ local_id: id })
    } catch {}
  }

  async function sendReview() {
    if (!starRating) return
    setSending(true)
    try {
      await supabase.from('avaliacoes').insert({
        local_id: id,
        rating: starRating,
        comentario: comment,
      })
      setShowReview(false)
      setStarRating(0)
      setComment('')
    } finally {
      setSending(false)
    }
  }

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

  if (loading) {
    return (
      <div className="app-shell">
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!local) {
    return (
      <div className="app-shell">
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Local não encontrado</div>
        </div>
        <BottomNav />
      </div>
    )
  }

  const stars = Math.round(Number(local.rating))

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
            <button
              onClick={toggleFav}
              style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isFav ? '#4caf85' : 'none'} stroke={isFav ? '#4caf85' : 'currentColor'} strokeWidth="2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            <button style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Map thumbnail */}
        <div style={{ margin: '0 16px 0', height: 120, borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--green-light)', position: 'relative', border: '1px solid var(--border)' }}>
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4caf85" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>

        {/* Header card */}
        <div className="local-header-card">
          <div className="local-tipo-badge">{TIPO_LABELS[local.tipo] || local.tipo}</div>
          <div className="local-nome">{local.nome}</div>
          <div className="local-address">
            {local.endereco && `${local.endereco} · `}{local.cidade}, {local.estado}
          </div>
          <div className="rating-row">
            <div className="stars">
              {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className="star">{i <= stars ? '★' : '☆'}</span>
              ))}
            </div>
            <span className="rating-num">{Number(local.rating).toFixed(1)}</span>
            <span className="rating-count">({local.total_ratings} avaliações)</span>
          </div>
          {local.certificado_pitstop && (
            <div className="certified-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4caf85" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="9"/><polyline points="9,12 11,14 15,10"/>
              </svg>
              Certificado PitStop Baby
            </div>
          )}
        </div>

        {/* Amenidades */}
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

        {/* Check-in */}
        <div style={{ padding: '16px 16px 0' }}>
          <button
            className="btn-primary"
            onClick={doCheckin}
            disabled={checkinDone}
            style={{ opacity: checkinDone ? 0.7 : 1 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9"/><polyline points="9,12 11,14 15,10"/>
            </svg>
            {checkinDone ? 'Check-in feito!' : 'Check-in rápido'}
          </button>
        </div>

        {/* Action row */}
        <div className="action-row">
          <button
            className="btn-outline"
            onClick={() => setShowReview(!showReview)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Avaliar
          </button>
          <button className="btn-outline" onClick={openMaps}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Direções
          </button>
        </div>

        {/* Review form */}
        {showReview && (
          <div className="review-section" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Deixar avaliação</div>
            <div className="star-picker">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  className="star-btn"
                  onMouseEnter={() => setStarHover(i)}
                  onMouseLeave={() => setStarHover(0)}
                  onClick={() => setStarRating(i)}
                >
                  {i <= (starHover || starRating) ? '★' : '☆'}
                </button>
              ))}
            </div>
            <textarea
              className="review-textarea"
              placeholder="Como foi a experiência? Conte para outras famílias..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
            <button
              className="btn-primary"
              style={{ marginTop: 12 }}
              onClick={sendReview}
              disabled={!starRating || sending}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              {sending ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          </div>
        )}

        {/* Check-ins da comunidade */}
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
      <BottomNav />
    </div>
  )
}
