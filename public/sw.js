// Service Worker with proper cache versioning and invalidation
const CACHE_VERSION = "v1.0.1"
const CACHE_NAME = `money-manager-${CACHE_VERSION}`
const urlsToCache = [
  "/",
  "/login",
  "/dashboard",
  "/transactions",
  "/accounts",
  "/analytics",
  "/settings",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/apple-touch-icon.png",
]

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log(`Service Worker installing with cache version: ${CACHE_VERSION}`)
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache:", CACHE_NAME)
      return cache.addAll(urlsToCache)
    })
  )
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Fetch event - serve from cache when offline, but prefer network for fresh content
self.addEventListener("fetch", (event) => {
  const request = event.request

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip non-http requests
  if (!request.url.startsWith("http")) {
    return
  }

  // Always bypass caching for API requests and Next data requests
  const isApiRequest = request.url.includes("/api/") || request.url.includes("/_next/data/")
  if (isApiRequest) {
    event.respondWith(fetch(request))
    return
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        // Always try to fetch from network first for fresh content
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            // Cache successful network responses
            if (networkResponse.status === 200) {
              cache.put(request, networkResponse.clone())
            }
            return networkResponse
          })
          .catch(() => {
            // Network failed, return cached response if available
            return cachedResponse
          })

        // Return cached response immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise
      })
    })
  )
})

// Activate event - clean up old caches and take control immediately
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating and cleaning up old caches")
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  )
})

// Handle service worker updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

// Background sync for offline data
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    console.log("Background sync started")
    // Add your sync logic here
  } catch (error) {
    console.error("Background sync failed:", error)
  }
}
