"use client"

import React, { useState } from "react"
import {
  User,
  LogOut,
  ChevronRight,
  Globe,
  IndianRupee,
  Tag,
  Info,
  Plus,
  Sun,
  Moon,
} from "lucide-react"
import { useAuth } from "@/hooks"
import { useTheme, ACCENTS } from "@/hooks/useTheme"
import CustomDrawer from "@/components/CustomDrawer"
import { AddCategory } from "@/form/AddCategory"
import { useViewCategoriesDrawer, useAddEditCategoryDrawer, useTransactions } from "@/hooks"
import { useRouter } from "next/navigation"
import ViewAllCategories from "@/components/ViewAllCategories"
import { useMemo } from "react"

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { theme, accent, toggle: toggleTheme, setAccent } = useTheme()
  const [currency] = useState("INR")
  useAddEditCategoryDrawer()
  const router = useRouter()

  // Derive stats from transaction data
  const { transactions, totalExpenses } = useTransactions({}, !!user?.id)

  const stats = useMemo(() => {
    const txList = transactions ?? []
    // Logged = unique days with at least one transaction
    const uniqueDays = new Set(txList.map((t: any) => t.occurred_at?.slice(0, 10))).size
    // Streak = consecutive days ending today
    const sorted = [...new Set(txList.map((t: any) => t.occurred_at?.slice(0, 10)))]
      .filter(Boolean)
      .sort()
      .reverse()
    let streak = 0
    let cursor = new Date()
    cursor.setHours(0, 0, 0, 0)
    for (const day of sorted) {
      const d = new Date(day as string)
      d.setHours(0, 0, 0, 0)
      if (d.getTime() === cursor.getTime()) {
        streak++
        cursor.setDate(cursor.getDate() - 1)
      } else {
        break
      }
    }
    // Saved = difference between income and expenses
    const totalIncome = txList
      .filter((t: any) => t.type === "income")
      .reduce((s: number, t: any) => s + t.amount, 0)
    const saved = totalIncome - totalExpenses

    return { logged: uniqueDays, streak, saved }
  }, [transactions, totalExpenses])

  const formatSaved = (n: number) => {
    if (Math.abs(n) >= 1000) return `₹${Math.round(Math.abs(n) / 1000)}k`
    return `₹${Math.abs(n)}`
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/")
    } catch {
      router.push("/")
    }
  }

  const avatarLetter = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "U"

  const settingsItems = [
    {
      id: "profile",
      title: "Profile",
      subtitle: "Manage your profile information",
      icon: User,
      onClick: () => {},
    },
    {
      id: "categories",
      title: "Categories",
      subtitle: "Manage transaction categories",
      icon: Tag,
      onClick: () => router.push("/settings/categories"),
    },
    {
      id: "currency",
      title: "Currency",
      subtitle: `Current: ${currency}`,
      icon: IndianRupee,
      onClick: () => {},
    },
    {
      id: "language",
      title: "Language",
      subtitle: "English (US)",
      icon: Globe,
      onClick: () => {},
    },
    {
      id: "about",
      title: "About Us",
      subtitle: "App version and information",
      icon: Info,
      onClick: () => {},
    },
  ]

  return (
    <div className="max-w-md mx-auto min-h-screen bg-paper pb-28">
      <div className="pt-10 flex flex-col gap-6">

        {/* Profile Hero */}
        <div className="flex flex-col items-center pt-2 pb-1">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black text-white mb-4 shadow-lg"
            style={{ background: "var(--ms-accent)" }}
          >
            {avatarLetter}
          </div>
          <h1 className="text-xl font-bold text-ink tracking-tight">{user?.name || "User"}</h1>
          <p className="text-sm text-ms-muted mt-0.5">{user?.email}</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface border border-line rounded-2xl p-4 text-center shadow-sm">
            <p className="text-xl font-black text-ink">{stats.logged}</p>
            <p className="text-[10px] text-ms-muted font-medium mt-1">Logged</p>
          </div>
          <div className="bg-surface border border-line rounded-2xl p-4 text-center shadow-sm">
            <p className="text-xl font-black text-ink">{stats.streak}</p>
            <p className="text-[10px] text-ms-muted font-medium mt-1">Streak</p>
          </div>
          <div className="bg-surface border border-line rounded-2xl p-4 text-center shadow-sm">
            <p className="text-xl font-black text-ink">{formatSaved(stats.saved)}</p>
            <p className="text-[10px] text-ms-muted font-medium mt-1">Saved</p>
          </div>
        </div>

        {/* Appearance Toggle */}
        <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-alt flex items-center justify-center">
              {theme === "dark"
                ? <Moon className="w-4 h-4 text-ink" />
                : <Sun className="w-4 h-4 text-ink" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Appearance</p>
              <p className="text-[11px] text-ms-muted font-medium">
                {theme === "dark" ? "Dark Mode" : "Light Mode"}
              </p>
            </div>
          </div>

          {/* Toggle pill */}
          <button
            onClick={toggleTheme}
            role="switch"
            aria-checked={theme === "dark"}
            className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none"
            style={{ background: theme === "dark" ? "var(--ms-accent)" : "var(--line-strong)" }}
          >
            <span
              className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
              style={{ transform: theme === "dark" ? "translateX(22px)" : "translateX(4px)" }}
            />
          </button>
        </div>

        {/* Accent Color */}
        <div className="bg-surface border border-line rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-bold text-ink mb-0.5">Accent Color</p>
          <p className="text-[11px] text-ms-muted font-medium mb-4">Choose Your App's Highlight Color</p>
          <div className="flex gap-4 flex-wrap">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                onClick={() => setAccent(a.key)}
                className="flex flex-col items-center gap-1.5 active:scale-90 transition-transform"
                title={a.label}
              >
                <div
                  className="w-10 h-10 rounded-full transition-transform"
                  style={{
                    background: a.swatch,
                    outline: accent === a.key ? `3px solid ${a.swatch}` : "3px solid transparent",
                    outlineOffset: 2,
                    boxShadow: accent === a.key ? `0 0 0 1px var(--surface), 0 0 0 4px ${a.swatch}40` : "none",
                  }}
                >
                  {accent === a.key && (
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-semibold ${accent === a.key ? "text-ms-accent" : "text-ms-muted"}`}>
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
          {settingsItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={item.onClick}
                className={`w-full flex items-center gap-3 px-4 py-4 transition-colors active:bg-surface-alt text-left ${
                  idx < settingsItems.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-surface-alt flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-ink" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="text-[11px] text-ms-muted font-medium mt-0.5">{item.subtitle}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-ms-muted shrink-0" />
              </button>
            )
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl border border-neg/20 bg-neg/8 active:bg-neg/15 transition-colors"
        >
          <div className="w-10 h-10 rounded-2xl bg-neg/15 flex items-center justify-center shrink-0">
            <LogOut className="w-4 h-4 text-neg" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-neg">Logout</p>
            <p className="text-[11px] text-neg/60 font-medium mt-0.5">Sign out of your account</p>
          </div>
          <ChevronRight className="w-4 h-4 text-neg/60 shrink-0" />
        </button>

        {/* Version */}
        <p className="text-center text-[10px] text-ms-muted pb-2">MoneySpent v1.0.0</p>

      </div>

    </div>
  )
}
