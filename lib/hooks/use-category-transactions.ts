import { useQuery } from "@tanstack/react-query"
import axios from "axios"

interface UseCategoryTransactionsOptions {
  userId: string
  category: string
  dateRange?: "all" | "today" | "week" | "month" | "year" | "custom"
  customStartDate?: string
  customEndDate?: string
  enabled?: boolean
}

export function useCategoryTransactions({
  userId,
  category,
  dateRange = "month",
  customStartDate,
  customEndDate,
  enabled = true,
}: UseCategoryTransactionsOptions) {
  return useQuery({
    queryKey: [
      "category-transactions-v4",
      userId,
      category,
      dateRange,
      customStartDate,
      customEndDate,
    ],
    queryFn: async () => {
      console.log("=== CATEGORY HOOK EXECUTING ===")
      console.log("Hook received params:", {
        userId,
        category,
        dateRange,
        customStartDate,
        customEndDate,
      })

      const params = new URLSearchParams()

      if (dateRange && dateRange !== "all") {
        params.append("dateRange", dateRange)
      }

      if (customStartDate) {
        params.append("customStartDate", customStartDate)
      }

      if (customEndDate) {
        params.append("customEndDate", customEndDate)
      }

      // Use the by-category API route
      const apiUrl = `/api/transactions/by-category`
      params.append("category", category)
      const fullUrl = `${apiUrl}?${params.toString()}`

      console.log("Category hook calling API:", fullUrl)
      console.log("Category hook params:", { category, dateRange, customStartDate, customEndDate })
      console.log("=== END CATEGORY HOOK DEBUG ===")

      try {
        const response = await axios.get(fullUrl, {
          headers: {
            "Cache-Control": "no-store",
          },
        })

        console.log("Category hook received data:", response.data)
        return response.data.transactions || []
      } catch (error) {
        console.error("API error:", error)
        throw new Error("Failed to fetch category transactions")
      }
    },
    enabled: enabled && !!userId && userId.trim() !== "" && !!category,
  })
}
