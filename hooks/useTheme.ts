"use client"

import { useState, useEffect, useCallback } from "react"

type Theme = "light" | "dark"

export type AccentKey = "emerald" | "indigo" | "rose" | "amber" | "sky" | "violet"

export interface AccentPalette {
  key: AccentKey
  label: string
  swatch: string        // shown in the UI picker (always vivid)
  light: string         // --ms-accent in light mode
  dark: string          // --ms-accent in dark mode
  negLight: string      // --neg in light mode
  negDark: string       // --neg in dark mode
}

export const ACCENTS: AccentPalette[] = [
  { key: "emerald", label: "Emerald",  swatch: "#10b981", light: "#0f8a55", dark: "#3ab87f", negLight: "#c93a3a", negDark: "#ee7d96" },
  { key: "indigo",  label: "Indigo",   swatch: "#6366f1", light: "#4f46e5", dark: "#818cf8", negLight: "#c93a3a", negDark: "#ee7d96" },
  { key: "rose",    label: "Rose",     swatch: "#f43f5e", light: "#e11d48", dark: "#fb7185", negLight: "#7c3aed", negDark: "#a78bfa" },
  { key: "amber",   label: "Amber",    swatch: "#f59e0b", light: "#d97706", dark: "#fbbf24", negLight: "#c93a3a", negDark: "#ee7d96" },
  { key: "sky",     label: "Sky",      swatch: "#0ea5e9", light: "#0284c7", dark: "#38bdf8", negLight: "#c93a3a", negDark: "#ee7d96" },
  { key: "violet",  label: "Violet",   swatch: "#8b5cf6", light: "#7c3aed", dark: "#a78bfa", negLight: "#c93a3a", negDark: "#ee7d96" },
]

function applyAccent(palette: AccentPalette, theme: Theme) {
  const root = document.documentElement
  const accent = theme === "dark" ? palette.dark : palette.light
  const neg    = theme === "dark" ? palette.negDark : palette.negLight
  root.style.setProperty("--ms-accent", accent)
  root.style.setProperty("--pos",       accent)
  root.style.setProperty("--neg",       neg)
  root.style.setProperty("--ring",      accent)
}

export function useTheme() {
  const [theme, setThemeState]   = useState<Theme>("dark")
  const [accent, setAccentState] = useState<AccentKey>("emerald")

  useEffect(() => {
    try {
      const storedTheme  = (localStorage.getItem("ms-theme")  as Theme      | null) ?? "dark"
      const storedAccent = (localStorage.getItem("ms-accent-key") as AccentKey | null) ?? "emerald"
      setThemeState(storedTheme)
      setAccentState(storedAccent)
      const palette = ACCENTS.find((a) => a.key === storedAccent) ?? ACCENTS[0]
      applyAccent(palette, storedTheme)
    } catch {}
  }, [])

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem("ms-theme", next)
      if (next === "dark") document.documentElement.classList.add("dark")
      else document.documentElement.classList.remove("dark")
      setThemeState(next)
      const palette = ACCENTS.find((a) => a.key === accent) ?? ACCENTS[0]
      applyAccent(palette, next)
    } catch {}
  }, [accent])

  const setAccent = useCallback((key: AccentKey) => {
    try {
      localStorage.setItem("ms-accent-key", key)
      setAccentState(key)
      const palette = ACCENTS.find((a) => a.key === key) ?? ACCENTS[0]
      applyAccent(palette, theme)
    } catch {}
  }, [theme])

  const toggle = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark")
  }, [theme, setTheme])

  return { theme, accent, setTheme, setAccent, toggle }
}
