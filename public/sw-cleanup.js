// Service Worker Cleanup Script
// This script unregisters any existing service workers to fix authentication issues
// Runs only once per session and only if old PWA service workers are detected

;(function () {
  // Check if we've already run cleanup in this session
  if (sessionStorage.getItem("sw-cleanup-completed")) {
    return
  }

  // Only proceed if service workers are supported
  if (!("serviceWorker" in navigator)) {
    return
  }

  // Check if there are any existing service workers before running cleanup
  navigator.serviceWorker
    .getRegistrations()
    .then(function (registrations) {
      // Only run cleanup if there are actual service workers to clean up
      if (registrations.length === 0) {
        console.log("No service workers found - cleanup not needed")
        return
      }

      // Mark cleanup as completed for this session
      sessionStorage.setItem("sw-cleanup-completed", "true")

      console.log(`Found ${registrations.length} service worker(s) - running cleanup`)

      // Unregister all service workers
      for (let registration of registrations) {
        registration.unregister()
        console.log("Service Worker unregistered:", registration)
      }

      // Also try to unregister by scope
      navigator.serviceWorker.ready.then(function (registration) {
        registration.unregister()
        console.log("Service Worker ready state unregistered")
      })

      // Clear all caches
      if ("caches" in window) {
        caches.keys().then(function (names) {
          for (let name of names) {
            caches.delete(name)
            console.log("Cache deleted:", name)
          }
        })
      }

      console.log("Service Worker cleanup completed for this session")
    })
    .catch(function (error) {
      console.log("Error checking service workers:", error)
    })
})()
