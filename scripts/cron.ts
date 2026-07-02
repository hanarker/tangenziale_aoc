/**
 * Wrapper node-cron per l'aggiornamento periodico dello stato.
 * Eseguibile con: npm run cron
 *
 * Gira come processo separato dal server Next.js; non usa il runtime
 * serverless di Vercel. Intervallo configurabile via CRON_INTERVAL (.env).
 *
 * Ad ogni esecuzione fa scraping; l'LLM viene richiamato solo se il testo
 * estratto è cambiato dall'ultima esecuzione (vedi lib/update-runner.ts).
 */
import cron from 'node-cron'
import { loadConfig } from '@/lib/config'
import { runUpdate } from '@/lib/update-runner'
import { mkdirSync } from 'fs'
import { join } from 'path'

const STATE_PATH = join(process.cwd(), 'data', 'state.json')

const config = loadConfig()

mkdirSync(join(process.cwd(), 'data'), { recursive: true })

async function updateState() {
  console.log(`[cron] ${new Date().toISOString()} — avvio scraping…`)

  const result = await runUpdate(config, STATE_PATH)

  switch (result.outcome) {
    case 'unchanged':
      console.log('[cron] Nessun cambiamento nel testo, LLM non richiamato.')
      break
    case 'updated':
      console.log(`[cron] Aggiornamento completato: ${result.itemCount} svincoli non-verdi.`)
      break
    case 'error':
      console.warn('[cron] Aggiornamento fallito, stato precedente marcato come stale.')
      break
  }
}

console.log(`[cron] Avviato. Intervallo: "${config.cronInterval}"`)
cron.schedule(config.cronInterval, updateState)

// Prima esecuzione immediata
updateState().catch(console.error)
