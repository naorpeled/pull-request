import { NextRequest } from 'next/server'
import { get } from '@/lib/redis'
import { IssueRecord, filterIssuesByLanguages } from '@/lib/dataset'

interface RepositoryResult {
  repoName: string
  repoDesc: string
  repoUrl: string
  repoStars: number
  repoLanguages: string[]
  issueCount: number
  issues: Array<{
    url: string
    title: string
    labels: string[]
    createdAt: string
    commentCount?: number
    assigneeCount?: number
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const languages = Array.isArray(body.languages) ? body.languages : []
    const minStars = typeof body.minStars === 'number' && !isNaN(body.minStars) ? body.minStars : 0

    const issuesJson = await get('dataset:issues')
    if (!issuesJson) {
      return new Response('Dataset not available. Please refresh the dataset first.', { status: 503 })
    }

    const issues: IssueRecord[] = JSON.parse(issuesJson)

    let filtered = filterIssuesByLanguages(issues, languages)
    filtered = filtered.filter(issue => issue.repoStars >= minStars)

    const repoMap: Record<string, { repo: IssueRecord; issues: IssueRecord[] }> = {}

    for (const issue of filtered) {
      const key = issue.repoUrl || issue.repoName
      if (!repoMap[key]) {
        repoMap[key] = { repo: issue, issues: [] }
      }
      repoMap[key].issues.push(issue)
    }

    const repositories: RepositoryResult[] = Object.values(repoMap)
      .map(({ repo, issues: repoIssues }) => {
        const languagesSet = new Set<string>()
        repoIssues.forEach(i => i.repoLanguages.forEach(l => languagesSet.add(l)))

        return {
          repoName: repo.repoName,
          repoDesc: repo.repoDesc,
          repoUrl: repo.repoUrl,
          repoStars: repo.repoStars,
          repoLanguages: Array.from(languagesSet),
          issueCount: repoIssues.length,
          issues: repoIssues
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3)
            .map(i => ({
              url: i.url,
              title: i.title,
              labels: i.labels,
              createdAt: i.createdAt,
              commentCount: i.commentCount,
              assigneeCount: i.assigneeCount,
            })),
        }
      })
      .sort((a, b) => b.repoStars - a.repoStars)
      .slice(0, 20)

    return Response.json({ repositories })
  } catch (error) {
    console.error('Search API error:', error)
    return new Response('Invalid request', { status: 400 })
  }
}

