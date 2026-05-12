'use client'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import type { Local } from '@/lib/types'

function timeAgo(dateStr: string) {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  if (isNaN(date)) return 'recente'
  const diff = now - date
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora mesmo'
  if (min < 60) return `${min}m atrás`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h atrás`
  return `${Math.floor(hr / 24)}d atrás`
}

export default function MeusLocaisPage() {
  const [tab, setTab] = useState<'recentes' | 'favoritos'>('recentes')
  const [recentes, setRecentes] = useState<(Local & { visitedAt?: string })[]>([])
  const [favoritos, setFavoritos] = useState<Local[]>([])

  useEffect(() => {
    try {
      setRecentes(JSON.parse(localStorage.getItem('recentes') || '[]'))
      setFavoritos(JSON.parse(localStorage.getItem('favoritos') || '[]'))
    } catch {}
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
          <div className="page-title">Meus Locais</div>
          <div className="page-subtitle">Recentes e favoritos salvos</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px' }}>
          {(['recentes', 'favoritos'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '10px 0',
                borderRadius: 50,
                border: tab === t ? '2px solid var(--green)' : '1.5px solid var(--border)',
                background: tab === t ? 'var(--green-soft)' : 'var(--bg-card)',
                color: tab === t ? 'var(--green-dark)' : 'var(--text-muted)',
                fontFamily: 'var(--font)',
                fontSize: 14,
                fontWeight: tab === t ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {t === 'recentes' ? '🕐 Recentes' : '♡ Favoritos'}
            </button>
          ))}
        </div>

        {/* Recentes */}
        {tab === 'recentes' && (
          recentes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9"/><polyline points="12,7 12,12 15,15"/>
                </svg>
              </div>
              <div className="empty-title">Nenhum local visitado</div>
              <div className="empty-desc">Explore o mapa e toque em um local para ver os detalhes.</div>
              <Link href="/mapa" className="empty-link">Explorar o mapa</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' }}>
              {recentes.map((local) => (
                <Link key={local.id} href={`/local/${local.id}`} className="recent-item">
                  <div className="recent-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4caf85" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="2.5"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {local.nome}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {local.endereco || local.cidade}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                    {local.visitedAt ? timeAgo(local.visitedAt) : 'recente'}
                  </div>
                </Link>
              ))}
            </div>
          )
        )}

        {/* Favoritos */}
        {tab === 'favoritos' && (
          favoritos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <div className="empty-title">Nenhum favorito salvo</div>
              <div className="empty-desc">Toque no ♡ em um local para salvá-lo aqui.</div>
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
          )
        )}
      </div>
      <BottomNav />
    </div>
  )
}
