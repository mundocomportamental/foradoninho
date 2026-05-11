'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { getStoresNearby, getAllStores } from '@/lib/supabase'
import StoreCard from '@/components/StoreCard'
import StorePanel from '@/components/StorePanel'

const Map = dynamic(() => import('@/components/Map'), { ssr: false })

type StorePin = {
  id: string
  name: string
  slug: string
  address_city: string
  address_state: string
  distance_m: number
  lat: number
  lng: number
}

const DEFAULT_CENTER: [number, number] = [-22.8, -46.3]
const DEFAULT_RADIUS = 350000

function parseLocation(loc: unknown): { lat: number; lng: number } | null {
  if (!loc) return null
  if (typeof loc === 'object' && loc !== null) {
    const geo = loc as any
    if (geo.type === 'Point' && Array.isArray(geo.coordinates)) {
      return { lng: geo.coordinates[0], lat: geo.coordinates[1] }
    }
  }
  return null
}

function toStorePin(s: any): StorePin | null {
  const geo = parseLocation(s.location)
  if (!geo) return null
  return {
    id: s.id, name: s.name, slug: s.slug,
    address_city: s.address_city, address_state: s.address_state,
    distance_m: s.distance_m, lat: geo.lat, lng: geo.lng,
  }
}

export default function HomePage() {
  const [stores, setStores] = useState<StorePin[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_CENTER)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [locating, setLocating] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getStoresNearby(DEFAULT_CENTER[0], DEFAULT_CENTER[1], DEFAULT_RADIUS)
      .then((nearby) => {
        setStores(nearby.map(toStorePin).filter(Boolean) as StorePin[])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const locateMe = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserLocation(coords)
        setMapCenter(coords)
        setLocating(false)
        getStoresNearby(coords[0], coords[1], 300000).then((nearby) => {
          setStores(nearby.map(toStorePin).filter(Boolean) as StorePin[])
        })
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const filtered = stores.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address_city.toLowerCase().includes(search.toLowerCase())
  )

  const selectedStore = stores.find((s) => s.id === selectedId) ?? null

  return (
    <div style={{
      display: 'flex', height: '100dvh',
      background: 'var(--bg)', overflow: 'hidden',
      fontFamily: 'var(--font-body)',
    }}>
      {/* SIDEBAR */}
      <div style={{
        width: 320, flexShrink: 0,
        display: 'flex', flexDirection: 'column',
        background: 'var(--bg)',
        borderRight: '1px solid var(--border)',
        position: 'relative', zIndex: 20,
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 16px 14px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-card)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{
              width: 36, height: 36, background: 'var(--accent)',
              borderRadius: 10, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 20, flexShrink: 0,
            }}>🍼</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--text)', lineHeight: 1 }}>
                PitStop Baby
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Produtos de bebê na estrada
              </div>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: 'var(--text-muted)', pointerEvents: 'none' }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar loja ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '8px 10px 8px 32px',
                border: '1.5px solid var(--border)', borderRadius: 8,
                fontSize: 13, fontFamily: 'var(--font-body)',
                background: 'var(--bg)', color: 'var(--text)',
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
            />
          </div>
        </div>

        {/* Store list / panel */}
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          {showPanel && selectedStore ? (
            <StorePanel store={selectedStore} onClose={() => setShowPanel(false)} />
          ) : (
            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 4px 4px' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                  {loading ? 'Carregando...' : `${filtered.length} parada${filtered.length !== 1 ? 's' : ''}`}
                </span>
                <button
                  onClick={locateMe}
                  disabled={locating}
                  style={{
                    background: 'var(--accent-soft)', border: 'none',
                    borderRadius: 20, padding: '4px 10px',
                    fontSize: 11, fontWeight: 600, color: 'var(--accent)',
                    cursor: locating ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                    opacity: locating ? 0.6 : 1,
                  }}
                >
                  {locating ? '⏳' : '📍'} {locating ? 'Localizando...' : 'Perto de mim'}
                </button>
              </div>

              {loading ? (
                [1,2,3].map((i) => (
                  <div key={i} style={{
                    height: 80, background: 'var(--bg-card)',
                    borderRadius: 'var(--radius)', border: '1.5px solid var(--border)',
                  }} />
                ))
              ) : filtered.length === 0 ? (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  Nenhuma parada encontrada.
                </div>
              ) : (
                filtered.map((store, i) => (
                  <StoreCard
                    key={store.id}
                    store={store}
                    selected={selectedId === store.id}
                    index={i}
                    onClick={() => { setSelectedId(store.id); setShowPanel(true) }}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 16px', borderTop: '1px solid var(--border)',
          fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-card)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>Fernão Dias · SP → MG</span>
          <span style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '2px 8px', borderRadius: 20, fontWeight: 600, fontSize: 10 }}>
            {stores.length} lojas
          </span>
        </div>
      </div>

      {/* MAP */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Map
          stores={stores}
          center={mapCenter}
          selectedId={selectedId}
          userLocation={userLocation}
          onSelect={(id) => { setSelectedId(id); setShowPanel(true) }}
        />
        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 24, right: 16,
          background: 'rgba(247,244,239,0.92)', backdropFilter: 'blur(8px)',
          border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          padding: '10px 14px', boxShadow: 'var(--shadow)',
          fontSize: 12, zIndex: 999,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Legenda
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: 'var(--accent)', border: '1.5px solid white' }} />
              <span>Graal</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: 'var(--accent-2)', border: '1.5px solid white' }} />
              <span>Frango Assado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
