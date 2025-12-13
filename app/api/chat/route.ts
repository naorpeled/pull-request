import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { get, incr, expire } from '@/lib/redis'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { getAnonId, getPreferences } from '@/lib/kv'
import { IssueRecord, filterIssuesByLanguages, filterIssuesByQuery } from '@/lib/dataset'

// Rate limiting helper
async function checkRateLimit(anonId: string, ip: string): Promise<boolean> {
  const key = `rate:chat:${anonId}:${ip}`
  const countStr = await get(key)
  const count = countStr ? parseInt(countStr, 10) : 0
  
  if (count >= 20) { // 20 requests per window
    return false
  }

  await incr(key)
  await expire(key, 60) // 1 minute window
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
    const { message, preferredLanguages: requestedLanguages, selectedIssue } = body

    if (!message || typeof message !== 'string') {
      return new Response('Message is required', { status: 400 })
    }

    // Get user preferences
    const prefs = await getPreferences(anonId)
    const preferredLanguages = requestedLanguages || prefs.preferredLanguages || []

    // Load dataset from Redis
    const issuesJson = await get('dataset:issues')
    if (!issuesJson) {
      return new Response('Dataset not available. Please refresh the dataset first.', { status: 503 })
    }

    const allIssues: IssueRecord[] = JSON.parse(issuesJson)

    // If a specific issue is selected, focus the assistant on that issue only
    if (selectedIssue?.url) {
      const matchedIssue = allIssues.find(issue => issue.url === selectedIssue.url)
      const issue = matchedIssue || selectedIssue

      const issueContext = `Issue title: ${issue.title}
Issue URL: ${issue.url}
Repository: ${issue.repoName} (${issue.repoUrl || 'no repo url provided'})
Repo description: ${issue.repoDesc || 'No description provided.'}
Repo stars: ${issue.repoStars}
Repo languages: ${(issue.repoLanguages || []).join(', ') || 'Not listed'}
Labels: ${(issue.labels || []).join(', ') || 'None'}
Created at: ${issue.createdAt}
Comments: ${'commentCount' in issue ? issue.commentCount : 'unknown'}
Assignees: ${'assigneeCount' in issue ? issue.assigneeCount : 'unknown'}`

      const systemPrompt = `You are a helpful contributor assistant. Guide the user to successfully work on the specific GitHub issue below.

ISSUE CONTEXT
${issueContext}

RULES
- Stay focused on this issue only; do not invent other issues or repositories.
- Give concise, actionable steps: understanding the problem, how to reproduce, likely code areas, and a suggested plan.
- Offer verification ideas and quick checks. If something is missing, ask clarifying questions before guessing.
- Keep URLs exact as provided.`

      const result = await streamText({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      })

      return result.toDataStreamResponse()
    }

    // Filter issues by preferred languages
    const languageMatchedIssues = filterIssuesByLanguages(allIssues, preferredLanguages)
    let candidateIssues = filterIssuesByQuery(languageMatchedIssues, message)

    const hasExplicitFilter =
      /more than\s*\d+\s*stars?/i.test(message) ||
      />\s*\d+\s*stars?/i.test(message) ||
      /less than\s*\d+\s*stars?/i.test(message) ||
      /<\s*\d+\s*stars?/i.test(message) ||
      /no assignees?/i.test(message) ||
      /unassigned/i.test(message) ||
      /has comments?/i.test(message) ||
      /with comments?/i.test(message)

    // If query filtering removed everything but the selected languages do exist,
    // fall back to the language-only set so we still return relevant issues.
    if (
      candidateIssues.length === 0 &&
      preferredLanguages.length > 0 &&
      languageMatchedIssues.length > 0 &&
      !hasExplicitFilter
    ) {
      candidateIssues = languageMatchedIssues
    }

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

