import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { getJson, setJson } from './redis'

export interface UserPreferences {
  preferredLanguages: string[]
  consent: boolean | null
}

export async function getAnonId(cookieStore: Awaited<ReturnType<typeof cookies>>): Promise<string> {
  const existing = cookieStore.get('anonId')
  if (existing?.value) {
    return existing.value
  }

  // Generate new anonymous ID
  const newId = randomUUID()
  return newId
}

export async function getPreferences(anonId: string): Promise<UserPreferences> {
  try {
    const data = await getJson<UserPreferences>(`prefs:${anonId}`)
    return data || { preferredLanguages: [], consent: null }
  } catch (error) {
    console.error('Error getting preferences:', error)
    return { preferredLanguages: [], consent: null }
  }
}

export async function setPreferences(anonId: string, prefs: Partial<UserPreferences>): Promise<void> {
  try {
    const existing = await getPreferences(anonId)
    const updated = { ...existing, ...prefs }
    await setJson(`prefs:${anonId}`, updated)
  } catch (error) {
    console.error('Error setting preferences:', error)
    throw error
  }
}

export async function getConsent(anonId: string): Promise<boolean | null> {
  try {
    const data = await getJson<boolean | null>(`consent:${anonId}`)
    return data ?? null
  } catch (error) {
    console.error('Error getting consent:', error)
    return null
  }
}

export async function setConsent(anonId: string, consented: boolean): Promise<void> {
  try {
    await setJson(`consent:${anonId}`, consented)
    // Also update preferences for convenience
    await setPreferences(anonId, { consent: consented })
  } catch (error) {
    console.error('Error setting consent:', error)
    throw error
  }
}

