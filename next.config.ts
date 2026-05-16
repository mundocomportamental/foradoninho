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
}

export default nextConfig
