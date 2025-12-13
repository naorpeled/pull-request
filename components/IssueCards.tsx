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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-sm)',
      width: '100%',
    }}>
      <h3 style={{ 
        marginBottom: 'var(--spacing-xs)', 
        fontSize: '0.95rem', 
        fontWeight: '700',
        color: 'var(--text-primary)',
      }}>
        Recommended Issues
      </h3>
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        maxHeight: '400px',
        overflowY: 'auto',
        paddingRight: 'var(--spacing-xs)',
      }}>
        {issues.map((issue, idx) => (
          <div
            key={idx}
            style={{
              border: '1px solid var(--border-color-light)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              backgroundColor: 'rgba(99, 102, 241, 0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-xs)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              e.currentTarget.style.borderColor = 'var(--primary-light)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
            onClick={() => handleIssueClick(issue.url)}
          >
            <div>
              <h3
                style={{
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  marginBottom: 'var(--spacing-xs)',
                  color: 'var(--primary-dark)',
                  lineHeight: '1.3',
                }}
              >
                {issue.title}
              </h3>
              <p style={{ 
                fontSize: '0.85rem', 
                color: 'var(--text-primary)', 
                marginBottom: 'var(--spacing-xs)',
                fontWeight: '500'
              }}>
                {issue.repoName}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
              {issue.labels.slice(0, 3).map((label, labelIdx) => (
                <span
                  key={labelIdx}
                  style={{
                    padding: '2px var(--spacing-xs)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.7rem',
                    color: 'var(--primary-dark)',
                    fontWeight: '500',
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              fontSize: '0.75rem', 
              color: 'var(--text-secondary)',
            }}>
              <span>⭐ {issue.repoStars.toLocaleString()}</span>
              <span>{formatDate(issue.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

