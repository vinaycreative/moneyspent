import React from "react"
import { CustomInput } from "@/components/CustomInput"
import CustomDrawer from "@/components/CustomDrawer"
import { Plus, FolderPlus } from "lucide-react"
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

export interface CategoryFormData {
  name: string
  type: "expense" | "income"
  icon: string
  color: string
}

export const AddCategory = ({ trigger }: { trigger: React.ReactNode }) => {
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

  const handleFormSubmit = async () => {
    try {
      await handleSubmit()
      // The drawer will be closed automatically by the hook after successful submission
    } catch (error) {
      console.error("Failed to create category:", error)
    }
  }

  return (
    <CustomDrawer
      trigger={trigger}
      title="Add Category"
      SubmitIcon={FolderPlus}
      submitTitle="Add Category"
      submitDisabled={isSubmitDisabled}
      submitLoading={isLoading}
      onSubmit={handleFormSubmit}
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          openDrawer()
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
                  color.value,
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
                  formData.color
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
