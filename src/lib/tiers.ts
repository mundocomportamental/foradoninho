// Sistema de tiers de contribuidor(a), usado em /perfil e na tela de sucesso
// de "Adicionar local" — fica num lugar só pra não divergir entre telas
// (o que já tinha acontecido: a tela de sucesso tinha seu próprio "Contribuidor
// Top" independente, com nomes diferentes dos usados em /perfil).
// Filhote 0-5 | Andorinha 6-15 | Gaivota 16-50 | Águia 51+

export interface TierInfo { label: string; color: string; bg: string; icon: string }

export function getTierInfo(total: number): TierInfo {
  if (total > 50) return { label: 'Águia', color: '#d97706', bg: '#fffbeb', icon: '🦅' }
  if (total > 15) return { label: 'Gaivota', color: '#0891b2', bg: '#ecfeff', icon: '🕊️' }
  if (total > 5) return { label: 'Andorinha', color: '#059669', bg: '#f0fdf4', icon: '🐦' }
  return { label: 'Filhote', color: '#6b7280', bg: '#f9fafb', icon: '🐣' }
}

export interface NextTierProgress { nextLabel: string; rangeStart: number; rangeEnd: number; progress: number }

// Retorna null quando já está no tier máximo (Águia) — não há "próximo".
export function getNextTierProgress(total: number): NextTierProgress | null {
  if (total > 50) return null
  let rangeStart = 0, rangeEnd = 5, nextLabel = 'Andorinha'
  if (total > 15) { rangeStart = 16; rangeEnd = 50; nextLabel = 'Águia' }
  else if (total > 5) { rangeStart = 6; rangeEnd = 15; nextLabel = 'Gaivota' }
  const progress = Math.min(((total - rangeStart) / (rangeEnd - rangeStart)) * 100, 100)
  return { nextLabel, rangeStart, rangeEnd, progress }
}
