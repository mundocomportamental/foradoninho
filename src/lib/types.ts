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
  espaco_familia: boolean
  espaco_kids: boolean
  microondas: boolean
  menu_kids: boolean
  cadeirão: boolean
  pet_friendly: boolean
  // campos legados (mantidos para compatibilidade com o banco)
  amamentacao?: boolean
  playground?: boolean
  balanco?: boolean
  carrinho?: boolean
  agua_quente?: boolean
  certificado_pitstop: boolean
  is_servico?: boolean
  aprovado?: boolean
  // Campos de profissionais (preenchidos quando is_servico=true)
  whatsapp?: string
  instagram?: string
  facebook?: string
  website?: string
  telefone?: string
  descricao?: string
  profissional_id?: string
  rating: number
  total_ratings: number
  total_checkins: number
  distancia_metros?: number
  foto_principal?: string
  fotos_metadata?: Array<{ url: string; ordem?: number }>
}

export const TIPO_LABELS: Record<string, string> = {
  posto: 'Posto',
  restaurante: 'Restaurante',
  hotel: 'Hotel',
  shopping: 'Shopping',
  farmacia: 'Farmácia',
  lanchonete: 'Lanchonete',
  supermercado: 'Supermercado',
  parque: 'Parque',
  outro: 'Outro',
  // Profissionais
  consultora: 'Consultora de Amamentação',
  doula: 'Doula',
  pediatra: 'Pediatra',
  fisioterapeuta: 'Fisioterapeuta',
  fonoaudiologa: 'Fonoaudióloga',
  psicologa: 'Psicóloga Infantil',
}

export const AMENIDADES = [
  { key: 'fraldario', label: 'Fraldário', icon: '🧷' },
  { key: 'espaco_familia', label: 'Espaço Família', icon: '👨‍👩‍👧' },
  { key: 'espaco_kids', label: 'Espaço Kids', icon: '🛝' },
  { key: 'microondas', label: 'Microondas', icon: '🥣' },
  { key: 'menu_kids', label: 'Menu Kids', icon: '🍽️' },
  { key: 'cadeirão', label: 'Cadeirão', icon: '🪑' },
  { key: 'pet_friendly', label: 'Pet-Friendly', icon: '🐾' },
]

export const FILTROS = [
  { key: 'fraldario', label: 'Fraldário' },
  { key: 'espaco_familia', label: 'Espaço Família' },
  { key: 'espaco_kids', label: 'Espaço Kids' },
  { key: 'microondas', label: 'Microondas' },
  { key: 'menu_kids', label: 'Menu Kids' },
  { key: 'cadeirão', label: 'Cadeirão' },
  { key: 'pet_friendly', label: 'Pet-Friendly' },
]
