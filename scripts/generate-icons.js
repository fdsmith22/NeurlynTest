const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure icons directory exists
const iconsDir = path.join(__dirname, '..', 'assets', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create base SVG icon
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6C9E83;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#5A8970;stop-opacity:1" />
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="512" height="512" rx="102" fill="url(#bg-gradient)"/>
  <!-- White circle -->
  <circle cx="256" cy="256" r="180" fill="rgba(255,255,255,0.95)"/>
  <!-- Letter N -->
  <text x="256" y="256" font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
        font-size="240" font-weight="bold" fill="#6C9E83"
        text-anchor="middle" dominant-baseline="central">N</text>
</svg>
`;

// Generate icons
async function generateIcons() {
  // console.log('Generating Neurlyn icons...');

  // Create base icon from SVG
  const svgBuffer = Buffer.from(svgIcon);

  // Generate each size
  for (const size of sizes) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
      // console.log(`✓ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`Error generating ${size}x${size} icon:`, error);
    }
  }

  // Generate favicon (32x32)
  try {
    await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(iconsDir, 'favicon.png'));
    // console.log('✓ Generated favicon.png');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }

  // Generate apple-touch-icon (180x180)
  try {
    await sharp(svgBuffer)
      .resize(180, 180)
      .png()
      .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
    // console.log('✓ Generated apple-touch-icon.png');
  } catch (error) {
    console.error('Error generating apple-touch-icon:', error);
  }

  // Save the SVG as well
  fs.writeFileSync(path.join(iconsDir, 'favicon.svg'), svgIcon);
  // console.log('✓ Generated favicon.svg');

  // console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
