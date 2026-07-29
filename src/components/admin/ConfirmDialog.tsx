'use client'
import { useState } from 'react'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmWord?: string
  onConfirm: (motivo: string) => Promise<void> | void
  onCancel: () => void
  askMotivo?: boolean
}

export default function ConfirmDialog({
  title, description, confirmWord = 'EXCLUIR', onConfirm, onCancel, askMotivo = false,
}: ConfirmDialogProps) {
  const [texto, setTexto] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleConfirm() {
    setLoading(true)
    setErro('')
    try {
      await onConfirm(motivo)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro inesperado.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: 16, padding: 24, maxWidth: 420, width: '100%' }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 16 }}>{description}</div>

        {askMotivo && (
          <input
            type="text"
            value={motivo}
            onChange={e => setMotivo(e.target.value)}
            placeholder="Motivo (opcional)"
            style={{
              width: '100%', height: 40, padding: '0 12px', borderRadius: 10, marginBottom: 12,
              border: '1px solid #374151', background: '#0b0f19', color: 'white', fontSize: 13,
              boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
        )}

        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>
          Digite <strong style={{ color: 'white' }}>{confirmWord}</strong> para confirmar:
        </div>
        <input
          type="text"
          value={texto}
          onChange={e => setTexto(e.target.value)}
          autoFocus
          style={{
            width: '100%', height: 44, padding: '0 12px', borderRadius: 10, marginBottom: 16,
            border: '1px solid #374151', background: '#0b0f19', color: 'white', fontSize: 14,
            boxSizing: 'border-box', fontFamily: 'inherit', letterSpacing: 1,
          }}
        />

        {erro && <div style={{ fontSize: 12, color: '#f87171', marginBottom: 12 }}>{erro}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, height: 42, borderRadius: 10, border: '1px solid #374151', background: 'transparent',
              color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={texto !== confirmWord || loading}
            style={{
              flex: 1, height: 42, borderRadius: 10, border: 'none',
              background: texto === confirmWord ? '#dc2626' : '#374151',
              color: texto === confirmWord ? 'white' : 'rgba(255,255,255,0.4)',
              fontWeight: 700, fontSize: 13,
              cursor: texto === confirmWord && !loading ? 'pointer' : 'not-allowed',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Aplicando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}
