'use client'

import { useState, useRef, useEffect } from 'react'
import LanguagePicker from './LanguagePicker'
import IssueCards from './IssueCards'
import { trackEvent } from '@/lib/analytics'

interface Message {
  role: 'user' | 'assistant'
  content: string
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
  const [isLoading, setIsLoading] = useState(false)
  const [recommendedIssues, setRecommendedIssues] = useState<IssueCard[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    setRecommendedIssues([])

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
        }),
      })

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantMessage += parsed.content
                setMessages(prev => {
                  const last = prev[prev.length - 1]
                  if (last?.role === 'assistant') {
                    return [...prev.slice(0, -1), { role: 'assistant', content: assistantMessage }]
                  }
                  return [...prev, { role: 'assistant', content: assistantMessage }]
                })
              }
              if (parsed.recommendedIssues) {
                setRecommendedIssues(parsed.recommendedIssues)
                if (hasAnalyticsConsent) {
                  trackEvent('issue_recommended', { count: parsed.recommendedIssues.length })
                }
              }
            } catch (e) {
              // Skip invalid JSON
            }
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
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', gap: '20px' }}>
      <LanguagePicker
        selectedLanguages={preferredLanguages}
        onChange={onLanguagesChange}
        onUpdate={() => {
          if (hasAnalyticsConsent) {
            trackEvent('language_pref_updated', { count: preferredLanguages.length })
          }
        }}
      />

      <div
        style={{
          flex: 1,
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          overflowY: 'auto',
          backgroundColor: 'white',
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: '#666', textAlign: 'center', marginTop: '40px' }}>
            <p>Start by selecting your preferred programming languages above, then ask me to find good first issues!</p>
            <p style={{ marginTop: '10px', fontSize: '0.9rem' }}>
              Try: &quot;Find me Python issues&quot; or &quot;Show me JavaScript projects with more than 100 stars&quot;
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                maxWidth: '80%',
                backgroundColor: msg.role === 'user' ? '#0070f3' : '#f0f0f0',
                color: msg.role === 'user' ? 'white' : '#333',
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {recommendedIssues.length > 0 && (
        <IssueCards
          issues={recommendedIssues}
          hasAnalyticsConsent={hasAnalyticsConsent}
        />
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask for good first issues..."
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '1rem',
          }}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '500',
            opacity: isLoading || !input.trim() ? 0.5 : 1,
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          Send
        </button>
      </form>
    </div>
  )
}

