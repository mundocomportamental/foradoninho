'use client'
import { useEffect, useRef } from 'react'

// Recorte decorativo do mesmo mapa (tiles cinza CartoDB) usado em /mapa, sem interação.
export default function LandingMapPreview() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    let cancelled = false

    async function init() {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      if (cancelled || !containerRef.current) return

      const map = L.map(containerRef.current, {
        center: [-22.955, -43.185],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map)

      const pins: [number, number, string][] = [
        [-22.951, -43.192, '#33cccc'],
        [-22.961, -43.176, '#7c3aed'],
        [-22.947, -43.198, '#33cccc'],
      ]
      pins.forEach(([lat, lng, color]) => {
        const icon = L.divIcon({
          html: `<div style="width:20px;height:20px;border-radius:50% 50% 50% 0;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);transform:rotate(-45deg);"></div>`,
          iconSize: [20, 20],
          className: '',
        })
        L.marker([lat, lng], { icon }).addTo(map)
      })

      mapRef.current = map
    }

    init()

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} aria-hidden="true" />
}
