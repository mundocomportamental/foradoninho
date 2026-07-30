import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/cadastro-profissional',
        destination: '/cadastro-profissional.html',
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Impede que o app seja carregado dentro de um <iframe> de outro
          // site (clickjacking) — nenhuma página aqui precisa ser embedada.
          { key: 'X-Frame-Options', value: 'DENY' },
          // Impede o navegador de "adivinhar" o tipo de um arquivo servido
          // com Content-Type errado (ex: tratar um upload como script).
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Não vaza a URL completa de origem em requisições cross-site.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Desliga por padrão APIs sensíveis do navegador que o app não usa
          // (geolocalização é liberada porque o mapa depende dela).
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), geolocation=(self)' },
          // Força HTTPS em todas as visitas futuras por 1 ano.
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ]
  },
}

export default nextConfig
