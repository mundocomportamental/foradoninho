'use client'
import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// Assina mudanças (INSERT/UPDATE/DELETE) numa tabela via Supabase Realtime e
// chama `onChange` (tipicamente um reload da lista) sempre que algo mudar —
// usado no Admin pra manter as listas de avaliações/checkins/profissionais
// atualizadas sem precisar recarregar a página manualmente.
export function useRealtimeRefresh(table: string, onChange: () => void, filter?: string) {
  const callbackRef = useRef(onChange)
  callbackRef.current = onChange

  useEffect(() => {
    const supabase = createClient()
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const channel = supabase
      .channel(`admin-${table}-changes-${filter || 'all'}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table, ...(filter ? { filter } : {}) },
        () => {
          if (debounceTimer) clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => callbackRef.current(), 400)
        }
      )
      .subscribe()

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [table, filter])
}
