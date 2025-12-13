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
        backgroundColor: 'var(--bg-secondary)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-color)',
        padding: 'var(--spacing-lg)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        zIndex: 1000,
      }}
    >
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: 'var(--spacing-lg)', 
        flexWrap: 'wrap' 
      }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <p style={{ 
            marginBottom: 'var(--spacing-sm)', 
            fontWeight: '600',
            color: 'var(--text-primary)',
            fontSize: '1rem'
          }}>
            We use analytics to improve your experience
          </p>
          <p style={{ 
            fontSize: '0.9rem', 
            color: 'var(--text-secondary)',
            lineHeight: '1.5'
          }}>
            We send anonymous usage metrics to Mixpanel and Google Analytics. Your chat messages are{' '}
            <strong style={{ color: 'var(--text-primary)' }}>not stored</strong> in our database.{' '}
            <a href="/privacy" style={{ 
              color: 'var(--primary)', 
              textDecoration: 'underline',
              fontWeight: '500'
            }}>
              Learn more
            </a>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <button
            onClick={onReject}
            style={{
              padding: 'var(--spacing-md) var(--spacing-xl)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color-light)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-color-light)';
            }}
          >
            Decline
          </button>
          <button
            onClick={onAccept}
            style={{
              padding: 'var(--spacing-md) var(--spacing-xl)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}

