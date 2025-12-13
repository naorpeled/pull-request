import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAnonId, getPreferences, setPreferences, setConsent } from '@/lib/kv'
import { UserPreferences } from '@/lib/kv'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const anonId = await getAnonId(cookieStore)
    const prefs = await getPreferences(anonId)

    const response = NextResponse.json(prefs)
    
    // Set cookie if it doesn't exist
    if (!cookieStore.get('anonId')) {
      response.cookies.set('anonId', anonId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    }

    return response
  } catch (error) {
    console.error('Error getting preferences:', error)
    return NextResponse.json({ error: 'Failed to get preferences' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const anonId = await getAnonId(cookieStore)
    const body = await request.json()

    const updates: Partial<UserPreferences> = {}

    if (typeof body.preferredLanguages !== 'undefined') {
      updates.preferredLanguages = Array.isArray(body.preferredLanguages)
        ? body.preferredLanguages
        : []
    }

    if (typeof body.consent !== 'undefined') {
      await setConsent(anonId, body.consent === true)
      updates.consent = body.consent === true
    } else {
      await setPreferences(anonId, updates)
    }

    const response = NextResponse.json({ success: true })
    
    // Set cookie if it doesn't exist
    if (!cookieStore.get('anonId')) {
      response.cookies.set('anonId', anonId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    }

    return response
  } catch (error) {
    console.error('Error updating preferences:', error)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}

