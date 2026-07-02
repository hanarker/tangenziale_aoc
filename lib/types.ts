/** Stato di un tratto / uscita della tangenziale */
export type Status = 'verde' | 'giallo' | 'rosso'

/** Le due direzioni di percorrenza */
export type Direzione = 'capodichino' | 'pozzuoli'

/** Finestra temporale in cui una chiusura è effettivamente attiva */
export interface ClosureWindow {
  /** ISO 8601 con offset Europe/Rome, es. "2026-06-30T23:00:00+02:00" */
  from: string
  /** ISO 8601 con offset Europe/Rome, es. "2026-07-01T06:00:00+02:00" */
  to: string
}

/** Stato di uno svincolo per una specifica direzione */
export interface SvincoloState {
  id: string
  direzione: Direzione
  status: Status
  /** Nota testuale opzionale (es. "chiusa fino alle 6:00") */
  note?: string
  /**
   * Finestre temporali in cui `status` è effettivamente attivo.
   * Assente o vuoto = sempre attivo (es. lavori permanenti).
   */
  windows?: ClosureWindow[]
}

/** Stato globale della tangenziale */
export interface TangenzialeState {
  /** Elenco degli stati per ogni svincolo × direzione */
  items: SvincoloState[]
  /** ISO timestamp dell'ultimo cambiamento di contenuto rilevato (ri-classificato dall'LLM) */
  updatedAt: string
  /**
   * ISO timestamp dell'ultimo scraping riuscito, anche se il contenuto non è
   * cambiato e l'LLM non è stato richiamato. Assente sugli state.json creati
   * prima dell'introduzione della change-detection.
   */
  checkedAt?: string
  /** Testo sorgente usato per la classificazione (estratto dal sito) */
  source: string
  /** true se i dati non sono freschissimi (ultimo update fallito) */
  stale: boolean
}
