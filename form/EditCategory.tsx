"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Edit, FolderOpen } from "lucide-react"
import { useAddEditCategoryDrawer } from "@/hooks"
import { InteractiveDrawer } from "@/components/InteractiveDrawer"
import { SentenceToken } from "@/components/SentenceToken"

export interface CategoryFormData {
  name: string
  kind: "expense" | "income"
  icon: string
  color: string
}

type ActiveField = "kind" | "name" | "icon" | "color" | null

// ─── Helpers ─────────────────────────────────────────────────────────────────

const suggestEmoji = (name: string, kind: "expense" | "income" | "transfer" | "loan"): string | null => {
  if (!name || name.trim() === "") return null
  const n = name.toLowerCase()
  if (kind === "expense") {
    if (n.includes("food") || n.includes("eat") || n.includes("meal") || n.includes("restaurant") || n.includes("lunch") || n.includes("dinner") || n.includes("breakfast") || n.includes("snack") || n.includes("dining")) return "🍔"
    if (n.includes("grocer") || n.includes("supermarket") || n.includes("mart")) return "🛒"
    if (n.includes("coffee") || n.includes("cafe") || n.includes("drink")) return "☕"
    if (n.includes("transport") || n.includes("car") || n.includes("uber") || n.includes("taxi") || n.includes("bus") || n.includes("train") || n.includes("fuel") || n.includes("gas") || n.includes("petrol") || n.includes("commute") || n.includes("transit") || n.includes("auto")) return "🚗"
    if (n.includes("flight") || n.includes("travel") || n.includes("air") || n.includes("plane") || n.includes("trip") || n.includes("hotel") || n.includes("vacation") || n.includes("holiday")) return "✈️"
    if (n.includes("shop") || n.includes("cloth") || n.includes("mall") || n.includes("fashion") || n.includes("apparel") || n.includes("shoes") || n.includes("wear")) return "🛍️"
    if (n.includes("tech") || n.includes("laptop") || n.includes("computer") || n.includes("software") || n.includes("app") || n.includes("electronic") || n.includes("gadget") || n.includes("device")) return "💻"
    if (n.includes("phone") || n.includes("mobile") || n.includes("recharge") || n.includes("cell")) return "📱"
    if (n.includes("movie") || n.includes("cinema") || n.includes("netflix") || n.includes("entertainment") || n.includes("show") || n.includes("film") || n.includes("theater")) return "🎬"
    if (n.includes("game") || n.includes("xbox") || n.includes("playstation") || n.includes("steam") || n.includes("nintendo")) return "🎮"
    if (n.includes("music") || n.includes("spotify") || n.includes("concert") || n.includes("song") || n.includes("audio")) return "🎵"
    if (n.includes("health") || n.includes("doctor") || n.includes("hospital") || n.includes("medical") || n.includes("clinic") || n.includes("dentist") || n.includes("care") || n.includes("therapy")) return "🏥"
    if (n.includes("medicine") || n.includes("pill") || n.includes("pharmacy") || n.includes("drug")) return "💊"
    if (n.includes("education") || n.includes("school") || n.includes("college") || n.includes("course") || n.includes("book") || n.includes("tuition") || n.includes("class") || n.includes("learn") || n.includes("study") || n.includes("university")) return "📚"
    if (n.includes("home") || n.includes("rent") || n.includes("house") || n.includes("apartment") || n.includes("mortgage") || n.includes("maintenance") || n.includes("furniture")) return "🏠"
    if (n.includes("bill") || n.includes("electric") || n.includes("water") || n.includes("utility") || n.includes("internet") || n.includes("wifi") || n.includes("broadband") || n.includes("fee")) return "💡"
    if (n.includes("sub") || n.includes("subscription") || n.includes("member")) return "🔄"
    if (n.includes("pet") || n.includes("dog") || n.includes("cat") || n.includes("vet") || n.includes("animal")) return "🐾"
    if (n.includes("gym") || n.includes("fitness") || n.includes("workout") || n.includes("sport") || n.includes("exercise") || n.includes("training") || n.includes("club")) return "🏋️"
    if (n.includes("gift") || n.includes("present") || n.includes("donation") || n.includes("charity")) return "🎁"
    if (n.includes("kid") || n.includes("child") || n.includes("baby") || n.includes("toy") || n.includes("daycare")) return "👶"
    if (n.includes("beauty") || n.includes("salon") || n.includes("hair") || n.includes("makeup") || n.includes("cosmetic") || n.includes("spa") || n.includes("skincare") || n.includes("groom")) return "💅"
    if (n.includes("hobby") || n.includes("craft") || n.includes("art")) return "🎨"
    if (n.includes("insur")) return "🛡️"
    if (n.includes("tax")) return "🏛️"
    if (n.includes("stuff") || n.includes("misc") || n.includes("other") || n.includes("general")) return "📦"
    if (n.includes("debt") || n.includes("loan") || n.includes("credit")) return "💳"
    if (n.includes("save") || n.includes("saving") || n.includes("invest")) return "🏦"
  } else {
    // Income heuristics
    if (n.includes("salary") || n.includes("job") || n.includes("work") || n.includes("wage") || n.includes("pay") || n.includes("employ")) return "💼"
    if (n.includes("gift") || n.includes("present")) return "🎁"
    if (n.includes("freelance") || n.includes("project") || n.includes("contract") || n.includes("gig") || n.includes("consult")) return "💻"
    if (n.includes("refund") || n.includes("cashback") || n.includes("return") || n.includes("reimburse")) return "🔙"
    if (n.includes("interest") || n.includes("bank") || n.includes("dividend") || n.includes("invest") || n.includes("stock") || n.includes("crypto") || n.includes("trade") || n.includes("profit") || n.includes("return")) return "📈"
    if (n.includes("sale") || n.includes("sell") || n.includes("sold")) return "🏷️"
    if (n.includes("bonus") || n.includes("tip")) return "🎉"
    if (n.includes("award") || n.includes("prize") || n.includes("win")) return "🏆"
    if (n.includes("allowance") || n.includes("pocket")) return "💸"
    if (n.includes("rental") || n.includes("rent")) return "🏠"
    if (n.includes("business") || n.includes("revenue") || n.includes("income")) return "💰"
    if (n.includes("stuff") || n.includes("misc") || n.includes("other")) return "📦"
  }
  return null
}

