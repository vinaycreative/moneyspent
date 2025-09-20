# API Architecture Documentation

## Overview

This document describes the layered API architecture implemented in the MoneySpent frontend application. The architecture follows a strict separation of concerns with three main layers:

1. **API Layer** (`api/`) - Raw HTTP calls using Axios
2. **Query Layer** (`queries/`) - React Query wrappers for data fetching and caching
3. **Hook Layer** (`hooks/`) - UI-ready custom hooks with derived values

## Architecture Principles

### ✅ Do's
- Always use the centralized `axios` instance from `lib/axios.ts`
- Validate all API responses with Zod schemas
- Use React Query for all server state management
- Create UI-ready hooks that expose derived values
- Handle loading and error states consistently
- Use proper TypeScript types throughout

### ❌ Don'ts
- Never call axios directly in components
- Don't bypass the layered architecture
- Avoid duplicating data transformation logic
- Never ignore error handling

## Directory Structure

```
├── lib/
│   └── axios.ts              # Centralized axios instance with auth
├── types/
│   ├── apiResponse.ts        # Generic API response types
│   └── schemas/              # Zod validation schemas
│       ├── auth.schema.ts
│       ├── category.schema.ts
│       ├── transaction.schema.ts
│       └── account.schema.ts
├── api/                      # Raw HTTP calls
│   ├── auth.ts
│   ├── categories.ts
│   ├── transactions.ts
│   └── accounts.ts
├── queries/                  # React Query wrappers
│   ├── authQueries.ts
│   ├── categoryQueries.ts
│   ├── transactionQueries.ts
│   └── accountQueries.ts
├── hooks/                    # UI-ready hooks
│   ├── useAuth.ts
│   ├── useCategories.ts
│   ├── useTransactions.ts
│   ├── useAccounts.ts
│   └── index.ts
└── utils/
    └── formatters.ts         # UI formatting utilities
```

## Layer Details

### 1. Axios Configuration (`lib/axios.ts`)

**Features:**
- Centralized base URL configuration
- Automatic authentication header injection from cookies
- Request/Response interceptors
- Automatic auth error handling with redirect
- CORS and security configurations

```typescript
// Auto-injects Bearer token from access_token cookie
// Handles 401 errors by clearing auth state and redirecting
```

### 2. Type System (`types/`)

**Features:**
- Zod schemas for runtime validation
- Generic `ApiResponse<T>` wrapper type
- Domain-specific schemas (User, Category, Transaction, Account)
- Request/Response type definitions
- Pagination support

**Example Usage:**
```typescript
const validatedResponse = ApiResponseSchema(UserSchema).parse(response.data)
```

### 3. API Layer (`api/`)

**Responsibilities:**
- Raw HTTP calls using axios instance
- Response validation with Zod
- Error handling and meaningful error messages
- No React dependencies (pure functions)

**Pattern:**
```typescript
export const fetchCategories = async (userId: string): Promise<Category[]> => {
  const response = await api.get(`/categories?user_id=${userId}`)
  const validatedResponse = ApiResponseSchema(z.array(CategorySchema)).parse(response.data)
  
  if (!validatedResponse.success) {
    throw new Error(validatedResponse.error || "Failed to fetch categories")
  }
  
  return validatedResponse.data
}
```

### 4. Query Layer (`queries/`)

**Responsibilities:**
- React Query configuration (`useQuery`, `useMutation`)
- Cache key management
- Optimistic updates
- Cache invalidation strategies
- Retry logic and error handling

**Features:**
- Consistent query key patterns
- Proper stale time configuration
- Smart cache invalidation
- Mutation success/error handling
- Background refetching

**Example:**
```typescript
export const useFetchCategories = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: categoryQueryKeys.list(userId),
    queryFn: () => fetchCategories(userId),
    enabled: !!userId && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    meta: { errorMessage: "Failed to fetch categories" }
  })
}
```

### 5. Hook Layer (`hooks/`)

**Responsibilities:**
- UI-ready data transformation
- Derived values calculation
- Loading/error state aggregation
- Action helpers
- Component-friendly API

