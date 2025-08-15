import { useAuth } from "@/lib/contexts/auth-context"
import { useCategories } from "@/lib/hooks"
import React from "react"

const ViewAllCategories = () => {
  const { user } = useAuth()
  // Get categories from API
  const { data: categories, isLoading } = useCategories(user?.id || "", {
    enabled: !!user?.id,
  })
  return (
    <div className="h-full overflow-y-auto">
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          Manage your transaction categories. You can edit or delete existing categories.
        </p>
      </div>
      <div>
        {categories?.map((category: any) => (
          <div key={category.id}>
            <h2>{category.name}</h2>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ViewAllCategories
