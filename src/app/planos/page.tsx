'use client'
import { useState } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import AnuncieModal from '@/components/AnuncieModal'

const plans = [
  {
    id: 'gratis',
    name: 'Grátis',
    price: 'R$ 0',
    period: 'para sempre',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    features: [
      'Mapa completo com filtros',
      'Ver todos os locais',
      'Check-in rápido ilimitado',
      'Com anúncios nativos',
    ],
    featured: false,
    cta: 'Plano atual',
    disabled: true,
    badge: null,
  },
]

export default function PlanosPage() {
  const [showAnuncio, setShowAnuncio] = useState(false)

  return (
    <div className="app-shell">
      <div className="page">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 20px' }}>
          <Link href="/perfil" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', textDecoration: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>Escolha seu plano</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 16px 24px' }}>
          {plans.map((plan) => (
            <div key={plan.id} className={`plan-card${plan.featured ? ' featured' : ''}`}>
              {plan.badge && <div className="plan-badge">{plan.badge}</div>}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {plan.icon}
                <div className="plan-name">{plan.name}</div>
              </div>

              <div className="plan-price">
                {plan.price}
                {plan.price !== 'R$ 0' && <span>/mês</span>}
              </div>
              <div className="plan-period">{plan.period}</div>

              <ul className="plan-features">
                {plan.features.map((f, i) => (
                  <li key={i}>
                    <svg className="check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className="btn-primary"
                style={{ marginTop: 16, opacity: plan.disabled ? 0.5 : 1, cursor: plan.disabled ? 'default' : 'pointer' }}
                disabled={plan.disabled}
              >
                {plan.cta}
              </button>
            </div>
          ))}

          {/* Card Anuncie */}
          <div
            onClick={() => setShowAnuncio(true)}
            className="plan-card"
            style={{ borderColor: '#a78bfa', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(124,58,237,0.12)' }}>
                <span style={{ fontSize: 22 }}>👩‍⚕️</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#5b21b6', marginBottom: 2 }}>Anuncie seu serviço</div>
                <div style={{ fontSize: 13, color: '#7c3aed', lineHeight: 1.4 }}>Doula, consultora, pediatra e mais — alcance famílias e cuidadores na sua cidade</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </div>

            <button
              className="btn-primary"
              style={{ background: '#7c3aed', width: '100%', pointerEvents: 'none' }}
            >
              Saber mais sobre o cadastro
            </button>
          </div>
        </div>
      </div>

      {showAnuncio && <AnuncieModal onClose={() => setShowAnuncio(false)} />}

      <BottomNav />
    </div>
  )
}
