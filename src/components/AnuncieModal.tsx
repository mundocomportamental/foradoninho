'use client'
import { useState } from 'react'
import Link from 'next/link'

const STEPS = [
  {
    icon: '📍',
    tag: 'Visibilidade',
    title: 'Apareça para famílias quando elas mais precisam de você',
    body: 'Pais em viagem estão num território desconhecido, com urgência real — eles buscam profissionais com pressa e alta intenção de contratar. Seu perfil aparece exatamente nesse momento, para quem já está procurando.',
  },
  {
    icon: '🤝',
    tag: 'Rede & Autoridade',
    title: 'Faça parte da maior rede de apoio para famílias em movimento',
    body: 'Cada família que te encontra e confia no seu trabalho vira uma indicação para outras. No Fora do Ninho, reputação se constrói coletivamente — avaliações reais de pais reais, que recomendam você para sua rede.',
  },
  {
    icon: '🔑',
    tag: 'Você no controle',
    title: 'Sua agenda, seus clientes, suas regras',
    body: 'O Fora do Ninho te conecta com as famílias — mas tudo o que vem depois é seu. Você conversa pelo seu WhatsApp, agenda do seu jeito e recebe como preferir. Nenhuma comissão, nenhum intermediário, nenhuma dependência.',
  },
]

interface AnuncieModalProps {
  onClose: () => void
}

export default function AnuncieModal({ onClose }: AnuncieModalProps) {
  const [step, setStep] = useState(0) // 0-2 = benefit cards; 3 = pricing

  const progress = ((step + 1) / 3) * 100
  const current = STEPS[step]

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'flex-end' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: 'var(--bg-card)', borderTopLeftRadius: 24, borderTopRightRadius: 24, width: '100%', padding: '24px 20px 48px', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 24px' }} />

        {step < 3 ? (
          <>
            {/* Barra de progresso */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Passo {step + 1} de 3</span>
                <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 700 }}>{Math.round(progress)}% concluído</span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
                  borderRadius: 3,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>

            {/* Card de benefício */}
            <div style={{
              background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)',
              borderRadius: 20,
              padding: '28px 20px 24px',
              border: '1.5px solid #c4b5fd',
              marginBottom: 24,
              minHeight: 200,
            }}>
              <div style={{ fontSize: 44, marginBottom: 16, textAlign: 'center' }}>{current.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', background: 'rgba(124,58,237,0.1)', padding: '3px 12px', borderRadius: 20, display: 'inline-block', marginBottom: 12 }}>
                {current.tag}
              </div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#5b21b6', lineHeight: 1.4, marginBottom: 12 }}>
                {current.title}
              </div>
              <div style={{ fontSize: 14, color: '#6d28d9', lineHeight: 1.7 }}>
                {current.body}
              </div>
            </div>

            {/* Indicadores de passo */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{
                  width: i === step ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === step ? '#7c3aed' : i < step ? '#a78bfa' : 'var(--border)',
                  transition: 'all 0.3s',
                }} />
              ))}
            </div>

            <button
              onClick={() => setStep(s => s + 1)}
              style={{ width: '100%', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 50, padding: '14px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}
            >
              {step < 2 ? 'Próximo →' : 'Ver planos e preços →'}
            </button>

            <button
              onClick={onClose}
              style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', padding: 12, fontFamily: 'var(--font)' }}
            >
              Fechar
            </button>
          </>
        ) : (
          <>
            {/* Tela de preços */}
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: 'var(--text)' }}>Pronto para começar?</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
              Um perfil completo, visível para milhares de famílias em viagem.
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)',
              border: '2px solid #a78bfa',
              borderRadius: 20,
              padding: '20px 18px',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#5b21b6' }}>Plano Profissional</div>
                  <div style={{ fontSize: 12, color: '#7c3aed', marginTop: 3 }}>Sem fidelidade · cancele quando quiser</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#7c3aed', lineHeight: 1 }}>R$ 89</div>
                  <div style={{ fontSize: 12, color: '#7c3aed' }}>/mês</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {[
                  'Pin no mapa com sua localização',
                  'Perfil completo com fotos',
                  'Contato direto via WhatsApp',
                  'Sem comissão por atendimento',
                  'Você controla agenda e pagamentos',
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/cadastro-profissional"
              onClick={onClose}
              style={{ display: 'block', textAlign: 'center', background: '#7c3aed', color: 'white', padding: '14px', borderRadius: 50, fontSize: 15, fontWeight: 700, textDecoration: 'none' }}
            >
              Começar meu cadastro →
            </Link>

            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 14 }}>
              Dúvidas?{' '}
              <a href="mailto:foradoninho.app@gmail.com" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>
                foradoninho.app@gmail.com
              </a>
            </div>

            <button
              onClick={() => setStep(2)}
              style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer', padding: 8, fontFamily: 'var(--font)' }}
            >
              ← Voltar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
