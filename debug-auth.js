#!/usr/bin/env node

/**
 * Debug script to check authentication configuration
 * Run this to verify your environment variables and settings
 */

console.log('🔍 Authentication Debug Information')
console.log('=====================================')

console.log('\n📋 Environment Variables:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY present:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

console.log('\n🌐 Expected Configuration:')
console.log('Frontend URL: Your Vercel/Netlify domain')
console.log('Backend URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')

console.log('\n🍪 Cookie Configuration Issues to Check:')
console.log('1. Ensure your frontend and backend are on HTTPS in production')
console.log('2. Check if domains match or are properly configured for cross-origin')
console.log('3. Verify CORS settings on your backend allow credentials')

console.log('\n🔧 Backend CORS Configuration Needed:')
console.log(`
app.use(cors({
  origin: [
    'https://your-frontend-domain.vercel.app',
    'http://localhost:3000'  // for development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
`)

console.log('\n✅ Next Steps:')
console.log('1. Deploy these changes to production')
console.log('2. Check browser dev tools → Application → Cookies to see if access_token is being set')
console.log('3. Check Network tab to see if cookies are being sent with requests')
console.log('4. Verify CORS configuration on your backend')