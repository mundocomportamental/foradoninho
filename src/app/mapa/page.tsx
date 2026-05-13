'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import BottomNav from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Local } from '@/lib/types'
import { FILTROS, TIPO_LABELS, AMENIDADES } from '@/lib/types'

const FILTROS_INFO: Record<string, { title: string; desc: string; icon: string }> = {
  fraldario: {
    icon: '🧷',
    title: 'Fraldário / Trocador',
    desc: 'Local equipado para troca de fraldas com trocador para bebês.',
  },
  espaco_familia: {
    icon: '👨‍👩‍👧',
    title: 'Espaço Família',
    desc: 'Área dedicada às famílias — amamentação, banheiro família e descanso.',
  },
  espaco_kids: {
    icon: '🛝',
    title: 'Espaço Kids / Playground',
    desc: 'Área de entretenimento infantil — playground, brinquedoteca e similares.',
  },
  microondas: {
    icon: '📡',
    title: 'Microondas',
    desc: 'Microondas disponível para aquecer mamadeiras e refeições.',
  },
  menu_kids: {
    icon: '🍽️',
    title: 'Menu Kids',
    desc: 'Cardápio especial pensado para crianças.',
  },
  cadeirão: {
    icon: '🪑',
    title: 'Cadeirão',
    desc: 'Cadeirão de bebê disponível para uso nas refeições.',
  },
  pet_friendly: {
    icon: '🐾',
    title: 'Pet-Friendly',
    desc: 'Local que aceita animais de estimação.',
  },
}

const AMENIDADES_POPUP = [
  { icon: '🧷', label: 'Fraldário / Trocador', desc: 'Trocador de fraldas e espaço adequado para higiene do bebê' },
  { icon: '👨‍👩‍👧', label: 'Espaço Família', desc: 'Área reservada para amamentação e conforto da família' },
  { icon: '🛝', label: 'Espaço Kids / Playground', desc: 'Área de entretenimento e recreação infantil' },
  { icon: '📡', label: 'Microondas', desc: 'Para aquecer mamadeiras, papinhas e refeições' },
  { icon: '🍽️', label: 'Menu Kids', desc: 'Cardápio especial e adequado para crianças' },
  { icon: '🪑', label: 'Cadeirão', desc: 'Cadeirão de bebê disponível nas refeições' },
  { icon: '🐾', label: 'Pet-Friendly', desc: 'Estabelecimento que aceita seus animais de estimação' },
]

// ── Popup de boas-vindas ────────────────────────────────────────────────
function WelcomePopup({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      zIndex: 900, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20,
        boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
        width: '100%', maxWidth: 380,
        maxHeight: '88vh', overflowY: 'auto',
        padding: '22px 20px 24px',
        position: 'relative',
      }}>
        {/* Fechar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 28, height: 28, borderRadius: '50%',
            border: '1px solid var(--border)', background: 'var(--bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Ícone */}
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'var(--green-soft)', border: '1.5px solid var(--green-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 24 }}>🪺</span>
        </div>

        {/* Título */}
        <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 10, lineHeight: 1.3 }}>
          Bem-vindos ao Fora do Ninho!
        </div>

        {/* Texto intro */}
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
          Sabemos o quão necessário é ter uma rede de apoio para o seu bebê — seja na estrada ou em casa, dentro ou fora do ninho.
        </p>

        {/* Divisor */}
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          O que você encontra aqui
        </div>

        {/* Bullet points das amenidades */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {AMENIDADES_POPUP.map(a => (
            <div key={a.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: 'var(--green-soft)', border: '1px solid var(--green-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16,
              }}>
                {a.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 1 }}>{a.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Botão CTA */}
        <button
          onClick={onClose}
          className="btn-primary"
          style={{ fontSize: 14, padding: '13px 20px' }}
        >
          Explorar o mapa 🗺️
        </button>
      </div>
    </div>
  )
}

