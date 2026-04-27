import { cn } from "@/lib/utils"
import React, { forwardRef } from "react"

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  placeholder: string
  className?: string
  inputClassName?: string
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ id, label, placeholder, className, inputClassName, ...props }, ref) => {
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <label htmlFor={id} className="text-sm text-ink font-medium">
          {label}
        </label>
        <input
          ref={ref}
          className={cn(
            "w-full text-sm border bg-surface border-line text-ink rounded-xl py-2.5 px-4 placeholder:text-ms-muted focus:outline-none focus:ring-1 focus:ring-ink/30",
            "mobile-scroll", // Add mobile scrolling utility
            inputClassName
          )}
          placeholder={placeholder}
          id={id}
          // Mobile-specific attributes
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          {...props}
        />
      </div>
    )
  }
)

CustomInput.displayName = "CustomInput"
