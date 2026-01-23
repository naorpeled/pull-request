'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { trackEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'

interface IssueCard {
  url: string
  title: string
  repoName: string
  repoDesc: string
  repoStars: number
  labels: string[]
  createdAt: string
}

export default function IssueCards({
  issues,
  hasAnalyticsConsent,
}: {
  issues: IssueCard[]
  hasAnalyticsConsent: boolean
}) {
  const handleIssueClick = (url: string) => {
    if (hasAnalyticsConsent) {
      trackEvent('issue_link_clicked', { issueUrl: url })
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return dateString
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <h3 className="mb-1 text-[0.95rem] font-bold text-foreground">
        Recommended Issues
      </h3>
      <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
        {issues.map((issue, idx) => (
          <Card
            key={idx}
            className={cn(
              "border-border/50 bg-primary/5 cursor-pointer transition-all flex-shrink-0",
              "hover:-translate-y-1 hover:shadow-xl hover:border-primary/50"
            )}
            onClick={() => handleIssueClick(issue.url)}
          >
            <CardContent className="p-3 flex flex-col gap-1">
              <div>
                <h3 className="text-[0.95rem] font-semibold mb-1 text-primary leading-tight">
                  {issue.title}
                </h3>
                <p className="text-[0.85rem] text-foreground mb-1 font-medium">
                  {issue.repoName}
                </p>
              </div>

              <div className="flex flex-wrap gap-1">
                {issue.labels.slice(0, 3).map((label, labelIdx) => (
                  <Badge
                    key={labelIdx}
                    variant="secondary"
                    className="px-1 text-[0.7rem] text-primary bg-primary/10"
                  >
                    {label}
                  </Badge>
                ))}
              </div>

              <div className="flex justify-between items-center text-[0.75rem] text-muted-foreground">
                <span>⭐ {issue.repoStars.toLocaleString()}</span>
                <span>{formatDate(issue.createdAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
