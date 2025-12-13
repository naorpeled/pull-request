'use client'

import { useState } from 'react'

export default function PrivacyDisclaimer() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      style={{
        marginBottom: '20px',
        padding: '12px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        fontSize: '0.9rem',
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          background: 'none',
          border: 'none',
          color: '#0070f3',
          cursor: 'pointer',
          textDecoration: 'underline',
          fontSize: '0.9rem',
          padding: 0,
          marginBottom: isExpanded ? '8px' : 0,
          display: 'block',
        }}
      >
        {isExpanded ? '▼' : '▶'} Privacy Notice
      </button>
      {isExpanded && (
        <div style={{ color: '#666', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '8px' }}>
            <strong>Your chat data is not stored.</strong> We do not save your messages or conversation history in our database.
          </p>
          <p style={{ marginBottom: '8px' }}>
            If you consent to analytics, we send anonymous usage metrics (like page views and feature usage) to{' '}
            <strong>Mixpanel</strong> and <strong>Google Analytics</strong>. We do not send your chat messages or any personal information.
          </p>
          <p>
            <a href="/privacy" style={{ color: '#0070f3', textDecoration: 'underline' }}>
              Read our full privacy policy →
            </a>
          </p>
        </div>
      )}
    </div>
  )
}

