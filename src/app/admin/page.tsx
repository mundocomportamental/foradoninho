'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import BarChart from '@/components/admin/BarChart'
import { cardStyle, tierInfo } from '@/components/admin/theme'

type Granularity = 'day' | 'week' | 'month'

interface OverviewStats {
  usuarios: { total: number; novos_hoje: number; novos_semana: number; novos_mes: number; ativos_mes: number }
  tiers: Record<string, number>
  locais: { total_ativos: number; pendentes_is_active: number; pendentes_aprovado: number; avaliados_semana: number; checkins_semana: number }
  profissionais: { total_ativos: number; pendentes: number; avaliados_semana: number; checkins_semana: number }
}

interface TopUser {
  id: string
  display_name: string | null
  username: string | null
  email: string
  total_avaliacoes: number
  total_checkins: number
  total_locais_adicionados: number
}

const TIER_LABELS: Record<string, { label: string; icon: string }> = {
  filhote: { label: 'Filhote', icon: '🐣' },
  andorinha: { label: 'Andorinha', icon: '🐦' },
  gaivota: { label: 'Gaivota', icon: '🕊️' },
  aguia: { label: 'Águia', icon: '🦅' },
}

function KpiCard({ label, value, sub, href }: { label: string; value: number | string; sub?: string; href?: string }) {
  const content = (
    <>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </>
  )
  const style: React.CSSProperties = { ...cardStyle, padding: '16px 18px', flex: '1 1 140px', display: 'block', textDecoration: 'none' }
  if (href) {
    return <Link href={href} style={{ ...style, transition: 'box-shadow 0.15s' }}>{content}</Link>
  }
  return <div style={style}>{content}</div>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )
}

