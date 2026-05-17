'use client'
import { useEffect, useRef } from 'react'
import type { Local } from '@/lib/types'

interface Props {
  locais: Local[]
  userPos: { lat: number; lng: number } | null
  center: { lat: number; lng: number }
  onMarkerClick: (id: string) => void
  onMapClick?: () => void
}

// SVG de pin de geolocalização simples com efeito hover/touch
function pinSVG(color: string, size: number, isProfissional = false) {
  return `<div class="map-pin-wrapper" style="
    width:${size}px;
    height:${size}px;
    display:flex;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    transition:transform 0.15s cubic-bezier(.34,1.56,.64,1);
    transform-origin:center bottom;
  ">
    <svg width="${size}" height="${size}" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 16 9 16s9-9.25 9-16c0-4.97-4.03-9-9-9z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="9" r="3.5" fill="white" opacity="0.9"/>
      ${isProfissional ? `<text x="12" y="13" text-anchor="middle" font-size="6" fill="${color}">⚕</text>` : ''}
    </svg>
  </div>`
}

export default function MapView({ locais, userPos, center, onMarkerClick, onMapClick }: Props) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])
  const onMapClickRef = useRef(onMapClick)
  onMapClickRef.current = onMapClick

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

      map.on('click', () => onMapClickRef.current?.())
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

  // Re-centraliza o mapa quando o prop center muda (ex: botão de geolocalização)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    map.flyTo([center.lat, center.lng], Math.max(map.getZoom(), 13), { animate: true, duration: 0.8 })
  }, [center.lat, center.lng])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    async function updateMarkers() {
      const L = (await import('leaflet')).default

      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      // Ponto do usuário — ícone do app com anel
      if (userPos) {
        const userIcon = L.divIcon({
          html: `<div style="
            width:40px;height:40px;border-radius:50%;
            overflow:hidden;
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.22),0 0 0 4px rgba(51,204,204,0.30);
          ">
            <img src="/icon-192.png" style="width:100%;height:100%;object-fit:cover;" alt="você" />
          </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
          className: '',
        })
        L.marker([userPos.lat, userPos.lng], { icon: userIcon }).addTo(map)
      }

      // Todos os locais com pin simples
      locais.forEach(local => {
        const isProfissional = !!local.is_servico
        const isPending = local.aprovado === false
        const pinColor = isPending ? '#aaaaaa' : isProfissional ? '#7c3aed' : '#33cccc'
        const size = 28
        const icon = L.divIcon({
          html: pinSVG(pinColor, size, isProfissional),
          iconSize: [size, size],
          iconAnchor: [size / 2, size],
          className: '',
        })
        const marker = L.marker([local.lat, local.lng], { icon })
          .addTo(map)
          .on('click', () => onMarkerClick(local.id))
          .on('mouseover', function(this: any) {
            const el = this.getElement()?.querySelector('.map-pin-wrapper') as HTMLElement | null
            if (el) el.style.transform = 'scale(1.3)'
          })
          .on('mouseout', function(this: any) {
            const el = this.getElement()?.querySelector('.map-pin-wrapper') as HTMLElement | null
            if (el) el.style.transform = 'scale(1)'
          })
          .on('touchstart', function(this: any) {
            const el = this.getElement()?.querySelector('.map-pin-wrapper') as HTMLElement | null
            if (el) el.style.transform = 'scale(1.3)'
            setTimeout(() => { if (el) el.style.transform = 'scale(1)' }, 300)
          })
        markersRef.current.push(marker)
      })
    }

    updateMarkers()
  }, [locais, userPos])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  )
}
