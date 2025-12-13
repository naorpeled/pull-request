'use client'

interface ConsentBannerProps {
  hasConsent: boolean | null
  onAccept: () => void
  onReject: () => void
}

export default function ConsentBanner({ hasConsent, onAccept, onReject }: ConsentBannerProps) {
  if (hasConsent !== null) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid #ddd',
        padding: '20px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <p style={{ marginBottom: '8px', fontWeight: '500' }}>
            We use analytics to improve your experience
          </p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            We send anonymous usage metrics to Mixpanel and Google Analytics. Your chat messages are{' '}
            <strong>not stored</strong> in our database.{' '}
            <a href="/privacy" style={{ color: '#0070f3', textDecoration: 'underline' }}>
              Learn more
            </a>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onReject}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#333',
              border: '1px solid #ddd',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

