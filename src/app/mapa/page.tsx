'use client'
import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import BottomNav from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Local } from '@/lib/types'
import { FILTROS, TIPO_LABELS, AMENIDADES } from '@/lib/types'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function MapaPage() {
  const [locais, setLocais] = useState<Local[]>([])
  const [filtro, setFiltro] = useState<string | null>(null)
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedLocal, setSelectedLocal] = useState<Local | null>(null)
  const router = useRouter()
  const supabase = createClient()

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
    if (l.microondas) items.push('Microondas')
    if (l.cadeirão) items.push('Cadeirão')
    if (l.amamentacao) items.push('Amamentação')
    return items.slice(0, 3)
  }

  return (
    <div className="app-shell">
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
            placeholder="Buscar local ou endereço..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="map-chips-row">
          {FILTROS.map(f => (
            <button
              key={f.key}
              className={`filter-chip${filtro === f.key ? ' active' : ''}`}
              onClick={() => setFiltro(filtro === f.key ? null : f.key)}
            >
              {f.label}
            </button>
          ))}
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
          {/* Botão fechar */}
          <button
            onClick={() => setSelectedLocal(null)}
            style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
            {/* Ícone do tipo */}
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--green-soft)', border: '1.5px solid var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 32" fill="none">
                <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 16 9 16s9-9.25 9-16c0-4.97-4.03-9-9-9z" fill="#4caf85" stroke="white" strokeWidth="1.5"/>
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

          {/* Rating + checkins */}
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
                <span style={{ fontSize: 11, fontWeight: 600, color: '#059669' }}>✓ PitStop</span>
              </>
            )}
          </div>

          {/* Amenidades */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {amenLabels(selectedLocal).map(a => (
              <span key={a} style={{ fontSize: 11, background: 'var(--green-soft)', color: 'var(--green-dark)', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                {a}
              </span>
            ))}
            {(() => {
              const all = [
                selectedLocal.fraldario && 'Fraldário',
                selectedLocal.microondas && 'Microondas',
                selectedLocal.cadeirão && 'Cadeirão',
                selectedLocal.amamentacao && 'Amamentação',
                selectedLocal.playground && 'Playground',
              ].filter(Boolean)
              return all.length > 3 ? (
                <span style={{ fontSize: 11, background: 'var(--bg)', color: 'var(--text-muted)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                  +{all.length - 3}
                </span>
              ) : null
            })()}
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleLocalClick(selectedLocal.id)}
              className="btn-primary"
              style={{ flex: 1, padding: '11px 16px', fontSize: 14 }}
            >
              Ver detalhes
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
            {filtered.map(local => (
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
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginLeft: 8 }}>
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
                  {amenLabels(local).map(a => (
                    <span key={a} className="local-chip-tiny">{a}</span>
                  ))}
                  {(() => {
                    const all = [
                      local.fraldario && 'Fraldário',
                      local.microondas && 'Microondas',
                      local.cadeirão && 'Cadeirão',
                      local.amamentacao && 'Amamentação',
                      local.playground && 'Playground',
                    ].filter(Boolean)
                    return all.length > 3 ? (
                      <span className="local-chip-tiny">+{all.length - 3}</span>
                    ) : null
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
