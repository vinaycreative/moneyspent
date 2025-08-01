# PWA Setup Guide

Your Money Manager app now supports Progressive Web App (PWA) functionality! Here's what's been implemented and how to complete the setup.

## What's Implemented

✅ **Web App Manifest** - `public/manifest.json`
✅ **Service Worker** - `public/sw.js`
✅ **Service Worker Registration** - `public/sw-register.js`
✅ **PWA Meta Tags** - Updated in `app/layout.tsx`
✅ **Install Prompt Component** - `components/PWAInstallPrompt.tsx`
✅ **PWA Hook** - `lib/hooks/use-pwa.ts`
✅ **Offline Page** - `components/OfflinePage.tsx`
✅ **Browser Config** - `public/browserconfig.xml`

## Missing Icons (Need to Generate)

You need to generate the following icon files:

### Required Icons:

- `public/icon-192x192.png` (192x192 pixels)
- `public/icon-512x512.png` (512x512 pixels)
- `public/apple-touch-icon.png` (180x180 pixels)

### Optional Screenshots:

- `public/screenshot-wide.png` (1280x720 pixels)
- `public/screenshot-narrow.png` (750x1334 pixels)

## How to Generate Icons

### Option 1: Online Icon Generator

1. Go to [PWA Builder](https://www.pwabuilder.com/imageGenerator)
2. Upload your app logo or use the provided SVG icon
3. Download the generated icons
4. Place them in the `public/` directory

### Option 2: Using Image Editing Software

1. Create a 512x512 base icon
2. Export at different sizes: 192x192, 512x512, 180x180
3. Ensure icons have proper padding and are square

### Option 3: Command Line (if you have ImageMagick)

```bash
# Convert SVG to PNG at different sizes
convert public/icon.svg -resize 192x192 public/icon-192x192.png
convert public/icon.svg -resize 512x512 public/icon-512x512.png
convert public/icon.svg -resize 180x180 public/apple-touch-icon.png
```

## Testing PWA Functionality

### 1. Build and Deploy

```bash
npm run build
npm start
```

### 2. Test Installation

- Open Chrome DevTools
- Go to Application tab
- Check "Manifest" section
- Verify service worker is registered
- Test "Install" prompt

### 3. Test Offline Functionality

- Open DevTools → Network tab
- Check "Offline" checkbox
- Refresh page - should show cached content
- Test offline page component

### 4. Lighthouse Audit

- Open Chrome DevTools
- Go to Lighthouse tab
- Run audit for "Progressive Web App"
- Should score 90+ for PWA features

## PWA Features

### ✅ Implemented Features:

- **Install Prompt** - Users can install the app
- **Offline Support** - Caches important pages
- **App-like Experience** - Standalone mode
- **Responsive Design** - Works on all devices
- **Fast Loading** - Optimized caching strategy

### 🔄 Future Enhancements:

- Background sync for offline transactions
- Push notifications
- Advanced caching strategies
- Offline-first data management

## Browser Support

- ✅ Chrome/Edge (Full PWA support)
- ✅ Firefox (Full PWA support)
- ✅ Safari (Limited PWA support)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Service Worker Not Registering

- Check browser console for errors
- Ensure HTTPS (required for service workers)
- Clear browser cache and reload

### Install Prompt Not Showing

- Must meet PWA criteria (HTTPS, manifest, service worker)
- Check Lighthouse audit for issues
- Ensure app isn't already installed

### Icons Not Loading

- Verify file paths in manifest.json
- Check file permissions
- Ensure correct image formats

## Deployment Notes

- Deploy to HTTPS (required for PWA)
- Update manifest.json with correct URLs
- Test on multiple devices/browsers
- Monitor service worker performance

Your Money Manager app is now PWA-ready! 🎉
