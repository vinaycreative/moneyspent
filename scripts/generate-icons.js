const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  const svgPath = path.join(__dirname, '../public/icon.svg');
  const outputDir = path.join(__dirname, '../public');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const sizes = [
    { name: 'icon-192x192.png', size: 192 },
    { name: 'icon-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 }
  ];

  console.log('Generating PWA icons...');

  for (const icon of sizes) {
    try {
      await sharp(svgPath)
        .resize(icon.size, icon.size)
        .png()
        .toFile(path.join(outputDir, icon.name));
      
      console.log(`✅ Generated ${icon.name}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${icon.name}:`, error);
    }
  }

  console.log('🎉 Icon generation complete!');
}

generateIcons().catch(console.error); 