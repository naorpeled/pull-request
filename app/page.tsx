'use client'

import { useState, useEffect } from 'react'
import ChatInterface from '@/components/ChatInterface'
import ConsentBanner from '@/components/ConsentBanner'
import PrivacyDisclaimer from '@/components/PrivacyDisclaimer'
import { initializeAnalytics } from '@/lib/analytics'

export default function Home() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)
  const [preferredLanguages, setPreferredLanguages] = useState<string[]>([])

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

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <ConsentBanner
        hasConsent={hasConsent}
        onAccept={() => handleConsentChange(true)}
        onReject={() => handleConsentChange(false)}
      />
      <div style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '20px' }}>
        <h1 style={{ marginBottom: '20px', fontSize: '2rem', fontWeight: 'bold' }}>
          Find Your Next Open Source Contribution
        </h1>
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

