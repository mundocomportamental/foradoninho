'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

interface Detail {
  profissional: {
    id: string; nome: string; nome_negocio: string | null; email: string; telefone: string
    cidade: string | null; uf: string | null; status_aprovacao: string; ativo: boolean
    pagamento_status: string; tipo_perfil: string; resumo: string | null
    servicos: string[] | null; created_at: string
  }
  conta_vinculada: { id: string; email: string; display_name: string | null } | null
  local_sincronizado_id: string | null
  avaliacoes_recentes: {
    id: string; user_id: string; user_email: string; user_nome: string | null
    experiencia: number | null; comentario: string | null; created_at: string
  }[]
}

export default function AdminProfissionalDetailPage() {
  const supabase = createClient()
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [excluir, setExcluir] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_get_profissional_detail', { p_id: id })
    if (error) { setErro('Profissional não encontrado.'); setLoading(false); return }
    setDetail(data as Detail)
    setLoading(false)
  }, [supabase, id])

  useEffect(() => { load() }, [load])

  async function moderar(acao: 'aprovar' | 'rejeitar') {
    await supabase.rpc('admin_moderate_profissional', { p_id: id, p_acao: acao })
    load()
  }

  async function confirmarExcluir() {
    await supabase.rpc('admin_moderate_profissional', { p_id: id, p_acao: 'excluir' })
    router.push('/admin/profissionais')
  }

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando…</div>
  if (erro || !detail) return <div style={{ color: '#f87171' }}>{erro}</div>

  const p = detail.profissional

  return (
    <div>
      <Link href="/admin/profissionais" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>← Voltar</Link>

      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 14, padding: 20, marginTop: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{p.nome_negocio || p.nome}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              {p.nome} · {p.email} · {p.telefone}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              {p.cidade}{p.uf ? `/${p.uf}` : ''} · {p.tipo_perfil === 'pj' ? 'Pessoa Jurídica' : 'Pessoa Física'} · pagamento: {p.pagamento_status}
            </div>
            {p.resumo && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, maxWidth: 480 }}>{p.resumo}</div>}
            {p.servicos && p.servicos.length > 0 && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Serviços: {p.servicos.join(', ')}</div>
            )}
            {detail.conta_vinculada && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>
                Conta vinculada:{' '}
                <Link href={`/admin/usuarios/${detail.conta_vinculada.id}`} style={{ color: '#33CCCC', textDecoration: 'none', fontWeight: 700 }}>
                  {detail.conta_vinculada.display_name || detail.conta_vinculada.email}
                </Link>
              </div>
            )}
            {!detail.conta_vinculada && (
              <div style={{ fontSize: 12, color: '#fbbf24', marginTop: 8 }}>Sem conta de usuário vinculada ainda (cadastro anônimo).</div>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {p.status_aprovacao !== 'aprovado' && <button onClick={() => moderar('aprovar')} style={btnStyle('#059669')}>Aprovar</button>}
              {p.status_aprovacao !== 'rejeitado' && <button onClick={() => moderar('rejeitar')} style={btnStyle('#92400e')}>Rejeitar</button>}
              <button onClick={() => setExcluir(true)} style={btnStyle('#991b1b')}>Excluir</button>
            </div>
            {detail.local_sincronizado_id && (
              <Link href={`/admin/locais/${detail.local_sincronizado_id}`} style={{ fontSize: 12, color: '#33CCCC', textDecoration: 'none' }}>
                Ver listagem sincronizada →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>
        Avaliações recentes ({detail.avaliacoes_recentes.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {detail.avaliacoes_recentes.length === 0 && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Nenhuma avaliação ainda.</div>}
        {detail.avaliacoes_recentes.map(a => (
          <div key={a.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 12 }}>
            <Link href={`/admin/usuarios/${a.user_id}`} style={{ color: '#33CCCC', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
              {a.user_nome || a.user_email}
            </Link>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              experiência {a.experiencia ?? '—'}/10 {a.comentario ? `· "${a.comentario}"` : ''}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{new Date(a.created_at).toLocaleString('pt-BR')}</div>
          </div>
        ))}
      </div>

      {excluir && (
        <ConfirmDialog
          title={`Excluir "${p.nome_negocio || p.nome}"?`}
          description="Essa ação remove o cadastro profissional permanentemente. Não pode ser desfeita."
          onConfirm={confirmarExcluir}
          onCancel={() => setExcluir(false)}
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
