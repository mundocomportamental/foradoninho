import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade — Fora do Ninho',
  description: 'Política de Privacidade do aplicativo Fora do Ninho',
}

export default function PrivacidadePage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '0 0 60px',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #33CCCC, #1aabab)',
        padding: '32px 24px 28px',
        textAlign: 'center',
      }}>
        <img
          src="/icon-192.png"
          alt="Fora do Ninho"
          style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'contain', marginBottom: 12 }}
        />
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>
          Política de Privacidade
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: 0 }}>
          Fora do Ninho · Atualizada em maio de 2025
        </p>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

        <Section title="1. Quem somos">
          <p>O <strong>Fora do Ninho</strong> é um aplicativo colaborativo que ajuda pais, mães e cuidadores a encontrar locais baby-friendly durante viagens e passeios. O responsável pelo tratamento dos seus dados é o desenvolvedor do aplicativo, acessível pelo e-mail <a href="mailto:contato@foradoninho.com.br" style={{ color: '#33CCCC' }}>contato@foradoninho.com.br</a>.</p>
        </Section>

        <Section title="2. Dados que coletamos">
          <p>Coletamos apenas os dados necessários para o funcionamento do app:</p>
          <ul>
            <li><strong>Nome e endereço de e-mail:</strong> fornecidos no cadastro via e-mail/senha ou login com Google.</li>
            <li><strong>ID de usuário:</strong> identificador interno gerado automaticamente pelo sistema.</li>
            <li><strong>Localização:</strong> usada para exibir locais próximos no mapa, somente quando você autoriza.</li>
            <li><strong>Fotos e avaliações:</strong> conteúdo que você opta por enviar sobre locais visitados.</li>
          </ul>
        </Section>

        <Section title="3. Como usamos seus dados">
          <ul>
            <li>Criar e gerenciar sua conta no aplicativo.</li>
            <li>Exibir locais baby-friendly próximos à sua localização.</li>
            <li>Publicar suas avaliações e fotos no mapa colaborativo.</li>
            <li>Garantir a segurança e autenticidade das contribuições.</li>
          </ul>
          <p>Não vendemos, alugamos nem compartilhamos seus dados pessoais com terceiros para fins comerciais ou publicitários.</p>
        </Section>

        <Section title="4. Compartilhamento de dados">
          <p>Seus dados são armazenados de forma segura no <strong>Supabase</strong> (infraestrutura de banco de dados e autenticação). O Supabase atua como subprocessador de dados e está sujeito a políticas de privacidade próprias. Não há outro compartilhamento com terceiros.</p>
          <p>As avaliações e fotos que você publica ficam visíveis para todos os usuários do app — são contribuições públicas ao mapa colaborativo.</p>
        </Section>

        <Section title="5. Localização">
          <p>A permissão de localização é solicitada apenas para exibir locais próximos a você. Você pode recusar ou revogar essa permissão a qualquer momento nas configurações do seu dispositivo. O app funciona normalmente sem ela — você poderá navegar o mapa manualmente.</p>
        </Section>

        <Section title="6. Retenção de dados">
          <p>Seus dados são mantidos enquanto sua conta estiver ativa. Após a exclusão da conta, removemos seus dados pessoais em até 30 dias, conforme a legislação aplicável.</p>
        </Section>

        <Section title="7. Seus direitos (LGPD)">
          <p>Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:</p>
          <ul>
            <li>Confirmar a existência de tratamento dos seus dados.</li>
            <li>Acessar, corrigir ou atualizar seus dados.</li>
            <li>Solicitar a exclusão dos seus dados pessoais.</li>
            <li>Revogar o consentimento a qualquer momento.</li>
            <li>Solicitar a portabilidade dos seus dados.</li>
          </ul>
          <p>Para exercer qualquer um desses direitos, entre em contato pelo e-mail <a href="mailto:contato@foradoninho.com.br" style={{ color: '#33CCCC' }}>contato@foradoninho.com.br</a> ou acesse nossa <a href="/excluir-conta" style={{ color: '#33CCCC' }}>página de exclusão de conta</a>.</p>
        </Section>

        <Section title="8. Segurança">
          <p>Todos os dados transmitidos entre o app e nossos servidores são criptografados via HTTPS/TLS. Adotamos boas práticas de segurança para proteger suas informações.</p>
        </Section>

        <Section title="9. Crianças">
          <p>O Fora do Ninho é destinado a adultos (pais, mães e cuidadores). Não coletamos intencionalmente dados de menores de 18 anos. Se você acredita que uma criança forneceu dados ao app, entre em contato conosco para remoção imediata.</p>
        </Section>

        <Section title="10. Alterações nesta política">
          <p>Podemos atualizar esta política periodicamente. Em caso de mudanças significativas, notificaremos os usuários pelo app ou por e-mail. A data da última atualização está indicada no topo desta página.</p>
        </Section>

        <Section title="11. Contato">
          <p>Dúvidas sobre privacidade? Fale conosco:</p>
          <p>
            📧 <a href="mailto:contato@foradoninho.com.br" style={{ color: '#33CCCC' }}>contato@foradoninho.com.br</a><br />
            🌐 <a href="https://foradoninho.com.br" style={{ color: '#33CCCC' }}>foradoninho.com.br</a>
          </p>
        </Section>

        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: 24,
          marginTop: 8,
          textAlign: 'center',
        }}>
          <Link href="/" style={{ color: '#33CCCC', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            ← Voltar ao Fora do Ninho
          </Link>
        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{
        fontSize: 16,
        fontWeight: 700,
        color: '#1a2b1a',
        marginBottom: 10,
        paddingBottom: 6,
        borderBottom: '2px solid #e2f7f7',
      }}>
        {title}
      </h2>
      <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  )
}
