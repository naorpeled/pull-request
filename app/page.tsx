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
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <ConsentBanner
        hasConsent={hasConsent}
        onAccept={() => handleConsentChange(true)}
        onReject={() => handleConsentChange(false)}
      />
      <div style={{ 
        flex: 1, 
        maxWidth: '1400px', 
        margin: '0 auto', 
        width: '100%', 
        padding: 'var(--spacing-lg) var(--spacing-md)',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 100px)',
        gap: 'var(--spacing-lg)'
      }}>
        <div style={{
          textAlign: 'center',
          flexShrink: 0,
          paddingTop: 'var(--spacing-md)'
        }}>
          <h1 style={{ 
            marginBottom: 'var(--spacing-sm)', 
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', 
            fontWeight: '800',
            color: 'var(--text-primary)',
            lineHeight: '1.2',
            letterSpacing: '-0.02em'
          }}>
            Find Your Next Open Source Contribution
          </h1>
          <p style={{
            fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
            color: 'var(--text-secondary)',
            fontWeight: '400',
            maxWidth: '650px',
            margin: '0 auto',
            lineHeight: '1.5'
          }}>
            Discover perfect first issues tailored to your skills and interests
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

