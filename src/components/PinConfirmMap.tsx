'use client'
import { useEffect, useRef } from 'react'
import { getOsmStyle } from '@/lib/mapStyle'

interface Props {
  initialCenter: { lat: number; lng: number }
  onConfirm: (pos: { lat: number; lng: number }) => void
  onBack: () => void
}

export default function PinConfirmMap({ initialCenter, onConfirm, onBack }: Props) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    async function init() {
      const { Map: MapLibreMap } = await import('maplibre-gl')
      await import('maplibre-gl/dist/maplibre-gl.css')

      const map = new MapLibreMap({
        container: containerRef.current!,
        style: getOsmStyle(),
        center: [initialCenter.lng, initialCenter.lat],
        zoom: 17,
        minZoom: 4,
        maxZoom: 19,
        // Tela de "arraste pra confirmar o pino" — sem girar, pra manter o
        // gesto simples e o pino fixo no centro sempre óbvio.
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: false,
      })
      // Mantém zoom por pinça, mas sem o componente de rotação do gesto.
      map.touchZoomRotate.disableRotation()

      mapRef.current = map
    }

    init()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleConfirm() {
    const c = mapRef.current?.getCenter()
    if (!c) return
    onConfirm({ lat: c.lat, lng: c.lng })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--bg)' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Pino fixo no centro — quem se move é o mapa por baixo, não o pino */}
      <div style={{
        position: 'absolute', top: 'calc(50% - 36px)', left: '50%',
        transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 500,
      }}>
        <svg width="36" height="46" viewBox="0 0 24 32" fill="none">
          <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 16 9 16s9-9.25 9-16c0-4.97-4.03-9-9-9z"
            fill="#33CCCC" stroke="white" strokeWidth="1.5"/>
          <circle cx="12" cy="9" r="3.5" fill="white" opacity="0.9"/>
        </svg>
      </div>

      <button
        onClick={onBack}
        style={{
          position: 'absolute', top: 16, left: 16, zIndex: 600,
          width: 36, height: 36, borderRadius: '50%',
          border: '1.5px solid var(--border)', background: 'var(--bg-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 28px', zIndex: 600 }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, padding: '14px 18px',
          marginBottom: 12, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>É aqui?</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            Arraste o mapa para ajustar o ponto exato
          </div>
        </div>
        <button className="btn-primary" onClick={handleConfirm}>Confirmar localização</button>
      </div>
    </div>
  )
}
