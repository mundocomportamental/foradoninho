'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

type Filtro = 'pendentes' | 'ativos' | 'todos'

interface LocalItem {
  id: string
  nome: string
  tipo: string
  cidade: string | null
  estado: string | null
  is_active: boolean
  aprovado: boolean
  rating: number
  total_ratings: number
  total_checkins: number
  added_by: string | null
  added_by_email: string | null
  added_by_nome: string | null
  created_at: string
}

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'pendentes', label: 'Pendentes' },
  { key: 'ativos', label: 'Ativos' },
  { key: 'todos', label: 'Todos' },
]

export default function AdminLocaisPage() {
  const supabase = createClient()
  const [filtro, setFiltro] = useState<Filtro>('pendentes')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [items, setItems] = useState<LocalItem[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [excluirAlvo, setExcluirAlvo] = useState<LocalItem | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_list_locais', {
      p_filtro: filtro, p_search: debouncedSearch || null, p_limit: limit, p_offset: offset,
    })
    if (!error && data) {
      setItems(data.items || [])
      setTotal(data.total || 0)
    }
    setLoading(false)
  }, [supabase, filtro, debouncedSearch, offset])

  useEffect(() => { setOffset(0) }, [filtro, debouncedSearch])
  useEffect(() => { load() }, [load])

  async function moderar(id: string, acao: 'aprovar' | 'rejeitar', motivo?: string) {
    setBusy(id)
    await supabase.rpc('admin_moderate_local', { p_local_id: id, p_acao: acao, p_motivo: motivo || null })
    setBusy(null)
    load()
  }

  async function excluir(motivo: string) {
    if (!excluirAlvo) return
    const { error } = await supabase.rpc('admin_moderate_local', { p_local_id: excluirAlvo.id, p_acao: 'excluir', p_motivo: motivo || null })
    if (error) throw new Error('Falha ao excluir.')
    setExcluirAlvo(null)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTROS.map(f => (
            <button key={f.key} onClick={() => setFiltro(f.key)} style={{
              padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              border: '1px solid #374151', fontFamily: 'inherit',
              background: filtro === f.key ? '#1f2937' : 'transparent',
              color: filtro === f.key ? 'white' : 'rgba(255,255,255,0.5)',
            }}>
              {f.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome ou cidade…"
          style={{
            flex: '1 1 220px', height: 36, padding: '0 12px', borderRadius: 8,
            border: '1px solid #374151', background: '#111827', color: 'white', fontSize: 13,
            fontFamily: 'inherit',
          }}
        />
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{total} resultado{total !== 1 ? 's' : ''}</div>
      </div>

      {loading ? (
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando…</div>
      ) : items.length === 0 ? (
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>Nenhum local encontrado.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                <Link href={`/admin/locais/${item.id}`} style={{ color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  {item.nome}
                </Link>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {item.cidade}{item.estado ? `/${item.estado}` : ''} · {item.tipo} · adicionado por {item.added_by_nome || item.added_by_email || 'desconhecido'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, fontSize: 11 }}>
                <span style={{ padding: '3px 9px', borderRadius: 20, fontWeight: 700, background: item.is_active ? '#064e3b' : '#78350f', color: item.is_active ? '#34d399' : '#fbbf24' }}>
                  {item.is_active ? 'ativo' : 'pendente'}
                </span>
                {!item.aprovado && (
                  <span style={{ padding: '3px 9px', borderRadius: 20, fontWeight: 700, background: '#1e3a8a', color: '#93c5fd' }}>fotos pendentes</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                ⭐ {item.rating?.toFixed(1) ?? '0.0'} ({item.total_ratings}) · {item.total_checkins} check-ins
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {!item.is_active && (
                  <button disabled={busy === item.id} onClick={() => moderar(item.id, 'aprovar')} style={btnStyle('#059669')}>Aprovar</button>
                )}
                {item.is_active && (
                  <button disabled={busy === item.id} onClick={() => moderar(item.id, 'rejeitar')} style={btnStyle('#92400e')}>Desativar</button>
                )}
                <button disabled={busy === item.id} onClick={() => setExcluirAlvo(item)} style={btnStyle('#991b1b')}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {total > limit && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
          <button disabled={offset === 0} onClick={() => setOffset(o => Math.max(0, o - limit))} style={btnStyle('#374151')}>← Anterior</button>
          <button disabled={offset + limit >= total} onClick={() => setOffset(o => o + limit)} style={btnStyle('#374151')}>Próxima →</button>
        </div>
      )}

      {excluirAlvo && (
        <ConfirmDialog
          title={`Excluir "${excluirAlvo.nome}"?`}
          description="Essa ação remove o local permanentemente do banco, incluindo suas avaliações e check-ins associados. Não pode ser desfeita."
          askMotivo
          onConfirm={excluir}
          onCancel={() => setExcluirAlvo(null)}
        />
      )}
    </div>
  )
}

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
    border: 'none', background: color, color: 'white', fontFamily: 'inherit',
  }
}
