'use client'

import { useEffect } from 'react'
import { useProjectStore } from '@/store/useProjectStore'

// Dispara fetchData quando o usuário volta à aba. O TTL do store evita refetches excessivos.
export function FocusRefresh() {
  const fetchData = useProjectStore((s) => s.fetchData)

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible') fetchData()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [fetchData])

  return null
}
