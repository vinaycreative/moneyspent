"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { Drawer } from "vaul"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Building2, CreditCard, Wallet, Plus, ChevronDown } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import { useAuth } from "@/hooks"
import { useAccounts } from "@/hooks/useAccounts"
import { useCreateTransactionMutation } from "@/hooks/useTransactions"
import { AddCategory } from "./AddCategory"
import { AddAccount } from "./AddAccount"

// ─── Types ───────────────────────────────────────────────────────────────────

type ActiveField = "amount" | "title" | "category" | "account" | null

interface ExpenseFormData {
  amount: string
  title: string
  categoryId: string
  accountId: string
  date: Date
}

const defaultForm: ExpenseFormData = {
  amount: "",
  title: "",
  categoryId: "",
  accountId: "",
  date: new Date(),
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const accountIcon = (type: string) => {
  if (type === "credit") return <CreditCard size={14} />
  if (type === "cash" || type === "wallet") return <Wallet size={14} />
  return <Building2 size={14} />
}

const SUGGESTED_AMOUNTS = [50, 100, 150, 200, 500, 1000]

// ─── Sub-components ──────────────────────────────────────────────────────────

/** A dashed-underline token that highlights when active */
const SentenceToken = ({
  value,
  placeholder,
  active,
  color = "text-[#5B9CF6]",
  onClick,
  icon,
}: {
  value?: string
  placeholder: string
  active: boolean
  color?: string
  onClick: () => void
  icon?: React.ReactNode
}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1 font-bold transition-all duration-200 border-b-2 border-dashed
      ${active ? "border-white/60 scale-105" : "border-white/25"}
      ${value ? color : "text-white/40"}
    `}
    style={{ lineHeight: 1.3 }}
  >
    {icon && value && <span className="text-xl leading-none">{icon}</span>}
    <span>{value || placeholder}</span>
  </button>
)

// ─── Main Component ───────────────────────────────────────────────────────────

interface AddExpenseProps {
  trigger: React.ReactNode
  onSuccess?: () => void
}

export const AddExpense = ({ trigger, onSuccess }: AddExpenseProps) => {
  const { user } = useAuth()
  const createTransaction = useCreateTransactionMutation()

  const { data: allCategories, isLoading: categoriesLoading } = useCategories(
    user?.id || "",
    undefined,
    !!user?.id
  )
  const { accounts, isLoading: accountsLoading } = useAccounts(user?.id!)

  // Only expense categories
  const categories = (allCategories || []).filter((c: any) => c.type === "expense")

  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<ExpenseFormData>(defaultForm)
  const [activeField, setActiveField] = useState<ActiveField>("amount")
  const [isLoading, setIsLoading] = useState(false)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)

  // Derived display values
  const selectedCategory = categories.find((c: any) => c.id === form.categoryId)
  const selectedAccount = accounts?.find((a: any) => a.id === form.accountId)

  const isSubmitDisabled =
    !form.amount.trim() ||
    parseFloat(form.amount) <= 0 ||
    !form.title.trim() ||
    !form.categoryId ||
    !form.accountId

  // Reset form on close
  const handleClose = useCallback(() => {
    setIsOpen(false)
    setForm(defaultForm)
    setActiveField("amount")
  }, [])

  // Focus relevant input when field activates
  useEffect(() => {
    if (activeField === "title") {
      setTimeout(() => titleInputRef.current?.focus(), 120)
    }
    if (activeField === "amount") {
      setTimeout(() => amountInputRef.current?.focus(), 120)
    }
  }, [activeField])

  const handleFieldClick = (field: ActiveField) => {
    setActiveField(prev => (prev === field ? null : field))
  }

  const handleSubmit = async () => {
    if (!user?.id || isSubmitDisabled) return
    setIsLoading(true)
    try {
      await createTransaction.mutateAsync({
        user_id: user.id,
        title: form.title,
        amount: parseFloat(form.amount),
        type: "expense",
        category_id: form.categoryId,
        account_id: form.accountId,
        occurred_at: form.date.toISOString(),
        description: "",
        currency: "INR",
      })
      onSuccess?.()
      handleClose()
    } catch (err) {
      console.error("Failed to add expense:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>

      <Drawer.Root open={isOpen} onOpenChange={(open) => (open ? setIsOpen(true) : handleClose())}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto focus:outline-none"
            style={{ background: "transparent" }}
          >
            {/* Main card */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="rounded-t-[32px] overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #0f0f10 0%, #141418 100%)",
                boxShadow: "0 -8px 60px rgba(0,0,0,0.5)",
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-white/15" />
              </div>

              {/* Top bar */}
              <div className="flex items-center justify-between px-5 pt-2 pb-4">
                <button
                  onClick={handleClose}
                  className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <X size={17} className="text-white/70" />
                </button>

                <Drawer.Title className="text-sm font-bold text-white/50 uppercase tracking-[0.15em]">
                  Add Expense
                </Drawer.Title>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled || isLoading}
                  className={`h-9 px-4 rounded-full text-sm font-bold transition-all active:scale-95
                    ${isSubmitDisabled || isLoading
                      ? "bg-white/10 text-white/30"
                      : "bg-white text-black shadow-[0_2px_20px_rgba(255,255,255,0.15)]"
                    }`}
                >
                  {isLoading ? "Saving…" : "Save"}
                </button>
              </div>

              {/* ── Sentence ─────────────────────────────────── */}
              <div className="px-6 pb-2">
                <p
                  className="text-white text-[26px] font-bold leading-[1.45] tracking-tight"
                  style={{ fontFamily: "inherit" }}
                >
                  {"I spent "}
                  <SentenceToken
                    value={form.amount ? `₹${Number(form.amount).toLocaleString("en-IN")}` : ""}
                    placeholder="₹---"
                    active={activeField === "amount"}
                    color="text-[#5B9CF6]"
                    onClick={() => handleFieldClick("amount")}
                  />
                  {" on "}
                  <SentenceToken
                    value={form.title}
                    placeholder="---"
                    active={activeField === "title"}
                    color="text-white"
                    onClick={() => handleFieldClick("title")}
                  />
                  {" for "}
                  <SentenceToken
                    value={selectedCategory?.name}
                    placeholder="---"
                    active={activeField === "category"}
                    color="text-[#E8A44A]"
                    icon={selectedCategory?.icon}
                    onClick={() => handleFieldClick("category")}
                  />
                  {" from "}
                  <SentenceToken
                    value={selectedAccount?.name}
                    placeholder="---"
                    active={activeField === "account"}
                    color="text-[#7EC8A4]"
                    onClick={() => handleFieldClick("account")}
                  />
                  {" today"}
                </p>

                <p className="text-white/30 text-[11px] font-medium mt-2 flex items-center gap-1">
                  <span>⚡</span> Tap any underline to edit
                </p>
              </div>

              {/* ── Field Panels ─────────────────────────────── */}
              <div className="min-h-[240px]">
                <AnimatePresence mode="wait">

                {/* Amount panel */}
                {activeField === "amount" && (
                  <motion.div
                    key="amount"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18 }}
                    className="px-5 pt-4 pb-2"
                  >
                    {/* Big amount input */}
                    <div className="flex items-center gap-2 bg-white/6 rounded-2xl px-4 py-3 border border-white/10 focus-within:border-[#5B9CF6]/50 transition-colors">
                      <span className="text-2xl font-bold text-[#5B9CF6]">₹</span>
                      <input
                        ref={amountInputRef}
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        className="flex-1 bg-transparent text-2xl font-bold text-white placeholder:text-white/25 outline-none"
                      />
                      {form.amount && (
                        <button onClick={() => setForm({ ...form, amount: "" })} className="text-white/30 active:text-white/60">
                          <X size={15} />
                        </button>
                      )}
                    </div>

                    {/* Suggested amounts */}
                    <div className="mt-3 mb-1">
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/30 mb-2">
                        Suggested Amounts
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {SUGGESTED_AMOUNTS.map((amt) => {
                          const selected = form.amount === String(amt)
                          return (
                            <button
                              key={amt}
                              onClick={() => {
                                setForm({ ...form, amount: String(amt) })
                                setActiveField("title")
                              }}
                              className={`px-3.5 py-1.5 rounded-full text-sm font-semibold border transition-all active:scale-95
                                ${selected
                                  ? "bg-white text-black border-white shadow-[0_2px_12px_rgba(255,255,255,0.15)]"
                                  : "bg-white/6 text-white/70 border-white/10"
                                }`}
                            >
                              ₹{amt.toLocaleString("en-IN")}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Title panel */}
                {activeField === "title" && (
                  <motion.div
                    key="title"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18 }}
                    className="px-5 pt-4 pb-2"
                  >
                    <div className="flex items-center gap-3 bg-white/6 rounded-2xl px-4 py-3 border border-white/10 focus-within:border-white/30 transition-colors">
                      <input
                        ref={titleInputRef}
                        type="text"
                        placeholder="What did you spend on?"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="flex-1 bg-transparent text-base font-semibold text-white placeholder:text-white/25 outline-none"
                      />
                      {form.title && (
                        <button onClick={() => setForm({ ...form, title: "" })} className="text-white/30 active:text-white/60">
                          <X size={15} />
                        </button>
                      )}
                    </div>

                    {/* Quick label suggestions */}
                    <div className="flex flex-wrap gap-2 mt-3 mb-1">
                      {["Lunch", "Coffee", "Groceries", "Fuel", "Medicine", "Snacks"].map((label) => (
                        <button
                          key={label}
                          onClick={() => {
                            setForm({ ...form, title: label })
                            setActiveField("category")
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95
                            ${form.title === label
                              ? "bg-white text-black border-white"
                              : "bg-white/6 text-white/60 border-white/10"
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Category panel */}
                {activeField === "category" && (
                  <motion.div
                    key="category"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18 }}
                    className="px-5 pt-4 pb-2"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/30">Category</p>
                      <AddCategory
                        trigger={
                          <button className="flex items-center gap-1 text-[10px] font-semibold text-white/40 active:text-white/70 transition-colors">
                            <Plus size={10} /> New
                          </button>
                        }
                      />
                    </div>

                    {categoriesLoading ? (
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="h-16 rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                      </div>
                    ) : categories.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto pb-1">
                        {categories.map((cat: any) => {
                          const selected = form.categoryId === cat.id
                          return (
                            <button
                              key={cat.id}
                              onClick={() => {
                                setForm({ ...form, categoryId: cat.id })
                                setActiveField("account")
                              }}
                              className={`relative flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-center transition-all active:scale-95
                                ${selected
                                  ? "bg-[#E8A44A]/15 border-[#E8A44A]/40"
                                  : "bg-white/5 border-white/8"
                                }`}
                            >
                              {selected && (
                                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-[#E8A44A] rounded-full flex items-center justify-center">
                                  <Check size={8} className="text-black" strokeWidth={3} />
                                </span>
                              )}
                              <span className="text-xl leading-none">{cat.icon}</span>
                              <span className={`text-[10px] font-semibold leading-tight truncate w-full text-center px-1
                                ${selected ? "text-[#E8A44A]" : "text-white/50"}`}>
                                {cat.name}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/8 rounded-2xl py-6 text-center">
                        <p className="text-xs text-white/30">No expense categories yet</p>
                        <AddCategory
                          trigger={
                            <button className="mt-2 text-xs font-semibold text-[#E8A44A] flex items-center gap-1 mx-auto">
                              <Plus size={12} /> Add category
                            </button>
                          }
                        />
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Account panel */}
                {activeField === "account" && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18 }}
                    className="px-5 pt-4 pb-2"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/30">Account</p>
                      <AddAccount
                        trigger={
                          <button className="flex items-center gap-1 text-[10px] font-semibold text-white/40 active:text-white/70 transition-colors">
                            <Plus size={10} /> New
                          </button>
                        }
                      />
                    </div>

                    {accountsLoading ? (
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="h-12 rounded-2xl bg-white/5 animate-pulse" />
                        ))}
                      </div>
                    ) : (accounts?.length ?? 0) > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {accounts?.map((acc: any) => {
                          const selected = form.accountId === acc.id
                          return (
                            <button
                              key={acc.id}
                              onClick={() => {
                                setForm({ ...form, accountId: acc.id })
                                setActiveField(null)
                              }}
                              className={`flex items-center gap-2 px-3 py-3 rounded-2xl border transition-all active:scale-95
                                ${selected
                                  ? "bg-[#7EC8A4]/15 border-[#7EC8A4]/40 text-[#7EC8A4]"
                                  : "bg-white/5 border-white/8 text-white/60"
                                }`}
                            >
                              <span className={selected ? "text-[#7EC8A4]" : "text-white/40"}>
                                {accountIcon(acc.type)}
                              </span>
                              <span className="text-sm font-semibold truncate">{acc.name}</span>
                              {selected && <Check size={13} className="ml-auto text-[#7EC8A4] shrink-0" strokeWidth={2.5} />}
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/8 rounded-2xl py-6 text-center">
                        <p className="text-xs text-white/30">No accounts yet</p>
                      </div>
                    )}
                  </motion.div>
                )}

                </AnimatePresence>
              </div>

              {/* Bottom padding for safe area */}
              <div className="h-8" />
            </motion.div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
