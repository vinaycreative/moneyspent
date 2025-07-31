"use client"

import { useState } from "react"
import {
  User,
  HelpCircle,
  LogOut,
  ChevronRight,
  Globe,
  DollarSign,
  Tag,
  Info,
  Settings,
} from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"
import CategoryManagementModal from "@/components/CategoryManagementModal"
import { useRouter } from "next/navigation"

interface SettingItem {
  id: string
  title: string
  subtitle: string
  icon: any
  action: "navigate" | "modal" | "logout"
}

export default function SettingsPage() {
  const { user, profile, signOut } = useAuth()
  const [currency, setCurrency] = useState("INR")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const router = useRouter()

  const handleAction = async (item: SettingItem) => {
    switch (item.action) {
      case "modal":
        if (item.id === "categories") {
          setShowCategoryModal(true)
        }
        break
      case "logout":
        try {
          await signOut()
          // Redirect to login page after successful logout
          router.push("/login")
        } catch (error) {
          console.error("Logout failed:", error)
          // Still redirect to login page even if there's an error
          router.push("/login")
        }
        break
      case "navigate":
        // Handle navigation for other items
        switch (item.id) {
          case "profile":
            // Navigate to profile page (you can implement this later)
            console.log("Navigate to profile")
            break
          case "currency":
            // Handle currency selection (you can implement this later)
            console.log("Currency settings")
            break
          case "language":
            // Handle language selection (you can implement this later)
            console.log("Language settings")
            break
          case "help":
            // Handle help and support (you can implement this later)
            console.log("Help and support")
            break
          case "about":
            // Handle about page (you can implement this later)
            console.log("About page")
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
    <div className="h-screen bg-gray-50 overflow-hidden">
      <div className="max-w-md mx-auto h-full flex flex-col">
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Header */}
          <div className="px-4 pt-6 pb-4 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>

          {/* Profile Section */}
          <div className="px-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {profile?.full_name
                    ? profile.full_name.charAt(0).toUpperCase()
                    : user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900">{profile?.full_name || "User"}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                  <div className="text-xs text-gray-400">
                    {profile?.created_at
                      ? "Member since " + new Date(profile.created_at).toLocaleDateString()
                      : "New member"}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Settings List */}
          <div className="px-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="space-y-1">
                {settingsItems.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleAction(item)}
                      className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                        index !== settingsItems.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
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
          </div>

          {/* Logout Section */}
          <div className="px-4 mt-6">
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
              className="w-full flex items-center gap-4 p-4 rounded-xl text-red-500 hover:bg-red-50 transition-colors border border-red-200 bg-white"
            >
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">Logout</div>
                <div className="text-sm text-red-400">Sign out of your account</div>
              </div>
            </button>
          </div>

          {/* App Version */}
          <div className="px-4 mt-6 text-center">
            <div className="text-xs text-gray-400">Money Manager v1.0.0</div>
            <div className="text-xs text-gray-400 mt-1">Built with Next.js & Supabase</div>
          </div>
        </div>

        {/* Category Management Modal */}
        <CategoryManagementModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
        />
      </div>
    </div>
  )
}
