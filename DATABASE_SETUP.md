# Database Setup Guide for Money Manager

This guide will help you set up the Supabase database for your Money Manager application.

## 📋 **Prerequisites**

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project in your Supabase dashboard
3. **Database Access**: You'll need access to the SQL editor in your Supabase dashboard

## 🗄️ **Database Schema Overview**

### **Core Tables (6 total):**

1. **`users`** - User profiles and authentication
2. **`categories`** - Transaction categories (expense/income)
3. **`accounts`** - Bank accounts, cash, credit cards, etc.
4. **`transactions`** - All financial transactions
5. **`budgets`** - Budget tracking (optional for future)
6. **`goals`** - Financial goals (optional for future)

## 🚀 **Setup Instructions**

### **Step 1: Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `money-manager`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Click "Create new project"

### **Step 2: Run Database Schema**

1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the entire contents of `database_schema.sql`
4. Click "Run" to execute the schema

### **Step 3: Configure Authentication**

1. Go to **Authentication > Settings**
2. Configure your authentication providers:
   - **Google OAuth** (recommended)
   - **Email/Password** (if needed)
3. Set up your redirect URLs for your domain

### **Step 4: Get Environment Variables**

1. Go to **Settings > API**
2. Copy the following values:
   - **Project URL**
   - **Anon Key** (public)
   - **Service Role Key** (secret - keep safe)

### **Step 5: Update Environment Variables**

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 **Database Features**

### **🔐 Security Features:**

- **Row Level Security (RLS)** enabled on all tables
- **User isolation** - users can only access their own data
- **Automatic user creation** with default categories and accounts

### **⚡ Performance Features:**

- **Optimized indexes** for fast queries
- **Database functions** for complex analytics
- **Automatic timestamps** for all records

### **🔄 Automation Features:**

- **Default categories** created automatically for new users
- **Default accounts** (Cash, Bank, Credit Card) for new users
- **Updated timestamps** automatically maintained

## 🛠️ **Database Functions**

The schema includes three powerful functions for analytics:

### **1. `get_transaction_summary(user_id, start_date?, end_date?)`**

Returns total expenses, income, and net savings for a date range.

### **2. `get_category_breakdown(user_id, type, start_date?, end_date?)`**

Returns spending breakdown by category with percentages.

### **3. `get_monthly_trend(user_id, months_back?)`**

Returns monthly spending trends for charts.

## 📝 **Sample Queries**

### **Get User's Recent Transactions:**

```sql
SELECT
  t.*,
  c.name as category_name,
  c.icon as category_icon,
  c.color as category_color,
  a.name as account_name
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN accounts a ON t.account_id = a.id
WHERE t.user_id = 'user-uuid'
ORDER BY t.transaction_date DESC
LIMIT 10;
```

### **Get Category Breakdown:**

```sql
SELECT * FROM get_category_breakdown('user-uuid', 'expense', '2025-01-01', '2025-01-31');
```

### **Get Transaction Summary:**

```sql
SELECT * FROM get_transaction_summary('user-uuid', '2025-01-01', '2025-01-31');
```

## 🔧 **TypeScript Integration**

The `types/database.ts` file provides full TypeScript support:

```typescript
import { createClient } from "@supabase/supabase-js"
import { Database } from "@/types/database"

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Fully typed queries
const { data: transactions } = await supabase
  .from("transactions")
  .select("*")
  .eq("user_id", userId)
```

## 🚨 **Important Notes**

### **Security:**

- All tables have RLS enabled
- Users can only access their own data
- Service role key should be kept secret

### **Performance:**

- Indexes are created for common queries
- Functions are optimized for analytics
- Consider adding more indexes based on usage patterns

### **Scalability:**

- Schema supports multiple users
- Functions handle date filtering efficiently
- Structure supports future features (budgets, goals)

## 🔄 **Migration Strategy**

If you need to modify the schema later:

1. **Add new columns**: Use `ALTER TABLE` statements
2. **Add new tables**: Follow the same pattern as existing tables
3. **Add new functions**: Create them in the SQL editor
4. **Update types**: Regenerate TypeScript types if needed

## 📞 **Support**

If you encounter issues:

1. Check the Supabase logs in your dashboard
2. Verify RLS policies are correctly applied
3. Test queries in the SQL editor
4. Check environment variables are correctly set

## 🎯 **Next Steps**

After setting up the database:

1. **Update your Supabase client** configuration
2. **Replace mock data** with real database queries
3. **Test all CRUD operations** (Create, Read, Update, Delete)
4. **Implement error handling** for database operations
5. **Add loading states** for async operations

Your Money Manager app is now ready for production with a robust, scalable database!
