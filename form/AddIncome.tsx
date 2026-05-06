"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, Building2, CreditCard, Wallet, Plus, CheckCircle2 } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import { useAuth } from "@/hooks"
import { useAccounts } from "@/hooks/useAccounts"
import { useCreateTransactionMutation } from "@/hooks/useTransactions"
import { AddCategory } from "./AddCategory"
import { AddAccount } from "./AddAccount"
import { InteractiveDrawer } from "@/components/InteractiveDrawer"
import { SentenceToken } from "@/components/SentenceToken"

// ─── Types ───────────────────────────────────────────────────────────────────

type ActiveField = "amount" | "title" | "category" | "account" | null

interface IncomeFormData {
  amount: string
  title: string
  categoryId: string
  accountId: string
  date: Date
}

const defaultForm: IncomeFormData = {
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

const SUGGESTED_AMOUNTS = [1000, 5000, 10000, 20000, 50000]

// ─── Main Component ───────────────────────────────────────────────────────────

interface AddIncomeProps {
  trigger: React.ReactNode
  onSuccess?: () => void
}

export const AddIncome = ({ trigger, onSuccess }: AddIncomeProps) => {
  const { user } = useAuth()
  const createTransaction = useCreateTransactionMutation()

  const { data: allCategories, isLoading: categoriesLoading } = useCategories(
    user?.id || "",
    undefined,
    !!user?.id,
  )
  const { accounts, isLoading: accountsLoading } = useAccounts(user?.id!)

  // Only income categories
  const categories = (allCategories || []).filter((c: any) => c.type === "income")

  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<IncomeFormData>(defaultForm)
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
    if (!isOpen) return

    const focusInput = () => {
      if (activeField === "title") {
        titleInputRef.current?.focus()
      } else if (activeField === "amount") {
        amountInputRef.current?.focus()
      }
    }

    // Small delay to allow drawer animation to progress
    const timer = setTimeout(focusInput, 300)
    return () => clearTimeout(timer)
  }, [activeField, isOpen])

  const handleFieldClick = (field: ActiveField) => {
    setActiveField((prev) => (prev === field ? null : field))
  }

  const handleSubmit = async () => {
    if (!user?.id || isSubmitDisabled) return
    setIsLoading(true)
    try {
      await createTransaction.mutateAsync({
        title: form.title,
        amount: parseFloat(form.amount),
        type: "income",
        category_id: form.categoryId,
        account_id: form.accountId,
        occurred_at: form.date.toISOString(),
        description: "",
        currency: "INR",
      })
      onSuccess?.()
      handleClose()
    } catch (err) {
      console.error("Failed to add income:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <InteractiveDrawer
      isOpen={isOpen}
      onClose={handleClose}
      onOpenChange={(open) => (open ? setIsOpen(true) : handleClose())}
      onOpen={() => {
        setForm(defaultForm)
        setActiveField("amount")
      }}
      title="Add Income"
      trigger={trigger}
      isSubmitDisabled={isSubmitDisabled}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      showSubmit={false}
    >
      {/* ── Sentence ─────────────────────────────────── */}
      <div className="px-6 pb-2">
        <p
          className="text-ink text-[26px] font-bold leading-[1.45] tracking-tight"
          style={{ fontFamily: "inherit" }}
        >
          {"I received "}
          <SentenceToken
            value={form.amount ? `₹${Number(form.amount).toLocaleString("en-IN")}` : ""}
            placeholder="₹---"
            active={activeField === "amount"}
            colorClass="text-pos"
            onClick={() => handleFieldClick("amount")}
          />
          {" from "}
          <SentenceToken
            value={form.title}
            placeholder="---"
            active={activeField === "title"}
            colorClass="text-ink"
            onClick={() => handleFieldClick("title")}
          />
          {" as "}
          <SentenceToken
            value={selectedCategory?.name}
            placeholder="---"
            active={activeField === "category"}
            colorClass="text-orange-500"
            icon={selectedCategory?.icon}
            onClick={() => handleFieldClick("category")}
          />
          {" deposited into "}
          <SentenceToken
            value={selectedAccount?.name}
            placeholder="---"
            active={activeField === "account"}
            colorClass="text-blue-500"
            onClick={() => handleFieldClick("account")}
          />
          {" today"}
        </p>

        <p className="text-ms-muted text-[11px] font-medium mt-2 flex items-center gap-1">
          <span>⚡</span> Tap any underline to edit
        </p>
      </div>

      {/* ── Field Panels ─────────────────────────────── */}
      <div className="flex-1 flex flex-col">
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
              <div className="flex items-center gap-2 bg-surface-alt rounded-2xl px-4 py-3 border border-line focus-within:border-pos/50 transition-colors">
                <span className="text-2xl font-bold text-pos">₹</span>
                <input
                  ref={amountInputRef}
                  type="number"
                  inputMode="decimal"
                  autoFocus
                  placeholder="0"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="flex-1 bg-transparent text-2xl font-bold text-ink placeholder:text-ms-muted outline-none w-full"
                />
                {form.amount && (
                  <button
                    onClick={() => setForm({ ...form, amount: "" })}
                    className="text-ms-muted hover:text-ink"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Suggested amounts */}
              <div className="mt-3 mb-1">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ms-muted mb-2">
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
                        ${
                          selected
                            ? "bg-ink text-paper border-ink "
                            : "bg-surface-alt text-ms-muted border-line hover:text-ink"
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
              <div className="flex items-center gap-3 bg-surface-alt rounded-2xl px-4 py-3 border border-line focus-within:border-ink/30 transition-colors">
                <input
                  ref={titleInputRef}
                  type="text"
                  placeholder="Where did this income come from?"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="flex-1 bg-transparent text-base font-semibold text-ink placeholder:text-ms-muted outline-none w-full"
                />
                {form.title && (
                  <button
                    onClick={() => setForm({ ...form, title: "" })}
                    className="text-ms-muted hover:text-ink"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Quick label suggestions */}
              <div className="flex flex-wrap gap-2 mt-3 mb-1">
                {["Salary", "Freelance", "Gift", "Refund", "Bonus", "Sale"].map((label) => (
                  <button
                    key={label}
                    onClick={() => {
                      setForm({ ...form, title: label })
                      setActiveField("category")
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95
                    ${
                      form.title === label
                        ? "bg-ink text-paper border-ink"
                        : "bg-surface-alt text-ms-muted border-line hover:text-ink"
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
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ms-muted">
                  Category
                </p>
                <AddCategory
                  trigger={
                    <button className="flex items-center gap-1 text-[10px] font-semibold text-ms-muted hover:text-ink transition-colors">
                      <Plus size={10} /> New
                    </button>
                  }
                />
              </div>

              {categoriesLoading ? (
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-16 rounded-2xl bg-surface-alt animate-pulse" />
                  ))}
                </div>
              ) : categories.length > 0 ? (
                <div className="grid grid-cols-4 gap-2 max-h-58 overflow-y-auto pb-1 scrollbar-hide">
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
                        ${
                          selected
                            ? "bg-orange-500/10 border-orange-500/30 "
                            : "bg-surface border-line hover:bg-surface-alt"
                        }`}
                      >
                        {selected && (
                          <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-orange-500 rounded-full flex items-center justify-center">
                            <Check size={8} className="text-white" strokeWidth={3} />
                          </span>
                        )}
                        <span className="text-xl leading-none">{cat.icon}</span>
                        <span
                          className={`text-[10px] font-semibold leading-tight truncate w-full text-center px-1
                        ${selected ? "text-orange-500" : "text-ms-muted"}`}
                        >
                          {cat.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-surface border border-line rounded-2xl py-6 text-center">
                  <p className="text-xs text-ms-muted">No income categories yet</p>
                  <AddCategory
                    trigger={
                      <button className="mt-2 text-xs font-semibold text-orange-500 hover:text-orange-400 flex items-center gap-1 mx-auto">
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
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-ms-muted">
                  Account
                </p>
                <AddAccount
                  trigger={
                    <button className="flex items-center gap-1 text-[10px] font-semibold text-ms-muted hover:text-ink transition-colors">
                      <Plus size={10} /> New
                    </button>
                  }
                />
              </div>

              {accountsLoading ? (
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-12 rounded-2xl bg-surface-alt animate-pulse" />
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
                        ${
                          selected
                            ? "bg-blue-500/10 border-blue-500/30 text-blue-500 "
                            : "bg-surface border-line text-ms-muted hover:bg-surface-alt"
                        }`}
                      >
                        <span className={selected ? "text-blue-500" : "text-ms-muted"}>
                          {accountIcon(acc.type)}
                        </span>
                        <span className="text-sm font-semibold truncate text-ink">{acc.name}</span>
                        {selected && (
                          <CheckCircle2
                            size={13}
                            className="ml-auto text-blue-500 shrink-0"
                            strokeWidth={2.5}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-surface border border-line rounded-2xl py-6 text-center">
                  <p className="text-xs text-ms-muted">No accounts yet</p>
                </div>
              )}
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
                onClick={handleSubmit}
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
                    <span>Save Income</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveField("amount")}
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
