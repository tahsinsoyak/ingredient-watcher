import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../public/icons');

const sizes = [16, 32, 48, 128];

const leafSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#16a34a"/>
    </linearGradient>
    <linearGradient id="leaf" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#dcfce7"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#bg)"/>
  <g transform="translate(${size * 0.18}, ${size * 0.14}) scale(${size / 24})">
    <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" fill="url(#leaf)" opacity="0.95"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="url(#leaf)" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/>
  </g>
</svg>`;

async function generateIcons() {
  for (const size of sizes) {
    const svg = leafSvg(size);
    const outputPath = resolve(outDir, `icon${size}.png`);
    
    await sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`Generated ${outputPath} (${size}x${size})`);
  }
  
  console.log('All icons generated!');
}

generateIcons().catch(console.error);
