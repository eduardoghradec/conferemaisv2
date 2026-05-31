'use client'

export default function OfflinePage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: '#080808',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF6500, #FF8C35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
          fontSize: 26,
          fontWeight: 800,
          color: '#fff',
        }}
      >
        C+
      </div>

      <h1
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#ffffff',
          margin: '0 0 10px',
          letterSpacing: '-0.3px',
        }}
      >
        Você está offline
      </h1>

      <p
        style={{
          fontSize: 14,
          color: '#555555',
          maxWidth: 280,
          lineHeight: 1.65,
          margin: '0 0 32px',
        }}
      >
        Seus projetos e notas fiscais continuam disponíveis. Conecte-se à
        internet para sincronizar.
      </p>

      <button
        onClick={() => window.location.reload()}
        style={{
          background: 'linear-gradient(135deg, #FF6500, #FF8C35)',
          border: 'none',
          borderRadius: 12,
          padding: '12px 28px',
          fontSize: 14,
          fontWeight: 700,
          color: '#fff',
          cursor: 'pointer',
          letterSpacing: '-0.2px',
        }}
      >
        Tentar novamente
      </button>
    </div>
  )
}
