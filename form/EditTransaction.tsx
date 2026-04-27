import React from "react"
import { Drawer } from "vaul"
import { Plus, Building2, CreditCard, Wallet, ArrowDownRight, ArrowUpRight } from "lucide-react"
import { useCategories } from "@/hooks/useCategories"
import { useAuth } from "@/hooks"
import { useAccounts } from "@/hooks/useAccounts"
import { useEditTransactionDrawer } from "@/hooks"
import { useUpdateTransactionMutation } from "@/hooks"
import { AddCategory } from "./AddCategory"
import { AddAccount } from "./AddAccount"

export interface EditTransactionFormData {
  title: string
  type: string
  occurred_at: Date | undefined
  amount: string
  description: string
  category_id: string
  account_id: string
}

interface EditTransactionProps {
  trigger: React.ReactNode
  transaction: any
  onClose?: () => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const accountIcon = (type: string) => {
  if (type === "credit") return <CreditCard size={15} />
  if (type === "cash" || type === "wallet") return <Wallet size={15} />
  return <Building2 size={15} />
}

export const EditTransaction = ({
  trigger,
  transaction,
  onClose,
  isOpen,
  onOpenChange,
}: EditTransactionProps) => {
  const { user } = useAuth()
  const {
    activeTab,
    setActiveTab,
    formData,
    setFormData,
    isSubmitDisabled,
    isLoading,
  } = useEditTransactionDrawer()

  const updateTransaction = useUpdateTransactionMutation()

  const { data: categories, isLoading: categoriesLoading } = useCategories(user?.id!, undefined, !!user?.id)
  const { accounts, isLoading: accountsLoading } = useAccounts(user?.id!)

  const filteredCategories = categories?.filter((cat: any) => cat.type === activeTab) || []

  // Populate form when transaction changes or drawer opens
  React.useEffect(() => {
    if (transaction && isOpen) {
      setFormData({
        title: transaction.title || "",
        type: transaction.type || "expense",
        occurred_at: transaction.occurred_at ? new Date(transaction.occurred_at) : undefined,
        amount: transaction.amount?.toString() || "",
        description: transaction.description || "",
        category_id: transaction.category_id || "",
        account_id: transaction.account_id || "",
      })
      setActiveTab(transaction.type || "expense")
    }
  }, [transaction, isOpen])

  const handleFormSubmit = async () => {
    try {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        data: {
          title: formData.title,
          amount: parseFloat(formData.amount) || 0,
          type: activeTab,
          category_id: formData.category_id,
          account_id: formData.account_id,
          occurred_at: formData.occurred_at
            ? formData.occurred_at.toISOString()
            : transaction.occurred_at,
          description: formData.description || "",
          updated_at: new Date().toISOString(),
        },
      })
      onOpenChange(false)
      onClose?.()
    } catch (error) {
      console.error("Failed to update transaction:", error)
    }
  }

  const isExpense = activeTab === "expense"
  const submitDisabled =
    !formData.title.trim() ||
    !formData.amount.trim() ||
    !formData.category_id ||
    !formData.account_id ||
    updateTransaction.isPending

  return (
    <>
      <div>{trigger}</div>

      <Drawer.Root
        open={isOpen}
        onOpenChange={(open) => {
          onOpenChange(open)
          if (!open) onClose?.()
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-50" />
          <Drawer.Content className="bg-paper flex flex-col rounded-t-[28px] fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto focus:outline-none shadow-2xl max-h-[92vh]">

            {/* Handle */}
            <div className="pt-4 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1 rounded-full bg-line" />
            </div>

            {/* Header */}
            <div className="px-5 pb-3 shrink-0">
              <Drawer.Title className="text-xl font-bold text-ink">Edit Transaction</Drawer.Title>
              <p className="text-[11px] text-ms-muted font-medium mt-0.5">Update your transaction details</p>
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
                        setFormData({ ...formData, type, category_id: "" })
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
                  value={
                    formData.occurred_at
                      ? new Date(formData.occurred_at.getTime() - formData.occurred_at.getTimezoneOffset() * 60000)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setFormData({ ...formData, occurred_at: e.target.value ? new Date(e.target.value) : undefined })
                  }
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
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 rounded-2xl bg-surface-alt animate-pulse" />
                    ))}
                  </div>
                ) : filteredCategories.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2">
                    {filteredCategories.map((cat: any) => {
                      const selected = formData.category_id === cat.id
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setFormData({ ...formData, category_id: cat.id })}
                          className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border text-center transition-all active:scale-95 ${
                            selected
                              ? "bg-surface-alt border-ink/20"
                              : "bg-surface border-line"
                          }`}
                        >
                          <span className="text-xl leading-none">{cat.icon}</span>
                          <span className={`text-[10px] font-semibold leading-tight truncate w-full text-center px-1 ${
                            selected ? "text-ink" : "text-ms-muted"
                          }`}>
                            {cat.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="bg-surface border border-line rounded-2xl py-6 text-center">
                    <p className="text-xs text-ms-muted">No categories found</p>
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
                    {[1, 2].map((i) => (
                      <div key={i} className="h-12 rounded-2xl bg-surface-alt animate-pulse" />
                    ))}
                  </div>
                ) : (accounts?.length ?? 0) > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {accounts?.map((acc: any) => {
                      const selected = formData.account_id === acc.id
                      return (
                        <button
                          key={acc.id}
                          onClick={() => setFormData({ ...formData, account_id: acc.id })}
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

              {/* Note */}
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
                onClick={() => { onOpenChange(false); onClose?.() }}
                className="flex-1 py-4 rounded-2xl text-sm font-semibold text-ink bg-surface-alt border border-line active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={submitDisabled}
                className={`flex-1 py-4 rounded-2xl text-sm font-bold text-paper active:scale-95 transition-all disabled:opacity-40 ${
                  isExpense ? "bg-neg" : "bg-pos"
                }`}
              >
                {updateTransaction.isPending ? "Saving…" : "Save Changes"}
              </button>
            </div>

          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
