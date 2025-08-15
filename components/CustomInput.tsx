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
        <label htmlFor={id} className="text-sm text-gray-800 font-medium">
          {label}
        </label>
        <input
          ref={ref}
          className={cn(
            "w-full text-sm border bg-white border-gray-300 rounded-sm py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-black",
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
