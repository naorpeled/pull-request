'use client'

import { useState } from 'react'

export default function PrivacyDisclaimer() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      style={{
        marginBottom: 'var(--spacing-lg)',
        padding: 'var(--spacing-md) var(--spacing-lg)',
        backgroundColor: 'var(--bg-secondary)',
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        fontSize: '0.9rem',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--primary)',
          cursor: 'pointer',
          textDecoration: 'none',
          fontSize: '0.95rem',
          padding: 0,
          marginBottom: isExpanded ? 'var(--spacing-sm)' : 0,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          fontWeight: '600',
          transition: 'color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--primary-dark)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--primary)';
        }}
      >
        <span style={{
          fontSize: '0.7rem',
          transition: 'transform 0.2s ease',
          transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
          display: 'inline-block'
        }}>▶</span>
        Privacy Notice
      </button>
      {isExpanded && (
        <div style={{ 
          color: 'var(--text-secondary)', 
          lineHeight: '1.6',
          paddingTop: 'var(--spacing-sm)',
          borderTop: '1px solid var(--border-color-light)',
          marginTop: 'var(--spacing-sm)'
        }}>
          <p style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--text-primary)' }}>
            <strong>Your chat data is not stored.</strong> We do not save your messages or conversation history in our database.
          </p>
          <p style={{ marginBottom: 'var(--spacing-sm)' }}>
            If you consent to analytics, we send anonymous usage metrics (like page views and feature usage) to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>Mixpanel</strong> and <strong style={{ color: 'var(--text-primary)' }}>Google Analytics</strong>. We do not send your chat messages or any personal information.
          </p>
          <p>
            <a href="/privacy" style={{ 
              color: 'var(--primary)', 
              textDecoration: 'underline',
              fontWeight: '500'
            }}>
              Read our full privacy policy →
            </a>
          </p>
        </div>
      )}
    </div>
  )
}

