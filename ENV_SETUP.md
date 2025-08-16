# Environment Variables Setup

To fix the authentication and make your onboarding flow work, you need to create a `.env.local` file in your project root with the following variables:

## Required Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How to Get These Values

### 1. Supabase Configuration

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key

### 2. Google OAuth Setup in Supabase

1. In your Supabase dashboard, go to Authentication → Providers
2. Find Google and click "Enable"
3. Enter your Google Client ID and Client Secret (from Google Cloud Console)
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)
5. Save the configuration

## Steps to Fix

1. **Create `.env.local` file** in your project root (same level as `package.json`)
2. **Add the Supabase environment variables** with your actual values
3. **Configure Google provider in Supabase** (not in your code)
4. **Restart your development server** (`npm run dev`)
5. **The Google sign-in button should now appear** on the last onboarding screen

## Example `.env.local` file

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Important Notes

- **Never commit `.env.local` to git** (it should be in `.gitignore`)
- **Google OAuth is configured in Supabase**, not in your environment variables
- **Restart the dev server** after adding environment variables
- **Check browser console** for any remaining errors
- **Verify Supabase Google provider** is enabled in your Supabase dashboard

After setting these up, your onboarding flow should work perfectly with the Google sign-in button!
