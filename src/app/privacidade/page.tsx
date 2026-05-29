// Copie este arquivo para:
// C:\Fora do Ninho\src\app\privacidade\page.tsx

export const metadata = {
  title: 'Termos e Privacidade — Fora do Ninho',
  description: 'Termos de Uso e Política de Privacidade do aplicativo Fora do Ninho.',
};

export default function PrivacidadePage() {
  return (
    <main
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '2rem 1.5rem 5rem',
        fontFamily: 'system-ui, sans-serif',
        color: '#1a1a1a',
        lineHeight: '1.7',
        overflowY: 'auto',
      }}
    >
      {/* Cabeçalho */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <img
          src="/icons/icon-512-store.png"
          alt="Fora do Ninho"
          style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 12 }}
        />
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1aabab' }}>Fora do Ninho</div>
      </div>

      {/* Navegação rápida */}
      <nav style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2.5rem',
        borderBottom: '2px solid #e8f8f8',
        paddingBottom: '1rem',
      }}>
        <a
          href="#termos"
          style={{
            color: '#1aabab',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: 15,
            padding: '6px 14px',
            borderRadius: 20,
            background: '#e8f8f8',
          }}
        >
          📋 Termos de Uso
        </a>
        <a
          href="#privacidade"
          style={{
            color: '#1aabab',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: 15,
            padding: '6px 14px',
            borderRadius: 20,
            background: '#e8f8f8',
          }}
        >
          🔒 Política de Privacidade
        </a>
      </nav>

      {/* ===================== TERMOS DE USO ===================== */}
      <section id="termos">
        <h1 style={{ color: '#33CCCC', marginBottom: '0.25rem' }}>Termos de Uso</h1>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Última atualização: maio de 2026
        </p>

        <p>
          Bem-vindo ao <strong>Fora do Ninho</strong>! Ao usar o aplicativo, você concorda com estes
          Termos de Uso. Leia com atenção antes de criar sua conta.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>1. O que é o Fora do Ninho</h2>
        <p>
          O Fora do Ninho é uma plataforma colaborativa que permite a pais, mães e cuidadores
          encontrar, cadastrar e avaliar locais baby-friendly durante viagens e passeios — como
          postos de combustível com fraldário, restaurantes com cadeirão, e hotéis pet-friendly.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>2. Elegibilidade</h2>
        <p>
          Para usar o app, você deve ter 18 anos ou mais. Ao criar uma conta, você confirma que
          atende a esse requisito. O app é voltado exclusivamente a adultos que atuam como
          responsáveis por crianças.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>3. Sua conta</h2>
        <p>
          Você é responsável por manter a confidencialidade de suas credenciais de acesso. Não
          compartilhe sua senha com terceiros. Informe-nos imediatamente se suspeitar de uso não
          autorizado da sua conta.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>4. Conteúdo gerado por você</h2>
        <p>
          Ao publicar avaliações, fotos ou cadastrar locais, você declara que:
        </p>
        <ul>
          <li>As informações são verdadeiras e correspondem à realidade.</li>
          <li>Você tem o direito de publicar as fotos enviadas.</li>
          <li>O conteúdo não viola direitos de terceiros nem a lei brasileira.</li>
          <li>Você concede ao Fora do Ninho licença gratuita para exibir o conteúdo no app.</li>
        </ul>
        <p>
          Reservamo-nos o direito de remover conteúdo inadequado, falso ou que viole estas regras.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>5. Uso adequado</h2>
        <p>É proibido:</p>
        <ul>
          <li>Usar o app para fins comerciais sem autorização prévia.</li>
          <li>Publicar informações falsas ou enganosas sobre locais.</li>
          <li>Assediar outros usuários ou criar conteúdo ofensivo.</li>
          <li>Tentar acessar dados de outros usuários sem autorização.</li>
          <li>Usar scripts, bots ou automações sem permissão escrita.</li>
        </ul>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>6. Isenção de responsabilidade</h2>
        <p>
          As informações sobre locais são cadastradas por usuários e podem estar desatualizadas.
          O Fora do Ninho não se responsabiliza por informações incorretas sobre estabelecimentos,
          nem por qualquer dano decorrente do uso do app. Sempre confirme as informações
          diretamente no local antes de visitar.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>7. Encerramento de conta</h2>
        <p>
          Você pode excluir sua conta a qualquer momento na seção{' '}
          <a href="/excluir-conta" style={{ color: '#33CCCC' }}>Excluir conta</a>.
          Podemos suspender ou encerrar contas que violem estes Termos.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>8. Alterações nos Termos</h2>
        <p>
          Podemos atualizar estes Termos periodicamente. Informaremos sobre mudanças significativas
          por e-mail ou aviso no app. O uso continuado após a notificação constitui aceite das
          alterações.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>9. Lei aplicável</h2>
        <p>
          Estes Termos são regidos pelas leis brasileiras. Qualquer controvérsia será resolvida no
          foro da comarca de domicílio do usuário, conforme o Código de Defesa do Consumidor.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>10. Contato</h2>
        <p>
          Dúvidas sobre os Termos:{' '}
          <a href="mailto:contato@foradoninho.com.br" style={{ color: '#33CCCC' }}>
            contato@foradoninho.com.br
          </a>
        </p>
      </section>

      <hr style={{ border: 'none', borderTop: '2px solid #e8f8f8', margin: '3rem 0' }} />

      {/* ===================== POLÍTICA DE PRIVACIDADE ===================== */}
      <section id="privacidade">
        <h1 style={{ color: '#33CCCC', marginBottom: '0.25rem' }}>Política de Privacidade</h1>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Última atualização: maio de 2026
        </p>

        <p>
          O <strong>Fora do Ninho</strong> ("nós", "nosso") é uma plataforma colaborativa que ajuda
          pais e mães a encontrar locais seguros para bebês durante viagens. Esta Política de
          Privacidade explica quais dados coletamos, como os usamos e quais são os seus direitos.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>1. Dados que coletamos</h2>
        <p>Ao usar o Fora do Ninho, podemos coletar:</p>
        <ul>
          <li>
            <strong>Dados de cadastro:</strong> nome, endereço de e-mail e foto de perfil (quando
            você cria uma conta ou faz login com Google).
          </li>
          <li>
            <strong>Dados de localização:</strong> sua localização geográfica aproximada, somente
            quando você usa o mapa ou cadastra um local novo. Nunca rastreamos sua localização em
            segundo plano.
          </li>
          <li>
            <strong>Conteúdo que você cria:</strong> avaliações, fotos e informações de locais que
            você cadastra ou edita na plataforma.
          </li>
          <li>
            <strong>Dados do perfil familiar (opcionais):</strong> cidade, função
            (mamãe/papai/outro), informações sobre bebês (apenas data de nascimento e sexo). Nunca
            coletamos nome ou dados de identificação de crianças.
          </li>
          <li>
            <strong>Dados de uso:</strong> páginas visitadas e interações, coletados de forma
            agregada e anônima para melhorar o app.
          </li>
        </ul>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>2. Como usamos seus dados</h2>
        <ul>
          <li>Autenticar sua conta e manter sua sessão ativa.</li>
          <li>Exibir e personalizar o mapa de locais próximos à sua posição.</li>
          <li>Permitir que você avalie locais, cadastre novos pontos e interaja com a comunidade.</li>
          <li>Enviar notificações relevantes (somente com sua autorização).</li>
          <li>Melhorar a plataforma com base em dados agregados de uso.</li>
          <li>Cumprir obrigações legais e prevenir fraudes ou abusos.</li>
        </ul>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>3. Compartilhamento de dados</h2>
        <p>
          <strong>Não vendemos seus dados.</strong> Podemos compartilhá-los apenas com:
        </p>
        <ul>
          <li>
            <strong>Provedores de serviço:</strong> Supabase (banco de dados e autenticação) e
            Vercel (hospedagem), que processam dados em nosso nome com contratos de
            confidencialidade.
          </li>
          <li>
            <strong>Autoridades competentes:</strong> quando exigido por lei ou ordem judicial.
          </li>
        </ul>
        <p>
          Avaliações e fotos que você publica ficam visíveis publicamente para todos os usuários.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>4. Localização</h2>
        <p>
          O acesso à sua localização é solicitado somente quando necessário. Você pode negar ou
          revogar essa permissão a qualquer momento nas configurações do seu dispositivo. O app
          funciona normalmente sem localização — o mapa apenas não centraliza automaticamente.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>5. Crianças</h2>
        <p>
          O Fora do Ninho é destinado a adultos maiores de 18 anos. Não coletamos dados pessoais
          de crianças. As informações sobre bebês no perfil são fornecidas pelos próprios
          responsáveis e são opcionais.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>6. Seus direitos (LGPD)</h2>
        <p>
          Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:
        </p>
        <ul>
          <li>Acessar os dados que temos sobre você.</li>
          <li>Corrigir dados incompletos ou incorretos.</li>
          <li>Solicitar a exclusão dos seus dados.</li>
          <li>Revogar o consentimento para uso dos seus dados.</li>
          <li>Portabilidade dos dados para outro serviço.</li>
        </ul>
        <p>
          Para exercer qualquer desses direitos:{' '}
          <a href="mailto:contato@foradoninho.com.br" style={{ color: '#33CCCC' }}>
            contato@foradoninho.com.br
          </a>{' '}
          ou acesse a{' '}
          <a href="/excluir-conta" style={{ color: '#33CCCC' }}>
            página de exclusão de conta
          </a>
          .
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>7. Retenção de dados</h2>
        <p>
          Mantemos seus dados enquanto sua conta estiver ativa. Ao excluir sua conta, seus dados
          pessoais são removidos em até 30 dias. Avaliações e locais cadastrados podem ser mantidos
          de forma anônima para preservar a integridade da base colaborativa.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>8. Segurança</h2>
        <p>
          Utilizamos criptografia em trânsito (HTTPS/TLS) e em repouso para proteger seus dados.
          O acesso ao banco de dados é restrito por políticas de Row Level Security (RLS) no
          Supabase.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>9. Alterações nesta política</h2>
        <p>
          Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas
          por e-mail ou aviso no app. O uso continuado após a notificação constitui aceite.
        </p>

        <h2 style={{ color: '#1AABAB', marginTop: '2rem' }}>10. Contato</h2>
        <p>
          Dúvidas sobre privacidade:{' '}
          <a href="mailto:contato@foradoninho.com.br" style={{ color: '#33CCCC' }}>
            contato@foradoninho.com.br
          </a>
        </p>
      </section>

      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <a href="/" style={{ color: '#33CCCC', textDecoration: 'none', fontWeight: 600 }}>
          ← Voltar ao Fora do Ninho
        </a>
      </div>
    </main>
  );
}
