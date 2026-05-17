import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Fora do Ninho',
  description: 'Encontre fraldários, microondas e locais baby-friendly em qualquer estrada do Brasil.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Fora do Ninho',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: 'Fora do Ninho',
    description: 'Locais baby-friendly em qualquer 