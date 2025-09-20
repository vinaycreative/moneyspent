import { useState, useCallback } from "react"

export const useViewCategoriesDrawer = () => {
  const [isOpen, setIsOpen] = useState(false)

  const openDrawer = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    isOpen,
    openDrawer,
    closeDrawer,
  }
}