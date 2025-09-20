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
} from "lucide-react"
import { useAuth } from "@/hooks"
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
  const [currency] = useState("INR")
  const {
    isOpen: isViewOpen,
    openDrawer: openViewDrawer,
    closeDrawer: closeViewDrawer,
  } = useViewCategoriesDrawer()

  // Add category drawer state
  const {
    openDrawer: openAddEditDrawer,
    closeDrawer: closeAddEditDrawer,
  } = useAddEditCategoryDrawer()

  const router = useRouter()

  const handleAction = async (item: SettingItem) => {
    switch (item.action) {
      case "modal":
        if (item.id === "categories") {
          openViewDrawer()
        }
        break
      case "logout":
        try {
          await signOut()
          // Redirect to onboarding page after successful logout
          router.push("/")
        } catch (error) {
          console.error("Logout failed:", error)
          // Still redirect to onboarding page even if there's an error
          router.push("/")
        }
        break
      case "navigate":
        // Handle navigation for other items
        switch (item.id) {
          case "profile":
            // Navigate to profile page (you can implement this later)
            break
          case "currency":
            // Handle currency selection (you can implement this later)
            break
          case "language":
            // Handle language selection (you can implement this later)
            break
          case "help":
            // Handle help and support (you can implement this later)
            break
          case "about":
            // Handle about page (you can implement this later)
            break
        }
        break
    }
  }


  const settingsItems: SettingItem[] = [
    {
      id: "profile",
      title: "Profile",
      subtitle: "Manage your personal information",
      icon: User,
      action: "navigate",
    },
    {
      id: "categories",
      title: "Categories",
      subtitle: "Manage transaction categories",
      icon: Tag,
      action: "modal",
    },
    {
      id: "currency",
      title: "Currency",
      subtitle: `Current: ${currency}`,
      icon: DollarSign,
      action: "navigate",
    },
    {
      id: "language",
      title: "Language",
      subtitle: "English (US)",
      icon: Globe,
      action: "navigate",
    },
    {
      id: "help",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      icon: HelpCircle,
      action: "navigate",
    },
    {
      id: "about",
      title: "About Us",
      subtitle: "App version and information",
      icon: Info,
      action: "navigate",
    },
  ]

  return (
    <div className="max-w-md mx-auto h-full flex flex-col gap-4 mobile-viewport">
      {/* Header */}
      <header className="px-4 mt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Settings</h1>
        </div>
      </header>
      {/* Profile Section */}
      <section className="px-4">
        <div className="bg-white rounded-md p-4 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {user?.name
                ? user.name.charAt(0).toUpperCase()
                : user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-900">{user?.name || "User"}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
              <div className="text-xs text-gray-400">
                {user?.created_at
                  ? "Member since " + new Date(user.created_at).toLocaleDateString()
                  : "New member"}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Settings List */}
      <section className="px-4">
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="">
            {settingsItems.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleAction(item)}
                  className={`w-full cursor-pointer flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                    index !== settingsItems.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-md border border-gray-200 bg-gray-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>

                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.subtitle}</div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Logout Section */}
      <section className="px-4">
        <button
          onClick={() =>
            handleAction({
              id: "logout",
              title: "",
              subtitle: "",
              icon: LogOut,
              action: "logout",
            })
          }
          className="w-full flex items-center gap-4 p-4 rounded-md text-red-500 hover:bg-red-50 transition-colors border border-red-200 bg-white"
        >
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 text-left">
            <div className="font-medium">Logout</div>
            <div className="text-sm text-red-400">Sign out of your account</div>
          </div>
        </button>
      </section>

      {/* App Version */}
      <section className="px-4 pb-6 text-center">
        <div className="text-xs text-gray-400">MoneySpend v1.0.0</div>
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
              <button className="w-full cursor-pointer bg-black text-white rounded-md py-2.5 flex items-center justify-center gap-2 font-medium hover:bg-gray-800 transition-colors">
                <Plus className="w-5 h-5" />
                Add New Category
              </button>
            }
          />
        }
      >
        <ViewAllCategories />
      </CustomDrawer>

      {/* Add/Edit Category Component - Controlled by the hook */}
      <AddCategory trigger={<div style={{ display: "none" }} />} />
    </div>
  )
}
