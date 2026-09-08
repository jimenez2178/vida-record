const CACHE_NAME = 'vidarecord-v1'
const PRECACHE_URLS = ['/', '/login']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
  )
  self.clients.claim()
})

// Solo cacheamos el shell público (login/registro/landing) y los
// assets estáticos de Next. Nunca cacheamos rutas del dashboard ni
// /api/*: son contenido dinámico por usuario, y una caché del
// Service Worker es compartida en el origen — cachear esas
// respuestas podría servirle el historial médico de un usuario a
// otra sesión en el mismo dispositivo/navegador.
const CACHEABLE_PATHS = new Set(['/', '/login', '/register', '/forgot-password'])

function isCacheable(url) {
  if (url.origin !== self.location.origin) return false
  if (CACHEABLE_PATHS.has(url.pathname)) return true
  if (url.pathname.startsWith('/_next/static/')) return true
  if (url.pathname.startsWith('/icons/')) return true
  return false
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (!isCacheable(url)) return

  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone)
        })
        return response
      })
      .catch(() => caches.match(request))
  )
})
