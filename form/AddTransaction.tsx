import React from "react"
import { CustomInput } from "@/components/CustomInput"
import CustomDrawer from "@/components/CustomDrawer"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { DateTimePicker } from "@/components/DateTimePicker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useCategories } from "@/lib/hooks/use-categories"
import { useAuth } from "@/lib/contexts/auth-context"
import { useAccounts } from "@/lib/hooks/use-accounts"
import { AiTwotoneBank } from "react-icons/ai"
import { BsCreditCard2Front } from "react-icons/bs"
import { HiOutlineCash } from "react-icons/hi"
import { useAddTransactionDrawer } from "@/lib/hooks/use-add-transaction-drawer"

export interface TransactionFormData {
  type: string
  date: Date | undefined
  amount: string
  description: string
  category: string
  account: string
}

export const AddTransaction = ({ trigger }: { trigger: React.ReactNode }) => {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const transactionType = [
    {
      id: "expense",
      label: "Expense",
      value: "expense",
    },
    {
      id: "income",
      label: "Income",
      value: "income",
    },
  ]

  // Get categories and accounts
  const { data: categories, isLoading: categoriesLoading } = useCategories(user?.id || "", {
    enabled: !!user?.id,
  })

  const { data: accounts, isLoading: accountsLoading } = useAccounts(user?.id || "", {
    enabled: !!user?.id,
  })

  // Filter categories by type
  const filteredCategories = categories?.filter((cat: any) => cat.type === activeTab) || []

  const handleFormSubmit = async () => {
    try {
      await handleSubmit()
      // The drawer will be closed automatically by the hook after successful submission
    } catch (error) {
      console.error("Failed to create transaction:", error)
    }
  }

  return (
    <CustomDrawer
      trigger={trigger}
      title="Add Transaction"
      SubmitIcon={Plus}
      submitTitle="Add"
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
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 border-b border-gray-200 pb-4 grid grid-cols-2 gap-2">
          {/* custom checkbox for income and expense */}
          {transactionType.map((type, index) => (
            <div
              key={index}
              className={cn(
                `flex items-center justify-center gap-2 border rounded-sm p-2 cursor-pointer transition-all duration-300`,
                {
                  "bg-green-50 text-green-600 border border-green-600 font-medium":
                    type.id === "income" && activeTab === "income",
                  "bg-red-50 border-red-600 text-red-600 font-medium":
                    type.id === "expense" && activeTab === "expense",
                }
              )}
              onClick={() => {
                setActiveTab(type.id)
                setFormData({ ...formData, category: "" })
              }}
            >
              {type.label}
            </div>
          ))}
        </div>

        <CustomInput
          id="amount"
          label="Amount"
          name="amount"
          placeholder="Enter amount"
          type="number"
          value={formData.amount}
          onChange={handleInputChange}
          required
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="date" className="text-sm text-gray-800 font-medium">
            Date <span className="text-red-500">*</span>
          </label>
          <DateTimePicker
            id="date"
            name="date"
            date={formData.date}
            onDateChange={(date) => setFormData({ ...formData, date })}
            placeholder="Select date"
            required={true}
          />
        </div>
        <CustomInput
          id="description"
          label="Description"
          name="description"
          placeholder="Enter description"
          type="text"
          value={formData.description}
          onChange={handleInputChange}
          className="col-span-2"
          required
        />

        {/* Category Field */}
        <div className="flex flex-col gap-1.5 col-span-2">
          <Label className="text-sm text-gray-800 font-medium">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
            disabled={categoriesLoading}
            required
          >
            <SelectTrigger className={cn("w-full border-gray-300 bg-white")}>
              <SelectValue
                placeholder={categoriesLoading ? "Loading categories..." : "Select category"}
              />
            </SelectTrigger>
            <SelectContent>
              {categoriesLoading ? (
                <SelectItem value="loading" disabled>
                  Loading categories...
                </SelectItem>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-categories" disabled>
                  No categories available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5 col-span-2">
          <Label className="text-sm text-gray-800 font-medium">
            Account <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {accountsLoading ? (
              <div className="col-span-2 flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              accounts?.map((account: any) => {
                return (
                  <div
                    key={account.id}
                    className={cn(
                      "bg-white border border-gray-300 rounded-sm p-2 flex items-center justify-center gap-2 cursor-pointer hover:border-gray-600 transition-all duration-300",
                      {
                        "bg-gray-900 text-white border-gray-900": formData.account === account.id,
                      }
                    )}
                    onClick={() => setFormData({ ...formData, account: account.id })}
                  >
                    {account.type === "bank" && <AiTwotoneBank size={18} />}
                    {account.type === "credit" && <BsCreditCard2Front size={18} />}
                    {account.type === "cash" && <HiOutlineCash size={18} />}
                    <span>{account.name}</span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </CustomDrawer>
  )
}
