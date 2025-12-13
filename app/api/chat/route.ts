import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { kv } from '@vercel/kv'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { getAnonId, getPreferences } from '@/lib/kv'
import { IssueRecord, filterIssuesByLanguages, filterIssuesByQuery } from '@/lib/dataset'

// Rate limiting helper
async function checkRateLimit(anonId: string, ip: string): Promise<boolean> {
  const key = `rate:chat:${anonId}:${ip}`
  const count = await kv.get<number>(key) || 0
  
  if (count >= 20) { // 20 requests per window
    return false
  }

  await kv.incr(key)
  await kv.expire(key, 60) // 1 minute window
  return true
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const anonId = await getAnonId(cookieStore)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

    // Rate limiting
    const allowed = await checkRateLimit(anonId, ip)
    if (!allowed) {
      return new Response('Rate limit exceeded', { status: 429 })
    }

    const body = await request.json()
    const { message, preferredLanguages: requestedLanguages } = body

    if (!message || typeof message !== 'string') {
      return new Response('Message is required', { status: 400 })
    }

    // Get user preferences
    const prefs = await getPreferences(anonId)
    const preferredLanguages = requestedLanguages || prefs.preferredLanguages || []

    // Load dataset from KV
    const issuesJson = await kv.get<string>('dataset:issues')
    if (!issuesJson) {
      return new Response('Dataset not available. Please refresh the dataset first.', { status: 503 })
    }

    const allIssues: IssueRecord[] = JSON.parse(issuesJson)

    // Filter issues by preferred languages
    let candidateIssues = filterIssuesByLanguages(allIssues, preferredLanguages)

    // Apply query-based filtering
    candidateIssues = filterIssuesByQuery(candidateIssues, message)

    // Limit to top 20 candidates for LLM context
    candidateIssues = candidateIssues.slice(0, 20)

    if (candidateIssues.length === 0) {
      const result = await streamText({
        model: openai('gpt-4o-mini'),
        system: `You are a helpful assistant that helps developers find good first issues in open source projects.
You can only recommend issues from the provided list. Never make up or hallucinate issue URLs.
If no issues match, politely explain that and suggest adjusting the search criteria.`,
        messages: [
          {
            role: 'user',
            content: `No issues found matching the criteria. Please explain this to the user and suggest they try different languages or search terms.`,
          },
        ],
      })
      return result.toDataStreamResponse()
    }

    // Format issues for LLM context
    const issuesContext = candidateIssues.map((issue, idx) => ({
      index: idx + 1,
      url: issue.url,
      title: issue.title,
      repo: issue.repoName,
      repoDesc: issue.repoDesc,
      stars: issue.repoStars,
      languages: issue.repoLanguages.join(', '),
      labels: issue.labels.join(', '),
      createdAt: issue.createdAt,
      assignees: issue.assigneeCount,
      comments: issue.commentCount,
    }))

    const systemPrompt = `You are a helpful assistant that helps developers find good first issues in open source projects.

IMPORTANT RULES:
1. You can ONLY recommend issues from the provided candidate list. Never make up or hallucinate issue URLs.
2. Always cite the exact issue URL(s) when recommending.
3. Keep recommendations concise and actionable.
4. If the user asks for specific criteria (e.g., "more than 100 stars", "no assignees"), only recommend issues that match.
5. At the end of your response, include a JSON block with the format:
   {"recommendedIssueUrls": ["url1", "url2", ...]}
   Only include URLs from the candidate list.

Available issues:
${JSON.stringify(issuesContext, null, 2)}`

    let recommendedIssuesResolve!: (issues: IssueRecord[]) => void
    const recommendedIssuesPromise = new Promise<IssueRecord[]>((resolve) => {
      recommendedIssuesResolve = resolve
    })

    const resultPromise = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      onFinish: async ({ text }) => {
        // Extract recommended URLs from response
        const jsonMatch = text.match(/\{"recommendedIssueUrls":\s*\[.*?\]\}/s)
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0])
            const recommendedUrls = parsed.recommendedIssueUrls || []
            recommendedIssuesResolve(candidateIssues.filter(issue =>
              recommendedUrls.includes(issue.url)
            ))
          } catch (e) {
            // If JSON parsing fails, recommend top 3 issues by default
            recommendedIssuesResolve(candidateIssues.slice(0, 3))
          }
        } else {
          // If no JSON block found, recommend top 3 issues by default
          recommendedIssuesResolve(candidateIssues.slice(0, 3))
        }
      },
    })

    // Create a custom stream that includes recommended issues
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Stream the LLM response
        const result = await resultPromise
        const response = result.toDataStreamResponse()
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          controller.enqueue(value)
        }

        // After streaming completes, send recommended issues
        const recommendedIssues = await recommendedIssuesPromise
        if (recommendedIssues.length > 0) {
          const issuesData = recommendedIssues.map(issue => ({
            url: issue.url,
            title: issue.title,
            repoName: issue.repoName,
            repoDesc: issue.repoDesc,
            repoStars: issue.repoStars,
            labels: issue.labels,
            createdAt: issue.createdAt,
          }))

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ recommendedIssues: issuesData })}\n\n`)
          )
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

