import { z } from 'zod'

/** Stato di consenso ai cookie non essenziali (es. pubblicità futura) */
export type ConsentStatus = 'accepted' | 'rejected'

export interface ConsentRecord {
  status: ConsentStatus
  timestamp: number
}

export const CONSENT_STORAGE_KEY = 'tangenziale-cookie-consent'

const consentRecordSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
  timestamp: z.number(),
})

/** Legge il consenso salvato dall'utente, o null se assente/non valido */
export function getStoredConsent(): ConsentRecord | null {
  const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY)
  if (!raw) return null

  try {
    return consentRecordSchema.parse(JSON.parse(raw))
  } catch {
    return null
  }
}

/** Salva la scelta di consenso dell'utente con il timestamp corrente */
export function storeConsent(status: ConsentStatus): ConsentRecord {
  const record: ConsentRecord = { status, timestamp: Date.now() }
  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(record))
  return record
}
