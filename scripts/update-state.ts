/**
 * Script one-shot: scrape → (se il testo è cambiato) interpreta → salva stato.
 * Eseguibile con: npm run update
 *
 * In caso di errore NON sovrascrive lo stato valido precedente;
 * marca invece lo stato come stale aggiornando il campo relativo.
 */
import { loadConfig } from '@/lib/config'
import { runUpdate } from '@/lib/update-runner'
import { mkdirSync } from 'fs'
import { join } from 'path'

const STATE_PATH = join(process.cwd(), 'data', 'state.json')

async function main() {
  mkdirSync(join(process.cwd(), 'data'), { recursive: true })

  const config = loadConfig()

  console.log(`[update] Scraping ${config.targetUrl}…`)
  const result = await runUpdate(config, STATE_PATH)

  switch (result.outcome) {
    case 'unchanged':
      console.log('[update] Nessun cambiamento nel testo, LLM non richiamato.')
      break
    case 'updated':
      console.log(`[update] Stato aggiornato: ${result.itemCount} svincoli non-verdi.`)
      break
    case 'error':
      console.warn('[update] Aggiornamento fallito, stato precedente marcato come stale.')
      break
  }
}

main().catch((err) => {
  console.error('[update] Errore inatteso:', err)
  process.exit(1)
})
