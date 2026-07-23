'use client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

const LandingMapPreview = dynamic(() => import('./LandingMapPreview'), { ssr: false })

const DORES = [
  {
    icon: '🚪',
    title: 'Fraldário fechado ou inexistente',
    desc: 'Chegar num posto, restaurante ou shopping e descobrir que não tem onde trocar o bebê — ou que o espaço está sujo e sem estrutura.',
  },
  {
    icon: '🍼',
    title: 'Sem lugar pra amamentar com conforto',
    desc: 'Precisar amamentar ou esquentar a mamadeira em qualquer canto, sem privacidade e sem acolhimento.',
  },
  {
    icon: '🔍',
    title: 'Profissional de confiança é difícil de achar',
    desc: 'Procurar consultoras de amamentação, doulas ou pediatras que realmente entendam a fase e acolham sem julgamento.',
  },
  {
    icon: '💬',
    title: 'Informação espalhada em grupos de WhatsApp',
    desc: 'Indicações soltas, desatualizadas ou genéricas — sem saber se aquele lugar é mesmo preparado para crianças pequenas.',
  },
]

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
          <h1>Encontre locais baby-friendly em todas as cidades do Brasil</h1>
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
            <div className="landing-hero-visual-map">
              <LandingMapPreview />
            </div>
            <div className="landing-hero-icon-badge">
              <img src="/icons/icon-512-store.png" alt="" style={{ width: 64, height: 64, objectFit: 'contain', borderRadius: 16 }} />
            </div>
            <span className="landing-hero-chip" style={{ top: '12%', left: '-6%' }}>🚼 Fraldário</span>
            <span className="landing-hero-chip" style={{ bottom: '18%', right: '-8%' }}>⭐ 4.8</span>
            <span className="landing-hero-chip" style={{ bottom: '6%', left: '4%' }}>🍽️ Microondas</span>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-eyebrow">A dor que a gente conhece</span>
          <h2>Viajar ou sair de casa com bebê não devia ser um desafio de logística</h2>
          <p>
            Quem já cuidou de um bebê fora de casa conhece essas cenas. O Fora do Ninho nasceu para
            resolver exatamente isso.
          </p>
        </div>
        <div className="landing-pain-grid">
          {DORES.map((d) => (
            <div className="landing-pain-item" key={d.title}>
              <div className="landing-pain-icon">{d.icon}</div>
              <div>
                <strong>{d.title}</strong>
                <span>{d.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="landing-community-banner">
          <h3>Uma comunidade de pais, mães e cuidadores que se ajudam mutuamente</h3>
          <p>
            Cada local, cada avaliação e cada dica vem de quem já passou por ali — não é uma lista genérica,
            é gente cuidando de gente. Quanto mais famílias usam, mais forte a comunidade fica para todo mundo.
          </p>
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

      <section className="landing-section">
        <div className="landing-pro-section">
          <h2>É profissional e ajuda mamães e bebês?</h2>
          <p>
            Consultoras de amamentação, doulas, pediatras e outros profissionais da primeira infância podem
            criar um perfil gratuito e ser encontrados por famílias da sua região. Seja encontrada pela
            comunidade que mais cresce no Brasil.
          </p>
          <Link href="/cadastro-profissional" className="btn-pro-cta">Cadastrar meu serviço</Link>
        </div>
      </section>

      <footer className="landing-footer">
        © {new Date().getFullYear()} Fora do Ninho —{' '}
        <Link href="/privacidade">Privacidade</Link>
        <Link href="/privacidade#termos">Termos de Uso</Link>
      </footer>
    </div>
  )
}
