const CACHE = 'lo-v2'

const PRECACHE = [
  '/',
  '/flashcards',
  '/game',
  '/questions_full.json',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.origin !== self.location.origin) return

  // Cache-first for static assets (JS/CSS chunks, images)
  const isStatic = url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/question-images/') ||
    url.pathname.startsWith('/icons/')

  if (isStatic) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached
        return fetch(e.request).then(res => {
          if (res.ok) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()))
          }
          return res
        }).catch(() => new Response('Offline', { status: 503 }))
      })
    )
    return
  }

  // Network-first for pages and data, fall back to cache
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
      }
      return res
    }).catch(() => caches.match(e.request).then(c => c || new Response('Offline', { status: 503 })))
  )
})
