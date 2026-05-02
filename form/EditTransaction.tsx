"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Drawer } from "vaul"
import { X, Search, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useCategories, useAccounts, useAuth, useUpdateTransactionMutation } from "@/hooks"

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

// ── Helper: Sentence Token ─────────────────────────────────
const SentenceToken = ({
  value,
  placeholder,
  active,
  onClick,
  color = "text-white",
  icon,
}: {
  value?: string
  placeholder?: string
  active: boolean
  onClick: () => void
  color?: string
  icon?: string
}) => {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center cursor-pointer transition-colors border-b-2
        ${active ? `border-white/40 ${color}` : `border-white/20 hover:border-white/40 ${value ? color : "text-white/30"}`}
      `}
      style={{ paddingBottom: "2px", position: "relative", top: "2px", borderBottomStyle: "dashed" }}
    >
      {icon && <span className="mr-1.5 text-xl relative -top-0.5">{icon}</span>}
      {value || placeholder}
    </span>
  )
}

export function EditTransaction({ trigger, transaction, isOpen, onOpenChange, onClose }: EditTransactionProps) {
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

  const { data: categories, isLoading: catLoading } = useCategories(user?.id || "", undefined, !!user?.id)
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
    let list = categories.filter(c => c.type === form.type)
    if (categorySearch) {
      list = list.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
    }
    return list
  }, [categories, form.type, categorySearch])

  const selectedCategory = categories?.find(c => c.id === form.category_id)
  const selectedAccount = accounts?.find(a => a.id === form.account_id)

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

  const isSubmitDisabled = !form.title || !form.amount || !form.category_id || !form.account_id || Number(form.amount) <= 0

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
    <>
      <div onClick={() => onOpenChange(true)}>{trigger}</div>

      <Drawer.Root open={isOpen} onOpenChange={(open) => (open ? onOpenChange(true) : handleClose())}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" />
          <Drawer.Content
            className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto focus:outline-none"
            style={{ background: "transparent" }}
          >
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
                  Edit Transaction
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
                  {"I "}
                  <SentenceToken
                    value={isExpense ? "spent" : "received"}
                    active={activeField === "type"}
                    color="text-white"
                    onClick={() => handleFieldClick("type")}
                  />
                  {" "}
                  <SentenceToken
                    value={form.amount ? `₹${Number(form.amount).toLocaleString("en-IN")}` : ""}
                    placeholder="₹---"
                    active={activeField === "amount"}
                    color={isExpense ? "text-[#5B9CF6]" : "text-[#7EC8A4]"}
                    onClick={() => handleFieldClick("amount")}
                  />
                  {isExpense ? " on " : " from "}
                  <SentenceToken
                    value={form.title}
                    placeholder="---"
                    active={activeField === "title"}
                    color="text-white"
                    onClick={() => handleFieldClick("title")}
                  />
                  {isExpense ? " for " : " as "}
                  <SentenceToken
                    value={selectedCategory?.name}
                    placeholder="---"
                    active={activeField === "category"}
                    color="text-[#E8A44A]"
                    icon={selectedCategory?.icon}
                    onClick={() => handleFieldClick("category")}
                  />
                  {isExpense ? " from " : " to "}
                  <SentenceToken
                    value={selectedAccount?.name}
                    placeholder="---"
                    active={activeField === "account"}
                    color={isExpense ? "text-[#7EC8A4]" : "text-[#5B9CF6]"}
                    onClick={() => handleFieldClick("account")}
                  />
                  {"."}
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
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Transaction Type</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setForm({ ...form, type: "expense", category_id: "" })
                            setActiveField("amount")
                          }}
                          className={`flex-1 py-4 rounded-2xl text-sm font-bold border transition-all ${
                            isExpense ? "bg-[#5B9CF6]/20 border-[#5B9CF6]/50 text-[#5B9CF6]" : "bg-white/5 border-white/10 text-white/50"
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
                            !isExpense ? "bg-[#7EC8A4]/20 border-[#7EC8A4]/50 text-[#7EC8A4]" : "bg-white/5 border-white/10 text-white/50"
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
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Enter Amount</p>
                      <div className="flex items-center">
                        <span className="text-4xl font-light text-white/30 mr-2">₹</span>
                        <input
                          ref={amountInputRef}
                          type="number"
                          inputMode="decimal"
                          value={form.amount}
                          onChange={(e) => setForm({ ...form, amount: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Enter") setActiveField("title") }}
                          placeholder="0"
                          className="bg-transparent text-5xl font-bold text-white placeholder:text-white/20 outline-none w-full"
                        />
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
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">
                        {isExpense ? "What did you spend on?" : "Where did this come from?"}
                      </p>
                      <input
                        ref={titleInputRef}
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        onKeyDown={(e) => { if (e.key === "Enter" && form.title) setActiveField("category") }}
                        placeholder={isExpense ? "e.g. Lunch, Uber, Groceries" : "e.g. Salary, Freelance"}
                        className="bg-transparent text-3xl font-bold text-white placeholder:text-white/20 outline-none w-full border-b border-white/10 pb-2 focus:border-white/40 transition-colors"
                      />
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/30 transition-colors"
                        />
                      </div>
                      
                      <div className="flex-1 overflow-y-auto scrollbar-hide pb-10 pr-2">
                        {catLoading ? (
                          <div className="flex items-center justify-center h-20 text-white/40 text-sm">Loading...</div>
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
                                    ${selected
                                      ? "bg-white/15 border-white/30 shadow-inner"
                                      : "bg-white/5 border-white/5 hover:bg-white/10"
                                    }`}
                                >
                                  {selected && (
                                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-md">
                                      <Check size={10} className="text-black" />
                                    </div>
                                  )}
                                  <span className="text-2xl leading-none">{cat.icon}</span>
                                  <span className={`text-[10px] font-semibold leading-tight w-full truncate px-1 ${selected ? "text-white" : "text-white/60"}`}>
                                    {cat.name}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-white/40 text-sm">No categories found.</div>
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
                      <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Select Account</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {accLoading ? (
                          <div className="col-span-2 flex items-center justify-center h-20 text-white/40 text-sm">Loading...</div>
                        ) : accounts?.map((acc) => {
                          const selected = form.account_id === acc.id
                          return (
                            <button
                              key={acc.id}
                              onClick={() => {
                                setForm({ ...form, account_id: acc.id })
                                setActiveField(null)
                              }}
                              className={`flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-95
                                ${selected
                                  ? "bg-white text-black border-white shadow-[0_4px_15px_rgba(255,255,255,0.1)]"
                                  : "bg-white/5 border-white/10 hover:bg-white/10"
                                }`}
                            >
                              <div className="flex-1 text-left min-w-0">
                                <p className={`text-sm font-bold truncate ${selected ? "text-black" : "text-white"}`}>
                                  {acc.name}
                                </p>
                              </div>
                              {selected && <Check size={16} className="shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
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
