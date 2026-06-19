'use client'
import { useEffect, useState } from 'react'
import { useInstallPrompt } from '@/lib/useInstallPrompt'

const DISMISS_KEY = 'fdn_install_banner_dismissed'

export default function InstallBanner() {
  const { installed, canPromptNative, isIOS, promptInstall } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(true)
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === '1')
  }, [])

  if (installed || dismissed) return null
  if (!canPromptNative && !isIOS) return null

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  const handleInstall = async () => {
    if (canPromptNative) {
      await promptInstall()
      return
    }
    if (isIOS) setShowIosGuide(true)
  }

  return (
    <>
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 'var(--radius-sm)', flexShrink: 0,
          background: 'var(--green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src="/pwa-192x192.png" alt="" width={28} height={28} style={{ borderRadius: 6 }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Instale o Fora do Ninho</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Acesso rápido direto da tela inicial
          </div>
        </div>

        <button
          onClick={handleInstall}
          style={{
            background: 'var(--green)', color: 'white', border: 'none', borderRadius: 50,
            padding: '9px 16px', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)',
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          Instalar
        </button>

        <button
          onClick={dismiss}
          aria-label="Dispensar"
          style={{
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
            padding: 4, flexShrink: 0, display: 'flex',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {showIosGuide && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setShowIosGuide(false) }}
        >
          <div style={{ background: 'var(--bg-card)', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', padding: '24px 20px 40px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 24px' }} />

            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 6, textAlign: 'center' }}>
              Adicionar à Tela de Início
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, textAlign: 'center' }}>
              No Safari, siga os passos abaixo
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--green-soft)', color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</div>
                <div style={{ fontSize: 14, color: 'var(--text)', paddingTop: 3 }}>
                  Toque no ícone de <strong>Compartilhar</strong>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginLeft: 6 }}>
                    <path d="M12 2v13M8 6l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
                  </svg>
                  {' '}na barra do navegador
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--green-soft)', color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</div>
                <div style={{ fontSize: 14, color: 'var(--text)', paddingTop: 3 }}>
                  Selecione <strong>"Adicionar à Tela de Início"</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--green-soft)', color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</div>
                <div style={{ fontSize: 14, color: 'var(--text)', paddingTop: 3 }}>
                  Toque em <strong>"Adicionar"</strong> para confirmar
                </div>
              </div>
            </div>

            <button
              onClick={() => { setShowIosGuide(false); dismiss() }}
              className="btn-primary"
              style={{ marginTop: 28 }}
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  )
}
