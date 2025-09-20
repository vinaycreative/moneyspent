# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

MoneySpent is a personal finance management application built with Next.js 15, designed as a mobile-first PWA for tracking expenses, managing accounts, and financial analytics.

## Development Commands

### Essential Commands
- `npm run dev --turbopack` - Start development server with Turbopack (preferred)
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run clear-sw-cache` - Clear service worker cache (custom script)

### Development Workflow
- Use `npm run dev --turbopack` for faster development builds
- The app runs on http://localhost:3000
- Hot reloading is enabled for all file changes

## Architecture & Key Patterns

### Application Structure
- **App Router**: Uses Next.js 15 App Router with TypeScript
- **Mobile-First**: Constrained width layout (320px-400px) with mobile viewport optimizations
- **Route Groups**: Private routes under `app/(private)/` with layout-based authentication
- **Component Organization**: Separate directories for `components/`, `form/`, `hooks/`, and `context/`

### Authentication Architecture
- **Supabase Integration**: Uses `@supabase/ssr` and `@supabase/supabase-js`
- **Custom Cookie Management**: Stores `access_token` from Supabase session in HTTP-only cookie named 'access_token' (not using default Supabase cookies)
- **Route Protection**: Middleware-based protection for private routes (`/dashboard`, `/transactions`, `/analytics`, `/accounts`, `/settings`)
- **Auth Guard Components**: `AuthGuard.tsx` and `AuthErrorBoundary.tsx` handle session validation and error states
- **Session Management**: Automatic redirect to `/dashboard` when authenticated, to `/` when not

### Data Management & API Architecture
- **Layered Architecture**: Strict 3-layer architecture (api/ → queries/ → hooks/)
- **TanStack Query**: Used for server state management with React Query v5
- **Type Safety**: Full TypeScript coverage with Zod runtime validation
- **Centralized HTTP**: Single axios instance with auth interceptors
- **API Layer**: Raw HTTP calls with response validation (`api/`)
- **Query Layer**: React Query wrappers with caching strategies (`queries/`)
- **Hook Layer**: UI-ready hooks with derived values (`hooks/`)
- **Backend Integration**: Separate moneyspent-backend service

### UI Architecture
- **shadcn/ui**: Component library with "new-york" style preset
- **Tailwind CSS v4**: Custom styling with mobile-optimized classes
- **Radix UI**: Accessible component primitives for dialogs, forms, navigation
- **Framer Motion**: Animation library for smooth transitions
- **Vaul**: Drawer components for mobile interactions
- **Bottom Navigation**: Tab-based navigation for mobile UX

### Key Components
- **Layout Components**: `BottomNavigation.tsx`, `Header.tsx`, mobile-optimized layouts
- **Form Components**: Separate form directory with dedicated components for Add/Edit operations
- **Data Display**: `DashboardStats.tsx`, category management, transaction lists
- **Custom UI**: `CustomDrawer.tsx`, `CustomInput.tsx`, `DateTimePicker.tsx` for mobile-specific interactions

## Code Organization

### Directory Structure
```
app/
├── (private)/          # Protected routes with authentication
├── auth/              # Authentication callback routes
├── old/               # Legacy route components (being migrated)
├── layout.tsx         # Root layout with providers
├── page.tsx           # Landing/authentication page
components/            # Reusable UI components
├── ui/                # shadcn/ui components
├── Auth*.tsx          # Authentication-related components
├── *FormContent.tsx   # Form components for data input
├── *Drawer.tsx        # Mobile drawer components
form/                  # Dedicated form components
├── Add*.tsx           # Creation forms
├── Edit*.tsx          # Update forms
context/               # React context providers
├── TanstackProvider.tsx
types/                 # TypeScript types and Zod schemas
├── apiResponse.ts     # Generic API response types
├── schemas/           # Domain-specific Zod schemas
│   ├── auth.schema.ts
│   ├── category.schema.ts
│   ├── transaction.schema.ts
│   └── account.schema.ts
lib/                   # Shared libraries and utilities
├── axios.ts           # Centralized axios instance with auth
api/                   # Raw HTTP calls (Axios functions)
├── auth.ts
├── categories.ts
├── transactions.ts
└── accounts.ts
queries/               # React Query wrappers
├── authQueries.ts
├── categoryQueries.ts
├── transactionQueries.ts
└── accountQueries.ts
hooks/                 # UI-ready custom hooks with derived values
├── useAuth.ts
├── useCategories.ts
├── useTransactions.ts
├── useAccounts.ts
└── index.ts
utils/                 # Utility functions
└── formatters.ts      # Currency, date, and text formatting
```

### Important Files
- `middleware.ts` - Route protection and authentication checks
- `components.json` - shadcn/ui configuration
- `next.config.ts` - Security headers and caching configuration for auth-sensitive routes
- `package.json` - Uses Turbopack for development, includes clear-sw-cache script

## Development Guidelines

### Authentication Handling
- Always check for custom `access_token` cookie, not default Supabase cookies
- Use `AuthGuard` component for private route protection
- Handle auth errors with `AuthErrorBoundary` for graceful degradation
- Clear all auth state (localStorage, sessionStorage, cookies) on sign out

### Mobile-First Development
- Design for 320px-400px constrained width
- Use `mobile-viewport` class for proper mobile styling
- Implement drawer-based navigation patterns
- Test touch interactions and mobile keyboard behavior
- Use `dvh` (dynamic viewport height) instead of `vh` for mobile browsers

### State Management
- Use TanStack Query for all server state
- Implement optimistic updates for better UX
- Create custom hooks for complex query logic
- Handle loading and error states consistently across components

### Component Development
- Follow shadcn/ui patterns for consistent styling
- Use Radix UI primitives for accessibility
- Implement proper keyboard navigation
- Create mobile-specific interaction patterns (swipe, drawer, etc.)

### API Development Guidelines
- **Follow Layered Architecture**: Always use api/ → queries/ → hooks/ pattern
- **Never bypass layers**: Don't call axios directly in components
- **Use centralized axios**: Import from `@/lib/axios` for automatic auth
- **Validate responses**: All API functions must validate with Zod schemas
- **UI-ready hooks**: Create hooks that expose derived values and loading states
- **Consistent patterns**: Follow established query key and cache management patterns
- **Error handling**: Handle errors at each layer appropriately
- **Type safety**: Use TypeScript types throughout the entire flow

### Backend Integration
- Authentication headers automatically injected via axios interceptors
- Custom `access_token` cookie management with 401 error handling
- Response validation with Zod schemas ensures type safety
- React Query provides caching, background updates, and optimistic updates
- Backend service runs separately (moneyspent-backend repository)

## Dependencies & Tech Stack

### Core Framework
- **Next.js 15.4.4** with App Router and React 19
- **TypeScript 5** for type safety
- **Turbopack** for development builds

### State & Data
- **@tanstack/react-query 5.83.0** - Server state management
- **@supabase/ssr 0.6.1** - Supabase SSR integration
- **axios 1.11.0** - HTTP client

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **@radix-ui/* components** - Accessible UI primitives
- **framer-motion 12.23.12** - Animation library
- **vaul 1.1.2** - Mobile drawer components
- **lucide-react** - Icon library

### Forms & Validation
- **zod 4.0.17** - Schema validation
- **react-day-picker** - Date selection components

### Development Tools
- **@tanstack/react-query-devtools** - Query debugging
- **sharp** - Image optimization

## Notes

- Service worker cleanup script included for PWA functionality
- Security headers configured for auth-sensitive routes
- Mobile keyboard handling implemented for better UX
- Component library uses "new-york" style with gray base color
- All routes with authentication redirect to appropriate pages based on auth state
- **See `API_ARCHITECTURE.md`** for detailed documentation on the 3-layer API architecture
- Comprehensive utility functions available in `utils/formatters.ts` for UI formatting
