"use client"

import { useEffect } from "react"

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    console.log("Service Worker registration component mounted")

    if ("serviceWorker" in navigator) {
      console.log("Service Worker is supported")

      window.addEventListener("load", () => {
        console.log("Window load event fired, attempting to register service worker...")

        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("SW registered successfully: ", registration)
          })
          .catch((registrationError) => {
            console.error("SW registration failed: ", registrationError)
          })
      })
    } else {
      console.log("Service Worker is NOT supported")
    }
  }, [])

  return null
}
