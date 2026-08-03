// Extrai o path dentro do bucket a partir da URL pública de uma foto.
// Fotos enviadas em épocas diferentes vêm com hosts diferentes
// (domínio custom app.foradoninho.com.br ou o domínio bruto do projeto
// Supabase), mas o sufixo depois de "/<bucket>/" é sempre o mesmo.
export function extractBucketPath(url: string, bucket: string): string | null {
  const marker = `/${bucket}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return decodeURIComponent(url.slice(idx + marker.length).split('?')[0])
}
