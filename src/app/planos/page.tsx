'use client'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'

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
      'Adicionar 1 local/mês',
      'Com anúncios nativos',
    ],
    featured: false,
    cta: 'Plano atual',
    disabled: true,
  },
  {
    id: 'viajante',
    name: 'Viajante',
    price: 'R$ 14,90',
    period: '/mês ou R$ 99/ano',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#e8b84b" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    features: [
      'Tudo do Grátis',
      'Mapa offline por rota',
      'Planejador de rota baby-friendly',
      'Alertas "parada próxima" na rota',
      'Adicionar locais ilimitado',
      'Sem anúncios',
    ],
    featured: true,
    cta: 'Assinar Viajante',
    disabled: false,
  },
  {
    id: 'familia_pro',
    name: 'Família Pro',
    price: 'R$ 24,90',
    period: '/mês ou R$ 179/ano',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    features: [
      'Tudo do Viajante',
      'Até 6 perfis por conta',
      'Histórico de viagens da família',
      'Sugestões personalizadas por idade',
      'Modo viagem em grupo',
      'Suporte prioritário',
    ],
    featured: false,
    cta: 'Assinar Família Pro',
    disabled: false,
  },
]

export default function PlanosPage() {
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
              {plan.featured && <div className="plan-badge">Popular</div>}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {plan.icon}
                <div className="plan-name">{plan.name}</div>
              </div>

              <div className="plan-price">
                {plan.price}
                {plan.price !== 'R$ 0' && <span>/mês</span>}
              </div>
              {plan.price === 'R$ 0'
                ? <div className="plan-period">para sempre</div>
                : <div className="plan-period">{plan.period}</div>
              }

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
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
