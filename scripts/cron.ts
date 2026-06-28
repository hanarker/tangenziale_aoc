/**
 * Wrapper node-cron per l'aggiornamento periodico dello stato.
 * Eseguibile con: npm run cron
 *
 * Gira come processo separato dal server Next.js; non usa il runtime
 * serverless di Vercel. Intervallo configurabile via CRON_INTERVAL (.env).
 */
import cron from 'node-cron'
import { loadConfig } from '@/lib/config'
import { scrapeAvvisi } from '@/lib/scraper'
import { interpretAvvisi } from '@/lib/interpreter'
import { readState, writeState } from '@/lib/store'
import type { TangenzialeState } from '@/lib/types'
import { mkdirSync } from 'fs'
import { join } from 'path'

const STATE_PATH = join(process.cwd(), 'data', 'state.json')

const config = loadConfig()

mkdirSync(join(process.cwd(), 'data'), { recursive: true })

async function updateState() {
  console.log(`[cron] ${new Date().toISOString()} — avvio aggiornamento…`)

  let testoAvvisi: string
  try {
    testoAvvisi = await scrapeAvvisi(config.targetUrl)
  } catch (err) {
    await markStale('Errore scraping', err)
    return
  }

  let items: TangenzialeState['items']
  try {
    items = await interpretAvvisi(config.openaiApiKey, testoAvvisi)
  } catch (err) {
    await markStale('Errore LLM', err)
    return
  }

  const newState: TangenzialeState = {
    items,
    updatedAt: new Date().toISOString(),
    source: testoAvvisi,
    stale: false,
  }

  await writeState(newState, STATE_PATH)
  console.log(`[cron] Aggiornamento completato: ${items.length} svincoli non-verdi.`)
}

async function markStale(motivo: string, err: unknown) {
  console.error(`[cron] ${motivo}:`, err)
  const existing = await readState(STATE_PATH)
  if (existing) {
    await writeState({ ...existing, stale: true }, STATE_PATH)
    console.warn('[cron] Stato precedente mantenuto, marcato come stale.')
  }
}

console.log(`[cron] Avviato. Intervallo: "${config.cronInterval}"`)
cron.schedule(config.cronInterval, updateState)

// Prima esecuzione immediata
updateState().catch(console.error)