const colorOptions = [
  { name: "Gray", value: "#6B7280" },
  { name: "Red", value: "#F87171" },
  { name: "Orange", value: "#FB923C" },
  { name: "Yellow", value: "#FACC15" },
  { name: "Green", value: "#4ADE80" },
  { name: "Blue", value: "#60A5FA" },
  { name: "Purple", value: "#C084FC" },
  { name: "Pink", value: "#F472B6" },
  { name: "Indigo", value: "#818CF8" },
  { name: "Teal", value: "#2DD4BF" },
  { name: "Cyan", value: "#22D3EE" },
  { name: "Lime", value: "#A3E635" },
  { name: "Emerald", value: "#34D399" },
  { name: "Rose", value: "#FB7185" },
  { name: "Violet", value: "#A78BFA" },
]

const ALL_EMOJIS = [
  "😀","😃","😄","😁","😆","😅","😂","🤣","🥲","🥹","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😮‍💨","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🫣","🤗","🫡","🤔","🫣","🤭","🫢","🤫","🤥","😶","😶‍🌫️","😐","😑","😬","🫨","🫠","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪","😵","😵‍💫","🫥","🤐","🥴","🤢","🤮","🤧","😷","🤒","🤕","🤑","🤠","😈","👿","👹","👺","🤡","💩","👻","💀","☠️","👽","👾","🤖","🎃","😺","😸","😹","😻","😼","😽","🙀","😿","😾",
  "👋","🤚","🖐️","✋","🖖","🫱","🫲","🫳","🫴","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾","🦵","🦿","🦶","👣","👂","🦻","👃","🫀","🫁","🧠","🦷","🦴","👀","👁️","👅","👄","💋","🩸",
  "👶","👧","🧒","👦","👩","🧑","👨","👩‍🦱","🧑‍🦱","👨‍🦱","👩‍🦰","🧑‍🦰","👨‍🦰","👱‍♀️","👱","👱‍♂️","👩‍🦳","🧑‍🦳","👨‍🦳","👩‍🦲","🧑‍🦲","👨‍🦲","🧔‍♀️","🧔","🧔‍♂️","👵","🧓","👴","👲","👳‍♀️","👳","👳‍♂️","🧕","👮‍♀️","👮","👮‍♂️","👷‍♀️","👷","👷‍♂️","💂‍♀️","💂","💂‍♂️","🕵️‍♀️","🕵️","🕵️‍♂️","👩‍⚕️","🧑‍⚕️","👨‍⚕️","👩‍🌾","🧑‍🌾","👨‍🌾","👩‍🍳","🧑‍🍳","👨‍🍳","👩‍🎓","🧑‍🎓","👨‍🎓","👩‍🎤","🧑‍🎤","👨‍🎤","👩‍🏫","🧑‍🏫","👨‍🏫","👩‍🏭","🧑‍🏭","👨‍🏭","👩‍💻","🧑‍💻","👨‍💻","👩‍💼","🧑‍💼","👨‍💼","👩‍🔧","🧑‍🔧","👨‍🔧","👩‍🔬","🧑‍🔬","👨‍🔬","👩‍🎨","🧑‍🎨","👨‍🎨","👩‍🚒","🧑‍🚒","👨‍🚒","👩‍✈️","🧑‍✈️","👨‍✈️","👩‍🚀","🧑‍🚀","👨‍🚀","👩‍⚖️","🧑‍⚖️","👨‍⚖️","👰‍♀️","👰","👰‍♂️","🤵‍♀️","🤵","🤵‍♂️",
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐽","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🪰","🪲","🪳","🦟","🦗","🕷️","🕸️","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🦭","🐊","🐅","🐆","🦓","🦍","🦧","🦣","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🦬","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐕‍🦺","🐈","🐈‍⬛","🪶","🐓","🦃","🦤","🦚","🦜","🦢","🦩","🕊️","🐇","🦝","🦨","🦡","🦫","🦦","🦥","🐁","🐀","🐿️","🦔",
  "🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🫒","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🥨","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🦴","🌭","🍔","🍟","🍕","🫓","🥪","🥙","🧆","🌮","🌯","🫔","🥗","🥘","🫕","🥫","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥠","🥮","🍢","🍡","🍧","🍨","🍦","🥧","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍯","🥛","🍼","🫖","☕","🍵","🧃","🥤","🧋","🍶","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🧉","🍾","🧊","🥄","🍴","🍽️","🥣","🥡","🥢","🧂",
  "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🪀","🏓","🏸","🏒","🏑","🥍","🏏","🪃","🥅","⛳","🪁","🏹","🎣","🤿","🥊","🥋","🎽","🛹","🛼","🛷","⛸️","🥌","🎿","⛷️","🏂","🪂","🏋️‍♀️","🏋️","🏋️‍♂️","🤼‍♀️","🤼","🤼‍♂️","🤸‍♀️","🤸","🤸‍♂️","⛹️‍♀️","⛹️","⛹️‍♂️","🤺","🤾‍♀️","🤾","🤾‍♂️","🏌️‍♀️","🏌️","🏌️‍♂️","🏇","🧘‍♀️","🧘","🧘‍♂️","🏄‍♀️","🏄","🏄‍♂️","🏊‍♀️","🏊","🏊‍♂️","🤽‍♀️","🤽","🤽‍♂️","🚣‍♀️","🚣","🚣‍♂️","🧗‍♀️","🧗","🧗‍♂️","🚵‍♀️","🚵","🚵‍♂️","🚴‍♀️","🚴","🚴‍♂️","🏆","🥇","🥈","🥉","🏅","🎖️","🏵️","🎗️","🎫","🎟️","🎪","🤹‍♀️","🤹","🤹‍♂️","🎭","🩰","🎨","🎬","🎤","🎧","🎼","🎹","🥁","🪘","🎷","🎺","🪗","🎸","🪕","🎻","🎲","♟️","🎯","🎳","🎮","🎰","🧩",
  "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🦯","🦽","🦼","🛴","🚲","🛵","🏍️","🛺","🚨","🚔","🚍","🚘","🚖","🚡","🚠","🚟","🚃","🚋","🚞","🚝","🚄","🚅","🚈","🚂","🚆","🚇","🚊","🚉","✈️","🛫","🛬","🛩️","💺","🛰️","🚀","🛸","🚁","🛶","⛵","🚤","🛥️","🛳️","⛴️","🚢","⚓","🪝","⛽","🚧","🚦","🚥","🚏","🗺️","🗿","🗽","🗼","🏰","🏯","🏟️","🎡","🎢","🎠","⛲","⛱️","🏖️","🏝️","🏜️","🌋","⛰️","🏔️","🗻","🏕️","⛺","🛖","🏠","🏡","🏘️","🏚️","🏗️","🏭","🏢","🏬","🏣","🏤","🏥","🏦","🏨","🏪","🏫","🏩","💒","🏛️","⛪","🕌","🕍","🛕","🕋","⛩️","🛤️","🛣️","🗾","🎑","🏞️","🌅","🌄","🌠","🎇","🎆","🌇","🌆","🏙️","🌃","🌌","🌉","🌁",
  "⌚","📱","📲","💻","⌨️","🖥️","🖨️","🖱️","🖲️","🕹️","🗜️","💽","💾","💿","📀","📼","📷","📸","📹","🎥","📽️","🎞️","📞","☎️","📟","📠","📺","📻","🎙️","🎚️","🎛️","🧭","⏱️","⏲️","⏰","🕰️","⌛","⏳","📡","🔋","🔌","💡","🔦","🕯️","🪔","🧯","🛢️","💸","💵","💴","💶","💷","🪙","💰","💳","💎","⚖️","🪜","🧰","🪛","🔧","🔨","⚒️","🛠️","⛏️","🪚","🔩","⚙️","🪤","🧱","⛓️","🧲","🔫","💣","🧨","🪓","🔪","🗡️","⚔️","🛡️","🚬","⚰️","🪦","⚱️","🏺","🔮","📿","🧿","💈","⚗️","🔭","🔬","🕳️","🩹","🩺","💊","💉","🩸","🧬","🦠","🧫","🧪","🌡️","🧹","🪠","🧺","🧻","🚽","🚰","🚿","🛁","🛀","🧼","🪥","🪒","🧽","🪣","🧴","🛎️","🔑","🗝️","🚪","🪑","🛋️","🛏️","🛌","🧸","🪆","🖼️","🪞","🪟","🛍️","🛒","🎁","🎈","🎏","🎀","🪄","🪅","🎊","🎉","🎎","🏮","🎐","🧧","✉️","📩","📨","📧","💌","📥","📤","📦","🏷️","🪧","📪","📫","📬","📭","📮","📯","📜","📃","📄","📑","🧾","📊","📈","📉","🗒️","🗓️","📆","📅","🗑️","📇","🗃️","🗳️","🗄️","📋","📁","📂","🗂️","🗞️","📰","📓","📔","📒","📕","📗","📘","📙","📚","📖","🔖","🧷","🔗","📎","🖇️","📐","📏","🧮","📌","📍","✂️","🖊️","🖋️","✒️","🖌️","🖍️","📝","✏️","🔍","🔎","🔏","🔐","🔒","🔓",
  "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤️‍🔥","❤️‍🩹","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉️","☸️","✡️","🔯","🕎","☯️","☦️","🛐","⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑","☢️","☣️","📴","📳","🈶","🈚","🈸","🈺","🈷️","✴️","🆚","💮","🉐","㊙️","㊗️","🈴","🈵","🈹","🈲","🅰️","🅱️","🆎","🆑","🅾️","🆘","❌","⭕","🛑","⛔","📛","🚫","💯","💢","♨️","🚷","🚯","🚳","🚱","🔞","📵","🚭","❗️","❕","❓","❔","‼️","⁉️","🔅","🔆","〽️","⚠️","🚸","🔱","⚜️","🔰","♻️","✅","🈯","💹","❇️","✳️","❎","🌐","💠","Ⓜ️","🌀","💤","🏧","🚾","♿","🅿️","🛗","🈳","🈂️","🛂","🛃","🛄","🛅","🚹","🚺","🚼","⚧","🚻","🚮","🎦","📶","🈁","🔣","ℹ️","🔤","🔡","🔠","🆖","🆗","🆙","🆒","🆕","🆓","0️⃣","1️⃣","2️⃣","3️⃣","4️⃣","5️⃣","6️⃣","7️⃣","8️⃣","9️⃣","🔟","🔢","#️⃣","*️⃣","⏏️","▶️","⏸️","⏯️","⏹️","⏺️","⏭️","⏮️","⏩","⏪","⏫","⏬","◀️","🔼","🔽","➡️","⬅️","⬆️","⬇️","↗️","↘️","↙️","↖️","↕️","↔️","↪️","↩️","⤴️","⤵️","🔀","🔁","🔂","🔄","🔃","🎵","🎶","➕","➖","➗","✖️","🟰","♾️","💲","💱","™️","©️","®️","〰️","➰","➿","🔚","🔙","🔛","🔝","🔜"
]

