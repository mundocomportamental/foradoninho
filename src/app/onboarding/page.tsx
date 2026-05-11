'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const slides = [
  {
    title: 'Bem-vindos, famílias\nviajantes!',
    desc: 'Encontre fraldários, microondas e locais baby-friendly em qualquer estrada do Brasil.',
    icon: 'baby',
  },
  {
    title: 'Offline na estrada',
    desc: 'Baixe os locais da sua rota antes de sair. O app funciona sem internet — mesmo nos trechos sem sinal do interior.',
    icon: 'download',
  },
  {
    title: 'Check-in rápido',
    desc: 'Esteve num local? Um toque confirma que ainda está ativo. Ajude outras famílias sem precisar digitar nada.',
    icon: 'check',
  },
]

function IconBaby() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="15" r="8" stroke="#4caf85" strokeWidth="2.2" fill="none"/>
      <path d="M10 34c0-5.52 4.48-10 10-10s10 4.48 10 10" stroke="#4caf85" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <circle cx="17" cy="14" r="1.2" fill="#4caf85"/>
      <circle cx="23" cy="14" r="1.2" fill="#4caf85"/>
      <path d="M17 18.5s1.2 2 3 2 3-2 3-2" stroke="#4caf85" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
    </svg>
  )
}

function IconDownload() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 6v22M12 21l8 9 8-9" stroke="#4caf85" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 32h24" stroke="#4caf85" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  )
}

function IconCheck() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="13" stroke="#4caf85" strokeWidth="2.2" fill="none"/>
      <path d="M13 20l5 5 9-10" stroke="#4caf85" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const ICONS = {
  baby: <IconBaby />,
  download: <IconDownload />,
  check: <IconCheck />,
}

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const router = useRouter()
  const slide = slides[step]

  function next() {
    if (step < slides.length - 1) {
      setStep(step + 1)
    } else {
      finish()
    }
  }

  function finish() {
    localStorage.setItem('onboarding_done', '1')
    router.push('/mapa')
  }

  return (
    <div className="onboarding">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="icon-box">
          {ICONS[slide.icon as keyof typeof ICONS]}
        </div>
        <h1 style={{ whiteSpace: 'pre-line' }}>{slide.title}</h1>
        <p>{slide.desc}</p>
      </div>

      <div className="dots">
        {slides.map((_, i) => (
          <div key={i} className={`dot${i === step ? ' active' : ''}`} />
        ))}
      </div>

      <div className="onboarding-actions">
        <button className="btn-primary" onClick={next}>
          Próximo
        </button>
        <button className="btn-secondary" onClick={finish}>
          Agora não
        </button>
      </div>
    </div>
  )
}
