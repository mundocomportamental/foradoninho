import sharp from 'sharp'

const SOURCE = 'public/icon-512.png'
const BG = '#ffffff' // var(--bg-card) do design system

async function run() {
  await sharp(SOURCE).resize(192, 192).png().toFile('public/pwa-192x192.png')
  await sharp(SOURCE).resize(512, 512).png().toFile('public/pwa-512x512.png')

  // Maskable: ~10% de padding em cada borda (ícone ocupa ~80% da área segura)
  const inner = Math.round(512 * 0.8)
  const padded = await sharp(SOURCE)
    .resize(inner, inner)
    .extend({
      top: Math.round((512 - inner) / 2),
      bottom: Math.round((512 - inner) / 2),
      left: Math.round((512 - inner) / 2),
      right: Math.round((512 - inner) / 2),
      background: BG,
    })
    .png()
    .toFile('public/pwa-maskable-512x512.png')

  // Apple touch icon: sem transparência (iOS ignora alpha e pode renderizar preto)
  await sharp(SOURCE)
    .resize(180, 180)
    .flatten({ background: BG })
    .png()
    .toFile('public/apple-touch-icon.png')

  console.log('Ícones gerados:', padded)
}

run()
