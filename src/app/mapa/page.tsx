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
  const router = useRouter()
  const supabase = createClient()

  const fetchLocais = useCallback(async (lat: number, lng: number) => {
    setLoading(true)
    try {
      let q = supabase
        .from('locais')
        .select('*')
        .eq('is_active', true)

      const { data } = await q
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

  function handleLocalClick(id: string) {
    const local = locais.find(l => l.id === id)
    if (local) saveRecent(local)
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
            onMarkerClick={handleLocalClick}
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

      {/* Bottom sheet */}
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
              onClick={() => handleLocalClick(local.id)}
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

      <BottomNav />
    </div>
  )
}
