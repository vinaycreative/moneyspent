#!/usr/bin/env node

/**
 * Script to clear service worker caches and help with deployment issues
 * Run this script after deploying new changes to clear old caches
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Clearing Service Worker Caches...\n');

// Function to clear service worker caches
async function clearServiceWorkerCaches() {
  try {
    // This will be executed in the browser context
    const clearCacheScript = `
      if ('serviceWorker' in navigator) {
        // Clear all caches
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            return Promise.all(
              cacheNames.map(cacheName => {
                console.log('🗑️ Deleting cache:', cacheName);
                return caches.delete(cacheName);
              })
            );
          }).then(() => {
            console.log('✅ All caches cleared successfully');
          });
        }
        
        // Unregister service worker
        navigator.serviceWorker.getRegistrations().then(registrations => {
          return Promise.all(
            registrations.map(registration => {
              console.log('🔄 Unregistering service worker');
              return registration.unregister();
            })
          );
        }).then(() => {
          console.log('✅ Service worker unregistered successfully');
          // Reload the page to get fresh content
          window.location.reload();
        });
      }
    `;

    // Create a temporary HTML file to execute the script
    const tempHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Clear SW Cache</title>
        </head>
        <body>
          <h1>Clearing Service Worker Caches...</h1>
          <p>This page will automatically reload after clearing caches.</p>
          <script>
            ${clearCacheScript}
          </script>
        </body>
      </html>
    `;

    const tempFile = path.join(__dirname, '../public/clear-cache.html');
    fs.writeFileSync(tempFile, tempHtml);
    
    console.log('📄 Created temporary cache clearing page at: /clear-cache.html');
    console.log('🌐 Open this URL in your browser to clear caches:');
    console.log(`   http://localhost:3000/clear-cache.html`);
    console.log('\n💡 After clearing caches, you can delete the temporary file.');
    
  } catch (error) {
    console.error('❌ Error creating cache clearing script:', error);
  }
}

// Function to update service worker version
function updateServiceWorkerVersion() {
  try {
    const swPath = path.join(__dirname, '../public/sw.js');
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    // Extract current version
    const versionMatch = swContent.match(/const CACHE_VERSION = "([^"]+)"/);
    if (versionMatch) {
      const currentVersion = versionMatch[1];
      const versionParts = currentVersion.split('.');
      const newPatch = parseInt(versionParts[2]) + 1;
      const newVersion = `${versionParts[0]}.${versionParts[1]}.${newPatch}`;
      
      // Update version in service worker
      const updatedContent = swContent.replace(
        /const CACHE_VERSION = "[^"]+"/,
        `const CACHE_VERSION = "${newVersion}"`
      );
      
      fs.writeFileSync(swPath, updatedContent);
      console.log(`🔄 Updated service worker version from ${currentVersion} to ${newVersion}`);
    }
  } catch (error) {
    console.error('❌ Error updating service worker version:', error);
  }
}

// Main execution
async function main() {
  console.log('🚀 Service Worker Cache Management Tool\n');
  
  // Update service worker version
  updateServiceWorkerVersion();
  
  // Create cache clearing page
  await clearServiceWorkerCaches();
  
  console.log('\n✨ Done! Your service worker is ready for deployment.');
  console.log('\n📋 Next steps:');
  console.log('1. Deploy your changes');
  console.log('2. Visit /clear-cache.html to clear old caches');
  console.log('3. Delete the temporary clear-cache.html file');
  console.log('4. Test your application');
}

main().catch(console.error);
