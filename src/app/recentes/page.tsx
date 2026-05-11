'use client'
import { useState, useEffect } from 'react'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import type { Local } from '@/lib/types'
import { TIPO_LABELS } from '@/lib/types'

function timeAgo(dateStr: string) {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora mesmo'
  if (min < 60) return `${min}m atrás`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h atrás`
  return `${Math.floor(hr / 24)}d atrás`
}

export default function RecentesPage() {
  const [recentes, setRecentes] = useState<(Local & { visitedAt?: string })[]>([])

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem('recentes') || '[]')
      setRecentes(data)
    } catch {
      setRecentes([])
    }
  }, [])

  return (
    <div className="app-shell">
      <div className="page">
        <div className="page-header">
          <div className="page-title">Recentes</div>
          <div className="page-subtitle">Locais que você visitou recentemente</div>
        </div>

        {recentes.length === 0 ? (
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
        )}
      </div>
      <BottomNav />
    </div>
  )
}
