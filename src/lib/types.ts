export interface Local {
  id: string
  nome: string
  tipo: string
  endereco: string
  cidade: string
  estado: string
  lat: number
  lng: number
  fraldario: boolean
  microondas: boolean
  cadeirão: boolean
  amamentacao: boolean
  playground: boolean
  balanco: boolean
  carrinho: boolean
  agua_quente: boolean
  certificado_pitstop: boolean
  rating: number
  total_ratings: number
  total_checkins: number
  distancia_metros?: number
}

export const TIPO_LABELS: Record<string, string> = {
  posto: 'Posto',
  restaurante: 'Restaurante',
  hotel: 'Hotel',
  shopping: 'Shopping',
  farmacia: 'Farmácia',
  lanchonete: 'Lanchonete',
}

export const AMENIDADES = [
  { key: 'fraldario', label: 'Fraldário', icon: '🧷' },
  { key: 'microondas', label: 'Microondas', icon: '📡' },
  { key: 'cadeirão', label: 'Cadeirão', icon: '🪑' },
  { key: 'amamentacao', label: 'Amamentação', icon: '🤱' },
  { key: 'playground', label: 'Playground', icon: '🛝' },
  { key: 'balanco', label: 'Balanço', icon: '🔄' },
  { key: 'carrinho', label: 'Carrinho', icon: '🛒' },
  { key: 'agua_quente', label: 'Água quente', icon: '♨️' },
]

export const FILTROS = [
  { key: 'fraldario', label: 'Fraldário' },
  { key: 'microondas', label: 'Microondas' },
  { key: 'cadeirão', label: 'Cadeirão' },
]
