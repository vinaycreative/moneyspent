// Service Worker Registration
console.log("Service Worker registration script starting...")

if ("serviceWorker" in navigator) {
  console.log("Service Worker is supported")
  window.addEventListener("load", () => {
    console.log("Window load event fired, attempting to register service worker...")
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered successfully: ", registration)

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New content is available, show update notification
              showUpdateNotification()
            }
          })
        })
      })
      .catch((registrationError) => {
        console.error("SW registration failed: ", registrationError)
      })
  })
} else {
  console.log("Service Worker is NOT supported")
}

// Show update notification
function showUpdateNotification() {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    // You can show a notification to the user about the update
    console.log("New version available")

    // Optional: Show a toast notification
    if (typeof window !== "undefined" && window.showToast) {
      window.showToast("New version available. Refresh to update.", "info")
    }
  }
}

// Handle beforeinstallprompt event for PWA installation
let deferredPrompt

window.addEventListener("beforeinstallprompt", (e) => {
  console.log("beforeinstallprompt event fired")
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault()

  // Stash the event so it can be triggered later
  deferredPrompt = e

  // Show install button or notification
  showInstallPrompt()
})

// Show install prompt
function showInstallPrompt() {
  if (deferredPrompt) {
    console.log("Showing install prompt")
    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      deferredPrompt = null
    })
  }
}

// Expose install function globally
window.installPWA = showInstallPrompt

// Debug PWA status
window.addEventListener("load", () => {
  console.log("PWA Debug Info:")
  console.log("- Service Worker supported:", "serviceWorker" in navigator)
  console.log("- Standalone mode:", window.matchMedia("(display-mode: standalone)").matches)
  console.log("- Navigator standalone:", (navigator as any).standalone)
  
  // Check if manifest is loaded
  const manifestLink = document.querySelector('link[rel="manifest"]')
  console.log("- Manifest link found:", !!manifestLink)
  
  // Check if icons are accessible
  fetch("/icon-192x192.png")
    .then(response => console.log("- Icon 192x192 accessible:", response.ok))
    .catch(() => console.log("- Icon 192x192 not accessible"))
  
  fetch("/manifest.json")
    .then(response => response.json())
    .then(manifest => console.log("- Manifest loaded:", manifest.name))
    .catch(() => console.log("- Manifest not accessible"))
})
