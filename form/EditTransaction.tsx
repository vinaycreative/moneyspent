"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Search, Check, CheckCircle2 } from "lucide-react"
import { useCategories, useAccounts, useAuth, useUpdateTransactionMutation } from "@/hooks"
import { InteractiveDrawer } from "@/components/InteractiveDrawer"
import { SentenceToken } from "@/components/SentenceToken"

// ── Types ──────────────────────────────────────────────────
type ActiveField = "type" | "amount" | "title" | "category" | "account" | null

interface EditTransactionFormData {
  title: string
  type: "expense" | "income"
  amount: string
  category_id: string
  account_id: string
  occurred_at?: Date
}

interface EditTransactionProps {
  trigger: React.ReactNode
  transaction: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onClose?: () => void
}

export function EditTransaction({
  trigger,
  transaction,
  isOpen,
  onOpenChange,
  onClose,
}: EditTransactionProps) {
  const { user } = useAuth()

  const [form, setForm] = useState<EditTransactionFormData>({
    title: "",
    type: "expense",
    amount: "",
    category_id: "",
    account_id: "",
  })

  const [activeField, setActiveField] = useState<ActiveField>(null)
  const [isLoading, setIsLoading] = useState(false)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const amountInputRef = useRef<HTMLInputElement>(null)
  const [categorySearch, setCategorySearch] = useState("")

  const updateTransaction = useUpdateTransactionMutation()

  const { data: categories, isLoading: catLoading } = useCategories(
    user?.id || "",
    undefined,
    !!user?.id,
  )
  const { accounts, isLoading: accLoading } = useAccounts(user?.id || "")

  // Populate form on open
  useEffect(() => {
    if (transaction && isOpen) {
      setForm({
        title: transaction.title || "",
        type: transaction.type || "expense",
        amount: transaction.amount?.toString() || "",
        category_id: transaction.category_id || "",
        account_id: transaction.account_id || "",
        occurred_at: transaction.occurred_at ? new Date(transaction.occurred_at) : undefined,
      })
      setActiveField(null)
      setCategorySearch("")
    }
  }, [transaction, isOpen])

  // Filter categories by type
  const filteredCategories = useMemo(() => {
    if (!categories) return []
    let list = categories.filter((c) => c.type === form.type)
    if (categorySearch) {
      list = list.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
    }
    return list
  }, [categories, form.type, categorySearch])

  const selectedCategory = categories?.find((c) => c.id === form.category_id)
  const selectedAccount = accounts?.find((a) => a.id === form.account_id)

  const handleClose = useCallback(() => {
    onOpenChange(false)
    onClose?.()
    setActiveField(null)
  }, [onOpenChange, onClose])

  // Focus management
  useEffect(() => {
    if (!isOpen) return
    if (activeField === "amount") {
      setTimeout(() => amountInputRef.current?.focus(), 100)
    } else if (activeField === "title") {
      setTimeout(() => titleInputRef.current?.focus(), 100)
    }
  }, [activeField, isOpen])

  const handleFieldClick = (field: ActiveField) => {
    setActiveField(activeField === field ? null : field)
  }

  const isSubmitDisabled =
    !form.title ||
    !form.amount ||
    !form.category_id ||
    !form.account_id ||
    Number(form.amount) <= 0

  const handleSubmit = async () => {
    if (isSubmitDisabled) return
    setIsLoading(true)
    try {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        data: {
          title: form.title,
          amount: parseFloat(form.amount),
          type: form.type,
          category_id: form.category_id,
          account_id: form.account_id,
          occurred_at: form.occurred_at ? form.occurred_at.toISOString() : transaction.occurred_at,
          description: transaction.description,
          updated_at: new Date().toISOString(),
        },
      })
      handleClose()
    } catch (err) {
      console.error("Failed to update transaction:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const isExpense = form.type === "expense"

  return (
    <InteractiveDrawer
      isOpen={isOpen}
      onClose={handleClose}
      onOpenChange={(open) => (open ? onOpenChange(true) : handleClose())}
      onOpen={() => {
        // Form is populated from effect above
        setActiveField(null)
      }}
      title="Edit Transaction"
      trigger={trigger}
      isSubmitDisabled={isSubmitDisabled}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      submitText="Save"
    >
      {/* ── Sentence ─────────────────────────────────── */}
      <div className="px-6 pb-2">
        <p
          className="text-ink text-[26px] font-bold leading-[1.45] tracking-tight"
          style={{ fontFamily: "inherit" }}
        >
          {"I "}
          <SentenceToken
            value={isExpense ? "spent" : "received"}
            active={activeField === "type"}
            colorClass="text-ink"
            onClick={() => handleFieldClick("type")}
          />{" "}
          <SentenceToken
            value={form.amount ? `₹${Number(form.amount).toLocaleString("en-IN")}` : ""}
            placeholder="₹---"
            active={activeField === "amount"}
            colorClass={isExpense ? "text-neg" : "text-pos"}
            onClick={() => handleFieldClick("amount")}
          />
          {isExpense ? " on " : " from "}
          <SentenceToken
            value={form.title}
            placeholder="---"
            active={activeField === "title"}
            colorClass="text-ink"
            onClick={() => handleFieldClick("title")}
          />
          {isExpense ? " for " : " as "}
          <SentenceToken
            value={selectedCategory?.name}
            placeholder="---"
            active={activeField === "category"}
            colorClass="text-orange-500"
            icon={selectedCategory?.icon}
            onClick={() => handleFieldClick("category")}
          />
          {isExpense ? " from " : " to "}
          <SentenceToken
            value={selectedAccount?.name}
            placeholder="---"
            active={activeField === "account"}
            colorClass="text-blue-500"
            onClick={() => handleFieldClick("account")}
          />
          {"."}
        </p>

        <p className="text-ms-muted text-[11px] font-medium mt-3 mb-1 flex items-center gap-1">
          <span>⚡</span> Tap any underline to edit
        </p>
      </div>

      {/* ── Field Panels ─────────────────────────────── */}
      <div className="min-h-[240px]">
        <AnimatePresence mode="wait">
          {/* Type panel */}
          {activeField === "type" && (
            <motion.div
              key="type"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-6"
            >
              <p className="text-xs font-bold text-ms-muted uppercase tracking-widest mb-4">
                Transaction Type
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setForm({ ...form, type: "expense", category_id: "" })
                    setActiveField("amount")
                  }}
                  className={`flex-1 py-4 rounded-2xl text-sm font-bold border transition-all ${
                    isExpense
                      ? "bg-neg/10 border-neg/30 text-neg "
                      : "bg-surface border-line text-ms-muted hover:bg-surface-alt"
                  }`}
                >
                  Spent (Expense)
                </button>
                <button
                  onClick={() => {
                    setForm({ ...form, type: "income", category_id: "" })
                    setActiveField("amount")
                  }}
                  className={`flex-1 py-4 rounded-2xl text-sm font-bold border transition-all ${
                    !isExpense
                      ? "bg-pos/10 border-pos/30 text-pos "
                      : "bg-surface border-line text-ms-muted hover:bg-surface-alt"
                  }`}
                >
                  Received (Income)
                </button>
              </div>
            </motion.div>
          )}

          {/* Amount panel */}
          {activeField === "amount" && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-6"
            >
              <p className="text-xs font-bold text-ms-muted uppercase tracking-widest mb-4">
                Enter Amount
              </p>
              <div className="flex items-center gap-2 bg-surface-alt rounded-2xl px-4 py-3 border border-line focus-within:border-ink/50 transition-colors">
                <span className={`text-2xl font-bold ${isExpense ? "text-neg" : "text-pos"}`}>
                  ₹
                </span>
                <input
                  ref={amountInputRef}
                  type="number"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setActiveField("title")
                  }}
                  placeholder="0"
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
            </motion.div>
          )}

          {/* Title panel */}
          {activeField === "title" && (
            <motion.div
              key="title"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-6"
            >
              <p className="text-xs font-bold text-ms-muted uppercase tracking-widest mb-4">
                {isExpense ? "What did you spend on?" : "Where did this come from?"}
              </p>
              <div className="flex items-center gap-3 bg-surface-alt rounded-2xl px-4 py-3 border border-line focus-within:border-ink/30 transition-colors">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && form.title) setActiveField("category")
                  }}
                  placeholder={
                    isExpense ? "e.g. Lunch, Uber, Groceries" : "e.g. Salary, Freelance"
                  }
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
            </motion.div>
          )}

          {/* Category panel */}
          {activeField === "category" && (
            <motion.div
              key="category"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-6 flex flex-col h-[300px]"
            >
              <div className="relative mb-4 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ms-muted" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full bg-surface border border-line rounded-xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-ms-muted outline-none focus:border-ink/30 transition-colors"
                />
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-hide pr-2">
                {catLoading ? (
                  <div className="flex items-center justify-center h-40 text-ms-muted text-sm">
                    Loading...
                  </div>
                ) : filteredCategories.length > 0 ? (
                  <div className="grid grid-cols-4 gap-3">
                    {filteredCategories.map((cat) => {
                      const selected = form.category_id === cat.id
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setForm({ ...form, category_id: cat.id })
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
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
                              <Check size={10} className="text-white" />
                            </div>
                          )}
                          <span className="text-2xl leading-none">{cat.icon}</span>
                          <span
                            className={`text-[10px] font-semibold leading-tight w-full truncate px-1 ${selected ? "text-orange-500" : "text-ms-muted"}`}
                          >
                            {cat.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-ms-muted text-sm">
                    No categories found.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Account panel */}
          {activeField === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="px-6 py-6"
            >
              <p className="text-xs font-bold text-ms-muted uppercase tracking-widest mb-4">
                Select Account
              </p>

              <div className="grid grid-cols-2 gap-3">
                {accLoading ? (
                  <div className="col-span-2 flex items-center justify-center h-20 text-ms-muted text-sm">
                    Loading...
                  </div>
                ) : (
                  accounts?.map((acc) => {
                    const selected = form.account_id === acc.id
                    return (
                      <button
                        key={acc.id}
                        onClick={() => {
                          setForm({ ...form, account_id: acc.id })
                          setActiveField(null)
                        }}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95
                        ${
                          selected
                            ? "bg-blue-500/10 border-blue-500/30  text-blue-500"
                            : "bg-surface border-line text-ms-muted hover:bg-surface-alt"
                        }`}
                      >
                        <div className="flex-1 text-left min-w-0">
                          <p
                            className={`text-sm font-bold truncate ${selected ? "text-blue-500" : "text-ink"}`}
                          >
                            {acc.name}
                          </p>
                        </div>
                        {selected && <CheckCircle2 size={16} className="shrink-0 text-blue-500" />}
                      </button>
                    )
                  })
                )}
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
                    <span>Save Changes</span>
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
