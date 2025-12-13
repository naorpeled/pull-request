import { kv } from '@vercel/kv'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export interface UserPreferences {
  preferredLanguages: string[]
  consent: boolean | null
}

export async function getAnonId(cookieStore: ReadonlyRequestCookies): Promise<string> {
  const existing = cookieStore.get('anonId')
  if (existing?.value) {
    return existing.value
  }

  // Generate new anonymous ID
  const { randomUUID } = await import('uuid')
  const newId = randomUUID()
  return newId
}

export async function getPreferences(anonId: string): Promise<UserPreferences> {
  try {
    const data = await kv.get<UserPreferences>(`prefs:${anonId}`)
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
    await kv.set(`prefs:${anonId}`, updated)
  } catch (error) {
    console.error('Error setting preferences:', error)
    throw error
  }
}

export async function getConsent(anonId: string): Promise<boolean | null> {
  try {
    const data = await kv.get<boolean | null>(`consent:${anonId}`)
    return data ?? null
  } catch (error) {
    console.error('Error getting consent:', error)
    return null
  }
}

export async function setConsent(anonId: string, consented: boolean): Promise<void> {
  try {
    await kv.set(`consent:${anonId}`, consented)
    // Also update preferences for convenience
    await setPreferences(anonId, { consent: consented })
  } catch (error) {
    console.error('Error setting consent:', error)
    throw error
  }
}

