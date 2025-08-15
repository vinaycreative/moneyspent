import { useState, useEffect, useCallback } from "react"

interface UseMobileKeyboardReturn {
  isKeyboardVisible: boolean
  viewportHeight: number
  initialViewportHeight: number
  keyboardHeight: number
}

export const useMobileKeyboard = (): UseMobileKeyboardReturn => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [initialViewportHeight, setInitialViewportHeight] = useState(0)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const updateViewportInfo = useCallback(() => {
    if (typeof window !== "undefined") {
      const currentHeight = window.visualViewport?.height || window.innerHeight
      const newInitialHeight = initialViewportHeight || currentHeight

      setViewportHeight(currentHeight)

      if (!initialViewportHeight) {
        setInitialViewportHeight(newInitialHeight)
      }

      const heightDifference = newInitialHeight - currentHeight
      const newKeyboardVisible = heightDifference > 150

      setIsKeyboardVisible(newKeyboardVisible)
      setKeyboardHeight(newKeyboardVisible ? heightDifference : 0)
    }
  }, [initialViewportHeight])

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Set initial values
      setInitialViewportHeight(window.visualViewport?.height || window.innerHeight)
      setViewportHeight(window.visualViewport?.height || window.innerHeight)

      // Use visualViewport API if available (more reliable)
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", updateViewportInfo)
      } else {
        // Fallback for older browsers
        window.addEventListener("resize", updateViewportInfo)
        window.addEventListener("orientationchange", updateViewportInfo)
      }

      return () => {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener("resize", updateViewportInfo)
        } else {
          window.removeEventListener("resize", updateViewportInfo)
          window.removeEventListener("orientationchange", updateViewportInfo)
        }
      }
    }
  }, [updateViewportInfo])

  return {
    isKeyboardVisible,
    viewportHeight,
    initialViewportHeight,
    keyboardHeight,
  }
}
