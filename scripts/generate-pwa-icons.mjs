import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

// Master brand mark: navy rounded-square background, white heart
// (same path used across the app's auth/sidebar heart icon, scaled
// and centered) with a green heartbeat line through it.
const ICON_SVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="120" fill="#1E40AF"/>
  <g transform="translate(98,85) scale(14.35)">
    <path
      fill="#ffffff"
      d="M12 21s-6.716-4.35-9.428-8.243C.29 9.516 1.13 5.6 4.5 4.257c2.02-.805 4.14-.09 5.5 1.53C11.36 4.167 13.48 3.452 15.5 4.257c3.37 1.343 4.21 5.259 1.928 8.5C18.716 16.65 12 21 12 21z"
    />
  </g>
  <polyline
    points="120,272 182,272 207,222 242,322 272,242 302,272 392,272"
    fill="none"
    stroke="#10B981"
    stroke-width="15"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
`.trim()

const rootDir = path.resolve(import.meta.dirname, '..')
const publicDir = path.join(rootDir, 'public')
const iconsDir = path.join(publicDir, 'icons')
const appDir = path.join(rootDir, 'app')

fs.mkdirSync(iconsDir, { recursive: true })

const svgBuffer = Buffer.from(ICON_SVG)

// Source-of-truth SVG (also embedded inline in components/ui/Logo.tsx)
fs.writeFileSync(path.join(publicDir, 'brand-icon.svg'), ICON_SVG)

const targets = [
  { file: path.join(iconsDir, 'icon-192.png'), size: 192 },
  { file: path.join(iconsDir, 'icon-512.png'), size: 512 },
  { file: path.join(iconsDir, 'icon-512-maskable.png'), size: 512 },
  { file: path.join(iconsDir, 'apple-touch-icon.png'), size: 180 },
]

for (const { file, size } of targets) {
  await sharp(svgBuffer).resize(size, size).png().toFile(file)
  console.log(`Wrote ${path.relative(rootDir, file)} (${size}x${size})`)
}

fs.copyFileSync(path.join(publicDir, 'brand-icon.svg'), path.join(appDir, 'icon.svg'))
console.log('Wrote app/icon.svg')
