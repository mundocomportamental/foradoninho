'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Step = 'aviso' | 'confirmar' | 'excluindo' | 'erro'

export default function ExcluirContaPage() {
  const [step, setStep] = useState<Step>('aviso')
  const [confirmText, setConfirmText] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleExcluir() {
    if (confirmText !== 'EXCLUIR') return
    setStep('excluindo')
    setErro('')

    try {
      // Pega o token da sessão atual para passar para a Edge Function
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setErro('Você precisa estar logado para excluir sua conta.')
        setStep('erro')
        return
      }

      // Chama a Edge Function que deleta os dados e a conta no Supabase
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/delete-account`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Falha ao excluir conta')
      }

      // Faz logout local e redireciona para o onboarding
      await supabase.auth.signOut()
      localStorage.removeItem('onboarding_done')
      router.push('/onboarding')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erro inesperado. Tente novamente.'
      setErro(msg)
      setStep('erro')
    }
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5ef 0%, #f0fafa 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        background: 'white',
        borderRadius: 20,
        padding: '40px 32px',
        maxWidth: 520,
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <img
            src="/icon-192.png"
            alt="Fora do Ninho"
            style={{ width: 72, height: 72, borderRadius: 16, objectFit: 'contain' }}
          />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2b1a', marginTop: 16, marginBottom: 4 }}>
            Excluir minha conta
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Fora do Ninho</p>
        </div>

        {/* ── PASSO 1: Aviso ── */}
        {step === 'aviso' && (
          <>
            <div style={{
              background: '#fff8e1', border: '1.5px solid #ffd54f',
              borderRadius: 12, padding: '14px 16px', marginBottom: 24,
              fontSize: 14, color: '#5d4037',
            }}>
              ⚠️ <strong>Atenção:</strong> A exclusão é permanente e remove todos os seus dados, avaliações e contribuições do mapa. Essa ação não pode ser desfeita.
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 12, padding: '16px 18px', marginBottom: 28 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10, margin: '0 0 10px' }}>
                O que será excluído:
              </p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#64748b', lineHeight: 1.8 }}>
                <li>Dados da sua conta (nome, e-mail)</li>
                <li>Avaliações e fotos que você enviou</li>
                <li>Check-ins e contribuições no mapa</li>
                <li>Todos os dados pessoais do seu perfil</li>
              </ul>
            </div>

            <button
              onClick={() => setStep('confirmar')}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                background: '#ef4444', color: 'white', fontWeight: 700,
                fontSize: 15, cursor: 'pointer', marginBottom: 12,
              }}
            >
              Quero excluir minha conta
            </button>

            <Link href="/perfil" style={{
              display: 'block', textAlign: 'center',
              color: '#33CCCC', fontWeight: 600, fontSize: 14, textDecoration: 'none',
            }}>
              ← Cancelar e voltar
            </Link>
          </>
        )}

        {/* ── PASSO 2: Confirmação com digitação ── */}
        {step === 'confirmar' && (
          <>
            <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, marginBottom: 20 }}>
              Para confirmar, digite <strong>EXCLUIR</strong> no campo abaixo:
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="EXCLUIR"
              autoCapitalize="characters"
              style={{
                width: '100%', height: 48, padding: '0 14px', borderRadius: 12,
                border: '1.5px solid #e2e8f0', fontSize: 15, fontFamily: 'inherit',
                boxSizing: 'border-box', marginBottom: 16, outline: 'none',
                letterSpacing: 1,
              }}
            />

            <button
              onClick={handleExcluir}
              disabled={confirmText !== 'EXCLUIR'}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                background: confirmText === 'EXCLUIR' ? '#ef4444' : '#e2e8f0',
                color: confirmText === 'EXCLUIR' ? 'white' : '#94a3b8',
                fontWeight: 700, fontSize: 15,
                cursor: confirmText === 'EXCLUIR' ? 'pointer' : 'not-allowed',
                marginBottom: 12, transition: 'all 0.15s',
              }}
            >
              Excluir permanentemente
            </button>

            <button
              onClick={() => { setStep('aviso'); setConfirmText('') }}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 12,
                border: '1.5px solid #e2e8f0', background: 'white',
                color: '#64748b', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </>
        )}

        {/* ── PASSO 3: Excluindo (loading) ── */}
        {step === 'excluindo' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 40, height: 40, border: '3px solid #e2e8f0',
              borderTopColor: '#ef4444', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 20px',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: 15, color: '#374151', fontWeight: 600 }}>Excluindo sua conta...</p>
            <p style={{ fontSize: 13, color: '#94a3b8' }}>Isso pode levar alguns segundos.</p>
          </div>
        )}

        {/* ── PASSO 4: Erro ── */}
        {step === 'erro' && (
          <>
            <div style={{
              background: '#fef2f2', border: '1.5px solid #fca5a5',
              borderRadius: 12, padding: '14px 16px', marginBottom: 24,
              fontSize: 14, color: '#991b1b',
            }}>
              ❌ {erro || 'Ocorreu um erro ao excluir sua conta.'}
            </div>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>
              Se o problema persistir, entre em contato:{' '}
              <a href="mailto:contato@foradoninho.com.br" style={{ color: '#33CCCC' }}>
                contato@foradoninho.com.br
              </a>
            </p>
            <button
              onClick={() => setStep('aviso')}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
                background: '#33CCCC', color: 'white', fontWeight: 700,
                fontSize: 15, cursor: 'pointer',
              }}
            >
              Tentar novamente
            </button>
          </>
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 12, color: '#94a3b8' }}>
        Consulte nossa{' '}
        <Link href="/privacidade" style={{ color: '#33CCCC', textDecoration: 'none' }}>
          Política de Privacidade
        </Link>
      </p>
    </main>
  )
}
