'use client'
import { useEffect, useRef } from 'react'
import type { Local } from '@/lib/types'

interface Props {
  locais: Local[]
  userPos: { lat: number; lng: number } | null
  center: { lat: number; lng: number }
  onMarkerClick: (id: string) => void
}

// SVG de pin de geolocalização simples
function pinSVG(color: string, size: number) {
  return `<div style="
    width:${size}px;
    height:${size}px;
    display:flex;
    align-items:center;
    justify-content:center;
  ">
    <svg width="${size}" height="${size}" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 16 9 16s9-9.25 9-16c0-4.97-4.03-9-9-9z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="9" r="3.5" fill="white" opacity="0.9"/>
    </svg>
  </div>`
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

      // Ponto do usuário — círculo verde com anel
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

      // Todos os locais com pin simples
      locais.forEach(local => {
        const pinColor = local.certificado_pitstop ? '#4caf85' : '#e05b4e'
        const size = local.certificado_pitstop ? 32 : 28
        const icon = L.divIcon({
          html: pinSVG(pinColor, size),
          iconSize: [size, size],
          iconAnchor: [size / 2, size],
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
