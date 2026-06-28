/**
 * Script one-shot: scrape → interpreta → salva stato.
 * Eseguibile con: npm run update
 *
 * In caso di errore NON sovrascrive lo stato valido precedente;
 * marca invece lo stato come stale aggiornando il campo relativo.
 */
import { loadConfig } from '@/lib/config'
import { scrapeAvvisi } from '@/lib/scraper'
import { interpretAvvisi } from '@/lib/interpreter'
import { readState, writeState } from '@/lib/store'
import type { TangenzialeState } from '@/lib/types'
import { mkdirSync } from 'fs'
import { join } from 'path'

const STATE_PATH = join(process.cwd(), 'data', 'state.json')

async function main() {
  mkdirSync(join(process.cwd(), 'data'), { recursive: true })

  const config = loadConfig()

  console.log(`[update] Scraping ${config.targetUrl}…`)
  let testoAvvisi: string
  try {
    testoAvvisi = await scrapeAvvisi(config.targetUrl)
  } catch (err) {
    await markStale('Errore scraping', err)
    return
  }

  console.log('[update] Testo estratto, invio a LLM…')
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
  console.log(`[update] Stato aggiornato: ${items.length} svincoli non-verdi.`)
}

async function markStale(motivo: string, err: unknown) {
  console.error(`[update] ${motivo}:`, err)
  const existing = await readState(STATE_PATH)
  if (existing) {
    await writeState({ ...existing, stale: true }, STATE_PATH)
    console.warn('[update] Stato precedente mantenuto, marcato come stale.')
  } else {
    console.warn('[update] Nessuno stato precedente disponibile.')
  }
}

main().catch((err) => {
  console.error('[update] Errore inatteso:', err)
  process.exit(1)
})
