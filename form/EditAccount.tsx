"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Building2, CreditCard, Wallet, Plus, CheckCircle2 } from "lucide-react"
import { useAccountForm, useAuth } from "@/hooks"
import { InteractiveDrawer } from "@/components/InteractiveDrawer"
import { SentenceToken } from "@/components/SentenceToken"
import { ApiAccount } from "@/types"

// ── Types ──────────────────────────────────────────────────

type ActiveField = "name" | "type" | "balance" | null

const accountTypes = [
  { value: "bank", label: "Bank", icon: Building2 },
  { value: "credit", label: "Card", icon: CreditCard },
  { value: "cash", label: "Cash", icon: Wallet },
  { value: "wallet", label: "Wallet", icon: Wallet },
  { value: "savings", label: "Savings", icon: Wallet }, // Using Wallet as fallback icon
  { value: "investment", label: "Investment", icon: Building2 },
]

export const EditAccount = ({
  trigger,
  account,
  onClose,
  isOpen,
  onOpenChange,
}: {
  trigger: React.ReactNode
  account: ApiAccount
  onClose?: () => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const { formData, setFormData, isLoading, handleSubmit } = useAccountForm({
    name: account.name,
    type: account.type,
    starting_balance: account.current_balance?.toString() || "0",
    currency: account.currency || "INR",
  })

  const [activeField, setActiveField] = useState<ActiveField>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const balanceInputRef = useRef<HTMLInputElement>(null)

  // Sync form data when account changes
  useEffect(() => {
    if (account && isOpen) {
      setFormData({
        name: account.name,
        type: account.type,
        starting_balance: account.current_balance?.toString() || "0",
        currency: account.currency || "INR",
      })
      setActiveField(null)
    }
  }, [account, isOpen, setFormData])

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const selectedType = accountTypes.find((t) => t.value === formData.type)

  // Focus management
  useEffect(() => {
    if (!isOpen) return
    const focusInput = () => {
      if (activeField === "name") {
        nameInputRef.current?.focus()
      } else if (activeField === "balance") {
        balanceInputRef.current?.focus()
      }
    }
    const timer = setTimeout(focusInput, 300)
    return () => clearTimeout(timer)
  }, [activeField, isOpen])

  const handleFieldClick = (field: ActiveField) => {
    setActiveField((prev) => (prev === field ? null : field))
  }

  const handleClose = useCallback(() => {
    onOpenChange(false)
    onClose?.()
    setActiveField(null)
  }, [onOpenChange, onClose])

  const handleFormSubmit = async () => {
    try {
      await handleSubmit(account.id)
      handleClose()
    } catch (error) {
      console.error("Failed to update account:", error)
    }
  }

  const isSubmitDisabled = !formData.name.trim() || !formData.starting_balance.trim() || isLoading

  return (
    <InteractiveDrawer
      isOpen={isOpen}
      onClose={handleClose}
      onOpenChange={(open) => (open ? onOpenChange(true) : handleClose())}
      title="Edit Account"
      trigger={trigger}
      isSubmitDisabled={isSubmitDisabled}
      isLoading={isLoading}
      onSubmit={handleFormSubmit}
      showSubmit={false}
    >
      {/* ── Sentence ─────────────────────────────────── */}
      <div className="px-6 pb-2">
        <p
          className="text-ink text-[26px] font-bold leading-[1.45] tracking-tight"
          style={{ fontFamily: "inherit" }}
        >
          {"This is a "}
          <SentenceToken
            value={selectedType?.label}
            placeholder="---"
            active={activeField === "type"}
            colorClass="text-ms-accent"
            onClick={() => handleFieldClick("type")}
          />
          {" account named "}
          <SentenceToken
            value={formData.name}
            placeholder="---"
            active={activeField === "name"}
            colorClass="text-ink"
            onClick={() => handleFieldClick("name")}
          />
          {" with a balance of "}
          <SentenceToken
            value={formData.starting_balance ? `₹${Number(formData.starting_balance).toLocaleString("en-IN")}` : ""}
            placeholder="₹0"
            active={activeField === "balance"}
            colorClass="text-ms-accent"
            onClick={() => handleFieldClick("balance")}
          />
          {"."}
        </p>

        <p className="text-ms-muted text-[11px] font-medium mt-2 flex items-center gap-1">
          <span>⚡</span> Tap any underline to edit
        </p>
      </div>

      {/* ── Field Panels ─────────────────────────────── */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* Type panel */}
          {activeField === "type" && (
            <motion.div
              key="type"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-5 pt-4 pb-2"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ms-muted mb-3">
                Account Type
              </p>
              <div className="grid grid-cols-4 gap-2">
                {accountTypes.map(({ value, label, icon: Icon }) => {
                  const isSelected = formData.type === value
                  return (
                    <button
                      key={value}
                      onClick={() => {
                        handleInputChange("type", value)
                        setActiveField(null)
                      }}
                      className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl border transition-all active:scale-95 ${
                        isSelected
                          ? "bg-ms-accent/10 border-ms-accent/30 text-ms-accent"
                          : "bg-surface border-line text-ms-muted hover:bg-surface-alt"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Name panel */}
          {activeField === "name" && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-5 pt-4 pb-2"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ms-muted mb-3">
                Account Name
              </p>
              <div className="flex items-center gap-3 bg-surface-alt rounded-2xl px-4 py-3 border border-line focus-within:border-ink/30 transition-colors">
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="e.g. HDFC Bank, My Wallet"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setActiveField(null)
                  }}
                  className="flex-1 bg-transparent text-base font-semibold text-ink placeholder:text-ms-muted outline-none w-full"
                />
              </div>
            </motion.div>
          )}

          {/* Balance panel */}
          {activeField === "balance" && (
            <motion.div
              key="balance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-5 pt-4 pb-2"
            >
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ms-muted mb-3">
                Current Balance
              </p>
              <div className="flex items-center gap-2 bg-surface-alt rounded-2xl px-4 py-3 border border-line focus-within:border-ms-accent/50 transition-colors">
                <span className="text-2xl font-bold text-ms-accent">₹</span>
                <input
                  ref={balanceInputRef}
                  type="number"
                  inputMode="decimal"
                  autoFocus
                  placeholder="0"
                  value={formData.starting_balance}
                  onChange={(e) => handleInputChange("starting_balance", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setActiveField(null)
                  }}
                  className="flex-1 bg-transparent text-2xl font-bold text-ink placeholder:text-ms-muted outline-none w-full"
                />
              </div>
            </motion.div>
          )}

          {/* Summary / Save panel */}
          {activeField === null && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="px-5 pt-12 pb-6 flex flex-col items-center justify-end min-h-[240px]"
            >
              <button
                onClick={handleFormSubmit}
                disabled={isSubmitDisabled || isLoading}
                className="w-full py-4.5 rounded-[22px] bg-ink text-paper font-bold text-lg shadow-xl active:scale-[0.98] transition-all disabled:opacity-40 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-paper/30 border-t-paper rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={22} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveField("name")}
                className="mt-5 text-sm font-semibold text-ms-muted hover:text-ink transition-colors"
              >
                Wait, I need to edit something
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </InteractiveDrawer>
  )
}
