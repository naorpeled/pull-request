'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function PrivacyDisclaimer() {
  return (
    <Accordion defaultOpen={false} className="mb-6">
      <AccordionItem className="border rounded-lg bg-card/50 backdrop-blur-sm border-border shadow-sm">
        <AccordionTrigger className="px-4 py-3 text-primary hover:no-underline font-semibold text-[0.95rem]">
          Privacy Notice
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="text-muted-foreground leading-relaxed text-sm space-y-2 pt-2 border-t border-border/50">
            <p className="text-foreground">
              <strong>Your chat data is not stored.</strong> We do not save your messages or conversation history in our database.
            </p>
            <p>
              If you consent to analytics, we send anonymous usage metrics (like page views and feature usage) to{' '}
              <strong className="text-foreground">Mixpanel</strong> and <strong className="text-foreground">Google Analytics</strong>. We do not send your chat messages or any personal information.
            </p>
            <p>
              <a href="/privacy" className="text-primary underline font-medium">
                Read our full privacy policy →
              </a>
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
