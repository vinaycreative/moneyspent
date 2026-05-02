import React from "react"
import { cn } from "@/lib/utils"

interface SentenceTokenProps {
  value?: string
  placeholder: string
  active: boolean
  colorClass?: string // semantic tailwind text class
  onClick: () => void
  icon?: React.ReactNode
}

export const SentenceToken = ({
  value,
  placeholder,
  active,
  colorClass = "text-ink",
  onClick,
  icon,
}: SentenceTokenProps) => (
  <button
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-1 font-bold transition-all duration-200 border-b-2 border-dashed rounded-lg px-2 py-0.5 mx-0.5",
      active 
        ? "border-ink/60 bg-surface-alt scale-105" 
        : "border-line bg-surface hover:bg-surface-alt",
      value ? colorClass : "text-ms-muted"
    )}
    style={{ lineHeight: 1.3 }}
  >
    {icon && value && <span className="text-xl leading-none">{icon}</span>}
    <span>{value || placeholder}</span>
  </button>
)
