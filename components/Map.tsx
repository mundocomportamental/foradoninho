'use client'

import { useEffect, useRef } from 'react'

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

type Props = {
  stores: StorePin[]
  center: [number, number]
  selectedId: string | null
  onSelect: (id: string) => void
  userLocation: [number, number] | null
}

export default function Map({ stores, center, selectedId, onSelect, userLocation }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then((L) => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        center,
        zoom: 9,
        zoomControl: true,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map

      // Add store markers
      stores.forEach((store) => {
        const isGraal = store.name.toLowerCase().includes('graal')
        const color = isGraal ? '#E8490F' : '#2D6A4F'
        const emoji = isGraal ? '⛽' : '🍗'

        const icon = L.divIcon({
          className: '',
          html: `
            <div style="
              width:40px; height:40px;
              background:${color};
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              display:flex; align-items:center; justify-content:center;
              box-shadow:0 4px 14px rgba(0,0,0,0.25);
              border: 2px solid white;
              transition: transform 0.15s ease;
            ">
              <span style="transform:rotate(45deg); font-size:16px; line-height:1;">${emoji}</span>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -44],
        })

        const marker = L.marker([store.lat, store.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="padding:14px 16px; min-width:180px; font-family:'DM Sans',sans-serif;">
              <div style="font-family:'Syne',sans-serif; font-weight:700; font-size:14px; color:#1A1714; margin-bottom:4px;">
                ${store.name}
              </div>
              <div style="font-size:12px; color:#7A6F65;">
                ${store.address_city} · ${store.address_state}
              </div>
              <div style="
                margin-top:10px;
                background:${isGraal ? '#FDE8DF' : '#D8F0E6'};
                color:${color};
                font-size:11px; font-weight:600;
                padding:4px 10px; border-radius:20px;
                display:inline-block;
              ">
                ${(store.distance_m / 1000).toFixed(0)} km de distância
              </div>
            </div>
          `, { maxWidth: 240 })

        marker.on('click', () => onSelect(store.id))
        markersRef.current[store.id] = marker
      })

      // User location marker
      if (userLocation) {
        const userIcon = L.divIcon({
          className: '',
          html: `
            <div style="
              width:16px; height:16px;
              background:#3B82F6;
              border-radius:50%;
              border:3px solid white;
              box-shadow:0 0 0 4px rgba(59,130,246,0.25);
            "></div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })
        L.marker(userLocation, { icon: userIcon })
          .addTo(map)
          .bindPopup('<div style="padding:8px;font-size:12px;font-family:\'DM Sans\',sans-serif;">📍 Você está aqui</div>')
      }
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current = {}
    }
  }, []) // eslint-disable-line

  // Pan to selected store
  useEffect(() => {
    if (!mapRef.current || !selectedId) return
    const store = stores.find((s) => s.id === selectedId)
    if (!store) return
    mapRef.current.setView([store.lat, store.lng], 13, { animate: true })
    markersRef.current[selectedId]?.openPopup()
  }, [selectedId, stores])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%' }}
      className="animate-fade-in"
    />
  )
}
