'use client'

import { useState, useRef, useEffect } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import LanguagePicker from './LanguagePicker'
import IssueCards from './IssueCards'
import { trackEvent } from '@/lib/analytics'

interface Message {
  role: 'user' | 'assistant'
  content: string
  recommendedIssues?: IssueCard[]
}

interface IssueCard {
  url: string
  title: string
  repoName: string
  repoDesc: string
  repoStars: number
  labels: string[]
  createdAt: string
}

interface IssueSummary {
  url: string
  title: string
  labels: string[]
  createdAt: string
  commentCount?: number
  assigneeCount?: number
}

interface RepositoryResult {
  repoName: string
  repoDesc: string
  repoUrl: string
  repoStars: number
  repoLanguages: string[]
  issueCount: number
  issues: IssueSummary[]
}

interface SelectedIssue extends IssueSummary {
  repoName: string
  repoDesc: string
  repoUrl: string
  repoStars: number
  repoLanguages: string[]
}

export default function ChatInterface({
  preferredLanguages,
  onLanguagesChange,
  hasAnalyticsConsent,
}: {
  preferredLanguages: string[]
  onLanguagesChange: (languages: string[]) => void
  hasAnalyticsConsent: boolean
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [minStars, setMinStars] = useState<number>(0)
  const [repositories, setRepositories] = useState<RepositoryResult[]>([])
  const [selectedIssue, setSelectedIssue] = useState<SelectedIssue | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [issueBody, setIssueBody] = useState<string | null>(null)
  const [issueBodyStatus, setIssueBodyStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [issueBodyError, setIssueBodyError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const markdownComponents = {
    a: ({ children, href }: ComponentPropsWithoutRef<'a'>) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        style={{ color: 'var(--primary)', fontWeight: 600 }}
      >
        {children}
      </a>
    ),
    code: ({ children }: ComponentPropsWithoutRef<'code'>) => (
      <code
        style={{
          backgroundColor: 'rgba(255,255,255,0.08)',
          padding: '2px 4px',
          borderRadius: '4px',
          fontSize: '0.85em'
        }}
      >
        {children}
      </code>
    ),
    p: ({ children }: ComponentPropsWithoutRef<'p'>) => <p style={{ margin: '0 0 8px 0' }}>{children}</p>,
    ul: ({ children }: ComponentPropsWithoutRef<'ul'>) => <ul style={{ paddingLeft: '20px', margin: '0 0 8px 0' }}>{children}</ul>,
    ol: ({ children }: ComponentPropsWithoutRef<'ol'>) => <ol style={{ paddingLeft: '20px', margin: '0 0 8px 0' }}>{children}</ol>,
    li: ({ children }: ComponentPropsWithoutRef<'li'>) => <li style={{ marginBottom: '4px' }}>{children}</li>,
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!selectedIssue?.url) {
      setIssueBody(null)
      setIssueBodyStatus('idle')
      setIssueBodyError(null)
      return
    }

    const match = selectedIssue.url.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/i)
    if (!match) {
      setIssueBody(null)
      setIssueBodyStatus('error')
      setIssueBodyError('Could not parse issue URL.')
      return
    }

    const [, owner, repo, number] = match
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${number}`

    const fetchBody = async () => {
      setIssueBodyStatus('loading')
      setIssueBody(null)
      setIssueBodyError(null)
      try {
        const res = await fetch(apiUrl, {
          headers: {
            Accept: 'application/vnd.github+json',
          },
        })

        if (!res.ok) {
          throw new Error(`GitHub responded with ${res.status}`)
        }

        const data = await res.json()
        const bodyText = typeof data.body === 'string' && data.body.trim().length > 0
          ? data.body
          : 'No description provided.'
        setIssueBody(bodyText)
        setIssueBodyStatus('ready')
      } catch (err) {
        setIssueBody(null)
        setIssueBodyStatus('error')
        setIssueBodyError('Unable to load issue description from GitHub. You may be rate limited; try again later.')
      }
    }

    fetchBody()
  }, [selectedIssue])

  const handleSearch = async () => {
    setIsSearching(true)
    setStatusMessage(null)
    setSelectedIssue(null)
    setMessages([])

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languages: preferredLanguages,
          minStars,
        }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      const repos: RepositoryResult[] = data.repositories || []
      setRepositories(repos)

      if (hasAnalyticsConsent) {
        trackEvent('repository_search', {
          languageCount: preferredLanguages.length,
          minStars,
          repositoryCount: repos.length,
        })
      }

      if (repos.length === 0) {
        setStatusMessage('No repositories matched your filters. Try adjusting stars or languages.')
      }
    } catch (error) {
      console.error('Search error:', error)
      setStatusMessage('Unable to search right now. Please try again in a moment.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleIssueSelect = (issue: IssueSummary, repo: RepositoryResult) => {
    const selection: SelectedIssue = {
      ...issue,
      repoName: repo.repoName,
      repoDesc: repo.repoDesc,
      repoUrl: repo.repoUrl,
      repoStars: repo.repoStars,
      repoLanguages: repo.repoLanguages,
    }
    setSelectedIssue(selection)
    const issueContext = [
      `Great choice! You picked "${issue.title}" from ${repo.repoName}.`,
      repo.repoDesc ? `Repo summary: ${repo.repoDesc}` : null,
      `Stars: ${repo.repoStars.toLocaleString()} • Languages: ${repo.repoLanguages.join(', ') || 'n/a'}`,
      issue.labels.length ? `Labels: ${issue.labels.slice(0, 5).join(', ')}` : 'Labels: none listed',
      `Issue opened: ${new Date(issue.createdAt).toLocaleDateString()}`,
      `Issue link: ${issue.url}`,
      '',
      'Ask for: setup steps, how to reproduce, where to look in the repo, a step-by-step plan, or what a good first PR might include.',
    ]
      .filter(Boolean)
      .join('\n')

    setMessages([
      {
        role: 'assistant',
        content: issueContext,
      },
    ])

    if (hasAnalyticsConsent) {
      trackEvent('issue_selected', {
        repo: repo.repoName,
        issueUrl: issue.url,
        stars: repo.repoStars,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    if (!selectedIssue) {
      setStatusMessage('Pick an issue from the search results to start chatting.')
      return
    }

    const userMessage = input.trim()
    setStatusMessage(null)
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    if (hasAnalyticsConsent) {
      trackEvent('chat_message_sent', { hasLanguages: preferredLanguages.length > 0 })
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          preferredLanguages,
          selectedIssue,
        }),
      })

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.trim()) continue

          // Handle AI SDK format: 0:"text" or 1:{"type":"text-delta","textDelta":"..."}
          if (line.match(/^\d+:/)) {
            const colonIndex = line.indexOf(':')
            const type = line.substring(0, colonIndex)
            const content = line.substring(colonIndex + 1)

            try {
              if (type === '0') {
                // Text chunk format: 0:"text content"
                const parsed = JSON.parse(content)
                if (typeof parsed === 'string') {
                  assistantMessage += parsed
                  setMessages(prev => {
                    const last = prev[prev.length - 1]
                    if (last?.role === 'assistant') {
                      return [...prev.slice(0, -1), { role: 'assistant', content: assistantMessage }]
                    }
                    // If no assistant message exists, create one
                    return [...prev, { role: 'assistant', content: assistantMessage }]
                  })
                }
              } else if (type === '1') {
                // Tool call or delta format
                const parsed = JSON.parse(content)
                if (parsed.type === 'text-delta' && parsed.textDelta) {
                  assistantMessage += parsed.textDelta
                  setMessages(prev => {
                    const last = prev[prev.length - 1]
                    if (last?.role === 'assistant') {
                      return [...prev.slice(0, -1), { role: 'assistant', content: assistantMessage }]
                    }
                    // If no assistant message exists, create one
                    return [...prev, { role: 'assistant', content: assistantMessage }]
                  })
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
          // Handle SSE format: data: {...}
          else if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              // Handle recommendedIssues from custom stream
              if (parsed.recommendedIssues) {
                if (hasAnalyticsConsent) {
                  trackEvent('issue_recommended', { count: parsed.recommendedIssues.length })
                }
                // Attach issues to the last assistant message
                setMessages(prev => {
                  const updated = [...prev]
                  const lastIdx = updated.length - 1
                  if (updated[lastIdx]?.role === 'assistant') {
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      recommendedIssues: parsed.recommendedIssues
                    }
                  }
                  return updated
                })
              }
              // Handle other SSE formats
              else if (parsed.content || parsed.text || parsed.delta) {
                const contentChunk = parsed.content || parsed.text || parsed.delta
                if (typeof contentChunk === 'string') {
                  assistantMessage += contentChunk
                  setMessages(prev => {
                    const last = prev[prev.length - 1]
                    if (last?.role === 'assistant') {
                      return [...prev.slice(0, -1), { role: 'assistant', content: assistantMessage }]
                    }
                    return [...prev, { role: 'assistant', content: assistantMessage }]
                  })
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        if (buffer.match(/^\d+:/)) {
          const colonIndex = buffer.indexOf(':')
          const type = buffer.substring(0, colonIndex)
          const content = buffer.substring(colonIndex + 1)
          try {
            if (type === '0') {
              const parsed = JSON.parse(content)
              if (typeof parsed === 'string') {
                assistantMessage += parsed
                setMessages(prev => {
                  const last = prev[prev.length - 1]
                  if (last?.role === 'assistant') {
                    return [...prev.slice(0, -1), { role: 'assistant', content: assistantMessage }]
                  }
                  return [...prev, { role: 'assistant', content: assistantMessage }]
                })
              }
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      flex: 1,
      minHeight: 0,
      gap: 'var(--spacing-lg)',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <LanguagePicker
            selectedLanguages={preferredLanguages}
            onChange={onLanguagesChange}
            onUpdate={() => {
              if (hasAnalyticsConsent) {
                trackEvent('language_pref_updated', { count: preferredLanguages.length })
              }
            }}
          />
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--spacing-sm)', 
          padding: 'var(--spacing-md)', 
          border: '1px solid var(--border-color)', 
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-md)'
        }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', color: 'var(--text-primary)', fontWeight: 500, minWidth: '220px' }}>
            <span>Minimum repository stars: {minStars.toLocaleString()}</span>
            <input
              type="range"
              min={0}
              max={5000}
              step={50}
              value={minStars}
              onChange={e => setMinStars(Number(e.target.value) || 0)}
              style={{ width: '100%' }}
            />
          </label>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              fontWeight: 600,
              cursor: isSearching ? 'not-allowed' : 'pointer',
              opacity: isSearching ? 0.6 : 1,
              boxShadow: isSearching ? 'none' : 'var(--shadow-md)',
              minWidth: '180px'
            }}
          >
            {isSearching ? 'Searching...' : 'Search repositories'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div style={{ 
          padding: 'var(--spacing-sm) var(--spacing-md)', 
          borderRadius: 'var(--radius-md)', 
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-color-light)',
          color: 'var(--text-secondary)'
        }}>
          {statusMessage}
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: 'var(--spacing-md)',
        maxHeight: '360px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {repositories.map(repo => (
          <div
            key={repo.repoUrl || repo.repoName}
            style={{
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--bg-secondary)',
              boxShadow: 'var(--shadow-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {repo.repoName}
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {repo.repoDesc || 'No description provided.'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                ⭐ {repo.repoStars.toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
              {repo.repoLanguages.map(lang => (
                <span
                  key={lang}
                  style={{
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    color: 'var(--primary-dark)',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}
                >
                  {lang}
                </span>
              ))}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              {repo.issueCount} matching issue{repo.issueCount === 1 ? '' : 's'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
              {repo.issues.map(issue => (
                <div
                  key={issue.url}
                  style={{
                    border: '1px solid var(--border-color-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    backgroundColor: 'var(--bg-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--primary-dark)' }}>
                    {issue.title}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {issue.labels.slice(0, 3).map(label => (
                      <span
                        key={label}
                        style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'rgba(99, 102, 241, 0.08)',
                          color: 'var(--primary-dark)',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleIssueSelect(issue, repo)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--primary-light)',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        color: 'white',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      Chat about this issue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-xl)',
          paddingRight: 'var(--spacing-xl)',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-secondary)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: 0,
          transition: 'padding-right 0.3s ease',
        }}
      >
        <div style={{ 
          padding: 'var(--spacing-md)', 
          border: '1px solid var(--border-color-light)', 
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-primary)',
          marginBottom: 'var(--spacing-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-xs)'
        }}>
          {selectedIssue ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-sm)' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedIssue.title}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {selectedIssue.repoName}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  <span>⭐ {selectedIssue.repoStars.toLocaleString()}</span>
                  <a href={selectedIssue.repoUrl || selectedIssue.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    View repo
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedIssue.repoLanguages.map(lang => (
                  <span
                    key={lang}
                    style={{
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      color: 'var(--primary-dark)',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    {lang}
                  </span>
                ))}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {selectedIssue.repoDesc || 'No repository description provided.'}
              </div>
              <div style={{ 
                color: 'var(--text-primary)', 
                fontSize: '0.9rem',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-color-light)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {issueBodyStatus === 'loading' && 'Fetching issue description from GitHub...'}
                {issueBodyStatus === 'error' && (issueBodyError || 'Unable to load issue description.')}
                {issueBodyStatus === 'ready' && (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {issueBody || ''}
                  </ReactMarkdown>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <span>Issue opened: {new Date(selectedIssue.createdAt).toLocaleDateString()}</span>
                {selectedIssue.labels.slice(0, 3).map(label => (
                  <span
                    key={label}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      color: 'var(--primary-dark)',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    {label}
                  </span>
                ))}
                <a href={selectedIssue.url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  Open issue
                </a>
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              Search and pick an issue to unlock the chat assistant.
            </div>
          )}
        </div>

        {messages.length === 0 && (
          <div style={{ 
            color: 'var(--text-secondary)', 
            textAlign: 'center', 
            marginTop: '40px',
            padding: 'var(--spacing-xl)'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: 'var(--spacing-md)',
              opacity: 0.7
            }}>💬</div>
            <p style={{ 
              fontSize: '1.05rem', 
              fontWeight: '500',
              color: 'var(--text-primary)',
              marginBottom: 'var(--spacing-sm)'
            }}>
              Choose languages, set a star threshold, search repositories, then select an issue to start chatting about contributing.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 'var(--spacing-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                borderRadius: msg.role === 'user' 
                  ? 'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg)' 
                  : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm)',
                maxWidth: msg.recommendedIssues && msg.recommendedIssues.length > 0 ? '90%' : '80%',
                minWidth: msg.recommendedIssues && msg.recommendedIssues.length > 0 ? 'min(500px, 90%)' : 'auto',
                backgroundColor: msg.role === 'user' 
                  ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
                  : 'var(--bg-primary)',
                background: msg.role === 'user' 
                  ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)'
                  : 'var(--bg-primary)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                boxShadow: msg.role === 'user' ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border-color-light)',
                lineHeight: '1.6',
                wordWrap: 'break-word',
                display: 'flex',
                flexDirection: 'column',
                gap: msg.recommendedIssues && msg.recommendedIssues.length > 0 ? 'var(--spacing-md)' : 0,
              }}
            >
              {msg.content && (
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.content}
                </div>
              )}
              {msg.recommendedIssues && msg.recommendedIssues.length > 0 && (
                <div style={{
                  marginTop: msg.content ? 'var(--spacing-md)' : 0,
                  paddingTop: msg.content ? 'var(--spacing-md)' : 0,
                  borderTop: msg.content ? '1px solid var(--border-color-light)' : 'none',
                }}>
                  <IssueCards
                    issues={msg.recommendedIssues}
                    hasAnalyticsConsent={hasAnalyticsConsent}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ 
            color: 'var(--text-secondary)', 
            fontStyle: 'italic',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            padding: 'var(--spacing-md)'
          }}>
            <span className="pulse-dot"></span>
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ 
        display: 'flex', 
        gap: 'var(--spacing-md)',
        backgroundColor: 'var(--bg-secondary)',
        backdropFilter: 'blur(10px)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={selectedIssue ? 'Ask for help contributing to this issue...' : 'Select an issue to start chatting'}
          style={{
            flex: 1,
            padding: 'var(--spacing-md) var(--spacing-lg)',
            border: '1px solid var(--border-color-light)',
            borderRadius: 'var(--radius-lg)',
            fontSize: '1rem',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color-light)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          disabled={isLoading || !selectedIssue}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim() || !selectedIssue}
          style={{
            padding: 'var(--spacing-md) var(--spacing-xl)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            fontSize: '1rem',
            fontWeight: '600',
            opacity: isLoading || !input.trim() || !selectedIssue ? 0.5 : 1,
            cursor: isLoading || !input.trim() || !selectedIssue ? 'not-allowed' : 'pointer',
            boxShadow: isLoading || !input.trim() || !selectedIssue ? 'none' : 'var(--shadow-md)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (!isLoading && input.trim() && selectedIssue) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = isLoading || !input.trim() || !selectedIssue ? 'none' : 'var(--shadow-md)';
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}

