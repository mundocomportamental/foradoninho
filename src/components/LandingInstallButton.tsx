'use client'
import { useState } from 'react'
import { useInstallPrompt } from '@/lib/useInstallPrompt'

export default function LandingInstallButton() {
  const { installed, canPromptNative, isIOS, promptInstall } = useInstallPrompt()
  const [showIosGuide, setShowIosGuide] = useState(false)

  if (installed || (!canPromptNative && !isIOS)) return null

  async function handleClick() {
    if (canPromptNative) {
      await promptInstall()
      return
    }
    setShowIosGuide(true)
  }

  return (
    <>
      <button className="btn-install" onClick={handleClick}>
        📲 Instalar o app
      </button>

      {showIosGuide && (
        <div
          className="landing-ios-guide-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) setShowIosGuide(false) }}
        >
          <div className="landing-ios-guide-sheet">
            <div className="landing-ios-guide-title">Adicionar à Tela de Início</div>
            <p className="landing-ios-guide-sub">No Safari, siga os passos abaixo</p>
            <ol className="landing-ios-guide-steps">
              <li>Toque no ícone de Compartilhar na barra do navegador</li>
              <li>Selecione &quot;Adicionar à Tela de Início&quot;</li>
              <li>Toque em &quot;Adicionar&quot; para confirmar</li>
            </ol>
            <button className="btn-hero-primary" onClick={() => setShowIosGuide(false)}>Entendi</button>
          </div>
        </div>
      )}
    </>
  )
}
