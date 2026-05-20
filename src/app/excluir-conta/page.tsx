'use client'
import Link from 'next/link'

export default function ExcluirContaPage() {
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
          <h1 style={{
            fontSize: 22,
            fontWeight: 700,
            color: '#1a2b1a',
            marginTop: 16,
            marginBottom: 4,
          }}>
            Excluir minha conta
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            Fora do Ninho
          </p>
        </div>

        {/* Aviso */}
        <div style={{
          background: '#fff8e1',
          border: '1.5px solid #ffd54f',
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 24,
          fontSize: 14,
          color: '#5d4037',
        }}>
          ⚠️ <strong>Atenção:</strong> A exclusão da conta é permanente e irá remover todos os seus dados, avaliações e contribuições do mapa. Essa ação não pode ser desfeita.
        </div>

        {/* Instruções */}
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, marginBottom: 20 }}>
          Para solicitar a exclusão da sua conta e de todos os seus dados pessoais do Fora do Ninho, envie um e-mail para o endereço abaixo com o assunto <strong>"Excluir minha conta"</strong>:
        </p>

        <a
          href="mailto:contato@foradoninho.com.br?subject=Excluir%20minha%20conta"
          style={{
            display: 'block',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #33CCCC, #1aabab)',
            color: 'white',
            fontWeight: 700,
            fontSize: 16,
            padding: '14px 24px',
            borderRadius: 12,
            textDecoration: 'none',
            marginBottom: 24,
          }}
        >
          contato@foradoninho.com.br
        </a>

        {/* O que será excluído */}
        <div style={{
          background: '#f8fafc',
          borderRadius: 12,
          padding: '16px 18px',
          marginBottom: 24,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
            O que será excluído:
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#64748b', lineHeight: 1.8 }}>
            <li>Dados da sua conta (nome, e-mail)</li>
            <li>Avaliações e fotos que você enviou</li>
            <li>Check-ins e contribuições no mapa</li>
            <li>Todos os dados pessoais associados ao seu perfil</li>
          </ul>
        </div>

        <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
          Processaremos sua solicitação em até <strong>30 dias</strong> corridos, conforme a Lei Geral de Proteção de Dados (LGPD).
        </p>

        {/* Alternativa */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: 20,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>
            Prefere continuar usando o app?
          </p>
          <Link href="/" style={{
            color: '#33CCCC',
            fontWeight: 600,
            fontSize: 14,
            textDecoration: 'none',
          }}>
            ← Voltar ao Fora do Ninho
          </Link>
        </div>
      </div>

      {/* Política de privacidade */}
      <p style={{ marginTop: 20, fontSize: 12, color: '#94a3b8' }}>
        Consulte também nossa{' '}
        <Link href="/privacidade" style={{ color: '#33CCCC', textDecoration: 'none' }}>
          Política de Privacidade
        </Link>
      </p>
    </main>
  )
}
