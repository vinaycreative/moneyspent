# CustomDrawer Usage Guide

## Overview

The `CustomDrawer` component is a reusable drawer component that can be used to create forms and other content that slides up from the bottom of the screen. It includes built-in support for triggers, form submission, and automatic state management.

## Key Features

1. **Trigger Support**: Accepts any React node as a trigger to open the drawer
2. **Controlled State**: Can be controlled externally or manage its own state
3. **Form Integration**: Built-in submit button with loading states
4. **Automatic Closing**: Can automatically close after successful operations

## Basic Usage

### Simple Implementation

```tsx
import { CustomDrawer } from "@/components/CustomDrawer"
import { Plus } from "lucide-react"

const MyComponent = () => {
  return (
    <CustomDrawer
      trigger={<button className="bg-blue-600 text-white px-4 py-2 rounded">Open Drawer</button>}
      title="My Form"
      SubmitIcon={Plus}
      submitTitle="Submit"
      onSubmit={() => {
        // Handle form submission
        console.log("Form submitted!")
      }}
    >
      <div>Your form content goes here</div>
    </CustomDrawer>
  )
}
```

### Controlled State Implementation

```tsx
import { CustomDrawer } from "@/components/CustomDrawer"
import { Plus } from "lucide-react"
import { useState } from "react"

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = async () => {
    try {
      // Perform your operation
      await someAsyncOperation()

      // Close drawer after success
      setIsOpen(false)
    } catch (error) {
      console.error("Operation failed:", error)
    }
  }

  return (
    <CustomDrawer
      trigger={<button className="bg-blue-600 text-white px-4 py-2 rounded">Open Drawer</button>}
      title="My Form"
      SubmitIcon={Plus}
      submitTitle="Submit"
      open={isOpen}
      onOpenChange={setIsOpen}
      onSubmit={handleSubmit}
    >
      <div>Your form content goes here</div>
    </CustomDrawer>
  )
}
```

## AddTransaction Component Integration

The `AddTransaction` component demonstrates how to use `CustomDrawer` with automatic drawer closing after successful mutations.

### How It Works

1. **Trigger**: The component accepts a `trigger` prop that can be any React node (button, icon, card, etc.)
2. **State Management**: Uses the `useAddTransactionDrawer` hook to manage drawer state and form data
3. **Automatic Closing**: The drawer automatically closes after a successful transaction creation
4. **Form Reset**: Form data is automatically reset when the drawer closes

### Example Usage

```tsx
import { AddTransaction } from "@/form/AddTransaction"
import { Plus } from "lucide-react"

const Dashboard = () => {
  return (
    <div>
      <AddTransaction
        trigger={
          <button className="w-full bg-black text-white rounded-md py-3 flex items-center justify-center gap-2 font-medium hover:bg-gray-800 transition-colors">
            <Plus className="w-5 h-5" />
            Add Transaction
          </button>
        }
      />
    </div>
  )
}
```

### Custom Trigger Examples

#### Icon Button

```tsx
<AddTransaction
  trigger={
    <button className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
      <Plus className="w-6 h-6" />
    </button>
  }
/>
```

#### Card Style

```tsx
<AddTransaction
  trigger={
    <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer text-center">
      <div className="flex flex-col items-center gap-2">
        <Wallet className="w-6 h-6 text-gray-600" />
        <p className="font-medium text-gray-900">Add Transaction</p>
      </div>
    </div>
  }
/>
```

#### Floating Action Button

```tsx
<AddTransaction
  trigger={
    <button className="fixed bottom-6 right-6 w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg z-50">
      <Plus className="w-7 h-7" />
    </button>
  }
/>
```

## AddCategory Component Integration

The `AddCategory` component follows the same pattern as `AddTransaction` and provides a complete category creation form.

### How It Works

1. **Trigger**: Accepts any React node as a trigger to open the drawer
2. **State Management**: Uses the `useAddEditCategoryDrawer` hook to manage drawer state and form data
3. **Automatic Closing**: The drawer automatically closes after successful category creation
4. **Form Reset**: Form data is automatically reset when the drawer closes
5. **Rich Form**: Includes name, type, icon selection, color picker, and live preview

### Example Usage

```tsx
import { AddCategory } from "@/form/AddCategory"
import { FolderPlus } from "lucide-react"

const CategoriesPage = () => {
  return (
    <div>
      <AddCategory
        trigger={
          <button className="w-full bg-purple-600 text-white rounded-md py-3 flex items-center justify-center gap-2 font-medium hover:bg-purple-700 transition-colors">
            <FolderPlus className="w-5 h-5" />
            Add Category
          </button>
        }
      />
    </div>
  )
}
```

### Custom Trigger Examples

#### Icon Button

```tsx
<AddCategory
  trigger={
    <button className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
      <Plus className="w-6 h-6" />
    </button>
  }
/>
```

#### Card Style