// ── Botão de info dos filtros ──────────────────────────────────────────
function FiltrosInfoButton() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 30, height: 30, borderRadius: '50%',
          border: '1.5px solid var(--border)',
          background: open ? 'var(--green-soft)' : 'rgba(255,255,255,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,0.10)',
          backdropFilter: 'blur(6px)',
        }}
        aria-label="Informações sobre os filtros"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={open ? 'var(--green-dark)' : 'var(--text-muted)'} strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="8"/>
          <line x1="12" y1="12" x2="12" y2="16"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 36, right: 0, zIndex: 600,
          background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
          boxShadow: '0 8px 28px rgba(0,0,0,0.16)', padding: '14px 0',
          width: 270, maxHeight: '70vh', overflowY: 'auto',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', padding: '0 14px 10px', borderBottom: '1px solid var(--border)' }}>
            O que significa cada filtro?
          </div>
          {FILTROS.map(f => {
            const info = FILTROS_INFO[f.key]
            if (!info) return null
            return (
              <div key={f.key} style={{ display: 'flex', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{info.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{info.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45 }}>{info.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function MapaPage() {
  const [locais, setLocais] = useState<Local[]>([])
  const [filtro, setFiltro] = useState<string | null>(null)
  const [filtroProfissionais, setFiltroProfissionais] = useState(false)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedLocal, setSelectedLocal] = useState<Local | null>(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Mostra popup somente na primeira visita
  useEffect(() => {
    try {
      const seen = localStorage.getItem('welcome_seen')
      if (!seen) setShowWelcome(true)
    } catch {}
  }, [])

  function closeWelcome() {
    setShowWelcome(false)
    try { localStorage.setItem('welcome_seen', '1') } catch {}
  }

  const fetchLocais = useCallback(async (lat: number, lng: number) => {
    setLoading(true)
    try {
      const { data } = await supabase.from('locais').select('*').eq('is_active', true)
      if (data) {
        const sorted = (data as Local[]).sort((a, b) => {
          const da = Math.sqrt(Math.pow(a.lat - lat, 2) + Math.pow(a.lng - lng, 2))
          const db = Math.sqrt(Math.pow(b.lat - lat, 2) + Math.pow(b.lng - lng, 2))
          return da - db
        })
        setLocais(sorted)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude }
        setUserPos(pos)
        setMapCenter(pos)
        fetchLocais(pos.lat, pos.lng)
      },
      () => {
        const def = { lat: -23.22, lng: -46.58 }
        setUserPos(def)
        setMapCenter(def)
        fetchLocais(def.lat, def.lng)
      }
    )
  }, [fetchLocais])

  const filtered = locais.filter((l) => {
    if (filtro && !l[filtro as keyof Local]) return false
    if (filtroProfissionais && !l.is_servico) return false
    if (search && !l.nome.toLowerCase().includes(search.toLowerCase()) &&
      !l.cidade.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function saveRecent(local: Local) {
    try {
      const existing = JSON.parse(localStorage.getItem('recentes') || '[]')
      const updated = [local, ...existing.filter((r: Local) => r.id !== local.id)].slice(0, 20)
      localStorage.setItem('recentes', JSON.stringify(updated))
    } catch {}
  }

  function handleMarkerClick(id: string) {
    const local = locais.find(l => l.id === id)
    if (local) {
      saveRecent(local)
      setSelectedLocal(local)
    }
  }

  function handleLocalClick(id: string) {
    router.push(`/local/${id}`)
  }

  const amenLabels = (l: Local) => {
    const items = []
    if (l.fraldario) items.push('Fraldário')
    if (l.espaco_familia) items.push('Espaço Família')
    if (l.espaco_kids) items.push('Espaço Kids')
    if (l.microondas) items.push('Microondas')
    if (l.menu_kids) items.push('Menu Kids')
    if (l.cadeirão) items.push('Cadeirão')
    if (l.pet_friendly) items.push('Pet-Friendly')
    return items.slice(0, 3)
  }

  return (
    <div className="app-shell">
      {/* Popup de boas-vindas */}
      {showWelcome && <WelcomePopup onClose={closeWelcome} />}

      {/* Map layer */}
      <div className="map-wrapper">
        {mapCenter && (
          <MapView
            locais={filtered}
            userPos={userPos}
            center={mapCenter}
            onMarkerClick={handleMarkerClick}
          />
        )}
      </div>

      {/* Top overlay - search + chips */}
      <div className="map-overlay-top">
        <div className="map-search-wrapper">
          <svg className="map-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-bar"
            placeholder="Buscar causas perto de você..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div className="map-chips-row" style={{ flex: 1, overflowX: 'auto' }}>
            {/* Filtro Profissionais */}
            <button
              className={`filter-chip${filtroProfissionais ? ' active' : ''}`}
              onClick={() => setFiltroProfissionais(p => !p)}
              style={filtroProfissionais ? {
                background: '#EFE8FE',
                borderColor: '#9f7aea',
                color: '#6b21a8',
              } : undefined}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Profissionais
            </button>
            {/* Filtros de amenidades */}
            {FILTROS.map(f => {
              const isActive = filtro === f.key
              return (
                <button
                  key={f.key}
                  className={`filter-chip${isActive ? ' active' : ''}`}
                  onClick={() => setFiltro(filtro === f.key ? null : f.key)}
                >
                  {f.label}
                </button>
              )
            })}
          </div>
          <FiltrosInfoButton />
        </div>
      </div>

      {/* Mini card do local selecionado */}
      {selectedLocal && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(var(--nav-height) + 12px)',
            left: 12,
            right: 12,
            zIndex: 450,
            background: 'var(--bg-card)',
            borderRadius: 20,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            padding: '16px 16px 14px',
            border: '1px solid var(--border)',
          }}
        >
          <button
            onClick={() => setSelectedLocal(null)}
            style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--green-soft)', border: '1.5px solid var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 32" fill="none">
                <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 16 9 16s9-9.25 9-16c0-4.97-4.03-9-9-9z" fill="#33cccc" stroke="white" strokeWidth="1.5"/>
                <circle cx="12" cy="9" r="3.5" fill="white" opacity="0.9"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-dark)', background: 'var(--green-soft)', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 4 }}>
                {TIPO_LABELS[selectedLocal.tipo] || selectedLocal.tipo}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedLocal.nome}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {selectedLocal.endereco ? `${selectedLocal.endereco} · ` : ''}{selectedLocal.cidade}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ color: '#f5a623', fontSize: 14 }}>★</span>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{Number(selectedLocal.rating).toFixed(1)}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({selectedLocal.total_ratings})</span>
            </div>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }}>
                <circle cx="12" cy="12" r="9"/><polyline points="12,7 12,12 15,15"/>
              </svg>
              {selectedLocal.total_checkins} check-ins
            </span>
            {selectedLocal.certificado_pitstop && (
              <>
                <span style={{ color: 'var(--border)' }}>·</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#059669' }}>✓ Verificado</span>
              </>
            )}
          </div>

          {/* Amenidades ou "Seja o primeiro a avaliar" */}
          {(() => {
            const all = [
              selectedLocal.fraldario && 'Fraldário',
              selectedLocal.espaco_familia && 'Espaço Família',
              selectedLocal.espaco_kids && 'Espaço Kids',
              selectedLocal.microondas && 'Microondas',
              selectedLocal.menu_kids && 'Menu Kids',
              selectedLocal.cadeirão && 'Cadeirão',
              selectedLocal.pet_friendly && 'Pet-Friendly',
            ].filter(Boolean)

            if (all.length === 0) {
              return (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 12 }}>
                  Seja o primeiro a avaliar ✨
                </div>
              )
            }
            return (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {all.slice(0, 3).map(a => (
                  <span key={String(a)} style={{ fontSize: 11, background: 'var(--green-soft)', color: 'var(--green-dark)', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                    {String(a)}
                  </span>
                ))}
                {all.length > 3 && (
                  <span style={{ fontSize: 11, background: 'var(--bg)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                    +{all.length - 3}
                  </span>
                )}
              </div>
            )
          })()}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleLocalClick(selectedLocal.id)}
              className="btn-primary"
              style={{ flex: 1, padding: '11px 16px', fontSize: 14 }}
            >
              Detalhes e Avaliar
            </button>
            <button
              onClick={() => {
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLocal.lat},${selectedLocal.lng}`, '_blank')
              }}
              className="btn-outline"
              style={{ padding: '11px 14px' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bottom sheet com lista */}
      {!selectedLocal && (
        <div className="bottom-sheet">
          <div className="sheet-handle" />
          <div className="sheet-header">
            <span>{loading ? 'Carregando...' : `${filtered.length} locais encontrados nesta área`}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </div>
          <div className="sheet-scroll">
            {filtered.map(local => {
              const amenList = amenLabels(local)
              const allAmen = [
                local.fraldario, local.espaco_familia, local.espaco_kids,
                local.microondas, local.menu_kids, local.cadeirão, local.pet_friendly,
              ].filter(Boolean)
              return (
                <div
                  key={local.id}
                  className="local-card-mini"
                  onClick={() => handleMarkerClick(local.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="local-name">{local.nome}</div>
                      <div className="local-type">{TIPO_LABELS[local.tipo] || local.tipo}</div>
                    </div>
                    {local.certificado_pitstop && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#33cccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginLeft: 8 }}>
                        <circle cx="12" cy="12" r="9" />
                        <polyline points="9,12 11,14 15,10" />
                      </svg>
                    )}
                  </div>
                  <div className="local-meta">
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span style={{ color: '#f5a623' }}>★</span>
                      <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{Number(local.rating).toFixed(1)}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="9" /><polyline points="12,7 12,12 15,15" />
                      </svg>
                      {local.total_checkins} check-ins
                    </span>
                  </div>
                  <div className="local-chips">
                    {amenList.length > 0 ? (
                      <>
                        {amenList.map(a => (
                          <span key={a} className="local-chip-tiny">{a}</span>
                        ))}
                        {allAmen.length > 3 && (
                          <span className="local-chip-tiny">+{allAmen.length - 3}</span>
                        )}
                      </>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>Seja o primeiro a avaliar ✨</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* FAB — Adicionar local */}
      {!selectedLocal && (
        <button
          onClick={() => router.push('/locais/novo')}
          style={{
            position: 'absolute',
            bottom: 'calc(var(--nav-height) + 12px)',
            right: 12,
            zIndex: 450,
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--green)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(51,204,204,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          title="Adicionar local"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      )}

      <BottomNav />
    </div>
  )
}
