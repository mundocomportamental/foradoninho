'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function PrivacidadePage() {
  const [aba, setAba] = useState<'termos' | 'privacidade'>(
    typeof window !== 'undefined' && window.location.hash === '#privacidade'
      ? 'privacidade'
      : 'termos'
  )

  return (
    <div className="app-shell">
      {/* Header fixo */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px 0',
        }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: 22, lineHeight: 1 }}>
            ←
          </Link>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Legal</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', padding: '10px 20px 0', gap: 4 }}>
          {(['termos', 'privacidade'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setAba(tab)}
              style={{
                flex: 1,
                padding: '9px 0',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                color: aba === tab ? 'var(--green-dark)' : 'var(--text-muted)',
                borderBottom: aba === tab ? '2px solid var(--green)' : '2px solid transparent',
                transition: 'all 0.15s',
                fontFamily: 'var(--font)',
              }}
            >
              {tab === 'termos' ? 'Termos de Uso' : 'Privacidade'}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo rolável */}
      <div className="page" style={{ padding: '0 0 40px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px' }}>

          {/* ── TERMOS DE USO ── */}
          {aba === 'termos' && (
            <article>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
                Termos de Uso
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 36 }}>
                Última atualização: maio de 2026
              </p>

              <p style={{ marginBottom: 24, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Bem-vindo ao <strong style={{ color: 'var(--text)' }}>Fora do Ninho</strong>. Ao
                acessar ou usar o aplicativo, você concorda com estes Termos de Uso. Se não concordar,
                não utilize o app.
              </p>

              <Section title="1. O serviço">
                O Fora do Ninho é uma plataforma colaborativa que permite a pais, mães e cuidadores
                encontrar, cadastrar e avaliar locais baby-friendly durante viagens — como postos com
                fraldário, restaurantes com cadeirão e hotéis pet-friendly. O serviço é gratuito para
                uso pessoal.
              </Section>

              <Section title="2. Elegibilidade">
                Para usar o app você deve ter 18 anos ou mais. Ao criar uma conta, você confirma que
                atende a esse requisito. O app é voltado exclusivamente a adultos responsáveis por
                crianças.
              </Section>

              <Section title="3. Sua conta">
                Você é responsável por manter a confidencialidade de suas credenciais. Não compartilhe
                sua senha com terceiros. Caso suspeite de acesso não autorizado, entre em contato
                imediatamente pelo e-mail{' '}
                <a href="mailto:contato@foradoninho.com.br" style={{ color: 'var(--green-dark)' }}>
                  contato@foradoninho.com.br
                </a>.
              </Section>

              <Section title="4. Conteúdo que você publica">
                <p style={{ marginBottom: 12 }}>
                  Ao publicar avaliações, fotos ou cadastrar locais, você declara que:
                </p>
                <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <li>As informações são verdadeiras e correspondem à realidade.</li>
                  <li>Você tem o direito de publicar as fotos enviadas.</li>
                  <li>O conteúdo não viola direitos de terceiros nem a lei brasileira.</li>
                  <li>
                    Você concede ao Fora do Ninho licença gratuita e não exclusiva para exibir o
                    conteúdo no app e em materiais de divulgação.
                  </li>
                </ul>
                <p style={{ marginTop: 12 }}>
                  Reservamo-nos o direito de remover conteúdo inadequado, falso ou que viole estas
                  regras, sem aviso prévio.
                </p>
              </Section>

              <Section title="5. Uso proibido">
                <p style={{ marginBottom: 12 }}>É proibido:</p>
                <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <li>Usar o app para fins comerciais sem autorização prévia por escrito.</li>
                  <li>Publicar informações falsas ou enganosas sobre locais.</li>
                  <li>Assediar outros usuários ou publicar conteúdo ofensivo.</li>
                  <li>Tentar acessar dados de outros usuários sem autorização.</li>
                  <li>Usar scripts, bots ou automações sem permissão escrita.</li>
                  <li>Fazer engenharia reversa ou copiar o código do app.</li>
                </ul>
              </Section>

              <Section title="6. Isenção de responsabilidade">
                As informações sobre locais são cadastradas por usuários e podem estar desatualizadas
                ou incorretas. O Fora do Ninho não garante a precisão dessas informações e não se
                responsabiliza por danos decorrentes do uso do app. Sempre confirme as informações
                diretamente no local antes de visitar.
              </Section>

              <Section title="7. Encerramento de conta">
                Você pode excluir sua conta a qualquer momento em{' '}
                <Link href="/excluir-conta" style={{ color: 'var(--green-dark)' }}>
                  Configurações → Excluir conta
                </Link>
                . Podemos suspender ou encerrar contas que violem estes Termos.
              </Section>

              <Section title="8. Alterações">
                Podemos atualizar estes Termos periodicamente. Notificaremos sobre mudanças
                significativas por e-mail ou aviso no app. O uso continuado após a notificação
                constitui aceite das alterações.
              </Section>

              <Section title="9. Lei aplicável">
                Estes Termos são regidos pelas leis brasileiras. Qualquer controvérsia será
                resolvida no foro da comarca de domicílio do usuário, conforme o Código de Defesa
                do Consumidor (Lei nº 8.078/1990).
              </Section>

              <Section title="10. Contato">
                Dúvidas sobre os Termos:{' '}
                <a href="mailto:contato@foradoninho.com.br" style={{ color: 'var(--green-dark)' }}>
                  contato@foradoninho.com.br
                </a>
              </Section>
            </article>
          )}

          {/* ── POLÍTICA DE PRIVACIDADE ── */}
          {aba === 'privacidade' && (
            <article>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>
                Política de Privacidade
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 36 }}>
                Última atualização: maio de 2026
              </p>

              <p style={{ marginBottom: 24, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                O <strong style={{ color: 'var(--text)' }}>Fora do Ninho</strong> é uma plataforma
                colaborativa que ajuda pais e mães a encontrar locais baby-friendly em viagens. Esta
                Política explica quais dados coletamos, como os usamos e quais são os seus direitos.
              </p>

              <Section title="1. Dados que coletamos">
                <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <li>
                    <strong>Dados de cadastro:</strong> nome, e-mail e foto de perfil — fornecidos
                    ao criar conta ou fazer login com Google.
                  </li>
                  <li>
                    <strong>Localização:</strong> usada somente quando você abre o mapa ou cadastra
                    um local. Nunca rastreamos sua localização em segundo plano.
                  </li>
                  <li>
                    <strong>Conteúdo criado:</strong> avaliações, fotos e locais que você cadastra
                    ou edita na plataforma.
                  </li>
                  <li>
                    <strong>Perfil familiar (opcional):</strong> função (mamãe/papai/outro) e dados
                    do bebê (apenas data de nascimento e sexo). Nunca coletamos nome de crianças.
                  </li>
                  <li>
                    <strong>Dados de uso:</strong> páginas visitadas e interações, coletados de
                    forma agregada e anônima.
                  </li>
                </ul>
              </Section>

              <Section title="2. Como usamos seus dados">
                <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <li>Autenticar sua conta e manter sua sessão ativa.</li>
                  <li>Exibir locais baby-friendly próximos à sua posição.</li>
                  <li>Permitir avaliações, cadastros e interações na comunidade.</li>
                  <li>Enviar notificações relevantes (somente com sua autorização).</li>
                  <li>Melhorar a plataforma com base em dados agregados.</li>
                  <li>Cumprir obrigações legais e prevenir fraudes.</li>
                </ul>
              </Section>

              <Section title="3. Compartilhamento">
                <p style={{ marginBottom: 12 }}>
                  <strong>Não vendemos seus dados.</strong> Compartilhamos apenas com:
                </p>
                <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <li>
                    <strong>Supabase</strong> (banco de dados e autenticação) e{' '}
                    <strong>Vercel</strong> (hospedagem) — com contratos de confidencialidade.
                  </li>
                  <li>
                    <strong>Autoridades competentes</strong> — quando exigido por lei ou ordem
                    judicial.
                  </li>
                </ul>
                <p style={{ marginTop: 12 }}>
                  Avaliações e fotos que você publica ficam visíveis a todos os usuários do app.
                </p>
              </Section>

              <Section title="4. Localização">
                O acesso à localização é solicitado apenas quando necessário. Você pode negar ou
                revogar essa permissão a qualquer momento nas configurações do dispositivo. O app
                funciona normalmente sem ela — o mapa apenas não centraliza automaticamente.
              </Section>

              <Section title="5. Crianças">
                O app é destinado a adultos maiores de 18 anos. Não coletamos dados pessoais de
                crianças. As informações sobre bebês são fornecidas pelos próprios responsáveis e
                são totalmente opcionais.
              </Section>

              <Section title="6. Seus direitos (LGPD)">
                <p style={{ marginBottom: 12 }}>
                  Conforme a Lei nº 13.709/2018 (LGPD), você tem direito a:
                </p>
                <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <li>Acessar os dados que temos sobre você.</li>
                  <li>Corrigir dados incompletos ou incorretos.</li>
                  <li>Solicitar a exclusão dos seus dados.</li>
                  <li>Revogar o consentimento para uso dos seus dados.</li>
                  <li>Portabilidade dos dados para outro serviço.</li>
                </ul>
                <p style={{ marginTop: 12 }}>
                  Para exercer esses direitos, use a{' '}
                  <Link href="/excluir-conta" style={{ color: 'var(--green-dark)' }}>
                    página de exclusão de conta
                  </Link>{' '}
                  ou envie um e-mail para{' '}
                  <a href="mailto:contato@foradoninho.com.br" style={{ color: 'var(--green-dark)' }}>
                    contato@foradoninho.com.br
                  </a>.
                </p>
              </Section>

              <Section title="7. Retenção">
                Mantemos seus dados enquanto sua conta estiver ativa. Ao excluir a conta, seus
                dados pessoais são removidos em até 30 dias. Avaliações e locais podem ser mantidos
                de forma anônima para preservar a integridade do mapa colaborativo.
              </Section>

              <Section title="8. Segurança">
                Utilizamos criptografia em trânsito (HTTPS/TLS) e em repouso. O acesso ao banco de
                dados é restrito por Row Level Security (RLS) no Supabase.
              </Section>

              <Section title="9. Alterações">
                Podemos atualizar esta política periodicamente. Informaremos sobre mudanças
                significativas por e-mail ou aviso no app. O uso continuado constitui aceite.
              </Section>

              <Section title="10. Contato">
                Dúvidas sobre privacidade:{' '}
                <a href="mailto:contato@foradoninho.com.br" style={{ color: 'var(--green-dark)' }}>
                  contato@foradoninho.com.br
                </a>
              </Section>
            </article>
          )}

        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2 style={{
        fontSize: 15,
        fontWeight: 700,
        color: 'var(--text)',
        marginBottom: 10,
        paddingBottom: 8,
        borderBottom: '1px solid var(--border)',
      }}>
        {title}
      </h2>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 14 }}>
        {children}
      </div>
    </section>
  )
}
