'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import BarChart from '@/components/admin/BarChart'

type Granularity = 'day' | 'week' | 'month'

interface OverviewStats {
  usuarios: { total: number; novos_hoje: number; novos_semana: number; novos_mes: number; ativos_mes: number }
  tiers: Record<string, number>
  locais: { total_ativos: number; pendentes_is_active: number; pendentes_aprovado: number; avaliados_semana: number; checkins_semana: number }
  profissionais: { total_ativos: number; pendentes: number; avaliados_semana: number; checkins_semana: number }
}

const TIER_LABELS: Record<string, { label: string; icon: string }> = {
  filhote: { label: 'Filhote', icon: '🐣' },
  andorinha: { label: 'Andorinha', icon: '🐦' },
  gaivota: { label: 'Gaivota', icon: '🕊️' },
  aguia: { label: 'Águia', icon: '🦅' },
}

function KpiCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 14, padding: '16px 18px', flex: '1 1 140px' }}>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: 'white' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>{title}</div>
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
      const { data, error } = await supabase.rpc('admin_overview_stats')
      if (error) { setErro('Não foi possível carregar os dados.'); setLoading(false); return }
      setStats(data as OverviewStats)
      await loadTimeseries()
      setLoading(false)
    }
    load()
  }, [supabase]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading) loadTimeseries()
  }, [granularity]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div style={{ color: 'rgba(255,255,255,0.4)' }}>Carregando…</div>
  if (erro) return <div style={{ color: '#f87171' }}>{erro}</div>
  if (!stats) return null

  return (
    <div>
      <Section title="Usuários">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <KpiCard label="Total de contas" value={stats.usuarios.total} />
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

      <Section title="Locais">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <KpiCard label="Ativos no mapa" value={stats.locais.total_ativos} />
          <KpiCard label="Pendentes (is_active)" value={stats.locais.pendentes_is_active} sub="precisam de confirmação" />
          <KpiCard label="Pendentes (aprovado)" value={stats.locais.pendentes_aprovado} sub="gate secundário (fotos)" />
          <KpiCard label="Avaliados essa semana" value={stats.locais.avaliados_semana} />
          <KpiCard label="Com check-in essa semana" value={stats.locais.checkins_semana} />
        </div>
      </Section>

      <Section title="Profissionais">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <KpiCard label="Ativos e aprovados" value={stats.profissionais.total_ativos} />
          <KpiCard label="Pendentes de aprovação" value={stats.profissionais.pendentes} />
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
                padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                border: '1px solid #374151', fontFamily: 'inherit',
                background: granularity === g ? '#1f2937' : 'transparent',
                color: granularity === g ? 'white' : 'rgba(255,255,255,0.5)',
              }}
            >
              {g === 'day' ? 'Dia' : g === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Contas criadas</div>
            <BarChart data={contasSeries} color="#33CCCC" formatLabel={p => formatPeriodo(p, granularity)} />
          </div>
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Usuários ativos (com sessão)</div>
            <BarChart data={ativosSeries} color="#4caf85" formatLabel={p => formatPeriodo(p, granularity)} />
          </div>
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Locais avaliados</div>
            <BarChart data={avaliadosSeries} color="#f59e0b" formatLabel={p => formatPeriodo(p, granularity)} />
          </div>
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>Locais com check-in</div>
            <BarChart data={checkinsSeries} color="#a78bfa" formatLabel={p => formatPeriodo(p, granularity)} />
          </div>
        </div>
      </Section>
    </div>
  )
}
