'use client'

import { useState, useEffect } from 'react'
import ChatInterface from '@/components/ChatInterface'
import ConsentBanner from '@/components/ConsentBanner'
import PrivacyDisclaimer from '@/components/PrivacyDisclaimer'
import { initializeAnalytics } from '@/lib/analytics'
import { Skeleton } from '@/components/ui/skeleton'

export default function Home() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load consent and preferences from API
    fetch('/api/preferences')
      .then(res => res.json())
      .then(data => {
        const consent = data.consent ?? null
        setHasConsent(consent)
        setPreferredLanguages(data.preferredLanguages || [])
        
        // Initialize analytics if consent granted
        if (consent === true) {
          initializeAnalytics(true)
        }
      })
      .catch(() => {
        // First visit, no preferences yet
        setHasConsent(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const handleConsentChange = (consented: boolean) => {
    setHasConsent(consented)
    fetch('/api/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consent: consented }),
    }).catch(console.error)
    
    // Initialize analytics if consent granted
    if (consented) {
      initializeAnalytics(true)
    }
  }

  const handleLanguagesChange = (languages: string[]) => {
    setPreferredLanguages(languages)
    fetch('/api/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredLanguages: languages }),
    }).catch(console.error)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col relative">
        <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-6 flex flex-col h-[calc(100vh-100px)] gap-6">
          <div className="text-center flex-shrink-0 pt-4">
            <Skeleton className="h-10 w-[60%] mx-auto mb-4" />
            <Skeleton className="h-5 w-[45%] mx-auto mb-2" />
            <Skeleton className="h-4 w-[35%] mx-auto" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-24 flex-1 rounded-xl" />
            <Skeleton className="h-24 flex-1 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </main>
    )
  }

  const showConsentBanner = hasConsent === null

  return (
    <main className={`min-h-screen flex flex-col relative ${showConsentBanner ? 'pb-44 sm:pb-28' : 'pb-6'}`}>
      <ConsentBanner
        hasConsent={hasConsent}
        onAccept={() => handleConsentChange(true)}
        onReject={() => handleConsentChange(false)}
      />
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-6 flex flex-col h-[calc(100vh-100px)] gap-6">
        <div className="text-center flex-shrink-0 pt-4">
          <h1 className="mb-2 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold text-foreground leading-tight tracking-tight">
            Find Your Next Open Source Contribution
          </h1>
          <p className="text-[clamp(0.9rem,1.5vw,1.1rem)] text-muted-foreground font-normal max-w-[650px] mx-auto leading-relaxed mb-2">
            Discover perfect first issues tailored to your skills and interests
          </p>
          <p className="text-xs text-muted-foreground/70 max-w-[500px] mx-auto">
            💡 Tip: Press <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[0.7rem] font-mono">⌘K</kbd> or <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[0.7rem] font-mono">Ctrl+K</kbd> to search, <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[0.7rem] font-mono">Enter</kbd> to send messages
          </p>
        </div>
        <PrivacyDisclaimer />
        <ChatInterface
          preferredLanguages={preferredLanguages}
          onLanguagesChange={handleLanguagesChange}
          hasAnalyticsConsent={hasConsent === true}
        />
      </div>
    </main>
  )
}