**Features:**
- Computed properties (totals, counts, filtered data)
- User-friendly loading states
- Error aggregation
- Action shortcuts
- Memoized calculations

**Example:**
```typescript
export const useCategories = (userId: string): UseCategoriesReturn => {
  const query = useFetchCategories(userId)
  
  const derivedValues = useMemo(() => {
    const categories = query.data || []
    return {
      categories,
      hasCategories: categories.length > 0,
      expenseCategories: categories.filter(cat => cat.type === "expense"),
      incomeCategories: categories.filter(cat => cat.type === "income"),
      categoryCount: categories.length,
    }
  }, [query.data])
  
  return { ...query, ...derivedValues }
}
```

## Query Key Patterns

Consistent query key structure for efficient cache management:

```typescript
// Pattern: [domain, action, ...params]
export const categoryQueryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryQueryKeys.all, 'list'] as const,
  list: (userId: string) => [...categoryQueryKeys.lists(), userId] as const,
  details: () => [...categoryQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryQueryKeys.details(), id] as const,
}
```

## Error Handling Strategy

### API Layer
- Validates responses with Zod
- Throws meaningful error messages
- Handles network errors

### Query Layer
- Configures retry logic
- Sets error boundaries
- Provides error metadata

### Hook Layer
- Aggregates error states
- Provides user-friendly error messages
- Handles loading states

## Authentication Flow

1. **Token Storage**: Custom `access_token` HTTP-only cookie
2. **Automatic Injection**: Axios interceptor adds `Bearer` token
3. **Error Handling**: 401 responses trigger auth state cleanup
4. **Redirection**: Automatic redirect to login on auth failure

## Cache Management

### Invalidation Strategies
- **Create**: Add to list cache + invalidate lists
- **Update**: Update specific item + invalidate related caches
- **Delete**: Remove from cache + invalidate related queries

### Stale Time Configuration
- **User data**: 5 minutes (changes infrequently)
- **Categories/Accounts**: 10 minutes (relatively stable)
- **Transactions**: 2 minutes (changes frequently)
- **Analytics/Stats**: 5 minutes (computed data)

## Usage Examples

### In Components
```tsx
// ✅ Good: Use UI-ready hooks
const TransactionList = () => {
  const { user } = useAuth()
  const { transactions, hasTransactions, isLoading } = useTransactions({ 
    user_id: user?.id 
  })
  
  if (isLoading) return <LoadingSpinner />
  if (!hasTransactions) return <EmptyState />
  
  return (
    <div>
      {transactions.map(transaction => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}
    </div>
  )
}

// ❌ Bad: Don't use queries directly in components
const BadComponent = () => {
  const { data, isLoading } = useFetchTransactions() // Too low-level
  // Component needs to handle data transformation, loading states, etc.
}
```

### Forms and Mutations
```tsx
const CategoryForm = () => {
  const { create, isLoading, error } = useCategoryForm()
  
  const handleSubmit = (formData) => {
    create(formData)
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Category'}
      </button>
      {error && <ErrorMessage error={error} />}
    </form>
  )
}
```

## Benefits

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Type Safety**: Full TypeScript coverage with runtime validation
3. **Caching**: Intelligent caching with React Query
4. **Error Handling**: Consistent error handling at each layer
5. **Developer Experience**: UI-ready hooks with derived values
6. **Maintainability**: Clear patterns and consistent architecture
7. **Performance**: Optimistic updates and smart cache invalidation
8. **Reusability**: Composable hooks and query patterns

## Migration Guide

### From Old Pattern to New Architecture

**Before:**
```tsx
// Component making direct axios calls
const [categories, setCategories] = useState([])
const [loading, setLoading] = useState(false)

useEffect(() => {
  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/categories')
      setCategories(response.data.data)
    } catch (error) {
      // handle error
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

**After:**
```tsx
// Using new layered architecture
const { categories, hasCategories, isLoading } = useCategories(user?.id)
```

The new architecture reduces boilerplate by ~80% while providing better type safety, error handling, and caching.