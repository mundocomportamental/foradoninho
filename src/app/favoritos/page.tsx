'use client'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import type { Local } from '@/lib/types'

export default function FavoritosPage() {
  const [favoritos, setFavoritos] = useState<Local[]>([])

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('favoritos') || '[]')
      setFavoritos(data)
    } catch {
      setFavoritos([])
    }
  }, [])

  function removeFav(id: string) {
    const updated = favoritos.filter(f => f.id !== id)
    setFavoritos(updated)
    localStorage.setItem('favoritos', JSON.stringify(updated))
  }

  return (
    <div className="app-shell">
      <div className="page">
        <div className="page-header">
          <div className="page-title">Favoritos</div>
          <div className="page-subtitle">Locais que você salvou</div>
        </div>

        {favoritos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <div className="empty-title">Nenhum favorito salvo</div>
            <div className="empty-desc">
              Toque no <span style={{ color: 'var(--text-secondary)' }}>♡</span> em um local para salvá-lo
            </div>
            <Link href="/mapa" className="empty-link">Explorar o mapa</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' }}>
            {favoritos.map((local) => (
              <div key={local.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link href={`/local/${local.id}`} className="recent-item" style={{ flex: 1 }}>
                  <div className="recent-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#4caf85" stroke="#4caf85" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {local.nome}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {local.cidade}, {local.estado}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13 }}>
                    <span style={{ color: '#f5a623' }}>★</span>
                    <span style={{ fontWeight: 600, color: 'var(--text)' }}>{Number(local.rating).toFixed(1)}</span>
                  </div>
                </Link>
                <button
                  onClick={() => removeFav(local.id)}
                  style={{ width: 32, height: 32, border: '1px solid var(--border)', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
