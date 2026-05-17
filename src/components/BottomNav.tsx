'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const items = [
  {
    href: '/mapa',
    label: 'Mapa',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#4caf85' : '#8e8e8e'}
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    href: '/locais',
    label: 'Explorar',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#4caf85' : '#8e8e8e'}
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    href: '/meus-locais',
    label: 'Meus Locais',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24"
        fill={active ? '#4caf85' : 'none'}
        stroke={active ? '#4caf85' : '#8e8e8e'}
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: '/perfil',
    label: 'Perfil',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#4caf85' : '#8e8e8e'}
        strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const path = usePathname()
  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)
  const ticking = useRef(false)

  useEffect(() => {
    const handleScroll = (e: Event) => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        const target = e.target as HTMLElement
        const currentY = (e.target && e.target !== document && e.target !== window)
          ? (target as HTMLElement).scrollTop ?? window.scrollY
          : window.scrollY
        const diff = currentY - lastScrollY.current
        if (Math.abs(diff) > 6) setVisible(diff < 0)
        lastScrollY.current = currentY
        ticking.current = false
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true })
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true })
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
      document.removeEventListener('scroll', handleScroll, { capture: true })
    }
  }, [])

  useEffect(() => {
    setVisible(true)
    lastScrollY.current = 0
  }, [path])

  // Redireciona /recentes e /favoritos para /meus-locais
  const activePath = (path === '/recentes' || path === '/favoritos') ? '/meus-locais' : path

  return (
    <nav
      className="bottom-nav"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'rgba(255,255,255,0.95)',
      }}
    >
      {items.map((item) => {
        const active = activePath === item.href || (item.href !== '/mapa' && activePath.startsWith(item.href))
        return (
          <Link key={item.href} href={item.href} className="nav-item" style={{ color: active ? '#4caf85' : '#8e8e8e' }}>
            <div style={{
              padding: '6px',
              borderRadius: '12px',
              background: active ? 'rgba(76,175,133,0.12)' : 'transparent',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {item.icon(active)}
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: active ? 700 : 500,
              color: active ? '#4caf85' : '#8e8e8e',
              transition: 'all 0.2s',
            }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
