// Service Worker — Fora do Ninho
const CACHE_NAME = 'fdn-v2'

const STATIC_ASSETS = [
  '/',
  '/mapa',
  '/locais',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/love-birds.png',
]

// Instala e faz cache dos assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Ativa e limpa caches antigos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Estratégia: network first, fallback para cache
self.addEventListener('fetch', event => {
  // Ignora requisições não-GET e requests para APIs externas
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('supabase.co')) return
  if (event.request.url.includes('basemaps.cartocdn.com')) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clona e armazena no cache
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})
