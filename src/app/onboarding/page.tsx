'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SLIDES = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#33CCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21"/>
        <line x1="9" y1="3" x2="9" y2="18"/>
        <line x1="15" y1="6" x2="15" y2="21"/>
      </svg>
    ),
    bg: 'linear-gradient(135deg, #e0f7f7 0%, #b2eded 100%)',
    title: 'Encontre locais\nbaby-friendly',
    desc: 'Fraldários, microondas, cadeirão e muito mais. Tudo mapeado colaborativamente por pais, mães e cuidadores em viagem.',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#33CCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    bg: 'linear-gradient(135deg, #d4f5f5 0%, #a8e8e8 100%)',
    title: 'Próximos\nde você',
    desc: 'O app detecta sua localização e mostra os melhores locais na rota — postos, restaurantes, hotéis e shoppings.',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#33CCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    bg: 'linear-gradient(135deg, #c8f0f0 0%, #99e0e0 100%)',
    title: 'Check-in e\navaliações',
    desc: 'Com um toque, confirme que um local está ativo e avalie a experiência para ajudar outras famílias e cuidadores na estrada.',
  },
]

function Carrossel({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const slide = SLIDES[step]
  const isLast = step === SLIDES.length - 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '48px 32px 32px' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, marginBottom: 28 }}>
            <img src="/icons/icon-512-store.png" alt="Fora do Ninho" style={{ width: 84, height: 84, objectFit: 'contain', borderRadius: 20 }} />
            <span style={{ fontSize: 22, fontWeight: 800, color: '#1aabab', lineHeight: 1.3 }}>
              Bem-vindo à comunidade<br />Fora do Ninho
            </span>
          </div>
        )}
        {step > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <img src="/icons/icon-512-store.png" alt="Fora do Ninho" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 7 }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#1aabab' }}>Fora do Ninho</span>
          </div>
        )}

        <div style={{
          width: 96, height: 96, borderRadius: 28,
          background: slide.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 32, boxShadow: '0 8px 32px rgba(51,204,204,0.15)',
        }}>
          {slide.icon}
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', lineHeight: 1.25, whiteSpace: 'pre-line', marginBottom: 16 }}>
          {slide.title}
        </h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 300 }}>
          {slide.desc}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
        {SLIDES.map((_, i) => (
          <div key={i} style={{
            height: 4, borderRadius: 2,
            width: i === step ? 22 : 8,
            background: i === step ? '#33CCCC' : 'var(--border)',
            transition: 'all 0.2s',
          }} />
        ))}
      </div>

      <button className="btn-primary" onClick={() => isLast ? onDone() : setStep(s => s + 1)}>
        {isLast ? 'Criar conta ou entrar' : 'Próximo'}
      </button>
      <button className="btn-secondary" onClick={onDone} style={{ marginTop: 4 }}>Pular introdução</button>
    </div>
  )
}

