import React, { useEffect } from "react"
import { Drawer } from "vaul"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Building2, CreditCard, Wallet, ArrowDownRight, ArrowUpRight } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import { useAuth } from "@/hooks"
import { useAccounts } from "@/hooks/useAccounts"
import { useAddTransactionDrawer } from "@/hooks"
import { AddCategory } from "./AddCategory"
import { AddAccount } from "./AddAccount"

export interface TransactionFormData {
  type: string
  date: Date | undefined
  amount: string
  title: string
  description: string
  category: string
  account: string
}

interface AddTransactionProps {
  trigger: React.ReactNode
  defaultType?: "expense" | "income"
}

const accountIcon = (type: string) => {
  if (type === "credit") return <CreditCard size={15} />
  if (type === "cash" || type === "wallet") return <Wallet size={15} />
  return <Building2 size={15} />
}

export const AddTransaction = ({ trigger, defaultType }: AddTransactionProps) => {
  const { user } = useAuth()
  const {
    isOpen,
    openDrawer,
    closeDrawer,
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    handleSubmit,
    isSubmitDisabled,
    isLoading,
  } = useAddTransactionDrawer()

  const { data: categories, isLoading: categoriesLoading } = useCategories(
    user?.id || "", undefined, !!user?.id
  )
  const { accounts, isLoading: accountsLoading } = useAccounts(user?.id!)

  const filteredCategories = categories?.filter((cat: any) => cat.type === activeTab) || []

  // Set default type when drawer opens
  const handleOpen = () => {
    if (defaultType) setActiveTab(defaultType)
    openDrawer()
  }

  // When defaultType changes while open, update tab
  useEffect(() => {
    if (isOpen && defaultType) setActiveTab(defaultType)
  }, [defaultType, isOpen])

  const handleFormSubmit = async () => {
    try { await handleSubmit() }
    catch (error) { console.error("Failed to create transaction:", error) }
  }

  const isExpense = activeTab === "expense"

  return (
    <>
      <div onClick={handleOpen}>{trigger}</div>

      <Drawer.Root open={isOpen} onOpenChange={(open) => (open ? handleOpen() : closeDrawer())}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-50" />
          <Drawer.Content className="bg-paper flex flex-col rounded-t-[28px] fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto focus:outline-none shadow-2xl max-h-[92vh]">

            {/* Handle */}
            <div className="pt-4 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1 rounded-full bg-line" />
            </div>

            {/* Header */}
            <div className="px-5 pb-3 shrink-0">
              <Drawer.Title className="text-xl font-bold text-ink">Add Transaction</Drawer.Title>
              <p className="text-[11px] text-ms-muted font-medium mt-0.5">Log your expense or income</p>
            </div>

            {/* Scrollable body */}
            <div className="px-5 overflow-y-auto flex-1 space-y-5 pb-4">

              {/* Type Tabs */}
              <div className="grid grid-cols-2 gap-2">
                {(["expense", "income"] as const).map((type) => {
                  const active = activeTab === type
                  const isExp = type === "expense"
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setActiveTab(type)
                        setFormData({ ...formData, category: "" })
                      }}
                      className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold border transition-all ${
                        active
                          ? isExp
                            ? "bg-neg/10 text-neg border-neg/30"
                            : "bg-pos/10 text-pos border-pos/30"
                          : "bg-surface border-line text-ms-muted"
                      }`}
                    >
                      {isExp
                        ? <ArrowDownRight size={15} className={active ? "text-neg" : "text-ms-muted"} />
                        : <ArrowUpRight size={15} className={active ? "text-pos" : "text-ms-muted"} />
                      }
                      {isExp ? "Expense" : "Income"}
                    </button>
                  )
                })}
              </div>

              {/* Amount */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ms-muted mb-2">Amount</p>
                <div className={`flex items-center bg-surface border rounded-2xl px-4 focus-within:border-ink/40 transition-colors ${
                  isExpense ? "border-neg/25" : "border-pos/25"
                }`}>
                  <span className={`text-lg font-bold mr-2 ${isExpense ? "text-neg" : "text-pos"}`}>₹</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    inputMode="decimal"
                    className="flex-1 bg-transparent py-4 text-xl font-bold text-ink placeholder:text-ms-muted outline-none"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ms-muted mb-2">Title</p>
                <input
                  type="text"
                  placeholder="What did you spend on?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-surface border border-line rounded-2xl px-4 py-3.5 text-sm text-ink placeholder:text-ms-muted outline-none focus:border-ink/40 transition-colors"
                />
              </div>

              {/* Date */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ms-muted mb-2">Date</p>
                <input
                  type="datetime-local"
                  value={formData.date ? new Date(formData.date.getTime() - formData.date.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value ? new Date(e.target.value) : undefined })}
                  className="w-full bg-surface border border-line rounded-2xl px-4 py-3.5 text-sm text-ink outline-none focus:border-ink/40 transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ms-muted">Category</p>
                  <AddCategory
                    trigger={
                      <button className="text-[10px] font-semibold text-ms-muted flex items-center gap-0.5 active:opacity-70">
                        <Plus size={11} /> New
                      </button>
                    }
                  />
                </div>

                {categoriesLoading ? (
                  <div className="grid grid-cols-4 gap-2">
                    {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-2xl bg-surface-alt animate-pulse" />)}
                  </div>
                ) : filteredCategories.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {filteredCategories.map((cat: any) => {
                      const selected = formData.category === cat.id
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setFormData({ ...formData, category: cat.id })}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-center transition-all active:scale-95 ${
                            selected
                              ? "bg-surface-alt border-ink/20"
                              : "bg-surface border-line"
                          }`}
                        >
                          <span className="text-xl leading-none">{cat.icon}</span>
                          <span className={`text-[10px] font-semibold leading-tight truncate w-full text-center px-1 ${
                            selected ? "text-ink" : "text-ms-muted"
                          }`}>{cat.name}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="bg-surface border border-line rounded-2xl py-6 text-center">
                    <p className="text-xs text-ms-muted">No categories yet</p>
                    <AddCategory
                      trigger={
                        <button className="mt-2 text-xs font-semibold text-ms-accent flex items-center gap-1 mx-auto">
                          <Plus size={12} /> Add category
                        </button>
                      }
                    />
                  </div>
                )}
              </div>

              {/* Account */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ms-muted">Account</p>
                  <AddAccount
                    trigger={
                      <button className="text-[10px] font-semibold text-ms-muted flex items-center gap-0.5 active:opacity-70">
                        <Plus size={11} /> New
                      </button>
                    }
                  />
                </div>

                {accountsLoading ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[1,2].map(i => <div key={i} className="h-12 rounded-2xl bg-surface-alt animate-pulse" />)}
                  </div>
                ) : (accounts?.length ?? 0) > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {accounts?.map((acc: any) => {
                      const selected = formData.account === acc.id
                      return (
                        <button
                          key={acc.id}
                          onClick={() => setFormData({ ...formData, account: acc.id })}
                          className={`flex items-center gap-2 px-3 py-3 rounded-2xl border transition-all active:scale-95 ${
                            selected
                              ? "bg-ink text-paper border-ink"
                              : "bg-surface border-line text-ink"
                          }`}
                        >
                          <span className={selected ? "text-paper" : "text-ms-muted"}>
                            {accountIcon(acc.type)}
                          </span>
                          <span className="text-sm font-semibold truncate">{acc.name}</span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="bg-surface border border-line rounded-2xl py-6 text-center">
                    <p className="text-xs text-ms-muted">No accounts yet</p>
                  </div>
                )}
              </div>

              {/* Description (optional) */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ms-muted mb-2">Note (optional)</p>
                <input
                  type="text"
                  placeholder="Add a note…"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-surface border border-line rounded-2xl px-4 py-3.5 text-sm text-ink placeholder:text-ms-muted outline-none focus:border-ink/40 transition-colors"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="px-5 pt-3 pb-8 border-t border-line shrink-0 flex gap-3">
              <button
                onClick={closeDrawer}
                className="flex-1 py-4 rounded-2xl text-sm font-semibold text-ink bg-surface-alt border border-line active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={isSubmitDisabled || isLoading}
                className={`flex-1 py-4 rounded-2xl text-sm font-bold text-paper active:scale-95 transition-all disabled:opacity-40 ${
                  isExpense ? "bg-neg" : "bg-pos"
                }`}
              >
                {isLoading ? "Saving…" : isExpense ? "Add Expense" : "Add Income"}
              </button>
            </div>

          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
