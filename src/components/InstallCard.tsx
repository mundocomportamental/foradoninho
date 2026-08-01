'use client'
import { useState } from 'react'
import { useInstallPrompt } from '@/lib/useInstallPrompt'

export default function InstallCard() {
  const { installed, canPromptNative, isIOS, isAndroid, promptInstall } = useInstallPrompt()
  const [showGuide, setShowGuide] = useState(false)

  if (installed) return null

  async function handleInstall() {
    if (canPromptNative) {
      await promptInstall()
      return
    }
    setShowGuide(true)
  }

  return (
    <>
      <div style={{ margin: '0 16px 12px', padding: '16px', background: 'linear-gradient(135deg, var(--green) 0%, var(--green-dark) 100%)', borderRadius: 16, cursor: 'pointer' }} onClick={handleInstall}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
            <img src="/pwa-192x192.png" alt="" width={28} height={28} style={{ borderRadius: 6 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 2 }}>Instale o app</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>Acesso rápido direto da tela inicial do seu celular, iOS ou Android.</div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); handleInstall() }}
            style={{ background: 'white', color: 'var(--green-dark)', border: 'none', borderRadius: 50, padding: '9px 16px', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font)', cursor: 'pointer', flexShrink: 0 }}
          >
            Instalar
          </button>
        </div>
      </div>

      {showGuide && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setShowGuide(false) }}
        >
          <div style={{ background: 'var(--bg-card)', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', padding: '24px 20px 40px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 24px' }} />

            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 6, textAlign: 'center' }}>
              Adicionar à Tela de Início
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24, textAlign: 'center' }}>
              {isIOS ? 'No Safari, siga os passos abaixo' : isAndroid ? 'No Chrome, siga os passos abaixo' : 'No navegador do computador, siga os passos abaixo'}
            </div>

            {isIOS ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <GuideStep n={1}>
                  Toque no ícone de <strong>Compartilhar</strong>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginLeft: 6 }}>
                    <path d="M12 2v13M8 6l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
                  </svg>
                  {' '}na barra do navegador
                </GuideStep>
                <GuideStep n={2}>Selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong></GuideStep>
                <GuideStep n={3}>Toque em <strong>&quot;Adicionar&quot;</strong> para confirmar</GuideStep>
              </div>
            ) : isAndroid ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <GuideStep n={1}>Toque no menu <strong>⋮</strong> no canto superior direito do navegador</GuideStep>
                <GuideStep n={2}>Selecione <strong>&quot;Instalar app&quot;</strong> ou <strong>&quot;Adicionar à tela inicial&quot;</strong></GuideStep>
                <GuideStep n={3}>Confirme tocando em <strong>&quot;Instalar&quot;</strong></GuideStep>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <GuideStep n={1}>Procure o ícone de instalação (⊕ ou uma tela com seta) na barra de endereço</GuideStep>
                <GuideStep n={2}>Ou abra o menu do navegador e selecione <strong>&quot;Instalar Fora do Ninho&quot;</strong></GuideStep>
                <GuideStep n={3}>Confirme para instalar</GuideStep>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
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

function GuideStep({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--green-soft)', color: 'var(--green-dark)', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
      <div style={{ fontSize: 14, color: 'var(--text)', paddingTop: 3 }}>{children}</div>
    </div>
  )
}
