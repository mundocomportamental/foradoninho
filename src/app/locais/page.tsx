'use client'
import { useState, useEffect, useCallback } from 'react'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Local } from '@/lib/types'
import { TIPO_LABELS, AMENIDADES } from '@/lib/types'

const FILTROS_ESTABELECIMENTOS = [
  { key: 'todos', label: 'Todos' },
  { key: 'fraldario', label: '🧷 Fraldário' },
  { key: 'microondas', label: '🥣 Microondas' },
  { key: 'cadeirão', label: '🪑 Cadeirão' },
  { key: 'amamentacao', label: '🤱 Amamentação' },
  { key: 'playground', label: '🛝 Playground' },
]

const TIPO_SERVICO_LABELS: Record<string, string> = {
  consultora: 'Consultora de Amamentação',
  doula: 'Doula',
  pediatra: 'Pediatra',
  fisioterapeuta: 'Fisioterapeuta',
  fonoaudiologa: 'Fonoaudióloga',
  psicologa: 'Psicóloga Infantil',
}

function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function LocaisPage() {
  const [locais, setLocais] = useState<Local[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => setUserPos({ lat: coords.latitude, lng: coords.longitude }),
      () => {}
    )
  }, [])

  const fetchLocais = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase.from('locais').select('*').eq('is_active', true)
      if (data) setLocais(data as Local[])
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchLocais() }, [fetchLocais])

  const estabelecimentos = locais.filter(l =>
    !['consultora','doula','pediatra','fisioterapeuta','fonoaudiologa','psicologa'].includes(l.tipo)
  )
  const servicos = locais.filter(l =>
    ['consultora','doula','pediatra','fisioterapeuta','fonoaudiologa','psicologa'].includes(l.tipo)
  )

  const filteredEstab = estabelecimentos
    .filter(l => {
      if (filtro !== 'todos' && !l[filtro as keyof Local]) return false
      if (search && !l.nome.toLowerCase().includes(search.toLowerCase()) && !l.cidade.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
    .map(l => ({
      ...l,
      distKm: userPos ? getDistanceKm(userPos.lat, userPos.lng, l.lat, l.lng) : null,
    }))
    .sort((a, b) => (a.distKm ?? 999) - (b.distKm ?? 999))

  const filteredServicos = servicos.filter(l => {
    if (search && !l.nome.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }).map(l => ({
    ...l,
    distKm: userPos ? getDistanceKm(userPos.lat, userPos.lng, l.lat, l.lng) : null,
  })).sort((a, b) => (a.distKm ?? 999) - (b.distKm ?? 999))

  const destaques = estabelecimentos.filter(l => l.certificado_pitstop)

  return (
    <div className="app-shell">
      <div className="page">
        <div className="page-header">
          <div className="page-title">Explorar</div>
          <div className="page-subtitle">Locais e serviços baby-friendly</div>
        </div>

        {/* Busca */}
        <div style={{ padding: '0 16px 12px', position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            style={{ position: 'absolute', left: 30, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="search-bar"
            placeholder="Buscar local, cidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ── Bloco I: Estabelecimentos ── */}
        <div style={{ padding: '0 16px 6px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>🏪 Estabelecimentos</div>

          {/* Filtros */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'none' }}>
            {FILTROS_ESTABELECIMENTOS.map(f => (
              <button
                key={f.key}
                onClick={() => setFiltro(filtro === f.key ? 'todos' : f.key)}
                className={`filter-chip${filtro === f.key ? ' active' : ''}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Em Destaque */}
          {destaques.length > 0 && filtro === 'todos' && !search && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>⭐ Em destaque</div>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                {destaques.slice(0, 6).map(l => (
                  <Link key={l.id} href={`/local/${l.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <div style={{ width: 140, background: 'var(--bg-card)', borderRadius: 14, border: '1.5px solid var(--green)', padding: '12px 12px 10px', boxShadow: '0 2px 8px rgba(76,175,133,0.08)' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-dark)', background: 'var(--green-soft)', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 6 }}>
                        {TIPO_LABELS[l.tipo] || l.tipo}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {l.nome}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.cidade}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 6 }}>
                        <span style={{ color: '#f5a623', fontSize: 13 }}>★</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{Number(l.rating).toFixed(1)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Lista */}
          {loading ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Carregando...</div>
          ) : filteredEstab.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Nenhum local encontrado</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredEstab.slice(0, 5).map(local => (
                <Link key={local.id} href={`/local/${local.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '14px 14px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green-dark)', background: 'var(--green-soft)', padding: '2px 8px', borderRadius: 20 }}>
                            {TIPO_LABELS[local.tipo] || local.tipo}
                          </span>
                          {local.certificado_pitstop && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: 20 }}>✓ PitStop</span>
                          )}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {local.nome}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {local.cidade}, {local.estado}
                          {local.distKm != null && ` · ${local.distKm < 1 ? `${Math.round(local.distKm * 1000)}m` : `${local.distKm.toFixed(1)}km`}`}
                        </div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginLeft: 8 }}>
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <span style={{ color: '#f5a623' }}>★</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{Number(local.rating).toFixed(1)}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({local.total_ratings})</span>
                      </div>
                      <span style={{ color: 'var(--border)' }}>·</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{local.total_checkins} check-ins</span>
                      {AMENIDADES.filter(a => local[a.key as keyof Local]).slice(0, 3).map(a => (
                        <span key={a.key} style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 7px', borderRadius: 20, border: '1px solid var(--border)' }}>
                          {a.icon}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Bloco II: Serviços para bebês ── */}
        <div style={{ padding: '20px 16px 8px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>👶 Serviços para bebês</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            Profissionais especializados em saúde e bem-estar infantil
          </div>

          {filteredServicos.length === 0 ? (
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>Em breve na sua cidade</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Profissionais ainda não cadastrados nessa área.</div>
              <Link href="/cadastro-profissional" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, color: 'var(--green-dark)', fontWeight: 600, textDecoration: 'none' }}>
                Anuncie seu serviço →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredServicos.map(local => (
                <Link key={local.id} href={`/local/${local.id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '14px 14px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#6d28d9', background: '#ede9fe', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 4 }}>
                          {TIPO_SERVICO_LABELS[local.tipo] || local.tipo}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{local.nome}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {local.cidade}
                          {local.distKm != null && ` · ${local.distKm < 1 ? `${Math.round(local.distKm * 1000)}m` : `${local.distKm.toFixed(1)}km`}`}
                        </div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16, padding: '14px', background: 'linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)', borderRadius: 14, border: '1px solid #c4b5fd' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#5b21b6', marginBottom: 4 }}>É profissional de saúde infantil?</div>
            <div style={{ fontSize: 12, color: '#6d28d9', marginBottom: 10 }}>Anuncie no Fora do Ninho e seja encontrado pelas famílias em viagem.</div>
            <Link href="/cadastro-profissional" style={{ display: 'inline-block', background: '#7c3aed', color: 'white', fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 50, textDecoration: 'none' }}>
              Anunciar meu serviço
            </Link>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
