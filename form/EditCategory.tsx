import React from "react"
import CustomDrawer from "@/components/CustomDrawer"
import { Edit, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAddEditCategoryDrawer } from "@/hooks"
import { CustomInput } from "@/components/CustomInput"

export interface CategoryFormData {
  name: string
  type: "expense" | "income"
  icon: string
  color: string
}

interface EditCategoryProps {
  trigger: React.ReactNode
  category: {
    id: string
    name: string
    type: "expense" | "income"
    icon: string
    color: string
    is_default?: boolean
  }
}

export const EditCategory = ({ trigger, category }: EditCategoryProps) => {
  // Don't allow editing default categories
  const isDefaultCategory = category.is_default
  
  const {
    isOpen,
    openDrawer,
    closeDrawer,
    formData,
    setFormData,
    handleSubmit,
    isSubmitDisabled,
    isLoading,
  } = useAddEditCategoryDrawer()
  
  // If it's a default category, show a message instead of the edit form
  if (isDefaultCategory) {
    return (
      <CustomDrawer
        trigger={trigger}
        title="Cannot Edit Category"
        SubmitIcon={FolderOpen}
        submitTitle="OK"
        submitDisabled={false}
        onSubmit={() => closeDrawer()}
        open={isOpen}
        onOpenChange={(open) => {
          if (open) {
            openDrawer()
          } else {
            closeDrawer()
          }
        }}
      >
        <div className="text-center py-8">
          <FolderOpen className="w-16 h-16 text-ms-muted mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ink mb-2">Default Category</h3>
          <p className="text-ms-muted">
            This is a default category and cannot be edited. You can create your own custom categories instead.
          </p>
        </div>
      </CustomDrawer>
    )
  }

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const iconOptions = [
    // Food & Drinks
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
    "🍗",
    "🥩",
    "🥓",
    "🍳",
    "🥚",
    "🥖",
    "🥨",
    "🧀",
    "🥛",
    "🍼",
    "🍯",
    "🥜",
    "🌰",
    "🥑",
    "🥦",
    "🥬",
    "🥒",
    "🌶️",
    "🌽",
    "🥕",
    "🥔",
    "🍠",
    "🥐",
    "🥯",
    // Transportation
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
    "🚀",
    "🛸",
    "🛥️",
    "🚤",
    "⛴️",
    "🛩️",
    "🛫",
    "🛬",
    "🛰️",
    // Shopping & Fashion
    "🛒",
    "🛍️",
    "👕",
    "👖",
    "👟",
    "👜",
    "💄",
    "🧴",
    "💍",
    "👑",
    "👒",
    "🎩",
    "🧢",
    "👡",
    "👠",
    "👢",
    "👞",
    "🥾",
    "🥿",
    "🧦",
    "🧤",
    "🧣",
    "👔",
    "👕",
    "👖",
    "🧥",
    "👗",
    "👘",
    "👙",
    // Technology
    "📱",
    "💻",
    "🖥️",
    "⌨️",
    "🖱️",
    "🖨️",
    "📷",
    "📹",
    "📺",
    "📻",
    "🎙️",
    "🎚️",
    "🎛️",
    "📼",
    "💿",
    "💾",
    "📀",
    // Entertainment
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
    "🎹",
    "🎺",
    "🎻",
    "🥁",
    "🎤",
    "🎧",
    "🎼",
    // Money & Finance
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
    "📉",
    "💱",
    "💲",
    "🪙",
    "💴",
    "💶",
    "💷",
    // Health & Medical
    "🏥",
    "💊",
    "🩺",
    "🦷",
    "👨‍⚕️",
    "🩹",
    "🩻",
    "🧬",
    "🔬",
    "🧪",
    "🧫",
    "🦠",
    "🌡️",
    "🧹",
    "🪠",
    "🧻",
    "🧺",
    "🧽",
    "🪣",
    "🧴",
    "🧷",
    "🪡",
    "🧶",
    "🪢",
    "🧸",
    "🪁",
    "🪃",
    // Education
    "🎓",
    "📝",
    "✏️",
    "📖",
    "🎒",
    "🏫",
    "👨‍🏫",
    "📋",
    "📊",
    "📚",
    "🖊️",
    "🖋️",
    "✒️",
    "🖌️",
    "🖍️",
    "📐",
    "📏",
    "🧮",
    "🔢",
    "🔤",
    "🔡",
    "🔠",
    // Buildings & Places
    "🏠",
    "🏢",
    "🏪",
    "🏨",
    "🏰",
    "⛪",
    "🕌",
    "🕍",
    "🛕",
    "⛩️",
    "🗽",
    "🗼",
    "🎡",
    "🎢",
    "🎠",
    "⛲",
    "⛱️",
    "🏖️",
    "🏝️",
    "🏔️",
    "⛰️",
    "🌋",
    "🗻",
    "🏕️",
    "⛺",
    "🏜️",
    "🏞️",
    "🏟️",
    "🏛️",
    "🏗️",
    "🧱",
    "🏘️",
    "🏚️",
    "🏡",
    "🏭",
    "🏬",
    "🏣",
    "🏤",
    "🏥",
    "🏩",
    "💒",
    // Nature & Weather
    "🌱",
    "🌲",
    "🌳",
    "🌴",
    "🌵",
    "🌾",
    "🌿",
    "☘️",
    "🍀",
    "🍁",
    "🍂",
    "🍃",
    "🌺",
    "🌸",
    "🌼",
    "🌻",
    "🌞",
    "🌝",
    "🌛",
    "🌜",
    "🌚",
    "🌕",
    "🌖",
    "🌗",
    "🌘",
    "🌑",
    "🌒",
    "🌓",
    "🌔",
    "🌙",
    "🌎",
    "🌍",
    "🌏",
    "💫",
    "⭐",
    "🌟",
    "✨",
    "⚡",
    "☄️",
    "💥",
    "🔥",
    "🌪️",
    "🌈",
    "☀️",
    "🌤️",
    "⛅",
    "🌥️",
    "☁️",
    "🌦️",
    "🌧️",
    "⛈️",
    "🌩️",
    "🌨️",
    "🌬️",
    "💨",
    "💧",
    "💦",
    "☔",
    "☂️",
    "🌊",
    // Animals
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🙈",
    "🙉",
    "🙊",
    "🐒",
    "🐔",
    "🐧",
    "🐦",
    "🐤",
    "🐣",
    "🐥",
    "🦆",
    "🦅",
    "🦉",
    "🦇",
    "🐺",
    "🐗",
    "🐴",
    "🦄",
    "🐝",
    "🐛",
    "🦋",
    "🐌",
    "🐞",
    "🐜",
    "🦟",
    "🦗",
    "🕷️",
    "🕸️",
    "🦂",
    "🐢",
    "🐍",
    "🦎",
    "🦖",
    "🦕",
    "🐙",
    "🦑",
    "🦐",
    "🦞",
    "🦀",
    "🐡",
    "🐠",
    "🐟",
    "🐬",
    "🐳",
    "🐋",
    // Objects & Tools
    "🔧",
    "🔨",
    "⚒️",
    "🛠️",
    "⛏️",
    "🔩",
    "⚙️",
    "🧱",
    "⛓️",
    "🧲",
    "🔫",
    "💣",
    "🧨",
    "🪓",
    "🔪",
    "🗡️",
    "⚔️",
    "🛡️",
    "🚬",
    "⚰️",
    "⚱️",
    "🏺",
    "🔮",
    "📿",
    "🧿",
    "💈",
    "⚗️",
    "🔭",
    "🔬",
    "🕳️",
    "🩹",
    "🩺",
    "💊",
    "💉",
    "🩸",
    "🧬",
    "🦠",
    "🧫",
    "🧪",
    "🌡️",
    "🧹",
    "🪠",
    "🧻",
    "🧺",
    "🧽",
    "🪣",
    "🧴",
    "🧷",
    "🪡",
    "🧶",
    "🪢",
    "🧸",
    "🪁",
    "🪃",
    "🏓",
    "🏸",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    // Sports & Activities
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🥏",
    "🎱",
    "🪀",
    "🏓",
    "🏸",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "🥅",
    "⛳",
    "🪁",
    "🏹",
    "🎣",
    "🤿",
    "🥊",
    "🥋",
    "🎽",
    "🛹",
    "🛷️",
    "⛸️",
    "🥌",
    "🎿",
    "⛷️",
    "🏂",
    "🏋️",
    "🤼",
    "🤸",
    "⛹️",
    "🤺",
    "🤾",
    "🏊",
    "🏊‍♂️",
    "🏊‍♀️",
    "🚣",
    "🚣‍♂️",
    "🚣‍♀️",
    "🧘",
    "🧘‍♂️",
    "🧘‍♀️",
    "🏄",
    "🏄‍♂️",
    "🏄‍♀️",
    "🏃",
    "🏃‍♂️",
    "🏃‍♀️",
    "🚶",
    "🚶‍♂️",
    "🚶‍♀️",
    // Symbols & Signs
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
    "✝️",
    "☪️",
    "🕉️",
    "☸️",
    "✡️",
    "🔯",
    "🕎",
    "☯️",
    "☦️",
    "🛐",
    "⛎",
    "♈",
    "♉",
    "♊",
    "♋",
    "♌",
    "♍",
    "♎",
    "♏",
    "♐",
    "♑",
    "♒",
    "♓",
    "🆔",
    "⚛️",
    "🉑",
    "☢️",
    "☣️",
    "📴",
    "📳",
    "🈶",
    "🈚",
    "🈸",
    "🈺",
    "🈷️",
    "✴️",
    "🆚",
    "💮",
    "🉐",
    "㊙️",
    "㊗️",
    "🈴",
    // Flags & Countries
    "🏁",
    "🚩",
    "🎌",
    "🏴",
    "🏳️",
    "🏳️‍🌈",
    "🏴‍☠️",
    "🇦🇫",
    "🇦🇽",
    "🇦🇱",
    "🇩🇿",
    "🇦🇸",
    "🇦🇩",
    "🇦🇴",
    "🇦🇮",
    "🇦🇶",
    "🇦🇷",
    "🇦🇲",
    "🇦🇼",
    "🇦🇺",
    "🇦🇹",
    "🇦🇿",
    "🇧🇸",
    "🇧🇭",
    "🇧🇩",
    "🇧🇧",
    "🇧🇾",
    "🇧🇪",
    "🇧🇿",
    "🇧🇯",
    "🇧🇲",
    "🇧🇹",
    "🇧🇴",
    "🇧🇦",
    "🇧🇼",
    "🇧🇷",
    "🇮🇴",
    "🇻🇬",
    "🇧🇳",
    "🇧🇬",
    "🇧🇫",
    "🇧🇮",
    "🇰🇭",
    "🇨🇲",
    "🇨🇦",
    "🇨🇻",
    "🇰🇾",
    "🇨🇫",
    "🇹🇩",
    "🇨🇱",
    "🇨🇳",
    "🇨🇽",
    "🇨🇨",
    "🇨🇴",
    "🇰🇲",
    "🇨🇬",
    "🇨🇩",
    "🇨🇰",
    "🇨🇷",
    "🇭🇷",
    // Miscellaneous
    "🎯",
    "🎲",
    "🎮",
    "🎰",
    "🎳",
    "🎨",
    "🎬",
    "🎤",
    "🎧",
    "🎼",
    "🎹",
    "🎸",
    "🎺",
    "🎻",
    "🥁",
    "🎤",
    "🎧",
    "🎼",
    "🎹",
    "🎸",
    "🎺",
    "🎻",
    "🥁",
    "🎤",
    "🎧",
    "🎼",
    "🎹",
    "🎸",
    "🎺",
    "🎻",
    "🥁",
    "🎤",
    "🎧",
    "🎼",
    "🎹",
    "🎸",
    "🎺",
    "🎻",
    "🥁",
    "🎤",
    "🎧",
    "🎼",
    "🎹",
    "🎸",
    "🎺",
  ]

  const colorOptions = [
    { name: "Gray", value: "#6B7280", bgClass: "bg-gray-400" },
    { name: "Red", value: "#F87171", bgClass: "bg-red-400" },
    { name: "Orange", value: "#FB923C", bgClass: "bg-orange-400" },
    { name: "Yellow", value: "#FACC15", bgClass: "bg-yellow-400" },
    { name: "Green", value: "#4ADE80", bgClass: "bg-green-400" },
    { name: "Blue", value: "#60A5FA", bgClass: "bg-blue-400" },
    { name: "Purple", value: "#A78BFA", bgClass: "bg-purple-400" },
    { name: "Pink", value: "#F472B6", bgClass: "bg-pink-400" },
    { name: "Indigo", value: "#818CF8", bgClass: "bg-indigo-400" },
    { name: "Teal", value: "#2DD4BF", bgClass: "bg-teal-400" },
    { name: "Cyan", value: "#22D3EE", bgClass: "bg-cyan-400" },
    { name: "Lime", value: "#A3E635", bgClass: "bg-lime-400" },
    { name: "Emerald", value: "#34D399", bgClass: "bg-emerald-400" },
    { name: "Rose", value: "#FB7185", bgClass: "bg-rose-400" },
    { name: "Violet", value: "#8B5CF6", bgClass: "bg-violet-400" },
  ]

  const handleFormSubmit = async () => {
    try {
      await handleSubmit()
      // The drawer will be closed automatically by the hook after successful submission
    } catch (error) {
      console.error("Failed to update category:", error)
    }
  }

  const handleOpenDrawer = () => {
    openDrawer(category)
  }
  
  // Helper function to get the background class for a hex color
  const getColorBgClass = (hexColor: string) => {
    const colorOption = colorOptions.find(c => c.value === hexColor)
    return colorOption ? colorOption.bgClass : "bg-gray-400"
  }

  return (
    <CustomDrawer
      trigger={trigger}
      title="Edit Category"
      SubmitIcon={Edit}
      submitTitle="Update Category"
      submitDisabled={isSubmitDisabled}
      submitLoading={isLoading}
      onSubmit={handleFormSubmit}
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          handleOpenDrawer()
        } else {
          closeDrawer()
        }
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        {/* Category Name */}
        <CustomInput
          id="name"
          label="Category Name"
          name="name"
          placeholder="Enter category name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          required
        />

        {/* Category Type */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="type" className="text-sm text-ink font-medium">
            Type
          </label>
          <Select
            value={formData.type}
            onValueChange={(value) => handleInputChange("type", value as "expense" | "income")}
          >
            <SelectTrigger className="w-full border-line bg-surface text-ink">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="income">Income</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Icon Selection */}
        <div className="flex flex-col gap-1.5 col-span-2">
          <label htmlFor="icon" className="text-sm text-ink font-medium">
            Icon
          </label>
          <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto border border-line rounded-xl p-3 bg-surface">
            {iconOptions.map((icon, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleInputChange("icon", icon)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-surface-alt transition-colors",
                  formData.icon === icon ? "bg-surface-alt border-2 border-ms-accent" : ""
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selection */}
        <div className="flex flex-col gap-1.5 col-span-2">
          <label htmlFor="color" className="text-sm text-ink font-medium">
            Color
          </label>
          <div className="grid grid-cols-8 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => handleInputChange("color", color.value)}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  color.bgClass,
                  formData.color === color.value
                    ? "ring-2 ring-ms-accent ring-offset-2"
                    : "hover:scale-105"
                )}
              >
                {formData.color === color.value && (
                  <div className="w-3 h-3 bg-white rounded-full shadow" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2 col-span-2">
          <Label className="text-ink font-medium">Preview</Label>
          <div className="bg-surface-alt rounded-xl p-4 border border-line">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg",
                  getColorBgClass(formData.color)
                )}
              >
                {formData.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-ink">{formData.name || "Category Name"}</div>
                <div className="text-sm text-ms-muted capitalize">{formData.type || "Type"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomDrawer>
  )
}
