"use client"

import { useState } from "react"
import {
  User,
  Bell,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Globe,
  DollarSign,
  Tag,
  Plus,
  X,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SettingItem {
  id: string
  title: string
  subtitle: string
  icon: any
  action: "navigate" | "toggle" | "logout" | "modal"
  value?: boolean
}

interface Category {
  id: string
  name: string
  type: "expense" | "income"
  icon: string
  color: string
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [currency, setCurrency] = useState("INR")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    type: "expense" as "expense" | "income",
    icon: "📁",
    color: "bg-gray-400",
  })

  // Sample categories - in a real app, these would come from a database
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Food", type: "expense", icon: "🍔", color: "bg-yellow-400" },
    { id: "2", name: "Transport", type: "expense", icon: "⛽", color: "bg-orange-400" },
    { id: "3", name: "Shopping", type: "expense", icon: "🛒", color: "bg-purple-400" },
    { id: "4", name: "Entertainment", type: "expense", icon: "🎬", color: "bg-blue-400" },
    { id: "5", name: "Salary", type: "income", icon: "💰", color: "bg-green-500" },
    { id: "6", name: "Investment", type: "income", icon: "📈", color: "bg-green-400" },
  ])

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
      id: "notifications",
      title: "Notifications",
      subtitle: "Manage notification preferences",
      icon: Bell,
      action: "toggle",
      value: notifications,
    },
    {
      id: "security",
      title: "Security",
      subtitle: "Password, 2FA, and privacy settings",
      icon: Shield,
      action: "navigate",
    },
    {
      id: "payment",
      title: "Payment Methods",
      subtitle: "Manage cards and bank accounts",
      icon: CreditCard,
      action: "navigate",
    },
    {
      id: "currency",
      title: "Currency",
      subtitle: "Set your preferred currency",
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
      id: "darkMode",
      title: "Dark Mode",
      subtitle: "Switch between light and dark theme",
      icon: Moon,
      action: "toggle",
      value: darkMode,
    },
    {
      id: "help",
      title: "Help & Support",
      subtitle: "Get help and contact support",
      icon: HelpCircle,
      action: "navigate",
    },
  ]

  const handleToggle = (id: string) => {
    switch (id) {
      case "notifications":
        setNotifications(!notifications)
        break
      case "darkMode":
        setDarkMode(!darkMode)
        break
    }
  }

  const handleAction = (item: SettingItem) => {
    switch (item.action) {
      case "toggle":
        handleToggle(item.id)
        break
      case "modal":
        if (item.id === "categories") {
          setShowCategoryModal(true)
        }
        break
      default:
        // Handle navigation
        break
    }
  }

  const handleCreateCategory = () => {
    if (newCategory.name.trim()) {
      const category: Category = {
        id: Date.now().toString(),
        name: newCategory.name.trim(),
        type: newCategory.type,
        icon: newCategory.icon,
        color: newCategory.color,
      }
      setCategories([...categories, category])
      setNewCategory({ name: "", type: "expense", icon: "📁", color: "bg-gray-400" })
      setShowCategoryModal(false)
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter((cat) => cat.id !== categoryId))
  }

  const iconOptions = [
    "🍔",
    "🍽️",
    "☕",
    "🍕",
    "🍦",
    "🍎",
    "🥗",
    "🍜",
    "🍣",
    "🍖",
    "⛽",
    "🚗",
    "🚌",
    "🚇",
    "🚲",
    "✈️",
    "🚢",
    "🚅",
    "🛵",
    "🚁",
    "🛒",
    "🛍️",
    "👕",
    "👖",
    "👟",
    "👜",
    "💄",
    "🧴",
    "📱",
    "💻",
    "🎬",
    "🎮",
    "🎵",
    "🎨",
    "📚",
    "🎭",
    "🎪",
    "🎯",
    "🎲",
    "🎸",
    "💰",
    "📈",
    "💵",
    "💳",
    "🏦",
    "📊",
    "💎",
    "🏆",
    "🎁",
    "💼",
    "🏥",
    "💊",
    "🩺",
    "🦷",
    "👨‍⚕️",
    "🏥",
    "🩹",
    "🩻",
    "🧬",
    "🔬",
    "🎓",
    "📝",
    "📚",
    "✏️",
    "📖",
    "🎒",
    "🏫",
    "👨‍🏫",
    "📋",
    "📊",
  ]

  const colorOptions = [
    { name: "Gray", value: "bg-gray-400" },
    { name: "Red", value: "bg-red-400" },
    { name: "Orange", value: "bg-orange-400" },
    { name: "Yellow", value: "bg-yellow-400" },
    { name: "Green", value: "bg-green-400" },
    { name: "Blue", value: "bg-blue-400" },
    { name: "Purple", value: "bg-purple-400" },
    { name: "Pink", value: "bg-pink-400" },
    { name: "Indigo", value: "bg-indigo-400" },
    { name: "Teal", value: "bg-teal-400" },
  ]

  return (
    <div className="h-screen bg-white overflow-hidden">
      <div className="max-w-md mx-auto h-full flex flex-col">
        <div className="flex-1 overflow-y-auto pb-20">
          {/* Header */}
          <div className="px-4 pt-6 pb-4">
            <h1 className="text-xl font-bold text-black mb-6">Settings</h1>
          </div>

          {/* Profile Section */}
          <div className="px-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  JD
                </div>
                <div className="flex-1">
                  <div className="font-bold text-black">John Doe</div>
                  <div className="text-sm text-gray-500">john.doe@example.com</div>
                  <div className="text-xs text-gray-400">Premium Member</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Settings List */}
          <div className="px-4">
            <div className="space-y-1">
              {settingsItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleAction(item)}
                    className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>

                    <div className="flex-1 text-left">
                      <div className="font-medium text-black">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.subtitle}</div>
                    </div>

                    {item.action === "toggle" ? (
                      <div
                        className={`w-12 h-6 rounded-full transition-colors ${
                          item.value ? "bg-purple-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            item.value ? "translate-x-6" : "translate-x-0.5"
                          }`}
                        />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Logout Section */}
          <div className="px-4 mt-8">
            <button className="w-full flex items-center gap-4 p-4 rounded-lg text-red-500 hover:bg-red-50">
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
          <div className="px-4 mt-8 text-center">
            <div className="text-xs text-gray-400">Money Manager v1.0.0</div>
          </div>
        </div>

        {/* Category Management Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Manage Categories</h2>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Existing Categories */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Existing Categories</h3>
                <div className="space-y-3 mb-6">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color} text-white text-sm`}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{category.name}</div>
                          <div className="text-xs text-gray-500 capitalize">{category.type}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Category */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Category</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-700">Category Name</Label>
                      <Input
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="Enter category name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-gray-700">Type</Label>
                      <Select
                        value={newCategory.type}
                        onValueChange={(value: "expense" | "income") =>
                          setNewCategory({ ...newCategory, type: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-gray-700">Icon</Label>
                      <div className="mt-1 grid grid-cols-8 gap-2 max-h-32 overflow-y-auto">
                        {iconOptions.map((icon, index) => (
                          <button
                            key={index}
                            onClick={() => setNewCategory({ ...newCategory, icon })}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm hover:bg-gray-100 ${
                              newCategory.icon === icon
                                ? "bg-purple-100 border-2 border-purple-500"
                                : ""
                            }`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-700">Color</Label>
                      <div className="mt-1 grid grid-cols-5 gap-2">
                        {colorOptions.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                            className={`w-8 h-8 rounded-lg ${color.value} ${
                              newCategory.color === color.value
                                ? "ring-2 ring-purple-500 ring-offset-2"
                                : ""
                            }`}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleCreateCategory}
                      disabled={!newCategory.name.trim()}
                      className="w-full bg-purple-500 text-white py-3 rounded-lg font-medium hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Add Category
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
