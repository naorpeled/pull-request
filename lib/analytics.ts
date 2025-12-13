'use client'

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    mixpanel?: {
      init: (token: string, options?: Record<string, any>) => void
      track: (event: string, properties?: Record<string, any>) => void
      identify: (id: string) => void
    }
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...properties,
      // Ensure no PII is sent
      event_category: 'chatbot',
    })
  }

  // Mixpanel
  if (typeof window !== 'undefined' && window.mixpanel) {
    window.mixpanel.track(eventName, {
      ...properties,
      // Ensure no PII is sent
    })
  }
}

export function initializeAnalytics(hasConsent: boolean) {
  if (typeof window === 'undefined' || !hasConsent) {
    return
  }

  // Initialize Google Analytics
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (gaId) {
    const script1 = document.createElement('script')
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script1)

    const script2 = document.createElement('script')
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}', {
        anonymize_ip: true,
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
    `
    document.head.appendChild(script2)
  }

  // Initialize Mixpanel
  const mixpanelToken = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
  if (mixpanelToken) {
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js'
    script.onload = () => {
      if (window.mixpanel) {
        window.mixpanel.init(mixpanelToken, {
          track_pageview: true,
          persistence: 'localStorage',
        })
      }
    }
    document.head.appendChild(script)
  }
}

