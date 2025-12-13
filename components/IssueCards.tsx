'use client'

import { trackEvent } from '@/lib/analytics'

interface IssueCard {
  url: string
  title: string
  repoName: string
  repoDesc: string
  repoStars: number
  labels: string[]
  createdAt: string
}

export default function IssueCards({
  issues,
  hasAnalyticsConsent,
}: {
  issues: IssueCard[]
  hasAnalyticsConsent: boolean
}) {
  const handleIssueClick = (url: string) => {
    if (hasAnalyticsConsent) {
      trackEvent('issue_link_clicked', { issueUrl: url })
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '16px', fontSize: '1.25rem', fontWeight: '600' }}>
        Recommended Issues
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {issues.map((issue, idx) => (
          <div
            key={idx}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              transition: 'box-shadow 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'none'
            }}
            onClick={() => handleIssueClick(issue.url)}
          >
            <div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: '#0070f3',
                  textDecoration: 'underline',
                }}
              >
                {issue.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '4px' }}>
                <strong>{issue.repoName}</strong>
              </p>
              <p style={{ fontSize: '0.85rem', color: '#888' }}>{issue.repoDesc}</p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {issue.labels.slice(0, 5).map((label, labelIdx) => (
                <span
                  key={labelIdx}
                  style={{
                    padding: '2px 8px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    color: '#666',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#888' }}>
              <span>⭐ {issue.repoStars}</span>
              <span>{formatDate(issue.createdAt)}</span>
            </div>

            <button
              onClick={e => {
                e.stopPropagation()
                handleIssueClick(issue.url)
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: '500',
                cursor: 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              Open on GitHub →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

