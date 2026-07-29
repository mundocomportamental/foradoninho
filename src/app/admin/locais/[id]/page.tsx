'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

interface Detail {
  local: {
    id: string; nome: string; tipo: string; cidade: string | null; estado: string | null
    endereco: string | null; lat: number | null; lng: number | null
    is_active: boolean; aprovado: boolean; rating: number; total_ratings: number; total_checkins: number
    created_at: string
  }
  adicionado_por: { id: string; email: string; display_name: string | null } | null
  avaliacoes_recentes: {
    id: string; user_id: string; user_email: string; user_nome: string | null
    rating: number | null; experiencia: number | null; limpeza: number | null; atendimento: number | null
    instalacoes: number | null; comentario: string | null; created_at: string
  }[]
  checkins_recentes: { id: string; user_id: string; user_email: string; user_nome: string | null; created_at: string }[]
}

export default function AdminLocalDetailPage() {
  const supabase = createClient()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [excluirAvaliacao, setExcluirAvaliacao] = useState<string | null>(null)
  const [excluirCheckin, setExcluirCheckin] = useState<string | null>(null)
  const [excluirLocal, setExcluirLocal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_get_local_detail', { p_local_id: id })
    if (error) { setErro('Local não encontrado.'); setLoading(false); return }
    setDetail(data as Detail)
    setLoading(false)
  }, [supabase, id])

  useEffect(() => { load() }, [load])

  async function moderar(acao: 'aprovar' | 'rejeitar') {
    await supabase.rpc('admin_moderate_local', { p_local_id: id, p_acao: acao })
    load()
  }

  async function confirmarExcluirAvaliacao(motivo: string) {
    if (!excluirAvaliacao) return
    await supabase.rpc('admin_delete_avaliacao', { p_id: excluirAvaliacao, p_motivo: motivo || null })
    setExcluirAvaliacao(null)
    load()
  }

  async function confirmarExcluirCheckin(motivo: string) {
    if (!excluirCheckin) return
    await supabase.rpc('admin_delete_checkin', { p_id: excluirCheckin, p_motivo: motivo || null })
    setExcluirCheckin(null)
    load()
  }

  async function confirmarExcluirLocal() {
    await supabase.rpc('admin_moderate_local', { p_local_id: id, p_acao: 'excluir' })
    router.push('/admin/locais')
  }

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando…</div>
  if (erro || !detail) return <div style={{ color: '#f87171' }}>{erro}</div>

  const { local } = detail

  return (
    <div>
      <Link href="/admin/locais" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>← Voltar</Link>

      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 14, padding: 20, marginTop: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{local.nome}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              {local.tipo} · {local.endereco ? `${local.endereco}, ` : ''}{local.cidade}/{local.estado}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
              lat/lng: {local.lat ?? '—'}, {local.lng ?? '—'} · criado em {new Date(local.created_at).toLocaleString('pt-BR')}
            </div>
            {detail.adicionado_por && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
                Adicionado por{' '}
                <Link href={`/admin/usuarios/${detail.adicionado_por.id}`} style={{ color: '#33CCCC', textDecoration: 'none', fontWeight: 700 }}>
                  {detail.adicionado_por.display_name || detail.adicionado_por.email}
                </Link>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ fontSize: 12, display: 'flex', gap: 6 }}>
              <span style={{ padding: '3px 9px', borderRadius: 20, fontWeight: 700, background: local.is_active ? '#064e3b' : '#78350f', color: local.is_active ? '#34d399' : '#fbbf24' }}>
                {local.is_active ? 'ativo no mapa' : 'pendente'}
              </span>
              {!local.aprovado && <span style={{ padding: '3px 9px', borderRadius: 20, fontWeight: 700, background: '#1e3a8a', color: '#93c5fd' }}>fotos pendentes</span>}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              ⭐ {local.rating?.toFixed(1) ?? '0.0'} ({local.total_ratings} avaliações) · {local.total_checkins} check-ins
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {!local.is_active
                ? <button onClick={() => moderar('aprovar')} style={btnStyle('#059669')}>Aprovar</button>
                : <button onClick={() => moderar('rejeitar')} style={btnStyle('#92400e')}>Desativar</button>}
              <button onClick={() => setExcluirLocal(true)} style={btnStyle('#991b1b')}>Excluir local</button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Avaliações recentes ({detail.avaliacoes_recentes.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {detail.avaliacoes_recentes.length === 0 && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Nenhuma avaliação ainda.</div>}
            {detail.avaliacoes_recentes.map(a => (
              <div key={a.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <Link href={`/admin/usuarios/${a.user_id}`} style={{ color: '#33CCCC', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                    {a.user_nome || a.user_email}
                  </Link>
                  <button onClick={() => setExcluirAvaliacao(a.id)} style={{ ...btnStyle('transparent'), color: '#f87171', border: '1px solid #7f1d1d', padding: '3px 8px', fontSize: 11 }}>Excluir</button>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                  experiência {a.experiencia ?? '—'}/10 {a.comentario ? `· "${a.comentario}"` : ''}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{new Date(a.created_at).toLocaleString('pt-BR')}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Check-ins recentes ({detail.checkins_recentes.length})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {detail.checkins_recentes.length === 0 && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Nenhum check-in ainda.</div>}
            {detail.checkins_recentes.map(c => (
              <div key={c.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Link href={`/admin/usuarios/${c.user_id}`} style={{ color: '#33CCCC', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                    {c.user_nome || c.user_email}
                  </Link>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{new Date(c.created_at).toLocaleString('pt-BR')}</div>
                </div>
                <button onClick={() => setExcluirCheckin(c.id)} style={{ ...btnStyle('transparent'), color: '#f87171', border: '1px solid #7f1d1d', padding: '3px 8px', fontSize: 11 }}>Excluir</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {excluirAvaliacao && (
        <ConfirmDialog
          title="Excluir avaliação?"
          description="Remove essa avaliação permanentemente. A nota média do local é recalculada automaticamente."
          askMotivo
          onConfirm={confirmarExcluirAvaliacao}
          onCancel={() => setExcluirAvaliacao(null)}
        />
      )}
      {excluirCheckin && (
        <ConfirmDialog
          title="Excluir check-in?"
          description="Remove esse check-in permanentemente."
          askMotivo
          onConfirm={confirmarExcluirCheckin}
          onCancel={() => setExcluirCheckin(null)}
        />
      )}
      {excluirLocal && (
        <ConfirmDialog
          title={`Excluir "${local.nome}"?`}
          description="Essa ação remove o local permanentemente do banco, incluindo avaliações e check-ins associados. Não pode ser desfeita."
          onConfirm={confirmarExcluirLocal}
          onCancel={() => setExcluirLocal(false)}
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
