"use client"

import Script from "next/script"
import { supabase } from "@/lib/supabase/client"

type CredentialResponse = {
  credential: string
}
import { useRouter } from "next/navigation"
import { useEffect } from "react"

declare const google: {
  accounts: {
    id: {
      initialize: (config: any) => void
      prompt: () => void
    }
  }
}

// generate nonce to use for google id token sign-in
const generateNonce = async (): Promise<string[]> => {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
  const encoder = new TextEncoder()
  const encodedNonce = encoder.encode(nonce)
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedNonce)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return [nonce, hashedNonce]
}

const GoogleOneTapComponent = () => {
  const router = useRouter()

  const initializeGoogleOneTap = async () => {
    console.log("Initializing Google One Tap")

    try {
      const [nonce, hashedNonce] = await generateNonce()
      console.log("Nonce generated successfully")

      // check if there's already an existing session before initializing the one-tap UI
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error("Error getting session", error)
        return
      }

      if (data.session) {
        console.log("User already has a session, redirecting to dashboard")
        router.push("/dashboard")
        return
      }

      /* global google */
      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: CredentialResponse) => {
          try {
            // send id token returned in response.credential to supabase
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
              nonce,
            })
            if (error) throw error
            console.log("Session data: ", data)
            console.log("Successfully logged in with Google One Tap")
            // redirect to protected page
            router.push("/dashboard")
          } catch (error) {
            console.error("Error logging in with Google One Tap", error)
          }
        },
        nonce: hashedNonce,
        // with chrome's removal of third-party cookies, we need to use FedCM instead
        use_fedcm_for_prompt: true,
      })

      google.accounts.id.prompt() // Display the One Tap UI
    } catch (error) {
      console.error("Error initializing Google One Tap:", error)
    }
  }

  useEffect(() => {
    // Only initialize if we're on the login page or home page
    const path = window.location.pathname
    if (path === "/login" || path === "/") {
      initializeGoogleOneTap()
    }
  }, [])

  return (
    <Script
      onReady={() => {
        initializeGoogleOneTap()
      }}
      src="https://accounts.google.com/gsi/client"
    />
  )
}

export default GoogleOneTapComponent
