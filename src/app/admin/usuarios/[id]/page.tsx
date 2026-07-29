'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Detail {
  perfil: {
    id: string; email: string; created_at: string; last_sign_in_at: string | null
    display_name: string | null; username: string | null; is_admin: boolean
    plano: string; cidade: string | null; role: string | null
  }
  contadores: { avaliacoes: number; checkins: number; locais_adicionados: number; favoritos: number }
  avaliacoes_recentes: { id: string; local_id: string; local_nome: string; is_servico: boolean; experiencia: number | null; comentario: string | null; created_at: string }[]
  checkins_recentes: { id: string; local_id: string; local_nome: string; is_servico: boolean; created_at: string }[]
  locais_adicionados_lista: { id: string; nome: string; cidade: string | null; estado: string | null; is_active: boolean; aprovado: boolean; created_at: string }[]
}

function tierInfo(total: number): { label: string; icon: string } {
  if (total > 50) return { label: 'Águia', icon: '🦅' }
  if (total > 15) return { label: 'Gaivota', icon: '🕊️' }
  if (total > 5) return { label: 'Andorinha', icon: '🐦' }
  return { label: 'Filhote', icon: '🐣' }
}

export default function AdminUsuarioDetailPage() {
  const supabase = createClient()
  const params = useParams()
  const id = params.id as string
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('admin_get_user_detail', { p_user_id: id })
    if (error) { setErro('Usuário não encontrado.'); setLoading(false); return }
    setDetail(data as Detail)
    setLoading(false)
  }, [supabase, id])

  useEffect(() => { load() }, [load])

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando…</div>
  if (erro || !detail) return <div style={{ color: '#f87171' }}>{erro}</div>

  const { perfil, contadores } = detail
  const tier = tierInfo(contadores.avaliacoes + contadores.checkins)

  return (
    <div>
      <Link href="/admin/usuarios" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>← Voltar</Link>

      <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 14, padding: 20, marginTop: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>
              {perfil.display_name || perfil.username || 'Sem nome'} {perfil.is_admin && <span style={{ fontSize: 13, color: '#fbbf24' }}>· admin</span>}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{perfil.email}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
              conta desde {new Date(perfil.created_at).toLocaleDateString('pt-BR')}
              {perfil.last_sign_in_at && ` · último acesso ${new Date(perfil.last_sign_in_at).toLocaleDateString('pt-BR')}`}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
              {perfil.cidade || '—'} · {perfil.role || '—'} · plano {perfil.plano}
            </div>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>{tier.icon} {tier.label}</div>
        </div>

        <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{contadores.avaliacoes} avaliações</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{contadores.checkins} check-ins</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{contadores.locais_adicionados} locais adicionados</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{contadores.favoritos} favoritos</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Avaliações recentes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {detail.avaliacoes_recentes.length === 0 && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Nenhuma ainda.</div>}
            {detail.avaliacoes_recentes.map(a => (
              <div key={a.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 12 }}>
                <Link href={a.is_servico ? `/admin/profissionais/${a.local_id}` : `/admin/locais/${a.local_id}`} style={{ color: '#33CCCC', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  {a.local_nome}
                </Link>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                  experiência {a.experiencia ?? '—'}/10 {a.comentario ? `· "${a.comentario}"` : ''}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{new Date(a.created_at).toLocaleString('pt-BR')}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Check-ins recentes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {detail.checkins_recentes.length === 0 && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Nenhum ainda.</div>}
            {detail.checkins_recentes.map(c => (
              <div key={c.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 12 }}>
                <Link href={c.is_servico ? `/admin/profissionais/${c.local_id}` : `/admin/locais/${c.local_id}`} style={{ color: '#33CCCC', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  {c.local_nome}
                </Link>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{new Date(c.created_at).toLocaleString('pt-BR')}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>Locais adicionados</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {detail.locais_adicionados_lista.length === 0 && <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Nenhum ainda.</div>}
            {detail.locais_adicionados_lista.map(l => (
              <div key={l.id} style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 10, padding: 12 }}>
                <Link href={`/admin/locais/${l.id}`} style={{ color: '#33CCCC', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  {l.nome}
                </Link>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                  {l.cidade}/{l.estado} · {l.is_active ? 'ativo' : 'pendente'}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{new Date(l.created_at).toLocaleString('pt-BR')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
