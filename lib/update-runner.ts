import type { Config } from '@/lib/config'
import { scrapeAvvisi } from '@/lib/scraper'
import { interpretAvvisi } from '@/lib/interpreter'
import { readState, writeState } from '@/lib/store'
import type { TangenzialeState } from '@/lib/types'

export type UpdateOutcome = 'updated' | 'unchanged' | 'error'

export interface UpdateResult {
  outcome: UpdateOutcome
  itemCount?: number
}

/**
 * Pipeline condivisa di aggiornamento: scrape → change-detection → (LLM) → salva stato.
 * Usata sia dallo script one-shot (`npm run update`) sia dal cron (`npm run cron`).
 *
 * Comportamento:
 * - Se lo scraping fallisce: stato precedente marcato `stale`, outcome "error".
 * - Se il testo estratto è identico a `state.source` esistente: l'LLM NON viene
 *   chiamato, si aggiorna solo `checkedAt` (e si azzera `stale`, perché il
 *   contenuto è confermato invariato), outcome "unchanged".
 * - Se il testo è cambiato (o non c'è stato precedente): l'LLM viene chiamato e
 *   lo stato viene riscritto per intero, outcome "updated". Se l'LLM fallisce:
 *   stato precedente marcato `stale`, outcome "error".
 */
export async function runUpdate(
  config: Config,
  stateKey: string,
  now: Date = new Date()
): Promise<UpdateResult> {
  let testoAvvisi: string
  try {
    testoAvvisi = await scrapeAvvisi(config.targetUrl)
  } catch (err) {
    await markStale(stateKey, 'Errore scraping', err)
    return { outcome: 'error' }
  }

  const existing = await readState(stateKey)

  if (existing && existing.source === testoAvvisi) {
    await writeState(
      { ...existing, checkedAt: now.toISOString(), stale: false },
      stateKey
    )
    return { outcome: 'unchanged', itemCount: existing.items.length }
  }

  let items: TangenzialeState['items']
  try {
    items = await interpretAvvisi(config.openaiApiKey, testoAvvisi, now)
  } catch (err) {
    await markStale(stateKey, 'Errore LLM', err)
    return { outcome: 'error' }
  }

  const newState: TangenzialeState = {
    items,
    updatedAt: now.toISOString(),
    checkedAt: now.toISOString(),
    source: testoAvvisi,
    stale: false,
  }

  await writeState(newState, stateKey)
  return { outcome: 'updated', itemCount: items.length }
}

async function markStale(
  stateKey: string,
  motivo: string,
  err: unknown
): Promise<void> {
  console.error(`[update-runner] ${motivo}:`, err)
  const existing = await readState(stateKey)
  if (existing) {
    await writeState({ ...existing, stale: true }, stateKey)
  }
}
