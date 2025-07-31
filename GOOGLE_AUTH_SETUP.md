# Google Authentication Setup Guide

This guide will help you set up Google authentication for your MyWallet application using Supabase.

## Prerequisites

1. A Google Cloud project
2. A Supabase project
3. Next.js application (already set up)

## Step 1: Google Cloud Console Setup

### 1.1 Create OAuth 2.0 Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application" as the application type
6. Add your authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
7. Add your authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)
8. Copy your Client ID and Client Secret

### 1.2 Configure Consent Screen

1. Go to "OAuth consent screen"
2. Configure the consent screen with your app information
3. Add the following scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider

1. Go to your Supabase Dashboard
2. Navigate to Authentication → Providers
3. Find Google and click "Enable"
4. Enter your Google Client ID and Client Secret
5. Save the configuration

### 2.2 Configure Redirect URLs

In your Supabase project settings, add the following redirect URLs:

- `http://localhost:3000/auth/callback`
- `https://yourdomain.com/auth/callback`

## Step 3: Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## Step 4: Implementation Details

### Authentication Flow

The application implements two authentication methods:

1. **Standard OAuth Flow**: Uses `signInWithOAuth` with PKCE (Proof Key for Code Exchange)
2. **Google One Tap**: Uses `signInWithIdToken` for enhanced UX

### Key Components

- `app/auth/callback/route.ts`: Handles OAuth callback and code exchange
- `components/GoogleOneTap.tsx`: Implements Google One Tap sign-in
- `middleware.ts`: Protects routes and handles authentication state
- `app/login/page.tsx`: Login page with Google sign-in button

### Features

- ✅ PKCE flow for enhanced security
- ✅ Google One Tap integration
- ✅ Automatic session management
- ✅ Route protection with middleware
- ✅ Error handling and user feedback
- ✅ Responsive design

## Step 5: Testing

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to the login page
4. Click "Sign in with Google"
5. Complete the Google authentication flow
6. You should be redirected to the dashboard

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**: Make sure your redirect URIs match exactly in both Google Cloud Console and Supabase
2. **"Client ID not found" error**: Verify your Google Client ID is correct in the environment variables
3. **"Consent screen not configured"**: Complete the OAuth consent screen setup in Google Cloud Console

### Debug Tips

- Check browser console for authentication errors
- Verify environment variables are loaded correctly
- Ensure all redirect URLs are properly configured
- Test with both development and production URLs

## Security Considerations

- Always use HTTPS in production
- Keep your Client Secret secure and never expose it in client-side code
- Use environment variables for sensitive configuration
- Implement proper session management
- Consider implementing additional security measures like MFA

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