// ─── Main Component ───────────────────────────────────────────────────────────

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

  const [activeField, setActiveField] = useState<ActiveField>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [manualIcon, setManualIcon] = useState(true)

  const handleOpenDrawer = () => {
    openDrawer(category)
  }

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    if (field === "name") {
      const suggested = suggestEmoji(value, formData.kind)
      setFormData(prev => ({
        ...prev,
        name: value,
        icon: !manualIcon && suggested ? suggested : prev.icon
      }))
    } else if (field === "icon") {
      setManualIcon(true)
      setFormData(prev => ({ ...prev, icon: value }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }
  
  const handleTypeChange = (newKind: "expense" | "income" | "transfer" | "loan") => {
    const suggested = suggestEmoji(formData.name, newKind)
    setFormData(prev => ({
      ...prev,
      kind: newKind,
      icon: !manualIcon && suggested ? suggested : prev.icon
    }))
    setActiveField("name")
  }

  // Focus relevant input when field activates
  useEffect(() => {
    if (activeField === "name") {
      setTimeout(() => nameInputRef.current?.focus(), 120)
    }
  }, [activeField, isOpen])

  const handleFieldClick = (field: ActiveField) => {
    setActiveField(prev => (prev === field ? null : field))
  }

  const handleFormSubmit = async () => {
    try {
      await handleSubmit()
      setActiveField(null)
    } catch (error) {
      console.error("Failed to update category:", error)
    }
  }

  const selectedColor = colorOptions.find((c) => c.value === formData.color)

  // If it's a default category, show a message instead of the edit form
  if (isDefaultCategory) {
    return (
      <InteractiveDrawer
        isOpen={isOpen}
        onClose={closeDrawer}
        onOpenChange={(open) => (open ? handleOpenDrawer() : closeDrawer())}
        title="Cannot Edit"
        trigger={trigger}
        onSubmit={closeDrawer}
        submitText="" // No submit button
      >
        <div className="text-center py-8 px-6">
          <FolderOpen className="w-16 h-16 text-ms-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-ink mb-2">Default Category</h3>
          <p className="text-ms-muted text-sm">
            This is a default system category and cannot be edited. You can create your own custom categories instead.
          </p>
          <button
            onClick={closeDrawer}
            className="mt-8 bg-ink text-paper font-bold h-12 px-8 rounded-full shadow-sm active:scale-95 transition-transform"
          >
            Okay, got it
          </button>
        </div>
      </InteractiveDrawer>
    )
  }

  return (
    <InteractiveDrawer
      isOpen={isOpen}
      onClose={closeDrawer}
      onOpenChange={(open) => (open ? handleOpenDrawer() : closeDrawer())}
      onOpen={() => {
        setManualIcon(true)
        setActiveField(null)
      }}
      title="Edit Category"
      trigger={trigger}
      isSubmitDisabled={isSubmitDisabled}
      isLoading={isLoading}
      onSubmit={handleFormSubmit}
      submitText="Save"
    >
      {/* ── Sentence ─────────────────────────────────── */}
      <div className="px-6 pb-2">
        <p
          className="text-ink text-[24px] font-bold leading-[1.6] tracking-tight"
          style={{ fontFamily: "inherit" }}
        >
          {"Edit "}
          <SentenceToken
            value={formData.kind === "expense" ? "Expense" : "Income"}
            placeholder="---"
            active={activeField === "kind"}
            colorClass={formData.kind === "expense" ? "text-ms-accent" : "text-green-500"}
            onClick={() => handleFieldClick("kind")}
          />
          {" category named "}
          <SentenceToken
            value={formData.name}
            placeholder="---"
            active={activeField === "name"}
            colorClass="text-ink"
            onClick={() => handleFieldClick("name")}
          />
          {" with icon "}
          <SentenceToken
            value={formData.icon}
            placeholder="---"
            active={activeField === "icon"}
            colorClass="text-ink"
            onClick={() => handleFieldClick("icon")}
          />
          {" and color "}
          <SentenceToken
            value={selectedColor?.name}
            placeholder="---"
            active={activeField === "color"}
            colorClass="text-ink"
            onClick={() => handleFieldClick("color")}
          />
          {"."}
        </p>

        <p className="text-ms-muted text-[11px] font-medium mt-3 mb-1 flex items-center gap-1">
          <span>⚡</span> Tap any underline to edit
        </p>
      </div>

      {/* ── Field Panels ─────────────────────────────── */}
      <div className="min-h-[260px]">
        <AnimatePresence mode="wait">

          {/* Type panel */}
          {activeField === "kind" && (
            <motion.div
              key="kind"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-4"
            >
              <p className="text-xs font-bold text-ms-muted uppercase tracking-widest mb-4">Category Type</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleTypeChange("expense")}
                  className={`flex-1 py-4 rounded-2xl text-sm font-bold border transition-all ${
                    formData.kind === "expense" ? "bg-ms-accent/20 border-ms-accent/50 text-ms-accent" : "bg-surface border-line text-ms-muted hover:bg-surface-alt"
                  }`}
                >
                  Expense
                </button>
                <button
                  onClick={() => handleTypeChange("income")}
                  className={`flex-1 py-4 rounded-2xl text-sm font-bold border transition-all ${
                    formData.kind === "income" ? "bg-green-500/20 border-green-500/50 text-green-500" : "bg-surface border-line text-ms-muted hover:bg-surface-alt"
                  }`}
                >
                  Income
                </button>
              </div>
            </motion.div>
          )}

          {/* Name panel */}
          {activeField === "name" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-4"
            >
              <p className="text-xs font-bold text-ms-muted uppercase tracking-widest mb-4">Name</p>
              <div className="flex items-center gap-3 bg-surface-alt rounded-2xl px-4 py-3 border border-line focus-within:border-ink/30 transition-colors">
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="e.g. Subscriptions, Groceries..."
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && formData.name) setActiveField("icon")
                  }}
                  className="flex-1 bg-transparent text-lg font-bold text-ink placeholder:text-ms-muted outline-none w-full"
                />
                {formData.name && (
                  <button onClick={() => handleInputChange("name", "")} className="text-ms-muted hover:text-ink shrink-0">
                    <X size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Icon panel */}
          {activeField === "icon" && (
            <motion.div
              key="icon"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-2 flex flex-col h-[280px]"
            >
              <p className="text-xs font-bold text-ms-muted uppercase tracking-widest mb-3 shrink-0">Select Icon</p>
              <div className="flex-1 overflow-y-auto scrollbar-hide grid grid-cols-7 gap-2 content-start pb-6">
                {ALL_EMOJIS.map((icon, idx) => {
                  const selected = formData.icon === icon
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        handleInputChange("icon", icon)
                        setActiveField("color")
                      }}
                      className={`aspect-square flex items-center justify-center text-[26px] rounded-xl transition-all active:scale-95
                        ${selected 
                          ? "bg-surface-alt border border-ink/40 shadow-inner scale-110 z-10" 
                          : "bg-surface border border-transparent hover:bg-surface-alt"
                        }`}
                    >
                      {icon}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Color panel */}
          {activeField === "color" && (
            <motion.div
              key="color"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-4 flex flex-col"
            >
              <p className="text-xs font-bold text-ms-muted uppercase tracking-widest mb-4 shrink-0">Select Theme Color</p>
              
              <div className="overflow-y-auto scrollbar-hide pr-2 grid grid-cols-6 gap-x-3 gap-y-4 content-start">
                {colorOptions.map((color) => {
                  const selected = formData.color === color.value
                  return (
                    <button
                      key={color.value}
                      onClick={() => {
                        handleInputChange("color", color.value)
                        if (formData.name && formData.icon) {
                          setActiveField(null)
                        }
                      }}
                      className={`aspect-square rounded-full transition-all active:scale-95 flex items-center justify-center
                        ${color.name === "Gray" ? "bg-gray-400" :
                          color.name === "Red" ? "bg-red-400" :
                          color.name === "Orange" ? "bg-orange-400" :
                          color.name === "Yellow" ? "bg-yellow-400" :
                          color.name === "Green" ? "bg-green-400" :
                          color.name === "Blue" ? "bg-blue-400" :
                          color.name === "Purple" ? "bg-purple-400" :
                          color.name === "Pink" ? "bg-pink-400" :
                          color.name === "Indigo" ? "bg-indigo-400" :
                          color.name === "Teal" ? "bg-teal-400" :
                          color.name === "Cyan" ? "bg-cyan-400" :
                          color.name === "Lime" ? "bg-lime-400" :
                          color.name === "Emerald" ? "bg-emerald-400" :
                          color.name === "Rose" ? "bg-rose-400" :
                          "bg-violet-400"}
                        ${selected ? "ring-2 ring-ink ring-offset-2 ring-offset-paper scale-110 z-10" : "hover:scale-105 opacity-90 hover:opacity-100"}
                      `}
                    >
                      {selected && <div className="w-2 h-2 bg-paper rounded-full shadow-sm" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Preview panel */}
          {!activeField && formData.name && formData.icon && formData.color && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-6 flex flex-col items-center justify-center"
            >
              <div className="flex flex-col items-center gap-3">
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg border border-line/20"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.icon}
                </div>
                <div className="text-center">
                  <p className="text-ink font-bold text-xl">{formData.name}</p>
                  <p className="text-ms-muted text-[10px] font-bold uppercase tracking-widest mt-1">{formData.kind}</p>
                </div>
              </div>
              
              <button
                onClick={handleFormSubmit}
                disabled={isSubmitDisabled || isLoading}
                className={`mt-8 w-full max-w-[220px] h-12 rounded-full font-bold transition-all active:scale-95 flex items-center justify-center gap-2
                  ${isSubmitDisabled || isLoading
                    ? "bg-surface-alt text-ms-muted"
                    : "bg-ink text-paper shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
                  }`}
              >
                {isLoading ? "Saving..." : <><Edit size={18} /> Update Category</>}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </InteractiveDrawer>
  )
}
