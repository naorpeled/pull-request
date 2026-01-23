'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ConsentBannerProps {
  hasConsent: boolean | null
  onAccept: () => void
  onReject: () => void
}

export default function ConsentBanner({ hasConsent, onAccept, onReject }: ConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  useEffect(() => {
    if (hasConsent === null) {
      // Delay showing banner for smooth entrance
      const timer = setTimeout(() => setIsVisible(true), 300)
      return () => clearTimeout(timer)
    }
  }, [hasConsent])

  const handleAccept = () => {
    setIsAnimatingOut(true)
    setTimeout(() => {
      onAccept()
    }, 200)
  }

  const handleReject = () => {
    setIsAnimatingOut(true)
    setTimeout(() => {
      onReject()
    }, 200)
  }

  if (hasConsent !== null) {
    return null
  }

  return (
    <Alert 
        className={`
          fixed bottom-0 left-0 right-0 z-[1000] rounded-none border-t border-x-0 
          shadow-[0_-4px_20px_rgba(0,0,0,0.15)] bg-card/95 backdrop-blur-xl
          transition-all duration-300 ease-out
          ${isVisible && !isAnimatingOut ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
        `}
        role="dialog"
        aria-label="Cookie consent"
      >
        <div className="max-w-[1400px] mx-auto px-4 py-4 sm:py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <p className="mb-1 font-semibold text-foreground text-sm sm:text-base">
              We use analytics to improve your experience
            </p>
            <AlertDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We send anonymous usage metrics to Mixpanel and Google Analytics. Your chat messages are{' '}
              <strong className="text-foreground">not stored</strong> in our database.{' '}
              <a href="/privacy" className="text-primary underline font-medium hover:text-primary/80 transition-colors">
                Learn more
              </a>
            </AlertDescription>
          </div>
          <div className="flex gap-3 w-full sm:w-auto shrink-0">
            <Button
              variant="outline"
              onClick={handleReject}
              className="text-sm flex-1 sm:flex-none"
            >
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              className="text-sm flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all"
            >
              Accept
            </Button>
          </div>
        </div>
      </Alert>
  )
}
