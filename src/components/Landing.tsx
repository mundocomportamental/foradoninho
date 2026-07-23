'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const FEATURES = [
  {
    bg: 'linear-gradient(135deg, #e0f7f7 0%, #b2eded 100%)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1aabab" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
    ),
    title: 'Locais baby-friendly',
    desc: 'Fraldários, microondas, cadeirão e muito mais — mapeado colaborativamente por quem já passou por ali.',
  },
  {
    bg: 'linear-gradient(135deg, #d4f5f5 0%, #a8e8e8 100%)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1aabab" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Perto de você',
    desc: 'O app detecta sua localização e mostra os melhores locais na rota — postos, restaurantes, hotéis e shoppings.',
  },
  {
    bg: 'linear-gradient(135deg, #c8f0f0 0%, #99e0e0 100%)',
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1aabab" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'Check-in e avaliações',
    desc: 'Com um toque, confirme que um local está ativo e avalie a experiência para ajudar outras famílias na estrada.',
  },
]

export default function Landing() {
  const router = useRouter()

  function goAuth(type: 'login' | 'signup') {
    router.push(`/onboarding?auth=${type}`)
  }

  function goMap() {
    try {
      localStorage.setItem('onboarding_done', '1')
    } catch {}
    router.push('/mapa')
  }

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo">
          <img src="/icons/icon-512-store.png" alt="Fora do Ninho" />
          Fora do Ninho
        </div>
        <div className="landing-header-actions">
          <button className="btn-login" onClick={() => goAuth('login')}>Entrar</button>
          <button className="btn-signup" onClick={() => goAuth('signup')}>Criar conta</button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-text">
          <span className="landing-hero-badge">🍼 Feito por e para famílias viajantes</span>
          <h1>Encontre locais baby-friendly em qualquer estrada do Brasil</h1>
          <p>
            Fraldários, microondas, espaço kids e profissionais como consultoras de amamentação e pediatras —
            tudo mapeado colaborativamente por pais, mães e cuidadores em viagem.
          </p>
          <div className="landing-hero-actions">
            <button className="btn-hero-primary" onClick={goMap}>Ver o mapa</button>
            <button className="btn-hero-secondary" onClick={() => goAuth('signup')}>Criar conta grátis</button>
          </div>
        </div>

        <div className="landing-hero-visual" aria-hidden="true">
          <div className="landing-hero-visual-box">
            <img src="/icons/icon-512-store.png" alt="" style={{ width: 96, height: 96, objectFit: 'contain', borderRadius: 22 }} />
            <span className="landing-hero-chip" style={{ top: '12%', left: '-6%' }}>🚼 Fraldário</span>
            <span className="landing-hero-chip" style={{ bottom: '18%', right: '-8%' }}>⭐ 4.8</span>
            <span className="landing-hero-chip" style={{ bottom: '6%', left: '4%' }}>🍽️ Microondas</span>
          </div>
        </div>
      </section>

      <section className="landing-features">
        {FEATURES.map((f) => (
          <div className="landing-feature-card" key={f.title}>
            <div className="landing-feature-icon" style={{ background: f.bg }}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} Fora do Ninho —{' '}
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/privacidade#termos">Termos de Uso</Link>
      </footer>
    </div>
  )
}
