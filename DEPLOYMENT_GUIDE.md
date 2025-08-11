# Deployment Guide - Preventing Service Worker Cache Issues

## Problem
After deploying new changes to production, users experience client-side exceptions when refreshing the page. This happens because:

1. **Service Worker Cache Conflicts**: Old cached versions conflict with new code
2. **Version Mismatch**: Service worker doesn't properly invalidate old caches
3. **Aggressive Caching**: Service worker serves stale content instead of fresh code

## Solution Implemented

### 1. Service Worker Versioning
- Added dynamic cache versioning (`CACHE_VERSION`)
- Cache names now include version numbers to prevent conflicts
- Automatic cache cleanup of old versions

### 2. Improved Cache Strategy
- Network-first approach for fresh content
- Fallback to cache only when network fails
- Proper cache invalidation on updates

### 3. Update Handling
- Automatic detection of new service worker versions
- User notification for updates
- Force reload to get fresh content

## Deployment Process

### Before Deployment
1. **Update Service Worker Version**:
   ```bash
   npm run clear-sw-cache
   ```
   This will:
   - Increment the service worker version
   - Create a cache clearing page

### During Deployment
1. Deploy your changes to production
2. The new service worker will be registered automatically
3. Old caches will be cleaned up

### After Deployment
1. **Clear Old Caches** (if needed):
   - Visit `/clear-cache.html` on your production site
   - This will clear all old caches and reload the page
   - Delete the temporary `clear-cache.html` file

2. **Monitor Console Logs**:
   - Check for service worker registration messages
   - Verify cache cleanup is working
   - Look for any error messages

## Testing Deployment

### 1. Local Testing
```bash
npm run build
npm start
```

### 2. Production Testing
1. Deploy changes
2. Open the app in an incognito window
3. Check if service worker registers correctly
4. Verify no client-side exceptions occur

## Troubleshooting

### If Issues Persist

1. **Force Clear All Caches**:
   ```javascript
   // Run in browser console
   if ('caches' in window) {
     caches.keys().then(names => {
       names.forEach(name => caches.delete(name))
     })
   }
   ```

2. **Unregister Service Worker**:
   ```javascript
   // Run in browser console
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.getRegistrations().then(registrations => {
       registrations.forEach(registration => registration.unregister())
     })
   }
   ```

3. **Check Network Tab**:
   - Look for failed requests to `/sw.js`
   - Verify cache headers are correct
   - Check for 404 errors

### Common Issues

1. **Service Worker Not Updating**:
   - Check if `skipWaiting()` is called
   - Verify `clients.claim()` is working
   - Look for console errors

2. **Cache Not Clearing**:
   - Verify cache names are unique
   - Check if `activate` event is firing
   - Look for cache deletion errors

3. **Client-Side Exceptions**:
   - Check browser console for error details
   - Verify all dependencies are loaded
   - Look for hydration mismatches

## Best Practices

### 1. Version Management
- Always increment service worker version on deployment
- Use semantic versioning (e.g., v1.0.0, v1.0.1)
- Keep version numbers in sync with app versions

### 2. Cache Strategy
- Use network-first for critical resources
- Cache static assets with long expiration
- Implement proper cache invalidation

### 3. Error Handling
- Add try-catch blocks around service worker operations
- Log errors for debugging
- Provide fallback behavior

### 4. Testing
- Test service worker updates locally
- Verify cache behavior in different browsers
- Test offline functionality

## Monitoring

### 1. Console Logs
- Service worker registration status
- Cache operations
- Update notifications

### 2. Network Tab
- Service worker requests
- Cache hits/misses
- Resource loading

### 3. Application Tab
- Service worker status
- Cache storage
- IndexedDB (if used)

## Conclusion

By following this deployment process and implementing the improved service worker strategy, you should no longer experience client-side exceptions after deployments. The key is proper versioning, cache management, and update handling.

If you continue to experience issues, check the troubleshooting section and monitor the console logs for specific error messages.
