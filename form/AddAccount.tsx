import React from "react"
import { Drawer } from "vaul"
import { Building2, CreditCard, Wallet, PiggyBank } from "lucide-react"
import { useAccountForm } from "@/hooks"

export interface AccountFormData {
  name: string
  type: string
  starting_balance: string
  currency: string
}

const accountTypes = [
  { value: "bank",    label: "Bank",   icon: Building2 },
  { value: "credit",  label: "Card",   icon: CreditCard },
  { value: "cash",    label: "Cash",   icon: Wallet },
  { value: "wallet",  label: "Wallet", icon: Wallet },
]

export const AddAccount = ({ trigger }: { trigger: React.ReactNode }) => {
  const {
    isOpen,
    openDrawer,
    closeDrawer,
    formData,
    setFormData,
    handleSubmit,
    isSubmitDisabled,
    isLoading,
  } = useAccountForm()

  const handleInputChange = (field: keyof AccountFormData, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleFormSubmit = async () => {
    try {
      await handleSubmit()
    } catch (error) {
      console.error("Failed to create account:", error)
    }
  }

  return (
    <>
      <div onClick={openDrawer}>{trigger}</div>

      <Drawer.Root open={isOpen} onOpenChange={(open) => (open ? openDrawer() : closeDrawer())}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/30 z-50" />
          <Drawer.Content className="bg-paper flex flex-col rounded-t-[28px] fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto focus:outline-none shadow-2xl">
            {/* Handle */}
            <div className="pt-4 pb-2 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-line" />
            </div>

            <div className="px-5 pb-2">
              <Drawer.Title className="text-xl font-bold text-ink">Add account</Drawer.Title>
              <p className="text-[11px] text-ms-muted font-medium mt-0.5">Track all your money in one place</p>
            </div>

            <div className="px-5 pt-4 space-y-5 overflow-y-auto max-h-[70vh]">

              {/* Account Type Picker */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ms-muted mb-3">Type</p>
                <div className="grid grid-cols-4 gap-2">
                  {accountTypes.map(({ value, label, icon: Icon }) => {
                    const isSelected = formData.type === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleInputChange("type", value)}
                        className={`flex flex-col items-center gap-2 py-3 px-2 rounded-2xl border transition-all active:scale-95 ${
                          isSelected
                            ? "bg-surface-alt border-line"
                            : "bg-surface border-line text-ms-muted"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? "text-ink" : "text-ms-muted"}`} />
                        <span className={`text-[11px] font-bold ${isSelected ? "text-ink" : "text-ms-muted"}`}>
                          {label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Account Name */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ms-muted mb-2">Account Name</p>
                <input
                  type="text"
                  placeholder="Enter account name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full bg-surface border border-line rounded-2xl px-4 py-3.5 text-sm text-ink placeholder:text-ms-muted outline-none focus:border-ink/40 transition-colors"
                />
              </div>

              {/* Current Balance */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ms-muted mb-2">Current Balance</p>
                <div className="flex items-center bg-surface border border-line rounded-2xl px-4 focus-within:border-ink/40 transition-colors">
                  <span className="text-ms-muted text-sm font-medium mr-2">₹</span>
                  <input
                    type="number"
                    placeholder="Enter account name"
                    value={formData.starting_balance}
                    onChange={(e) => handleInputChange("starting_balance", e.target.value)}
                    inputMode="numeric"
                    className="flex-1 bg-transparent py-3.5 text-sm text-ink placeholder:text-ms-muted outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-5 pt-4 pb-8 mt-2 border-t border-line flex gap-3">
              <button
                onClick={closeDrawer}
                className="flex-1 py-4 rounded-2xl text-sm font-semibold text-ink bg-surface-alt border border-line active:scale-95 transition-transform"
              >
                Cancel
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={isSubmitDisabled || isLoading}
                className="flex-1 py-4 rounded-2xl text-sm font-bold text-paper bg-ink active:scale-95 transition-transform disabled:opacity-50"
              >
                {isLoading ? "Adding…" : "Add Account"}
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
