'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

type Filtro = 'pendentes' | 'aprovados' | 'rejeitados' | 'todos'

interface ProfItem {
  id: string
  nome: string
  nome_negocio: string | null
  email: string
  cidade: string | null
  uf: string | null
  status_aprovacao: string
  ativo: boolean
  pagamento_status: string
  created_at: string
}

const FILTROS: { key: Filtro; label: string }[] = [
  { key: 'pendentes', label: 'Pendentes' },
  { key: 'aprovados', label: 'Aprovados' },
  { key: 'rejeitados', label: 'Rejeitados' },
  { key: 'todos', label: 'Todos' },
]

const STATUS_LABEL: Record<string, { label: string; bg: string; fg: string }> = {
  aguardando: { label: 'aguardando', bg: '#78350f', fg: '#fbbf24' },
  edicao_pendente: { label: 'edição pendente', bg: '#1e3a8a', fg: '#93c5fd' },
  aprovado: { label: 'aprovado', bg: '#064e3b', fg: '#34d399' },
  rejeitado: { label: 'rejeitado', bg: '#7f1d1d', fg: '#fca5a5' },
}

export default function AdminProfissionaisPage() {
  const supabase = createClient()
  const [filtro, setFiltro] = useState<Filtro>('pendentes')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [items, setItems] = useState<ProfItem[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [excluirAlvo, setExcluirAlvo] = useState<ProfItem | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_list_profissionais', {
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

  async function moderar(id: string, acao: 'aprovar' | 'rejeitar') {
    setBusy(id)
    await supabase.rpc('admin_moderate_profissional', { p_id: id, p_acao: acao })
    setBusy(null)
    load()
  }

  async function excluir(motivo: string) {
    if (!excluirAlvo) return
    const { error } = await supabase.rpc('admin_moderate_profissional', { p_id: excluirAlvo.id, p_acao: 'excluir', p_motivo: motivo || null })
    if (error) throw new Error('Falha ao excluir.')
    setExcluirAlvo(null)
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
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
          placeholder="Buscar por nome, negócio ou cidade…"
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
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>Nenhum profissional encontrado.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(item => {
            const st = STATUS_LABEL[item.status_aprovacao] || { label: item.status_aprovacao, bg: '#374151', fg: 'white' }
            return (
              <div key={item.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                  <Link href={`/admin/profissionais/${item.id}`} style={{ color: 'white', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    {item.nome_negocio || item.nome}
                  </Link>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    {item.nome} · {item.email} · {item.cidade}{item.uf ? `/${item.uf}` : ''}
                  </div>
                </div>
                <span style={{ padding: '3px 9px', borderRadius: 20, fontWeight: 700, fontSize: 11, background: st.bg, color: st.fg }}>{st.label}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  {item.status_aprovacao !== 'aprovado' && (
                    <button disabled={busy === item.id} onClick={() => moderar(item.id, 'aprovar')} style={btnStyle('#059669')}>Aprovar</button>
                  )}
                  {item.status_aprovacao !== 'rejeitado' && (
                    <button disabled={busy === item.id} onClick={() => moderar(item.id, 'rejeitar')} style={btnStyle('#92400e')}>Rejeitar</button>
                  )}
                  <button disabled={busy === item.id} onClick={() => setExcluirAlvo(item)} style={btnStyle('#991b1b')}>Excluir</button>
                </div>
              </div>
            )
          })}
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
          title={`Excluir "${excluirAlvo.nome_negocio || excluirAlvo.nome}"?`}
          description="Essa ação remove o cadastro profissional permanentemente. Não pode ser desfeita."
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
