'use client'
import { useEffect, useRef } from 'react'
import { getOsmStyle } from '@/lib/mapStyle'

// Recorte decorativo do mesmo mapa (tiles OSM + filtro cinza) usado em /mapa, sem interação.
export default function LandingMapPreview() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    let cancelled = false

    async function init() {
      const { Map: MapLibreMap, Marker } = await import('maplibre-gl')
      await import('maplibre-gl/dist/maplibre-gl.css')
      if (cancelled || !containerRef.current) return

      const map = new MapLibreMap({
        container: containerRef.current,
        style: getOsmStyle(),
        center: [-43.185, -22.955],
        zoom: 13,
        interactive: false,
        attributionControl: false,
      })

      const pins: [number, number, string][] = [
        [-22.951, -43.192, '#33cccc'],
        [-22.961, -43.176, '#7c3aed'],
        [-22.947, -43.198, '#33cccc'],
      ]
      pins.forEach(([lat, lng, color]) => {
        const el = document.createElement('div')
        el.style.cssText = `width:20px;height:20px;border-radius:50% 50% 50% 0;background:${color};border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.25);transform:rotate(-45deg);`
        new Marker({ element: el, anchor: 'bottom' }).setLngLat([lng, lat]).addTo(map)
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