```tsx
<AddCategory
  trigger={
    <div className="w-full p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer text-center">
      <div className="flex flex-col items-center gap-2">
        <FolderPlus className="w-6 h-6 text-purple-600" />
        <p className="font-medium text-gray-900">Add New Category</p>
      </div>
    </div>
  }
/>
```

#### Floating Action Button

```tsx
<AddCategory
  trigger={
    <button className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg z-50">
      <Plus className="w-7 h-7" />
    </button>
  }
/>
```

## AddAccount Component Integration

The `AddAccount` component follows the same pattern as `AddTransaction` and `AddCategory` and provides a complete account creation form.

### How It Works

1. **Trigger**: Accepts any React node as a trigger to open the drawer
2. **State Management**: Uses the `useAddAccountDrawer` hook to manage drawer state and form data
3. **Automatic Closing**: The drawer automatically closes after successful account creation
4. **Form Reset**: Form data is automatically reset when the drawer closes
5. **Rich Form**: Includes name, type, balance, currency, and live preview with quick selection cards

### Example Usage

```tsx
import { AddAccount } from "@/form/AddAccount"
import { Plus } from "lucide-react"

const AccountsPage = () => {
  return (
    <div>
      <AddAccount
        trigger={
          <button className="w-full bg-blue-600 text-white rounded-md py-3 flex items-center justify-center gap-2 font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-5 h-5" />
            Add Account
          </button>
        }
      />
    </div>
  )
}
```

### Custom Trigger Examples

#### Icon Button

```tsx
<AddAccount
  trigger={
    <button className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
      <Plus className="w-6 h-6" />
    </button>
  }
/>
```

#### Card Style

```tsx
<AddAccount
  trigger={
    <div className="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer text-center">
      <div className="flex flex-col items-center gap-2">
        <Building2 className="w-6 h-6 text-blue-600" />
        <p className="font-medium text-gray-900">Add New Account</p>
      </div>
    </div>
  }
/>
```

#### Floating Action Button

```tsx
<AddAccount
  trigger={
    <button className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg z-50">
      <Plus className="w-7 h-7" />
    </button>
  }
/>
```

## Props Reference

### CustomDrawer Props

| Prop               | Type                    | Required | Description                                       |
| ------------------ | ----------------------- | -------- | ------------------------------------------------- |
| `trigger`          | React.ReactNode         | Yes      | The element that triggers the drawer to open      |
| `triggerClassName` | string                  | No       | Additional CSS classes for the trigger            |
| `title`            | string                  | Yes      | The title displayed in the drawer header          |
| `description`      | string                  | No       | Optional description below the title              |
| `children`         | React.ReactNode         | Yes      | The content to display in the drawer body         |
| `SubmitIcon`       | LucideIcon              | Yes      | Icon to display in the submit button              |
| `submitTitle`      | string                  | No       | Text for the submit button (defaults to "Submit") |
| `submitDisabled`   | boolean                 | No       | Whether the submit button is disabled             |
| `submitLoading`    | boolean                 | No       | Whether to show loading state in submit button    |
| `onSubmit`         | () => void              | No       | Function called when submit button is clicked     |
| `open`             | boolean                 | No       | Controlled open state                             |
| `onOpenChange`     | (open: boolean) => void | No       | Callback when open state changes                  |

### AddTransaction Props

| Prop      | Type            | Required | Description                                  |
| --------- | --------------- | -------- | -------------------------------------------- |
| `trigger` | React.ReactNode | Yes      | The element that triggers the drawer to open |

### AddCategory Props

| Prop      | Type            | Required | Description                                  |
| --------- | --------------- | -------- | -------------------------------------------- |
| `trigger` | React.ReactNode | Yes      | The element that triggers the drawer to open |

### AddAccount Props

| Prop      | Type            | Required | Description                                  |
| --------- | --------------- | -------- | -------------------------------------------- |
| `trigger` | React.ReactNode | Yes      | The element that triggers the drawer to open |

## Automatic Drawer Closing Logic

The drawer automatically closes after successful operations through the following flow:

1. **User clicks submit button** → `onSubmit` is called
2. **Form submission** → `handleSubmit` in the hook processes the form
3. **API call** → Data is created/updated via the respective mutation
4. **Success** → `closeDrawer()` is called automatically
5. **Drawer closes** → Form data is reset and drawer state is updated

This ensures a smooth user experience where users don't need to manually close the drawer after successful operations.

## Best Practices

1. **Always provide a clear trigger**: Make sure users understand what will happen when they click the trigger
2. **Use appropriate loading states**: Set `submitLoading` to show progress during async operations
3. **Handle errors gracefully**: Wrap your `onSubmit` logic in try-catch blocks
4. **Reset form data**: The component automatically resets form data, but you can add additional cleanup if needed
5. **Accessibility**: Ensure your trigger elements have proper ARIA labels and keyboard navigation support
6. **Consistent styling**: Use consistent colors and styling for similar actions (e.g., purple for categories, black for transactions, blue for accounts)
