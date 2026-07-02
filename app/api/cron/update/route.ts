import { NextResponse } from 'next/server'
import { loadConfig } from '@/lib/config'
import { runUpdate } from '@/lib/update-runner'
import { DEFAULT_STATE_KEY } from '@/lib/store'

/**
 * Endpoint invocato dal Vercel Cron Job (vedi vercel.json).
 * Protetto da CRON_SECRET: Vercel invia `Authorization: Bearer <CRON_SECRET>`
 * automaticamente per le invocazioni pianificate.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const config = loadConfig()
  const result = await runUpdate(config, DEFAULT_STATE_KEY)

  return NextResponse.json(result)
}
