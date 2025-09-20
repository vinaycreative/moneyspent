import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns"

// Currency formatting
export const formatCurrency = (
  amount: number,
  currency = "INR",
  showCents = true
): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  })
  
  return formatter.format(amount)
}

// Compact currency formatting (1.2K, 1.5M, etc.)
export const formatCurrencyCompact = (
  amount: number,
  currency = "INR"
): string => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    compactDisplay: "short",
  })
  
  return formatter.format(amount)
}

// Date formatting
export const formatDate = (date: string | Date, formatStr = "MMM dd, yyyy"): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, formatStr)
}

// Relative date formatting
export const formatDateRelative = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  
  if (isToday(dateObj)) return "Today"
  if (isYesterday(dateObj)) return "Yesterday"
  if (isThisWeek(dateObj)) return format(dateObj, "EEEE") // Monday, Tuesday, etc.
  if (isThisMonth(dateObj)) return format(dateObj, "MMM dd")
  
  return format(dateObj, "MMM dd, yyyy")
}

// Time formatting
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, "h:mm a")
}

// DateTime formatting
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, "MMM dd, yyyy h:mm a")
}

// Number formatting
export const formatNumber = (num: number, decimals = 0): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

// Percentage formatting
export const formatPercentage = (value: number, decimals = 1): string => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B"
  
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Truncate text
export const truncateText = (text: string, maxLength = 50): string => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Convert to title case
export const toTitleCase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

// Format phone number (US format)
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "")
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  
  return phone
}

// Generate initials from name
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Color utilities
export const getContrastColor = (hexColor: string): "black" | "white" => {
  // Remove # if present
  const hex = hexColor.replace("#", "")
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  return luminance > 0.5 ? "black" : "white"
}

// Transaction amount formatting with sign
export const formatTransactionAmount = (
  amount: number,
  type: "expense" | "income",
  currency = "USD"
): string => {
  const formatted = formatCurrency(amount, currency)
  return type === "expense" ? `-${formatted}` : `+${formatted}`
}

// Format account balance with trend
export const formatBalanceWithTrend = (
  current: number,
  previous: number,
  currency = "USD"
): {
  formatted: string
  trend: "up" | "down" | "neutral"
  changeFormatted: string
} => {
  const formatted = formatCurrency(current, currency)
  const change = current - previous
  const changeFormatted = formatCurrency(Math.abs(change), currency)
  
  let trend: "up" | "down" | "neutral"
  if (change > 0) trend = "up"
  else if (change < 0) trend = "down"
  else trend = "neutral"
  
  return {
    formatted,
    trend,
    changeFormatted,
  }
}