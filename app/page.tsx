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
        maxWidth: '1600px', 
        margin: '0 auto', 
        width: '100%', 
        padding: 'var(--spacing-md)',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 100px)',
        gap: 'var(--spacing-md)'
      }}>
        <div style={{
          textAlign: 'center',
          flexShrink: 0
        }}>
          <h1 style={{ 
            marginBottom: 'var(--spacing-xs)', 
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', 
            fontWeight: '800',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '1.2',
            textShadow: '0 2px 20px rgba(255, 255, 255, 0.3)'
          }}>
            Find Your Next Open Source Contribution
          </h1>
          <p style={{
            fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
            color: 'rgba(255, 255, 255, 0.95)',
            fontWeight: '400',
            maxWidth: '600px',
            margin: '0 auto',
            textShadow: '0 1px 10px rgba(0, 0, 0, 0.2)'
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