function formatPeriodo(iso: string, granularity: Granularity): string {
  const d = new Date(iso)
  if (granularity === 'month') return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function AdminOverviewPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [granularity, setGranularity] = useState<Granularity>('day')
  const [contasSeries, setContasSeries] = useState<{ periodo: string; valor: number }[]>([])
  const [ativosSeries, setAtivosSeries] = useState<{ periodo: string; valor: number }[]>([])
  const [avaliadosSeries, setAvaliadosSeries] = useState<{ periodo: string; valor: number }[]>([])
  const [checkinsSeries, setCheckinsSeries] = useState<{ periodo: string; valor: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  const periods = granularity === 'day' ? 30 : granularity === 'week' ? 12 : 6

  const loadTimeseries = useCallback(async () => {
    const [contas, ativos, avaliados, checkins] = await Promise.all([
      supabase.rpc('admin_timeseries', { p_metric: 'contas_criadas', p_granularity: granularity, p_periods: periods }),
      supabase.rpc('admin_timeseries', { p_metric: 'usuarios_ativos', p_granularity: granularity, p_periods: periods }),
      supabase.rpc('admin_timeseries', { p_metric: 'avaliacoes_locais', p_granularity: granularity, p_periods: periods }),
      supabase.rpc('admin_timeseries', { p_metric: 'checkins_locais', p_granularity: granularity, p_periods: periods }),
    ])
    setContasSeries(contas.data || [])
    setAtivosSeries(ativos.data || [])
    setAvaliadosSeries(avaliados.data || [])
    setCheckinsSeries(checkins.data || [])
  }, [supabase, granularity, periods])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setErro('')
      const [{ data, error }, topUsersRes] = await Promise.all([
        supabase.rpc('admin_overview_stats'),
        supabase.rpc('admin_list_users', { p_sort: 'ativos', p_limit: 6, p_offset: 0 }),
      ])
      if (error) { setErro('Não foi possível carregar os dados.'); setLoading(false); return }
      setStats(data as OverviewStats)
      setTopUsers((topUsersRes.data?.items || []) as TopUser[])
      await loadTimeseries()
      setLoading(false)
    }
    load()
  }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading) loadTimeseries()
  }, [granularity]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div style={{ color: 'var(--text-muted)' }}>Carregando…</div>
  if (erro) return <div style={{ color: '#dc2626' }}>{erro}</div>
  if (!stats) return null

  return (
    <div>
      <Section title="Usuários">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <KpiCard label="Total de contas" value={stats.usuarios.total} href="/admin/usuarios" />
          <KpiCard label="Novas hoje" value={stats.usuarios.novos_hoje} />
          <KpiCard label="Novas essa semana" value={stats.usuarios.novos_semana} />
          <KpiCard label="Novas esse mês" value={stats.usuarios.novos_mes} />
          <KpiCard label="Ativos no mês" value={stats.usuarios.ativos_mes} sub="2+ dias distintos com login" />
        </div>
      </Section>

      <Section title="Classificação de contribuidores">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(['filhote', 'andorinha', 'gaivota', 'aguia'] as const).map(tier => (
            <KpiCard key={tier} label={`${TIER_LABELS[tier].icon} ${TIER_LABELS[tier].label}`} value={stats.tiers[tier] || 0} />
          ))}
        </div>
      </Section>

      <Section title="Contas mais ativas">
        <div style={{ ...cardStyle, padding: 8 }}>
          {topUsers.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 12 }}>Sem atividade registrada ainda.</div>
          ) : (
            topUsers.map((u, i) => {
              const total = u.total_avaliacoes + u.total_checkins + u.total_locais_adicionados
              const tier = tierInfo(u.total_avaliacoes + u.total_checkins)
              return (
                <Link key={u.id} href={`/admin/usuarios/${u.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--radius-sm)',
                  textDecoration: 'none', color: 'var(--text)',
                  borderBottom: i < topUsers.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', width: 18 }}>{i + 1}</div>
                  <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{u.display_name || u.username || u.email}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {tier.icon} {tier.label} · {u.total_avaliacoes} avaliações · {u.total_checkins} check-ins · {u.total_locais_adicionados} locais
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--green-dark)' }}>{total}</div>
                </Link>
              )
            })
          )}
        </div>
        {topUsers.length > 0 && (
          <Link href="/admin/usuarios?sort=ativos" style={{ display: 'inline-block', marginTop: 8, fontSize: 12, color: 'var(--green-dark)', fontWeight: 700, textDecoration: 'none' }}>
            Ver ranking completo →
          </Link>
        )}
      </Section>

      <Section title="Locais">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <KpiCard label="Ativos no mapa" value={stats.locais.total_ativos} href="/admin/locais?filtro=ativos" />
          <KpiCard label="Pendentes (is_active)" value={stats.locais.pendentes_is_active} sub="precisam de confirmação" href="/admin/locais?filtro=pendentes" />
          <KpiCard label="Pendentes (aprovado)" value={stats.locais.pendentes_aprovado} sub="gate secundário (fotos)" href="/admin/locais?filtro=pendentes" />
          <KpiCard label="Avaliados essa semana" value={stats.locais.avaliados_semana} />
          <KpiCard label="Com check-in essa semana" value={stats.locais.checkins_semana} />
        </div>
      </Section>

      <Section title="Profissionais">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <KpiCard label="Ativos e aprovados" value={stats.profissionais.total_ativos} href="/admin/profissionais?filtro=aprovados" />
          <KpiCard label="Pendentes de aprovação" value={stats.profissionais.pendentes} href="/admin/profissionais?filtro=pendentes" />
          <KpiCard label="Avaliados essa semana" value={stats.profissionais.avaliados_semana} />
          <KpiCard label="Com check-in essa semana" value={stats.profissionais.checkins_semana} />
        </div>
      </Section>

      <Section title="Evolução">
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {(['day', 'week', 'month'] as const).map(g => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: '1px solid var(--border)', fontFamily: 'var(--font)',
                background: granularity === g ? 'var(--green-soft)' : 'var(--bg-card)',
                color: granularity === g ? 'var(--green-dark)' : 'var(--text-muted)',
              }}
            >
              {g === 'day' ? 'Dia' : g === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ ...cardStyle, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Contas criadas</div>
            <BarChart data={contasSeries} color="var(--green)" formatLabel={p => formatPeriodo(p, granularity)} />
          </div>
          <div style={{ ...cardStyle, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Usuários ativos (com sessão)</div>
            <BarChart data={ativosSeries} color="#4caf85" formatLabel={p => formatPeriodo(p, granularity)} />
          </div>
          <div style={{ ...cardStyle, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Locais avaliados</div>
            <BarChart data={avaliadosSeries} color="#f59e0b" formatLabel={p => formatPeriodo(p, granularity)} />
          </div>
          <div style={{ ...cardStyle, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 10 }}>Locais com check-in</div>
            <BarChart data={checkinsSeries} color="#a78bfa" formatLabel={p => formatPeriodo(p, granularity)} />
          </div>
        </div>
      </Section>
    </div>
  )
}
