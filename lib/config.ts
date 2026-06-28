export interface Config {
  openaiApiKey: string
  targetUrl: string
  cronInterval: string
}

const DEFAULT_TARGET_URL = 'https://www.tangenzialedinapoli.it'
const DEFAULT_INTERVAL_MINUTES = 15

/**
 * Carica e valida le variabili d'ambiente necessarie.
 * Lancia un errore (fail fast) se una variabile obbligatoria manca o è invalida.
 *
 * Precedenza per l'intervallo di aggiornamento:
 *   1. CRON_INTERVAL (espressione cron completa, per utenti avanzati)
 *   2. UPDATE_INTERVAL_MINUTES (numero intero di minuti, più semplice)
 *   3. Default: 15 minuti
 */
export function loadConfig(): Config {
  const openaiApiKey = process.env.OPENAI_API_KEY
  if (!openaiApiKey) {
    throw new Error(
      'OPENAI_API_KEY mancante. Aggiungila al file .env prima di avviare il server.'
    )
  }

  const cronInterval = resolveCronInterval()

  return {
    openaiApiKey,
    targetUrl: process.env.TARGET_URL ?? DEFAULT_TARGET_URL,
    cronInterval,
  }
}

function resolveCronInterval(): string {
  if (process.env.CRON_INTERVAL) {
    return process.env.CRON_INTERVAL
  }

  if (process.env.UPDATE_INTERVAL_MINUTES) {
    const minutes = parseInt(process.env.UPDATE_INTERVAL_MINUTES, 10)
    if (isNaN(minutes) || minutes < 1) {
      throw new Error(
        `UPDATE_INTERVAL_MINUTES deve essere un numero intero positivo (ricevuto: "${process.env.UPDATE_INTERVAL_MINUTES}")`
      )
    }
    return `*/${minutes} * * * *`
  }

  return `*/${DEFAULT_INTERVAL_MINUTES} * * * *`
}
