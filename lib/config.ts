export interface Config {
  openaiApiKey: string
  targetUrl: string
  cronInterval: string
}

const DEFAULT_TARGET_URL = 'https://www.tangenzialedinapoli.it'
const DEFAULT_CRON_INTERVAL = '*/15 * * * *'

/**
 * Carica e valida le variabili d'ambiente necessarie.
 * Lancia un errore (fail fast) se una variabile obbligatoria manca.
 */
export function loadConfig(): Config {
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) {
    throw new Error(
      'OPENAI_API_KEY mancante. Aggiungila al file .env prima di avviare il server.'
    )
  }

  return {
    openaiApiKey,
    targetUrl: process.env.TARGET_URL ?? DEFAULT_TARGET_URL,
    cronInterval: process.env.CRON_INTERVAL ?? DEFAULT_CRON_INTERVAL,
  }
}
