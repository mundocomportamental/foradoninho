import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PitStop Baby',
  description: 'Encontre produtos para bebê nas paradas da estrada',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
