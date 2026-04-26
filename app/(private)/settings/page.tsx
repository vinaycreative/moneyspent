"use client"

import React, { useState } from "react"
import {
  User,
  HelpCircle,
  LogOut,
  ChevronRight,
  Globe,
  DollarSign,
  Tag,
  Info,
  Plus,
  Moon,
  Sun,
} from "lucide-react"
import { useAuth } from "@/hooks"
import { useTheme, ACCENTS } from "@/hooks/useTheme"
import CustomDrawer from "@/components/CustomDrawer"
import { AddCategory } from "@/form/AddCategory"
import { useViewCategoriesDrawer, useAddEditCategoryDrawer } from "@/hooks"
import { useRouter } from "next/navigation"
import ViewAllCategories from "@/components/ViewAllCategories"

interface SettingItem {
  id: string
  title: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  action: "navigate" | "modal" | "logout"
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { theme, accent, toggle: toggleTheme, setAccent } = useTheme()
  const [currency] = useState("INR")
  const { isOpen: isViewOpen, openDrawer: openViewDrawer, closeDrawer: closeViewDrawer } = useViewCategoriesDrawer()
  useAddEditCategoryDrawer()

  const router = useRouter()

  const handleAction = async (item: SettingItem) => {
    switch (item.action) {
      case "modal":
        if (item.id === "categories") openViewDrawer()
        break
      case "logout":
        try {
          await signOut()
          router.push("/")
        } catch (error) {
          console.error("Logout failed:", error)
          router.push("/")
        }
        break
      case "navigate":
        break
    }
  }

  const settingsItems: SettingItem[] = [
    { id: "profile", title: "Profile", subtitle: "Manage your personal information", icon: User, action: "navigate" },
    { id: "categories", title: "Categories", subtitle: "Manage transaction categories", icon: Tag, action: "modal" },
    { id: "currency", title: "Currency", subtitle: `Current: ${currency}`, icon: DollarSign, action: "navigate" },
    { id: "language", title: "Language", subtitle: "English (US)", icon: Globe, action: "navigate" },
    { id: "help", title: "Help & Support", subtitle: "Get help and contact support", icon: HelpCircle, action: "navigate" },
    { id: "about", title: "About Us", subtitle: "App version and information", icon: Info, action: "navigate" },
  ]

  return (
    <div className="max-w-md mx-auto h-full flex flex-col gap-4 mobile-viewport">
      {/* Header */}
      <header className="px-4 mt-4">
        <h1 className="text-lg font-bold text-ink">Settings</h1>
      </header>

      {/* Profile Section */}
      <section className="px-4">
        <div
          className="rounded-xl p-4 bg-surface border border-line"
        >
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ background: "linear-gradient(135deg, var(--ms-accent), color-mix(in oklab, var(--ms-accent) 60%, var(--ink)))" }}
            >
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <div className="font-bold text-ink">{user?.name || "User"}</div>
              <div className="text-sm text-ms-muted">{user?.email}</div>
              <div className="text-xs text-ms-muted">
                {user?.created_at
                  ? "Member since " + new Date(user.created_at).toLocaleDateString()
                  : "New member"}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-ms-muted" />
          </div>
        </div>
      </section>

      {/* Theme Toggle */}
      <section className="px-4">
        <div
          className="rounded-xl p-4 flex items-center justify-between bg-surface border border-line"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-alt border border-line"
            >
              {theme === "dark" ? (
                <Moon className="w-5 h-5 text-ms-accent" />
              ) : (
                <Sun className="w-5 h-5 text-ms-accent" />
              )}
            </div>
            <div>
              <div className="font-medium text-ink">Appearance</div>
              <div className="text-sm text-ms-muted">
                {theme === "dark" ? "Dark mode" : "Light mode"}
              </div>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none"
            style={{
              background: theme === "dark" ? "var(--ms-accent)" : "var(--line-strong)",
            }}
            role="switch"
            aria-checked={theme === "dark"}
          >
            <span
              className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
              style={{
                transform: theme === "dark" ? "translateX(22px)" : "translateX(4px)",
              }}
            />
          </button>
        </div>
      </section>

      {/* Accent Color */}
      <section className="px-4">
        <div
          className="rounded-xl p-4 bg-surface border border-line"
        >
          <div className="mb-3">
            <div className="font-medium text-ink">Accent Color</div>
            <div className="text-sm text-ms-muted">
              Choose your app's highlight color
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {ACCENTS.map((a) => (
              <button
                key={a.key}
                onClick={() => setAccent(a.key)}
                className="flex flex-col items-center gap-1.5 group"
                title={a.label}
              >
                <div
                  className="w-9 h-9 rounded-full transition-transform group-hover:scale-110"
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
                <span
                  className={`text-[10px] font-medium ${accent === a.key ? "text-ms-accent" : "text-ms-muted"}`}
                >
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Settings List */}
      <section className="px-4">
        <div
          className="rounded-xl overflow-hidden border border-line"
        >
          {settingsItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleAction(item)}
                className={`w-full cursor-pointer flex items-center gap-4 p-4 transition-colors bg-surface ${index !== settingsItems.length - 1 ? "border-b border-line" : ""}`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface-alt border border-line text-ms-muted"
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-ink">{item.title}</div>
                  <div className="text-sm text-ms-muted">{item.subtitle}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-ms-muted" />
              </button>
            )
          })}
        </div>
      </section>

      {/* Logout Section */}
      <section className="px-4">
        <button
          onClick={() => handleAction({ id: "logout", title: "", subtitle: "", icon: LogOut, action: "logout" })}
          className="w-full flex items-center gap-4 p-4 rounded-xl transition-colors border border-neg/30 bg-neg/10"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-neg/15"
          >
            <LogOut className="w-5 h-5 text-neg" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium text-neg">Logout</div>
            <div className="text-sm text-neg/70">Sign out of your account</div>
          </div>
        </button>
      </section>

      {/* App Version */}
      <section className="px-4 pb-6 text-center">
        <div className="text-xs text-ms-muted">MoneySpent v1.0.0</div>
      </section>

      {/* View Categories Drawer */}
      <CustomDrawer
        trigger={<div style={{ display: "none" }} />}
        title="Manage Categories"
        SubmitIcon={Tag}
        submitTitle="Add Category"
        submitDisabled={true}
        open={isViewOpen}
        onOpenChange={(open: boolean) => !open && closeViewDrawer()}
        customSubmitButton={
          <AddCategory
            trigger={
              <button
                className="w-full cursor-pointer rounded-xl py-2.5 flex items-center justify-center gap-2 font-semibold bg-ms-accent text-white"
              >
                <Plus className="w-5 h-5" />
                Add New Category
              </button>
            }
          />
        }
      >
        <ViewAllCategories />
      </CustomDrawer>

      <AddCategory trigger={<div style={{ display: "none" }} />} />
    </div>
  )
}
