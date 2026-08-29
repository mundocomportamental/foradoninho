'use client'
import { useEffect, useRef, useState } from 'react'
import type { Local } from '@/lib/types'

interface Props {
  locais: Local[]
  userPos: { lat: number; lng: number } | null
  center: { lat: number; lng: number }
  onMarkerClick: (id: string) => void
  onMapClick?: () => void
  flyTrigger?: number
}

// Ícone da bússola: só aparece quando o mapa está girado, gira em sentido
// oposto ao bearing pra sempre "apontar" o norte de verdade — clique reseta.
function CompassButton({ bearing, onReset }: { bearing: number; onReset: () => void }) {
  if (Math.abs(bearing) < 1) return null
  return (
    <button
      onClick={onReset}
      title="Reorientar para o norte"
      style={{
        position: 'absolute',
        // Empilha abaixo do botão de "minha localização" (mapa/page.tsx),
        // que agora está sempre visível.
        top: 'calc(var(--overlay-top-height, 110px) + 8px + 44px)',
        right: 12,
        zIndex: 450,
        width: 36, height: 36,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.95)',
        border: '1.5px solid var(--border)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.16)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" style={{ transform: `rotate(${-bearing}deg)` }}>
        <path d="M12 2 L16 12 L12 10 L8 12 Z" fill="#e04b4b" />
        <path d="M12 22 L16 12 L12 14 L8 12 Z" fill="#8e8e8e" />
      </svg>
    </button>
  )
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

// Tiles do OpenStreetMap Standard — gratuito, sem API key (a CartoDB passou a
// exigir chave em 28/08/2026). O filtro cinza fica em globals.css, aplicado
// direto em ".maplibregl-canvas".
const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: 'raster' as const,
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster' as const, source: 'osm' }],
}

export default function MapView({ locais, userPos, center, onMarkerClick, onMapClick, flyTrigger }: Props) {
  const mapRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<any[]>([])
  const onMapClickRef = useRef(onMapClick)
  onMapClickRef.current = onMapClick
  const [bearing, setBearing] = useState(0)

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    async function init() {
      const { Map: MapLibreMap } = await import('maplibre-gl')
      await import('maplibre-gl/dist/maplibre-gl.css')

      const map = new MapLibreMap({
        container: containerRef.current!,
        style: OSM_STYLE,
        center: [center.lng, center.lat],
        zoom: 11,
        // Impede zoom-out a ponto de mostrar cópias repetidas do mapa-múndi —
        // ver histórico do bug de pins deslocados no oceano (era um problema
        // do Leaflet; o MapLibre não sofre disso, mas mantemos o limite pois
        // não faz sentido pro app mostrar o mundo inteiro mesmo).
        minZoom: 4,
        maxZoom: 19,
        // Gira com 2 dedos (pinça), mas sem inclinar o mapa em 3D — o app é
        // 2D, então travamos o pitch pra evitar um efeito estranho/confuso.
        maxPitch: 0,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: false,
      })

      map.on('click', () => onMapClickRef.current?.())
      map.on('rotate', () => setBearing(map.getBearing()))

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

  // Re-centraliza o mapa ao clicar no botão de geolocalização (flyTrigger incrementa a cada clique)
  useEffect(() => {
    if (!flyTrigger) return
    const map = mapRef.current
    if (!map) return
    const zoom = Math.max(map.getZoom(), 13)
    const el = map.getContainer() as HTMLElement
    // flyTo pode se comportar mal se o container ainda não tem tamanho real
    // (ex: chamado logo no mount, antes do layout assentar) — nesse caso,
    // centraliza direto (sem animação) em vez de arriscar quebrar.
    if (!el || el.clientWidth === 0 || el.clientHeight === 0) {
      map.jumpTo({ center: [center.lng, center.lat], zoom })
      return
    }
    map.flyTo({ center: [center.lng, center.lat], zoom, duration: 800 })
  }, [flyTrigger])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    async function updateMarkers() {
      const { Marker } = await import('maplibre-gl')

      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      // Ponto do usuário — ícone do app com anel
      if (userPos) {
        const el = document.createElement('div')
        el.innerHTML = `<div style="
          width:40px;height:40px;border-radius:50%;
          overflow:hidden;
          border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.22),0 0 0 4px rgba(51,204,204,0.30);
        ">
          <img src="/icon-192.png" style="width:100%;height:100%;object-fit:cover;" alt="você" />
        </div>`
        const userMarker = new Marker({ element: el.firstElementChild as HTMLElement, anchor: 'center' })
          .setLngLat([userPos.lng, userPos.lat])
          .addTo(map)
        markersRef.current.push(userMarker)
      }

      // Todos os locais com pin simples
      locais.forEach(local => {
        // Local sem coordenadas válidas: pular (mesma proteção de antes —
        // ver histórico do "Café do Luka's").
        if (
          typeof local.lat !== 'number' || typeof local.lng !== 'number' ||
          Number.isNaN(local.lat) || Number.isNaN(local.lng)
        ) return

        const isProfissional = !!local.is_servico
        const isPending = local.aprovado === false
        const pinColor = isPending ? '#aaaaaa' : isProfissional ? '#7c3aed' : '#33cccc'
        const size = 28

        // "el" é o elemento que o MapLibre usa pra posicionar o pin no mapa —
        // precisa ficar do lado de fora, sem sofrer nenhum transform nosso.
        // O efeito de hover/toque (scale) fica só no "wrapper" (filho), senão
        // o scale() sobrescreve a translação de posição do MapLibre e o pin
        // "voa" pro canto superior esquerdo do mapa.
        const el = document.createElement('div')
        el.style.width = `${size}px`
        el.style.height = `${size}px`
        el.innerHTML = pinSVG(pinColor, size, isProfissional)
        const wrapper = el.firstElementChild as HTMLElement

        // stopPropagation é essencial aqui: o elemento do marcador vive dentro
        // do mesmo container do canvas do mapa, então sem isso o clique
        // "vaza" pro handler de clique do mapa (que fecha o card selecionado)
        // — o card abria e fechava no mesmo instante.
        wrapper.addEventListener('click', (e) => {
          e.stopPropagation()
          onMarkerClick(local.id)
        })
        wrapper.addEventListener('mouseover', () => { wrapper.style.transform = 'scale(1.3)' })
        wrapper.addEventListener('mouseout', () => { wrapper.style.transform = 'scale(1)' })
        wrapper.addEventListener('touchstart', () => {
          wrapper.style.transform = 'scale(1.3)'
          setTimeout(() => { wrapper.style.transform = 'scale(1)' }, 300)
        })

        const marker = new Marker({ element: el, anchor: 'bottom' })
          .setLngLat([local.lng, local.lat])
          .addTo(map)
        markersRef.current.push(marker)
      })
    }

    updateMarkers()
  }, [locais, userPos])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', touchAction: 'none' }} />
      <CompassButton
        bearing={bearing}
        onReset={() => mapRef.current?.resetNorth({ duration: 300 })}
      />
    </div>
  )
}
