'use client'
import { useEffect } from 'react'

// Aquece o chunk pesado do mapa (Leaflet) em segundo plano assim que o app
// abre, não importa por qual página — antes, esse warmup só existia dentro
// da Landing (src/components/Landing.tsx), então qualquer entrada que pula a
// Landing (usuário já logado, PWA/TWA instalado indo direto pro onboarding/
// mapa) chegava em /mapa com o chunk do Leaflet 100% frio: o download +
// parse + execução da lib bloqueia a thread principal por um tempo,
// atrasando a pintura de elementos já prontos no DOM (como a barra inferior
// de navegação, que "demora pra aparecer" na primeira visita ao mapa).
export default function MapWarmup() {
  useEffect(() => {
    const warm = () => {
      import('@/components/MapView')
      import('leaflet')
    }
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback
    if (ric) ric(warm, { timeout: 2000 })
    else setTimeout(warm, 1200)
  }, [])

  return null
}
