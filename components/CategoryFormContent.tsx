"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CategoryForm {
  name: string
  type: "expense" | "income"
  icon: string
  color: string
}

interface Category {
  id: string
  name: string
  type: "expense" | "income"
  icon: string
  color: string
}

interface CategoryFormContentProps {
  category?: Category | null
  formData: CategoryForm
  onFormDataChange: (data: CategoryForm) => void
  onSubmit: () => void
  isLoading: boolean
  isSubmitDisabled: boolean
}

export function CategoryFormContent({
  category,
  formData,
  onFormDataChange,
  onSubmit,
  isLoading,
  isSubmitDisabled,
}: CategoryFormContentProps) {
  const iconOptions = [
    // Food & Drinks
    "🍔", "🍽️", "☕", "🍕", "🍦", "🍎", "🥗", "🍜", "🍣", "🍖", "🍗", "🥩", "🥓", "🍳", "🥚",
    "🥖", "🥨", "🧀", "🥛", "🍼", "🍯", "🥜", "🌰", "🥑", "🥦", "🥬", "🥒", "🌶️", "🌽", "🥕",
    "🥔", "🍠", "🥐", "🥯", "🥖", "🥨", "🧀", "🥛", "🍼", "🍯", "🥜", "🌰", "🥑", "🥦", "🥬",
    "🥒", "🌶️", "🌽", "🥕", "🥔", "🍠", "🥐", "🥯", "🥖", "🥨", "🧀", "🥛", "🍼", "🍯", "🥜",
    
    // Transportation
    "⛽", "🚗", "🚌", "🚇", "🚲", "✈️", "🚢", "🚅", "🛵", "🚁", "🚀", "🛸", "🚁", "🛥️", "🚤",
    "⛴️", "🚢", "🚁", "🛩️", "✈️", "🛫", "🛬", "🚁", "🛸", "🚀", "🛰️", "🚁", "🛥️", "🚤", "⛴️",
    
    // Shopping & Fashion
    "🛒", "🛍️", "👕", "👖", "👟", "👜", "💄", "🧴", "💍", "👑", "👒", "🎩", "🧢", "👡", "👠",
    "👢", "👞", "👟", "🥾", "🥿", "🧦", "🧤", "🧣", "👔", "👕", "👖", "🧥", "👗", "👘", "👙",
    
    // Technology
    "📱", "💻", "🖥️", "⌨️", "🖱️", "🖨️", "📷", "📹", "📺", "📻", "🎙️", "🎚️", "🎛️", "📼", "💿",
    "💾", "📀", "🖥️", "⌨️", "🖱️", "🖨️", "📷", "📹", "📺", "📻", "🎙️", "🎚️", "🎛️", "📼", "💿",
    
    // Entertainment
    "🎬", "🎮", "🎵", "🎨", "📚", "🎭", "🎪", "🎯", "🎲", "🎸", "🎹", "🎺", "🎻", "🥁", "🎤",
    "🎧", "🎼", "🎹", "🎺", "🎻", "🥁", "🎤", "🎧", "🎼", "🎹", "🎺", "🎻", "🥁", "🎤", "🎧",
    
    // Money & Finance
    "💰", "📈", "💵", "💳", "🏦", "📊", "💎", "🏆", "🎁", "💼", "📈", "📉", "💱", "💲", "🪙",
    "💴", "💵", "💶", "💷", "🪙", "💱", "💲", "🪙", "💴", "💵", "💶", "💷", "🪙", "💱", "💲",
    
    // Health & Medical
    "🏥", "💊", "🩺", "🦷", "👨‍⚕️", "🩹", "🩻", "🧬", "🔬", "🧪", "🧫", "🧬", "🔬", "🧪", "🧫",
    "🧬", "🔬", "🧪", "🧫", "🧬", "🔬", "🧪", "🧫", "🧬", "🔬", "🧪", "🧫", "🧬", "🔬", "🧪",
    
    // Education
    "🎓", "📝", "✏️", "📖", "🎒", "🏫", "👨‍🏫", "📋", "📊", "📚", "📖", "📝", "✏️", "🖊️", "🖋️",
    "✒️", "🖌️", "🖍️", "📐", "📏", "🧮", "🔢", "🔤", "🔡", "🔠", "📝", "✏️", "🖊️", "🖋️", "✒️",
    
    // Buildings & Places
    "🏠", "🏢", "🏪", "🏨", "🏰", "⛪", "🕌", "🕍", "🛕", "⛩️", "🗽", "🗼", "🎡", "🎢", "🎠",
    "⛲", "⛱️", "🏖️", "🏝️", "🏔️", "⛰️", "🌋", "🗻", "🏕️", "⛺", "🏜️", "🏞️", "🏟️", "🏛️", "🏗️",
    "🧱", "🏘️", "🏚️", "🏡", "🏠", "🏗️", "🏭", "🏢", "🏬", "🏣", "🏤", "🏥", "🏨", "🏪", "🏫",
    "🏩", "💒", "🏛️", "⛪", "🕌", "🕍", "🛕", "⛩️", "🗽", "🗼", "🎡", "🎢", "🎠", "⛲", "⛱️",
    
    // Nature & Weather
    "🌱", "🌲", "🌳", "🌴", "🌵", "🌾", "🌿", "☘️", "🍀", "🍁", "🍂", "🍃", "🌺", "🌸", "🌼",
    "🌻", "🌞", "🌝", "🌛", "🌜", "🌚", "🌕", "🌖", "🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌙",
    "🌎", "🌍", "🌏", "💫", "⭐", "🌟", "✨", "⚡", "☄️", "💥", "🔥", "🌪️", "🌈", "☀️", "🌤️",
    "⛅", "🌥️", "☁️", "🌦️", "🌧️", "⛈️", "🌩️", "🌨️", "🌬️", "💨", "💧", "💦", "☔", "☂️", "🌊",
    
    // Animals
    "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵",
    "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇", "🐺",
    "🐗", "🐴", "🦄", "🐝", "🐛", "🦋", "🐌", "🐞", "🐜", "🦟", "🦗", "🕷️", "🕸️", "🦂", "🐢",
    "🐍", "🦎", "🦖", "🦕", "🐙", "🦑", "🦐", "🦞", "🦀", "🐡", "🐠", "🐟", "🐬", "🐳", "🐋",
    
    // Objects & Tools
    "🔧", "🔨", "⚒️", "🛠️", "⛏️", "🔩", "⚙️", "🧱", "⛓️", "🧲", "🔫", "💣", "🧨", "🪓", "🔪",
    "🗡️", "⚔️", "🛡️", "🚬", "⚰️", "⚱️", "🏺", "🔮", "📿", "🧿", "💈", "⚗️", "🔭", "🔬", "🕳️",
    "🩹", "🩺", "💊", "💉", "🩸", "🧬", "🦠", "🧫", "🧪", "🌡️", "🧹", "🪠", "🧻", "🧺", "🧽",
    "🪣", "🧴", "🧷", "🪡", "🧶", "🪢", "🧸", "🪁", "🪃", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏",
    
    // Sports & Activities
    "⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑",
    "🥍", "🏏", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷️", "⛸️", "🥌",
    "🎿", "⛷️", "🏂", "🏋️", "🤼", "🤸", "⛹️", "🤺", "🤾", "🏊", "🏊‍♂️", "🏊‍♀️", "🚣", "🚣‍♂️", "🚣‍♀️",
    "🧘", "🧘‍♂️", "🧘‍♀️", "🏄", "🏄‍♂️", "🏄‍♀️", "🏃", "🏃‍♂️", "🏃‍♀️", "🚶", "🚶‍♂️", "🚶‍♀️", "🏃", "🏃‍♂️", "🏃‍♀️",
    
    // Symbols & Signs
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❣️", "💕", "💞", "💓", "💗",
    "💖", "💘", "💝", "💟", "☮️", "✝️", "☪️", "🕉️", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐",
    "⛎", "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓", "🆔", "⚛️", "🉑", "☢️",
    "☣️", "📴", "📳", "🈶", "🈚", "🈸", "🈺", "🈷️", "✴️", "🆚", "💮", "🉐", "㊙️", "㊗️", "🈴",
    
    // Flags & Countries
    "🏁", "🚩", "🎌", "🏴", "🏳️", "🏳️‍🌈", "🏴‍☠️", "🇦🇫", "🇦🇽", "🇦🇱", "🇩🇿", "🇦🇸", "🇦🇩", "🇦🇴", "🇦🇮",
    "🇦🇶", "🇦🇷", "🇦🇲", "🇦🇼", "🇦🇺", "🇦🇹", "🇦🇿", "🇧🇸", "🇧🇭", "🇧🇩", "🇧🇧", "🇧🇾", "🇧🇪", "🇧🇿", "🇧🇯",
    "🇧🇲", "🇧🇹", "🇧🇴", "🇧🇦", "🇧🇼", "🇧🇷", "🇮🇴", "🇻🇬", "🇧🇳", "🇧🇬", "🇧🇫", "🇧🇮", "🇰🇭", "🇨🇲", "🇨🇦",
    "🇨🇻", "🇰🇾", "🇨🇫", "🇹🇩", "🇨🇱", "🇨🇳", "🇨🇽", "🇨🇨", "🇨🇴", "🇰🇲", "🇨🇬", "🇨🇩", "🇨🇰", "🇨🇷", "🇭🇷",
    
    // Miscellaneous
    "🎯", "🎲", "🎮", "🎰", "🎳", "🎨", "🎬", "🎤", "🎧", "🎼", "🎹", "🎸", "🎺", "🎻", "🥁",
    "🎤", "🎧", "🎼", "🎹", "🎸", "🎺", "🎻", "🥁", "🎤", "🎧", "🎼", "🎹", "🎸", "🎺", "🎻",
    "🥁", "🎤", "🎧", "🎼", "🎹", "🎸", "🎺", "🎻", "🥁", "🎤", "🎧", "🎼", "🎹", "🎸", "🎺"
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
    { name: "Cyan", value: "bg-cyan-400" },
    { name: "Lime", value: "bg-lime-400" },
    { name: "Emerald", value: "bg-emerald-400" },
    { name: "Rose", value: "bg-rose-400" },
    { name: "Violet", value: "bg-violet-400" },
  ]

  const handleInputChange = (field: keyof CategoryForm, value: string) => {
    onFormDataChange({
      ...formData,
      [field]: value,
    })
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-2 gap-4">
      {/* Category Name */}
      <div className="space-y-2">
        <Label className="text-gray-800 font-medium">Category Name</Label>
        <Input
          type="text"
          placeholder="Enter category name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="w-full border-gray-300 bg-white"
        />
      </div>

      {/* Category Type */}
      <div className="space-y-2">
        <Label className="text-gray-800 font-medium">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => handleInputChange("type", value as "expense" | "income")}
        >
          <SelectTrigger className="w-full border-gray-300 bg-white">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">Expense</SelectItem>
            <SelectItem value="income">Income</SelectItem>
          </SelectContent>
        </Select>
      </div>
      </div>

      {/* Icon Selection */}
      <div className="space-y-2">
        <Label className="text-gray-800 font-medium">Icon</Label>
        <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
          {iconOptions.map((icon) => (
            <button
              key={icon}
              onClick={() => handleInputChange("icon", icon)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-gray-100 transition-colors ${
                formData.icon === icon ? "bg-purple-100 border-2 border-purple-500" : ""
              }`}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-2">
        <Label className="text-gray-800 font-medium">Color</Label>
        <div className="grid grid-cols-5 gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => handleInputChange("color", color.value)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                formData.color === color.value
                  ? "ring-2 ring-purple-500 ring-offset-2"
                  : "hover:scale-105"
              } ${color.value}`}
            >
              {formData.color === color.value && (
                <div className="w-4 h-4 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <Label className="text-gray-800 font-medium">Preview</Label>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${formData.color} text-white text-lg`}
            >
              {formData.icon}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">
                {formData.name || "Category Name"}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {formData.type || "Type"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 