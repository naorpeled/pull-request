import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { normalizeIssue, buildLanguageIndex, IssueRecord, DatasetIssue } from '@/lib/dataset'

export async function POST(request: NextRequest) {
  try {
    // Check for CRON_SECRET header
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Also check for x-vercel-cron header (Vercel Cron sends this)
      const vercelCron = request.headers.get('x-vercel-cron')
      if (!vercelCron) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    console.log('Starting dataset refresh...')

    // Fetch and normalize dataset
    const rawData = await fetch(
      'https://raw.githubusercontent.com/iedr/goodfirstissues/master/backend/data.json'
    )
    if (!rawData.ok) {
      throw new Error(`Failed to fetch dataset: ${rawData.statusText}`)
    }

    const data = await rawData.json()
    const issues: IssueRecord[] = []

    for (const item of data) {
      try {
        const normalized = normalizeIssue(item)
        if (normalized) {
          issues.push(normalized)
        }
      } catch (error) {
        console.error('Error normalizing issue:', error)
      }
    }

    console.log(`Normalized ${issues.length} issues`)

    // Build language index
    const languageIndex = buildLanguageIndex(issues)

    // Store in KV
    await kv.set('dataset:issues', JSON.stringify(issues))
    
    // Store language indices
    for (const [lang, issueUrls] of Object.entries(languageIndex)) {
      await kv.set(`dataset:index:lang:${lang}`, JSON.stringify(issueUrls))
    }

    // Store list of all languages
    const allLanguages = Array.from(new Set(issues.flatMap(i => i.repoLanguages)))
    await kv.set('dataset:languages', JSON.stringify(allLanguages))

    console.log(`Indexed ${Object.keys(languageIndex).length} languages`)

    return NextResponse.json({
      success: true,
      issueCount: issues.length,
      languageCount: Object.keys(languageIndex).length,
    })
  } catch (error) {
    console.error('Error refreshing dataset:', error)
    return NextResponse.json(
      { error: 'Failed to refresh dataset', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

