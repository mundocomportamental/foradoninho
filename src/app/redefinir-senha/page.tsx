'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RedefinirSenhaPage() {
  const [checking, setChecking] = useState(true)
  const [hasSession, setHasSession] = useState(false)
  const [tokenHash, setTokenHash] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hash = params.get('token_hash')
    if (hash && params.get('type') === 'recovery') {
      // Fluxo novo (token_hash): só confirma a sessão quando a pessoa clicar
      // no botão "Confirmar e continuar" — isso evita que scanners de
      // segurança de e-mail (comuns em contas Outlook/Microsoft 365) gastem
      // o link sozinhos ao pré-visitá-lo automaticamente antes do clique real.
      setTokenHash(hash)
      setChecking(false)
      return
    }
    // Fluxo antigo (?code=), mantido por compatibilidade com links de reset
    // já enviados antes desta mudança de template.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session)
      setChecking(false)
    })
  }, [supabase])

  async function handleConfirmLink() {
    if (!tokenHash) return
    setVerifying(true)
    setVerifyError(false)
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' })
    setVerifying(false)
    if (error) { setVerifyError(true); return }
    setHasSession(true)
  }

  async function handleSubmit() {
    if (password.length < 6) { setError('A senha precisa ter pelo menos 6 caracteres'); return }
    if (password !== confirmPassword) { setError('As senhas não coincidem'); return }
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) { setError('Não foi possível atualizar sua senha. Tente pedir um novo link.'); return }
      setDone(true)
      setTimeout(() => router.push('/mapa'), 2000)
    } finally { setLoading(false) }
  }

  const inputStyle: React.CSSProperties = {
    height: 48, padding: '0 14px', borderRadius: 12,
    border: '1.5px solid var(--border)', fontFamily: 'var(--font)',
    fontSize: 14, color: 'var(--text)', background: 'var(--bg-card)',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  }

  const showInvalid = !checking && !hasSession && !done && (verifyError || !tokenHash)
  const showConfirmButton = !checking && tokenHash && !hasSession && !verifyError && !done

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', fontFamily: 'var(--font)' }}>
      <div style={{ width: '100%', maxWidth: 340 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img src="/icons/icon-512-store.png" alt="Fora do Ninho" style={{ width: 88, height: 88, objectFit: 'contain', borderRadius: 22, margin: '0 auto 14px', display: 'block' }} />
          <div style={{ fontSize: 22, fontWeight: 800 }}>Redefinir senha</div>
        </div>

        {checking && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Verificando o link...</div>
        )}

        {showConfirmButton && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
              Clique no botão abaixo para confirmar que é você e continuar a redefinição de senha.
            </div>
            <button className="btn-primary" onClick={handleConfirmLink} disabled={verifying}>
              {verifying ? 'Confirmando...' : 'Confirmar e continuar'}
            </button>
          </div>
        )}

        {showInvalid && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>
              Este link é inválido ou já expirou. Peça um novo link de redefinição na tela de login.
            </div>
            <button className="btn-primary" onClick={() => router.push('/onboarding?auth=login')}>Voltar para o login</button>
          </div>
        )}

        {!checking && hasSession && !done && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="password" placeholder="Nova senha" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            <input type="password" placeholder="Confirme a nova senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />
            {error && <div style={{ fontSize: 13, color: '#ef4444' }}>{error}</div>}
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </div>
        )}

        {done && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 600 }}>Senha atualizada!</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Levando você para o app...</div>
          </div>
        )}
      </div>
    </div>
  )
}
