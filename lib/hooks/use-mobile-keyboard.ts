import { useState, useEffect } from "react"

export const useMobileKeyboard = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const initialViewportHeight = window.visualViewport?.height || window.innerHeight
    let timeoutId: NodeJS.Timeout

    const handleViewportChange = () => {
      // Clear any existing timeout
      if (timeoutId) clearTimeout(timeoutId)
      
      // Debounce to avoid rapid changes
      timeoutId = setTimeout(() => {
        const currentHeight = window.visualViewport?.height || window.innerHeight
        const heightDifference = initialViewportHeight - currentHeight
        
        // Consider keyboard visible if viewport height decreased by more than 150px
        // This threshold accounts for mobile browsers' address bar changes
        const keyboardVisible = heightDifference > 150
        
        setIsKeyboardVisible(keyboardVisible)
      }, 100)
    }

    // Listen for viewport changes (modern approach)
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange)
    } else {
      // Fallback for older browsers
      window.addEventListener("resize", handleViewportChange)
    }

    // Also listen for focusin/focusout events on input elements
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) {
        // Small delay to allow keyboard animation to start
        setTimeout(() => {
          const currentHeight = window.visualViewport?.height || window.innerHeight
          const heightDifference = initialViewportHeight - currentHeight
          setIsKeyboardVisible(heightDifference > 150)
        }, 300)
      }
    }

    const handleFocusOut = () => {
      // Small delay to allow keyboard to hide
      setTimeout(() => {
        const currentHeight = window.visualViewport?.height || window.innerHeight
        const heightDifference = initialViewportHeight - currentHeight
        setIsKeyboardVisible(heightDifference > 150)
      }, 300)
    }

    document.addEventListener("focusin", handleFocusIn)
    document.addEventListener("focusout", handleFocusOut)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportChange)
      } else {
        window.removeEventListener("resize", handleViewportChange)
      }
      
      document.removeEventListener("focusin", handleFocusIn)
      document.removeEventListener("focusout", handleFocusOut)
    }
  }, [])

  return {
    isKeyboardVisible,
  }
}