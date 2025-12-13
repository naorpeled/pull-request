export interface IssueRecord {
  url: string
  title: string
  createdAt: string
  repoName: string
  repoDesc: string
  repoUrl: string
  repoStars: number
  repoLanguages: string[]
  repoOwner: string
  labels: string[]
  commentCount: number
  assigneeCount: number
}

export interface DatasetIssue {
  Issue: {
    issue_url: string
    issue_createdAt: string
    issue_repo: {
      repo_name: string
      repo_desc: string
      repo_url: string
      repo_stars: number
      repo_langs: {
        Nodes: Array<{ repo_prog_language: string }> | null
      }
      Owner: {
        repo_owner: string
      }
    }
    issue_title: string
    issue_labels: {
      Nodes: Array<{ label_name: string }> | null
      label_totalcount: number
    }
    Comments: {
      issue_comment_count: number
    }
    Assignees: {
      issue_assignees_count: number
    }
  }
}

export function normalizeIssue(raw: DatasetIssue): IssueRecord | null {
  try {
    const issue = raw.Issue
    if (!issue.issue_url || !issue.issue_title) {
      return null
    }

    return {
      url: issue.issue_url,
      title: issue.issue_title,
      createdAt: issue.issue_createdAt,
      repoName: issue.issue_repo.repo_name || '',
      repoDesc: issue.issue_repo.repo_desc || '',
      repoUrl: issue.issue_repo.repo_url || '',
      repoStars: issue.issue_repo.repo_stars || 0,
      repoLanguages: issue.issue_repo.repo_langs?.Nodes?.map(n => n.repo_prog_language) || [],
      repoOwner: issue.issue_repo.Owner?.repo_owner || '',
      labels: issue.issue_labels?.Nodes?.map(n => n.label_name) || [],
      commentCount: issue.Comments?.issue_comment_count || 0,
      assigneeCount: issue.Assignees?.issue_assignees_count || 0,
    }
  } catch (error) {
    console.error('Error normalizing issue:', error)
    return null
  }
}

export async function fetchDataset(): Promise<IssueRecord[]> {
  const response = await fetch(
    'https://raw.githubusercontent.com/iedr/goodfirstissues/master/backend/data.json'
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch dataset: ${response.statusText}`)
  }

  const data: DatasetIssue[] = await response.json()
  const normalized = data.map(normalizeIssue).filter((issue): issue is IssueRecord => issue !== null)
  return normalized
}

export function buildLanguageIndex(issues: IssueRecord[]): Record<string, string[]> {
  const index: Record<string, string[]> = {}

  for (const issue of issues) {
    for (const lang of issue.repoLanguages) {
      if (!index[lang]) {
        index[lang] = []
      }
      index[lang].push(issue.url)
    }
  }

  return index
}

export function filterIssuesByLanguages(
  issues: IssueRecord[],
  languages: string[]
): IssueRecord[] {
  if (languages.length === 0) {
    return issues
  }

  return issues.filter(issue =>
    issue.repoLanguages.some(lang => languages.includes(lang))
  )
}

export function filterIssuesByQuery(
  issues: IssueRecord[],
  query: string
): IssueRecord[] {
  const lowerQuery = query.toLowerCase()

  // Extract potential filters from query
  const minStarsMatch = query.match(/more than (\d+)\s*stars?/i) || query.match(/>\s*(\d+)\s*stars?/i)
  const maxStarsMatch = query.match(/less than (\d+)\s*stars?/i) || query.match(/<\s*(\d+)\s*stars?/i)
  const noAssigneesMatch = query.match(/no assignees?/i) || query.match(/unassigned/i)
  const hasCommentsMatch = query.match(/has comments?/i) || query.match(/with comments?/i)

  let filtered = issues

  if (minStarsMatch) {
    const minStars = parseInt(minStarsMatch[1], 10)
    filtered = filtered.filter(issue => issue.repoStars >= minStars)
  }

  if (maxStarsMatch) {
    const maxStars = parseInt(maxStarsMatch[1], 10)
    filtered = filtered.filter(issue => issue.repoStars <= maxStars)
  }

  if (noAssigneesMatch) {
    filtered = filtered.filter(issue => issue.assigneeCount === 0)
  }

  if (hasCommentsMatch) {
    filtered = filtered.filter(issue => issue.commentCount > 0)
  }

  // Text search in title and repo name
  if (lowerQuery && !minStarsMatch && !maxStarsMatch && !noAssigneesMatch && !hasCommentsMatch) {
    filtered = filtered.filter(
      issue =>
        issue.title.toLowerCase().includes(lowerQuery) ||
        issue.repoName.toLowerCase().includes(lowerQuery)
    )
  }

  return filtered
}

