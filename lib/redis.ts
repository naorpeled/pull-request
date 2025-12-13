import { createClient } from 'redis'

let client: ReturnType<typeof createClient> | null = null

async function getClient() {
  if (client) {
    return client
  }

  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is not set')
  }

  client = createClient({
    url: redisUrl,
  })

  client.on('error', (err) => {
    console.error('Redis Client Error', err)
  })

  await client.connect()
  return client
}

export async function get(key: string): Promise<string | null> {
  const redis = await getClient()
  return await redis.get(key)
}

export async function set(key: string, value: string): Promise<void> {
  const redis = await getClient()
  await redis.set(key, value)
}

export async function incr(key: string): Promise<number> {
  const redis = await getClient()
  return await redis.incr(key)
}

export async function expire(key: string, seconds: number): Promise<void> {
  const redis = await getClient()
  await redis.expire(key, seconds)
}

export async function getJson<T>(key: string): Promise<T | null> {
  const value = await get(key)
  if (value === null) {
    return null
  }
  try {
    return JSON.parse(value) as T
  } catch (error) {
    console.error(`Error parsing JSON for key ${key}:`, error)
    return null
  }
}

export async function setJson(key: string, value: unknown): Promise<void> {
  await set(key, JSON.stringify(value))
}

