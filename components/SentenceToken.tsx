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
      "inline-flex items-center gap-1.5 font-bold transition-all duration-200 border-b-2 rounded-lg px-2 py-0.5 mx-0.5 whitespace-nowrap",
      active 
        ? "border-ms-accent bg-ms-accent/10 scale-[1.02] text-ms-accent shadow-sm" 
        : cn("border-dashed border-line bg-surface/50 hover:bg-surface-alt", !value ? "text-ms-muted/40" : colorClass)
    )}
    style={{ lineHeight: 1.3 }}
  >
    {icon && value && <span className="text-xl leading-none shrink-0">{icon}</span>}
    <span>{value || placeholder}</span>
  </button>
)