function AuthScreen({ onSkip }: { onSkip: () => void }) {
  const [mode, setMode] = useState<'choose' | 'email'>('choose')
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [error, setError] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleGoogle() {
    setGoogleLoading(true); setError('')
    localStorage.setItem('onboarding_done', '1')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/mapa` },
    })
    if (error) { setError('Erro ao entrar com Google'); setGoogleLoading(false) }
  }

  async function handleEmail() {
    if (!email) { setError('Digite seu email'); return }
    setLoading(true); setError('')
    try {
      if (isLogin) {
        if (password) {
          const { error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) { setError('Email ou senha incorretos'); return }
          localStorage.setItem('onboarding_done', '1')
          router.push('/mapa'); return
        } else {
          const { error } = await supabase.auth.signInWithOtp({ email })
          if (error) { setError('Erro ao enviar link mágico'); return }
          setMagicSent(true); return
        }
      } else {
        if (!password) { setError('Crie uma senha'); return }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/mapa` },
        })
        if (error) { setError(error.message); return }
        setMagicSent(true)
      }
    } finally { setLoading(false) }
  }

  if (magicSent) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 28px', textAlign: 'center' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>📬</div>
      <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Verifique seu email</div>
      <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
        Enviamos um link para <strong>{email}</strong>. Clique nele para acessar o Fora do Ninho.
      </div>
      <button className="btn-secondary" onClick={() => setMagicSent(false)}>Tentar novamente</button>
      <button className="btn-secondary" onClick={onSkip}>Continuar sem conta</button>
    </div>
  )

  const inputStyle: React.CSSProperties = {
    height: 48, padding: '0 14px', borderRadius: 12,
    border: '1.5px solid var(--border)', fontFamily: 'var(--font)',
    fontSize: 14, color: 'var(--text)', background: 'var(--bg-card)',
    outline: 'none', width: '100%',
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px 32px', overflowY: 'auto' }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <img
          src="/icons/icon-512-store.png"
          alt="Fora do Ninho"
          style={{ width: 88, height: 88, objectFit: 'contain', borderRadius: 22, margin: '0 auto 14px', display: 'block' }}
        />
        <div style={{ fontSize: 22, fontWeight: 800 }}>Fora do Ninho</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          {mode === 'email' ? (isLogin ? 'Entrar na sua conta' : 'Criar conta gratuita') : 'Entre para salvar seus locais favoritos'}
        </div>
      </div>

      {mode === 'choose' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Google */}
          <button onClick={handleGoogle} disabled={googleLoading || !termsAccepted}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, height: 50, borderRadius: 14, border: '1.5px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600, color: 'var(--text)', opacity: termsAccepted ? 1 : 0.45 }}>
            {googleLoading
              ? <div style={{ width: 20, height: 20, border: '2px solid var(--border)', borderTopColor: 'var(--text)', borderRadius: '50%' }} />
              : <>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuar com Google
                </>}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>ou use email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* Email */}
          <button onClick={() => setMode('email')} disabled={!termsAccepted}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 50, borderRadius: 14, border: '1.5px solid var(--border)', background: 'var(--bg-card)', cursor: termsAccepted ? 'pointer' : 'not-allowed', fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600, color: 'var(--text)', opacity: termsAccepted ? 1 : 0.45 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Continuar com email
          </button>

          {error && <div style={{ fontSize: 13, color: '#ef4444', textAlign: 'center' }}>{error}</div>}

          {/* Aceite de termos — links inline, sem dropdowns */}
          <label
            onClick={() => setTermsAccepted(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginTop: 8,
              background: termsAccepted ? 'rgba(51,204,204,0.08)' : 'rgba(51,204,204,0.04)',
              border: termsAccepted ? '2px solid #33CCCC' : '2px solid #33CCCC',
              borderRadius: 12, padding: '12px 14px', transition: 'all 0.15s',
            }}
          >
            <div
              style={{
                width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                background: termsAccepted ? '#33CCCC' : 'white',
                border: termsAccepted ? '2px solid #33CCCC' : '2.5px solid #33CCCC',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              {termsAccepted && (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, fontWeight: 500 }}>
              Li e aceito os{' '}
              <Link
                href="/privacidade#termos"
                onClick={e => e.stopPropagation()}
                style={{ color: '#1aabab', fontWeight: 700, textDecoration: 'underline' }}
              >
                Termos de Uso
              </Link>
              {' '}e a{' '}
              <Link
                href="/privacidade"
                onClick={e => e.stopPropagation()}
                style={{ color: '#1aabab', fontWeight: 700, textDecoration: 'underline' }}
              >
                Política de Privacidade
              </Link>
            </span>
          </label>

          <button className="btn-secondary" onClick={onSkip} disabled={!termsAccepted} style={{ marginTop: 4, opacity: termsAccepted ? 1 : 0.45 }}>
            Continuar sem conta
          </button>
        </div>
      )}

      {mode === 'email' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 12, padding: 3, marginBottom: 4 }}>
            {(['Entrar', 'Criar conta'] as const).map((label, i) => (
              <button key={label} onClick={() => setIsLogin(i === 0)}
                style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', background: (i === 0 ? isLogin : !isLogin) ? 'var(--bg-card)' : 'transparent', fontFamily: 'var(--font)', fontSize: 14, fontWeight: 600, color: (i === 0 ? isLogin : !isLogin) ? 'var(--text)' : 'var(--text-muted)', cursor: 'pointer', boxShadow: (i === 0 ? isLogin : !isLogin) ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
                {label}
              </button>
            ))}
          </div>
          <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
          <input type="password" placeholder={isLogin ? 'Senha (opcional — aceita link mágico)' : 'Criar senha'} value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
          {error && <div style={{ fontSize: 13, color: '#ef4444' }}>{error}</div>}
          <button className="btn-primary" onClick={handleEmail} disabled={loading}>
            {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
          </button>
          <button className="btn-secondary" onClick={() => { setMode('choose'); setError('') }}>← Voltar</button>
        </div>
      )}
    </div>
  )
}

export default function OnboardingPage() {
  const [phase, setPhase] = useState<'slides' | 'auth'>('slides')
  const router = useRouter()

  function skipToApp() {
    localStorage.setItem('onboarding_done', '1')
    router.push('/mapa')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font)' }}>
      {phase === 'slides'
        ? <Carrossel onDone={() => setPhase('auth')} />
        : <AuthScreen onSkip={skipToApp} />
      }
    </div>
  )
}
