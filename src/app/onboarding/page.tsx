'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SLIDES = [
  {
    emoji: '🗺️',
    bg: 'linear-gradient(135deg, #e8f5ef 0%, #d1f0e0 100%)',
    title: 'Encontre locais\nbaby-friendly',
    desc: 'Fraldários, microondas, cadeirão e muito mais. Tudo mapeado colaborativamente por pais, mães e cuidadores em viagem.',
  },
  {
    emoji: '📍',
    bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    title: 'Próximos\nde você',
    desc: 'O app detecta sua localização e mostra os melhores locais na rota — postos, restaurantes, hotéis e shoppings.',
  },
  {
    emoji: '✅',
    bg: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
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
        <div style={{ width: 96, height: 96, borderRadius: 28, background: slide.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, marginBottom: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          {slide.emoji}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
          <svg width="16" height="21" viewBox="0 0 24 32" fill="none">
            <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 16 9 16s9-9.25 9-16c0-4.97-4.03-9-9-9z" fill="#4caf85" stroke="white" strokeWidth="1"/>
            <circle cx="12" cy="9" r="3" fill="white" opacity="0.9"/>
          </svg>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)' }}>Fora do Ninho</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', lineHeight: 1.25, whiteSpace: 'pre-line', marginBottom: 16 }}>{slide.title}</h1>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 300 }}>{slide.desc}</p>
      </div>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 28 }}>
        {SLIDES.map((_, i) => (
          <div key={i} style={{ height: 4, borderRadius: 2, width: i === step ? 22 : 8, background: i === step ? 'var(--green)' : 'var(--border)', transition: 'all 0.2s' }} />
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
  const [facebookLoading, setFacebookLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [error, setError] = useState('')
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

  async function handleFacebook() {
    setFacebookLoading(true); setError('')
    localStorage.setItem('onboarding_done', '1')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/mapa` },
    })
    if (error) { setError('Erro ao entrar com Facebook'); setFacebookLoading(false) }
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
        const { error } = await supabase.auth.signUp({ email, password })
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
        Enviamos um link para <strong>{email}</strong>. Clique nele para acessar o PitStop Baby.
      </div>
      <button className="btn-secondary" onClick={() => setMagicSent(false)}>Tentar novamente</button>
      <button className="btn-secondary" onClick={onSkip}>Continuar sem conta</button>
    </div>
  )

  const inputStyle: React.CSSProperties = { height: 48, padding: '0 14px', borderRadius: 12, border: '1.5px solid var(--border)', fontFamily: 'var(--font)', fontSize: 14, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', width: '100%' }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px 32px', overflowY: 'auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ width: 64, height: 64, background: 'var(--green-soft)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <svg width="28" height="37" viewBox="0 0 24 32" fill="none">
            <path d="M12 0C7.03 0 3 4.03 3 9c0 6.75 9 16 9 16s9-9.25 9-16c0-4.97-4.03-9-9-9z" fill="#4caf85" stroke="white" strokeWidth="1.2"/>
            <circle cx="12" cy="9" r="3.5" fill="white" opacity="0.9"/>
          </svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>PitStop Baby</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          {mode === 'email' ? (isLogin ? 'Entrar na sua conta' : 'Criar conta gratuita') : 'Entre para salvar seus locais favoritos'}
        </div>
      </div>

      {mode === 'choose' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button onClick={handleGoogle} disabled={googleLoading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, height: 50, borderRadius: 14, border: '1.5px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
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

          <button onClick={handleFacebook} disabled={facebookLoading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, height: 50, borderRadius: 14, border: 'none', background: '#1877F2', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600, color: 'white' }}>
            {facebookLoading
              ? <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }} />
              : <>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continuar com Facebook
                </>}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>ou use email</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          <button onClick={() => setMode('email')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: 50, borderRadius: 14, border: '1.5px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Continuar com email
          </button>

          {error && <div style={{ fontSize: 13, color: '#ef4444', textAlign: 'center' }}>{error}</div>}
          <button className="btn-secondary" onClick={onSkip} style={{ marginTop: 4 }}>Continuar sem conta</button>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
            Ao continuar, você concorda com os <span style={{ color: 'var(--green-dark)', fontWeight: 600 }}>Termos de Uso</span> e a <span style={{ color: 'var(--green-dark)', fontWeight: 600 }}>Política de Privacidade</span>.
          </div>
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
