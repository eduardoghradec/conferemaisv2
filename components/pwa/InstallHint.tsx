'use client'

import { useEffect, useState } from 'react'

export function InstallHint() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const dismissed = localStorage.getItem('confere-install-hint-v1')

    if (isIOS && !isStandalone && !dismissed) {
      const timer = setTimeout(() => setVisible(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('confere-install-hint-v1', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))',
        left: '1.25rem',
        right: '1.25rem',
        zIndex: 100,
        background: '#141414',
        border: '1px solid #2A2A2A',
        borderRadius: 16,
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6500, #FF8C35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: 13,
          color: '#fff',
          flexShrink: 0,
        }}
      >
        C+
      </div>
      <span style={{ fontSize: 12, color: '#A0A0A0', flex: 1, lineHeight: 1.55 }}>
        Adicione à tela de início: toque em{' '}
        <span style={{ color: '#FF6500' }}>compartilhar</span> e depois{' '}
        <span style={{ color: '#FF6500' }}>Adicionar à Tela de Início</span>.
      </span>
      <button
        onClick={dismiss}
        aria-label="Fechar"
        style={{
          background: 'none',
          border: 'none',
          color: '#555555',
          fontSize: 22,
          cursor: 'pointer',
          padding: '0 2px',
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  )
}
