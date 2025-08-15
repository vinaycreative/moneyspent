import { cn } from "@/lib/utils"
import React from "react"

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  placeholder: string
  className?: string
  inputClassName?: string
}

export const CustomInput = ({
  id,
  label,
  placeholder,
  className,
  inputClassName,
  ...props
}: CustomInputProps) => {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm text-gray-800 font-medium">
        {label}
      </label>
      <input
        className={cn(
          "w-full text-sm border bg-white border-gray-300 rounded-sm py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-black",
          inputClassName
        )}
        placeholder={placeholder}
        id={id}
        {...props}
      />
    </div>
  )
}
