import { readFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const svgRegular   = readFileSync(join(root, 'public/icons/source.svg'))
const svgMaskable  = readFileSync(join(root, 'public/icons/source-maskable.svg'))

mkdirSync(join(root, 'public/icons'), { recursive: true })

const tasks = [
  // Standard icons
  { src: svgRegular,  size: 192, out: 'public/icons/icon-192.png' },
  { src: svgRegular,  size: 512, out: 'public/icons/icon-512.png' },
  // Maskable icons (safe zone already baked into SVG)
  { src: svgMaskable, size: 192, out: 'public/icons/icon-maskable-192.png' },
  { src: svgMaskable, size: 512, out: 'public/icons/icon-maskable-512.png' },
  // Apple touch icon
  { src: svgRegular,  size: 180, out: 'public/apple-touch-icon.png' },
  // Next.js file-convention apple icon
  { src: svgRegular,  size: 180, out: 'app/apple-icon.png' },
  // Browser favicon (PNG fallback)
  { src: svgRegular,  size: 32,  out: 'public/favicon-32.png' },
]

await Promise.all(
  tasks.map(({ src, size, out }) =>
    sharp(src)
      .resize(size, size)
      .png()
      .toFile(join(root, out))
      .then(() => console.log(`✓ ${out}`))
  )
)

console.log('\nAll icons generated.')
