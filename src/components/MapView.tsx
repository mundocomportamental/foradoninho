'use client'
import { useEffect, useRef } from 'react'
import type { Local } from '@/lib/types'

interface Props {
  locais: Local[]
  userPos: { lat: number; lng: number } | null
  center: { lat: number; lng: number }
  onMarkerClick: (id: string) => void
}

// Igual ao Nóz: círculo com emoji + fundo colorido por tipo
const TIPO_CONFIG: Record<string, { emoji: string; bg: string; border: string }> = {
  posto:      { emoji: '⛽', bg: '#DCFCE7', border: '#86EFAC' },
  restaurante:{ emoji: '🍽️', bg: '#FEF3C7', border: '#F59E0B' },
  hotel:      { emoji: '🏨', bg: '#DBEAFE', border: '#93C5FD' },
  shopping:   { emoji: '🛍️', bg: '#F3E8FF', border: '#C084FC' },
  farmacia:   { emoji: '💊', bg: '#FFE4E6', border: '#F87171' },
  lanchonete: { emoji: '🥐', bg: '#FEF9C3', border: '#FACC15' },
}

function getTipoConfig(tipo: string) {
  return TIPO_CONFIG[tipo] || { emoji: '📍', bg: '#F0FAF4', border: '#86EFAC' }
}

export default function MapView({ locais, userPos, center, onMarkerClick }: Props) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    async function init() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      const map = L.map(containerRef.current!, {
        center: [center.lat, center.lng],
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
      })

      // CartoDB light_all — mapa cinza igual ao Nóz
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { attribution: '© CartoDB' }
      ).addTo(map)

      mapRef.current = map
    }

    init()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    async function updateMarkers() {
      const L = (await import('leaflet')).default

      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      // User dot — coral com glow ring, igual ao Nóz
      if (userPos) {
        const userIcon = L.divIcon({
          html: `<div style="
            width:16px;height:16px;border-radius:50%;
            background:#4caf85;
            border:3px solid white;
            box-shadow:0 0 0 4px rgba(76,175,133,0.25);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          className: '',
        })
        L.marker([userPos.lat, userPos.lng], { icon: userIcon }).addTo(map)
      }

      // Marcadores — círculo com emoji por tipo, igual ao Nóz
      locais.forEach(local => {
        const cfg = getTipoConfig(local.tipo)
        const size = local.certificado_pitstop ? 46 : 40
        const ring = local.certificado_pitstop
          ? `outline:2.5px solid ${cfg.border};outline-offset:2px;`
          : ''
        const icon = L.divIcon({
          html: `<div style="
            width:${size}px;height:${size}px;
            border-radius:50%;
            background:${cfg.bg};
            border:2.5px solid ${cfg.border};
            display:flex;align-items:center;justify-content:center;
            font-size:${local.certificado_pitstop ? 20 : 18}px;
            box-shadow:0 4px 12px rgba(0,0,0,0.13);
            ${ring}
          ">${cfg.emoji}</div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          className: '',
        })
        const marker = L.marker([local.lat, local.lng], { icon })
          .addTo(map)
          .on('click', () => onMarkerClick(local.id))
        markersRef.current.push(marker)
      })
    }

    updateMarkers()
  }, [locais, userPos])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  )
}
