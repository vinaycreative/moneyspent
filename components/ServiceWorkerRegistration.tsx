"use client"

import { useEffect, useCallback } from "react"

export default function ServiceWorkerRegistration() {
  const handleServiceWorkerUpdate = useCallback(() => {
    // Force reload to get the new version
    window.location.reload()
  }, [])

  useEffect(() => {
    console.log("Service Worker registration component mounted")

    if ("serviceWorker" in navigator) {
      console.log("Service Worker is supported")

      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js")
          console.log("SW registered successfully: ", registration)

          // Handle service worker updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("New service worker version available")
                  // Show update notification to user
                  if (confirm("A new version is available. Would you like to update now?")) {
                    handleServiceWorkerUpdate()
                  }
                }
              })
            }
          })

          // Handle service worker controller change
          navigator.serviceWorker.addEventListener("controllerchange", () => {
            console.log("Service worker controller changed")
          })

          // Handle service worker messages
          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data && event.data.type === "RELOAD_PAGE") {
              handleServiceWorkerUpdate()
            }
          })

        } catch (registrationError) {
          console.error("SW registration failed: ", registrationError)
        }
      }

      // Register service worker when page loads
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", registerServiceWorker)
      } else {
        registerServiceWorker()
      }

      // Handle page visibility change to check for updates
      const handleVisibilityChange = () => {
        if (!document.hidden && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: "CHECK_FOR_UPDATES" })
        }
      }

      document.addEventListener("visibilitychange", handleVisibilityChange)

      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange)
      }
    } else {
      console.log("Service Worker is NOT supported")
    }
  }, [handleServiceWorkerUpdate])

  return null
}
