'use client'
import { useEffect, useRef } from 'react'
import type { Local } from '@/lib/types'

interface Props {
  locais: Local[]
  userPos: { lat: number; lng: number } | null
  center: { lat: number; lng: number }
  onMarkerClick: (id: string) => void
  recenterKey?: number
}

// Bird SVG (old-Twitter style) no lugar da bolinha
const USER_BIRD_HTML = `
  <div style="filter:drop-shadow(0 2px 5px rgba(0,0,0,0.28));animation:birdPop 0.35s cubic-bezier(.34,1.56,.64,1)">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="#33CCCC" d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
    </svg>
  </div>
`

function pinSVG(color: string, size: number, isProfissional = false) {
  return `<div class="map-pin-wrapper" style="
    width:${size}px;height:${size}px;
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;transition:transform 0.15s cubic-bezier(.34,1.56,.64,1);
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

export default function MapView({ locais, userPos, center, onMarkerClick, recenterKey }: Props) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])
  const userMarkerRef = useRef<any>(null)
  const prevRecenterKey = useRef(0)

  // Init map once
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

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© CartoDB',
      }).addTo(map)

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

  // Update location markers when locais or userPos changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    async function updateMarkers() {
      const L = (await import('leaflet')).default

      // Remove all location markers
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      // Remove previous user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove()
        userMarkerRef.current = null
      }

      // Pássaro do usuário
      if (userPos) {
        const userIcon = L.divIcon({
          html: USER_BIRD_HTML,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          className: '',
        })
        userMarkerRef.current = L.marker([userPos.lat, userPos.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map)
      }

      // Pins dos locais
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
          .on('mouseover', function (this: any) {
            const el = this.getElement()?.querySelector('.map-pin-wrapper') as HTMLElement | null
            if (el) el.style.transform = 'scale(1.3)'
          })
          .on('mouseout', function (this: any) {
            const el = this.getElement()?.querySelector('.map-pin-wrapper') as HTMLElement | null
            if (el) el.style.transform = 'scale(1)'
          })
          .on('touchstart', function (this: any) {
            const el = this.getElement()?.querySelector('.map-pin-wrapper') as HTMLElement | null
            if (el) el.style.transform = 'scale(1.3)'
            setTimeout(() => { if (el) el.style.transform = 'scale(1)' }, 300)
          })
        markersRef.current.push(marker)
      })
    }

    updateMarkers()
  }, [locais, userPos])

  // Fly to user position when recenterKey changes
  useEffect(() => {
    if (
      recenterKey &&
      recenterKey !== prevRecenterKey.current &&
      mapRef.current &&
      userPos
    ) {
      prevRecenterKey.current = recenterKey
      mapRef.current.flyTo([userPos.lat, userPos.lng], 15, { animate: true, duration: 0.8 })
    }
  }, [recenterKey, userPos])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  )
}
