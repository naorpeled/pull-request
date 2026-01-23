'use client'

import { useState, useRef, useEffect } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import LanguagePicker from './LanguagePicker'
import IssueCards from './IssueCards'
import { trackEvent } from '@/lib/analytics'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  recommendedIssues?: IssueCard[]
  timestamp?: number
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
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null)
  const [issueBody, setIssueBody] = useState<string | null>(null)
  const [issueBodyStatus, setIssueBodyStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [issueBodyError, setIssueBodyError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)
  const [lastSearchParams, setLastSearchParams] = useState<{ languages: string[]; minStars: number } | null>(null)
  const [lastChatMessage, setLastChatMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatSectionRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const issueCardsRef = useRef<HTMLButtonElement[]>([])
  const [focusedIssueIndex, setFocusedIssueIndex] = useState<number>(-1)

  const [copiedMessageIdx, setCopiedMessageIdx] = useState<number | null>(null)

  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const copyToClipboard = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageIdx(idx)
      setTimeout(() => setCopiedMessageIdx(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const markdownComponents = {
    a: ({ children, href }: ComponentPropsWithoutRef<'a'>) => (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-primary font-semibold"
      >
        {children}
      </a>
    ),
    code: ({ children }: ComponentPropsWithoutRef<'code'>) => (
      <code className="bg-muted px-1 py-0.5 rounded text-[0.85em]">
        {children}
      </code>
    ),
    p: ({ children }: ComponentPropsWithoutRef<'p'>) => <p className="mb-2">{children}</p>,
    ul: ({ children }: ComponentPropsWithoutRef<'ul'>) => <ul className="pl-5 mb-2">{children}</ul>,
    ol: ({ children }: ComponentPropsWithoutRef<'ol'>) => <ol className="pl-5 mb-2">{children}</ol>,
    li: ({ children }: ComponentPropsWithoutRef<'li'>) => <li className="mb-1">{children}</li>,
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!selectedIssue) return
    requestAnimationFrame(() => {
      chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Auto-focus chat input when issue is selected
      setTimeout(() => {
        chatInputRef.current?.focus()
      }, 300)
    })
  }, [selectedIssue])

  // Get all issue buttons from repositories
  const getAllIssueButtons = (): { issue: IssueSummary; repo: RepositoryResult }[] => {
    const allIssues: { issue: IssueSummary; repo: RepositoryResult }[] = []
    repositories.forEach(repo => {
      repo.issues.forEach(issue => {
        allIssues.push({ issue, repo })
      })
    })
    return allIssues
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K to focus search (when no input is focused)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        searchButtonRef.current?.click()
      }
      // Escape to clear selection or close modals
      if (e.key === 'Escape' && selectedIssue) {
        setSelectedIssue(null)
        setMessages([])
      }

      // Arrow key navigation for issue cards
      const allIssues = getAllIssueButtons()
      if (allIssues.length === 0 || selectedIssue) return

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        const nextIndex = focusedIssueIndex < allIssues.length - 1 ? focusedIssueIndex + 1 : 0
        setFocusedIssueIndex(nextIndex)
        issueCardsRef.current[nextIndex]?.focus()
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        const prevIndex = focusedIssueIndex > 0 ? focusedIssueIndex - 1 : allIssues.length - 1
        setFocusedIssueIndex(prevIndex)
        issueCardsRef.current[prevIndex]?.focus()
      }

      // Enter to select focused issue
      if (e.key === 'Enter' && focusedIssueIndex >= 0 && focusedIssueIndex < allIssues.length) {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault()
          const { issue, repo } = allIssues[focusedIssueIndex]
          handleIssueSelect(issue, repo)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIssue, repositories, focusedIssueIndex])

  const fetchIssueBody = async (issueUrl: string) => {
    const match = issueUrl.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/i)
    if (!match) {
      setIssueBody(null)
      setIssueBodyStatus('error')
      setIssueBodyError('Could not parse issue URL.')
      return
    }

    const [, owner, repo, number] = match
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${number}`

    setIssueBodyStatus('loading')
    setIssueBody(null)
    setIssueBodyError(null)
    try {
      const res = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github+json',
        },
      })

      if (res.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please wait a few minutes and try again.')
      }

      if (!res.ok) {
        throw new Error(`Failed to load issue (status ${res.status}). Please try again.`)
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
      const errorMessage = err instanceof Error ? err.message : 'Unable to load issue description. Please try again.'
      setIssueBodyError(errorMessage)
    }
  }

  const retryFetchIssueBody = () => {
    if (selectedIssue?.url) {
      fetchIssueBody(selectedIssue.url)
    }
  }

  useEffect(() => {
    if (!selectedIssue?.url) {
      setIssueBody(null)
      setIssueBodyStatus('idle')
      setIssueBodyError(null)
      return
    }

    fetchIssueBody(selectedIssue.url)
  }, [selectedIssue])

    const handleSearch = async (retryParams?: { languages: string[]; minStars: number }) => {
    const searchLanguages = retryParams?.languages ?? preferredLanguages
    const searchMinStars = retryParams?.minStars ?? minStars
    
    setIsSearching(true)
    setStatusMessage(null)
    setSearchError(null)
    setSelectedIssue(null)
    setMessages([])
    setFocusedIssueIndex(-1)
    issueCardsRef.current = []
    setLastSearchParams({ languages: searchLanguages, minStars: searchMinStars })

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languages: searchLanguages,
          minStars: searchMinStars,
        }),
      })

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Service temporarily unavailable. Please try again in a moment.')
        }
        throw new Error('Search failed. Please try again.')
      }

      const data = await response.json()
      const repos: RepositoryResult[] = data.repositories || []
      setRepositories(repos)

      if (hasAnalyticsConsent) {
        trackEvent('repository_search', {
          languageCount: searchLanguages.length,
          minStars: searchMinStars,
          repositoryCount: repos.length,
        })
      }

      if (repos.length === 0) {
        setStatusMessage({ type: 'info', message: 'No repositories matched your filters. Try lowering the star threshold or selecting different languages.' })
      } else {
        setStatusMessage({ type: 'success', message: `Found ${repos.length} repositor${repos.length === 1 ? 'y' : 'ies'} with matching issues` })
      }
    } catch (error) {
      console.error('Search error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unable to search right now. Please try again.'
      setSearchError(errorMessage)
      setStatusMessage({ type: 'error', message: errorMessage })
    } finally {
      setIsSearching(false)
    }
  }

  const retrySearch = () => {
    if (lastSearchParams) {
      handleSearch(lastSearchParams)
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
        timestamp: Date.now(),
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

  const handleSubmit = async (e: React.FormEvent, retryMessage?: string) => {
    e?.preventDefault?.()
    const messageToSend = retryMessage || input.trim()
    if (!messageToSend || isLoading) return
    if (!selectedIssue) {
      setStatusMessage({ type: 'info', message: 'Select an issue from the search results to start chatting.' })
      return
    }

    setChatError(null)
    setLastChatMessage(messageToSend)
    if (!retryMessage) {
      setInput('')
      setMessages(prev => [...prev, { role: 'user', content: messageToSend, timestamp: Date.now() }])
    }
    setIsLoading(true)

    if (hasAnalyticsConsent) {
      trackEvent('chat_message_sent', { hasLanguages: preferredLanguages.length > 0 })
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          preferredLanguages,
          selectedIssue,
        }),
      })

      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment before trying again.')
      }

      if (!response.ok) {
        throw new Error('Failed to get a response. Please try again.')
      }

      if (!response.body) {
        throw new Error('No response received. Please try again.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let buffer = ''
      const messageTimestamp = Date.now()

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
                    if (last?.role === 'assistant' && !last.timestamp) {
                      return [...prev.slice(0, -1), { role: 'assistant', content: assistantMessage, timestamp: messageTimestamp }]
                    }
                    if (last?.role === 'assistant') {
                      return [...prev.slice(0, -1), { ...last, content: assistantMessage }]
                    }
                    return [...prev, { role: 'assistant', content: assistantMessage, timestamp: messageTimestamp }]
                  })
                }
              } else if (type === '1') {
                // Tool call or delta format
                const parsed = JSON.parse(content)
                if (parsed.type === 'text-delta' && parsed.textDelta) {
                  assistantMessage += parsed.textDelta
                  setMessages(prev => {
                    const last = prev[prev.length - 1]
                    if (last?.role === 'assistant' && !last.timestamp) {
                      return [...prev.slice(0, -1), { role: 'assistant', content: assistantMessage, timestamp: messageTimestamp }]
                    }
                    if (last?.role === 'assistant') {
                      return [...prev.slice(0, -1), { ...last, content: assistantMessage }]
                    }
                    return [...prev, { role: 'assistant', content: assistantMessage, timestamp: messageTimestamp }]
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
                      return [...prev.slice(0, -1), { ...last, content: assistantMessage }]
                    }
                    return [...prev, { role: 'assistant', content: assistantMessage, timestamp: messageTimestamp }]
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
      const errorMessage = error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.'
      setChatError(errorMessage)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: errorMessage, timestamp: Date.now() },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const retryChat = () => {
    if (lastChatMessage) {
      // Remove the last error message before retrying
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1]
        if (lastMsg?.role === 'assistant' && chatError && lastMsg.content === chatError) {
          return prev.slice(0, -1)
        }
        return prev
      })
      handleSubmit(undefined as unknown as React.FormEvent, lastChatMessage)
    }
  }

  return (
      <div className="flex flex-col flex-1 min-h-0 gap-4 sm:gap-6 relative" role="main" aria-label="Chat interface">
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-stretch py-2">
        <div className="flex-1 min-w-full sm:min-w-[280px] flex items-stretch">
          <div className="flex-1 flex flex-col min-h-full">
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
        </div>
        <Card className="flex flex-col sm:flex-row items-center gap-4 p-4 flex-1 min-w-[280px] sm:min-w-[320px] self-stretch bg-card/50 backdrop-blur-sm">
          <label className="flex flex-col gap-2 text-foreground font-medium flex-1 w-full sm:min-w-[200px]">
            <span className="text-sm">Minimum repository stars: {minStars.toLocaleString()}</span>
            <Slider
              min={0}
              max={5000}
              step={50}
              value={minStars}
              onChange={e => setMinStars(Number((e.target as HTMLInputElement).value) || 0)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              className="w-full cursor-pointer"
              aria-label="Minimum repository stars"
            />
          </label>
          <Button
            ref={searchButtonRef}
            onClick={() => handleSearch()}
            disabled={isSearching}
            className="w-full sm:w-auto sm:min-w-[160px] whitespace-nowrap shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            aria-label="Search repositories"
          >
            {isSearching ? (
              <>
                <span className="pulse-dot mr-2"></span>
                Searching...
              </>
            ) : (
              'Search repositories'
            )}
          </Button>
        </Card>
      </div>

      {statusMessage && (
        <Alert 
          className={cn(
            "border",
            statusMessage.type === 'success' && "bg-emerald-500/10 border-emerald-500/30 text-emerald-200",
            statusMessage.type === 'error' && "bg-red-500/10 border-red-500/30 text-red-200",
            statusMessage.type === 'info' && "bg-muted border-border"
          )}
          role="status" 
          aria-live="polite"
        >
          <AlertDescription className="text-sm leading-relaxed flex items-center justify-between gap-4">
            <span>{statusMessage.message}</span>
            <div className="flex gap-2">
              {statusMessage.type === 'error' && searchError && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => retrySearch()}
                  className="text-xs whitespace-nowrap"
                  aria-label="Retry search"
                >
                  Retry
                </Button>
              )}
              {repositories.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRepositories([])
                    setStatusMessage(null)
                    setSelectedIssue(null)
                    setMessages([])
                    setSearchError(null)
                  }}
                  className="text-xs whitespace-nowrap"
                  aria-label="Start new search"
                >
                  New search
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty state when no repositories and no issue selected */}
      {repositories.length === 0 && !selectedIssue && !isSearching && (
        <Card className="bg-card/50 backdrop-blur-sm border-dashed border-2 border-border/50 p-8 text-center">
          <CardContent className="flex flex-col items-center gap-4 p-0">
            <div className="text-5xl opacity-60">🔍</div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Get started</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                Select your preferred programming languages, set a minimum star threshold, 
                then click <strong className="text-foreground">Search repositories</strong> to find issues you can contribute to.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground/70 mt-2">
              <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded font-mono">⌘K</kbd>
              <span>to quickly search</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading skeletons while searching */}
      {isSearching && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm animate-pulse">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </div>
                  <div className="h-5 w-16 bg-muted rounded"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-1">
                  <div className="h-5 w-16 bg-muted rounded"></div>
                  <div className="h-5 w-20 bg-muted rounded"></div>
                </div>
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="space-y-2">
                  <div className="h-20 bg-muted/50 rounded"></div>
                  <div className="h-20 bg-muted/50 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-4 max-h-[400px] overflow-y-auto pr-1 pb-1",
        isSearching && "hidden"
      )}>
        {repositories.map(repo => (
          <Card
            key={repo.repoUrl || repo.repoName}
            className="bg-card/50 backdrop-blur-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <CardHeader>
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <CardTitle className="text-base mb-1">{repo.repoName}</CardTitle>
                  <p className="text-sm text-muted-foreground m-0">
                    {repo.repoDesc || 'No description provided.'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                  ⭐ {repo.repoStars.toLocaleString()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {repo.repoLanguages.map(lang => (
                  <Badge
                    key={lang}
                    variant="secondary"
                    className="text-xs font-semibold bg-primary/10 text-primary"
                  >
                    {lang}
                  </Badge>
                ))}
              </div>

              <div className="text-sm text-muted-foreground font-medium">
                {repo.issueCount} matching issue{repo.issueCount === 1 ? '' : 's'}
              </div>

              <div className="flex flex-col gap-2" role="listbox" aria-label="Issues in this repository">
                {repo.issues.map((issue, issueIdx) => {
                  // Calculate global index for this issue
                  let globalIndex = 0
                  for (let i = 0; i < repositories.indexOf(repo); i++) {
                    globalIndex += repositories[i].issues.length
                  }
                  globalIndex += issueIdx

                  return (
                    <Card
                      key={issue.url}
                      className={cn(
                        "bg-muted/50 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer",
                        focusedIssueIndex === globalIndex && "ring-2 ring-primary border-primary/50"
                      )}
                      role="option"
                      aria-selected={focusedIssueIndex === globalIndex}
                      tabIndex={0}
                      onFocus={() => setFocusedIssueIndex(globalIndex)}
                      onClick={() => handleIssueSelect(issue, repo)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleIssueSelect(issue, repo)
                        }
                      }}
                      ref={(el) => {
                        if (el) issueCardsRef.current[globalIndex] = el as unknown as HTMLButtonElement
                      }}
                    >
                      <CardContent className="p-4 flex flex-col gap-2">
                        <div className="font-semibold text-foreground text-[0.95rem] leading-snug">
                          {issue.title}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {issue.labels.slice(0, 3).map(label => (
                            <Badge
                              key={label}
                              variant="secondary"
                              className="text-[0.75rem] bg-primary/10 text-primary"
                            >
                              {label}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleIssueSelect(issue, repo)
                            }}
                            className="text-xs h-auto py-1.5 px-3.5 whitespace-nowrap shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
                            tabIndex={-1}
                          >
                            Chat about this issue
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Keyboard navigation hint */}
      {repositories.length > 0 && !selectedIssue && (
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60 py-2">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-muted border border-border rounded font-mono text-[0.65rem]">↑</kbd>
            <kbd className="px-1 py-0.5 bg-muted border border-border rounded font-mono text-[0.65rem]">↓</kbd>
            to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded font-mono text-[0.65rem]">Enter</kbd>
            to select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded font-mono text-[0.65rem]">Esc</kbd>
            to go back
          </span>
        </div>
      )}

      <div
        ref={chatSectionRef}
        className={cn(
          "flex flex-col gap-6 transition-all duration-200",
          selectedIssue ? "flex-1 min-h-0 opacity-100 max-h-[2400px] translate-y-0" : "flex-0 opacity-0 max-h-0 -translate-y-2 overflow-hidden pointer-events-none"
        )}
      >
        <Card className="flex-1 border-border rounded-xl p-6 overflow-y-auto bg-card/50 backdrop-blur-sm shadow-xl min-h-0 flex flex-col relative">
          <Card className="p-6 border-border rounded-lg bg-card/50 backdrop-blur-sm mb-6 flex flex-col gap-4 shadow-sm">
            {selectedIssue && (
              <>
                <div className="flex flex-col sm:flex-row justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{selectedIssue.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedIssue.repoName}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex gap-2 items-center text-muted-foreground font-semibold">
                      <span>⭐ {selectedIssue.repoStars.toLocaleString()}</span>
                      <a href={selectedIssue.repoUrl || selectedIssue.url} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">
                        View repo
                      </a>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedIssue(null)
                        setMessages([])
                        setStatusMessage(null)
                      }}
                      className="text-xs"
                      aria-label="Clear selected issue"
                    >
                      Clear selection
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedIssue.repoLanguages.map(lang => (
                    <Badge
                      key={lang}
                      variant="secondary"
                      className="text-xs font-semibold bg-primary/10 text-primary"
                    >
                      {lang}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedIssue.repoDesc || 'No repository description provided.'}
                </div>
                <div className="text-sm text-muted-foreground bg-muted border border-border rounded-md p-4 max-h-[220px] overflow-y-auto leading-relaxed">
                  {issueBodyStatus === 'loading' && (
                    <div className="flex items-center gap-2">
                      <span className="pulse-dot" aria-hidden="true"></span>
                      <span>Fetching issue description from GitHub...</span>
                    </div>
                  )}
                  {issueBodyStatus === 'error' && (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-red-300">{issueBodyError || 'Unable to load issue description.'}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={retryFetchIssueBody}
                        className="text-xs whitespace-nowrap shrink-0"
                        aria-label="Retry loading issue"
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                  {issueBodyStatus === 'ready' && (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {issueBody || ''}
                    </ReactMarkdown>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 items-center text-xs text-muted-foreground">
                  <span>Issue opened: {new Date(selectedIssue.createdAt).toLocaleDateString()}</span>
                  {selectedIssue.labels.slice(0, 3).map(label => (
                    <Badge
                      key={label}
                      variant="secondary"
                      className="text-[0.75rem] bg-primary/10 text-primary"
                    >
                      {label}
                    </Badge>
                  ))}
                  <a href={selectedIssue.url} target="_blank" rel="noreferrer" className="text-primary font-semibold">
                    Open issue
                  </a>
                </div>
              </>
            )}
          </Card>

          {selectedIssue && messages.length === 0 && (
            <div className="text-muted-foreground text-center mt-8 p-8 flex flex-col items-center justify-center flex-1">
              <div className="text-5xl mb-4 opacity-70">💬</div>
              <p className="text-lg font-medium text-foreground mb-2 max-w-[500px] leading-relaxed">
                Ready to help you contribute!
              </p>
              <p className="text-sm text-muted-foreground mt-1 max-w-[450px] leading-relaxed">
                Ask me anything about this issue — how to get started, what the code does, 
                or how to approach a fix. I'll guide you through the contribution process.
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setInput("How do I set up the development environment for this project?")}
                >
                  Setup guide
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setInput("What's the best approach to fix this issue?")}
                >
                  Fix approach
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => setInput("Where in the codebase should I look?")}
                >
                  Find code
                </Button>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "mb-4 flex flex-col group",
                msg.role === 'user' ? 'items-end' : 'items-start'
              )}
            >
              <div
                className={cn(
                  "px-4 py-3 rounded-lg max-w-[80%] flex flex-col gap-4 relative",
                  msg.recommendedIssues && msg.recommendedIssues.length > 0 && "max-w-[90%] min-w-[min(500px,90%)]",
                  msg.role === 'user'
                    ? "bg-primary text-primary-foreground rounded-br-sm shadow-md"
                    : "bg-card/50 backdrop-blur-sm text-foreground rounded-bl-sm shadow-sm border border-border",
                  msg.role === 'user' ? "rounded-tl-lg rounded-tr-lg" : "rounded-tl-lg rounded-tr-lg"
                )}
              >
                {msg.content && (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                )}
                {msg.recommendedIssues && msg.recommendedIssues.length > 0 && (
                  <div className={cn(
                    msg.content && "mt-4 pt-4 border-t border-border/50"
                  )}>
                    <IssueCards
                      issues={msg.recommendedIssues}
                      hasAnalyticsConsent={hasAnalyticsConsent}
                    />
                  </div>
                )}
                {/* Copy button for assistant messages */}
                {msg.role === 'assistant' && msg.content && (
                  <button
                    onClick={() => copyToClipboard(msg.content, idx)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    aria-label="Copy message"
                    title={copiedMessageIdx === idx ? 'Copied!' : 'Copy message'}
                  >
                    {copiedMessageIdx === idx ? (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
              {/* Timestamp */}
              {msg.timestamp && (
                <span className="text-xs text-muted-foreground/60 mt-1 px-1">
                  {formatRelativeTime(msg.timestamp)}
                </span>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2 ml-4" role="status" aria-live="polite">
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}

          {chatError && !isLoading && (
            <div className="flex items-center gap-3 ml-4 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={retryChat}
                className="text-xs"
                aria-label="Retry sending message"
              >
                Retry message
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </Card>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-4 bg-card/50 backdrop-blur-sm p-3 sm:p-4 rounded-xl border border-border shadow-lg flex-shrink-0">
          <Input
            ref={chatInputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={selectedIssue ? 'Ask for help contributing to this issue... (Press Enter to send)' : 'Select an issue to start chatting'}
            disabled={isLoading || !selectedIssue}
            className="flex-1 min-w-0"
            onKeyDown={(e) => {
              // Allow Shift+Enter for new lines, but Enter alone submits
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (input.trim() && !isLoading && selectedIssue) {
                  const form = e.currentTarget.closest('form')
                  if (form) {
                    const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
                    form.dispatchEvent(submitEvent)
                  }
                }
              }
            }}
            aria-label="Chat input"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim() || !selectedIssue}
            className="shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all w-full sm:w-auto"
            aria-label="Send message"
          >
            {isLoading ? (
              <>
                <span className="pulse-dot mr-2"></span>
                Sending...
              </>
            ) : (
              'Send'
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
