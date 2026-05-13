'use client'
import { useState } from 'react'
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
      'Com anúncios nativos',
    ],
    featured: false,
    cta: 'Plano atual',
    disabled: true,
    badge: null,
  },
]

type Package = { name: string; price: string; features: string[] }

const anunciePackages: Package[] = [
  {
    name: 'Plano Profissional',
    price: 'R$ 89,00/mês',
    features: [
      'Pin no mapa com sua localização',
      'Descrição completa do serviço',
      'Fotos do profissional/espaço',
      'Informações de contato visíveis',
    ],
  },
]

export default function PlanosPage() {
  const [showAnuncieModal, setShowAnuncieModal] = useState(false)

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

          {/* Card "Anuncie seu serviço" */}
          <div className="plan-card" style={{ borderColor: '#a78bfa', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              <div className="plan-name" style={{ color: '#5b21b6' }}>Anuncie seu serviço aqui</div>
            </div>

            <p style={{ fontSize: 14, color: '#6d28d9', lineHeight: 1.5, marginBottom: 16 }}>
              Para consultoras de amamentação, doulas, pediatras e outros profissionais de serviços infantis. Inclua seu pin no mapa e seja encontrado pelas famílias.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {['Consultoras', 'Doulas', 'Pediatras', 'Fisioterapeutas', 'Fonoaudiólogas'].map(tag => (
                <span key={tag} style={{ background: 'rgba(124,58,237,0.12)', color: '#6d28d9', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                  {tag}
                </span>
              ))}
            </div>

            <button
              className="btn-primary"
              style={{ background: '#7c3aed' }}
              onClick={() => setShowAnuncieModal(true)}
            >
              Ver pacotes
            </button>
          </div>
        </div>
      </div>

      {/* Modal pacotes anunciante */}
      {showAnuncieModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setShowAnuncieModal(false) }}
        >
          <div style={{ background: 'var(--bg-card)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: '24px 20px 40px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Escolha seu pacote</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>
              Inclua seu serviço no mapa do Fora do Ninho e seja encontrado pelas famílias em viagem.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {anunciePackages.map((pkg) => (
                <div key={pkg.name} style={{
                  background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)',
                  border: '2px solid #a78bfa',
                  borderRadius: 16,
                  padding: '18px 16px',
                  position: 'relative',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#5b21b6' }}>
                      {pkg.name}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>
                      {pkg.price}
                    </div>
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {pkg.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    className="btn-primary"
                    style={{ marginTop: 14, background: '#7c3aed' }}
                    onClick={() => alert('Em breve! Entre em contato via perfil para mais informações.')}
                  >
                    Quero o {pkg.name}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAnuncieModal(false)}
              style={{ width: '100%', marginTop: 16, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', padding: 12, fontFamily: 'var(--font)' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
