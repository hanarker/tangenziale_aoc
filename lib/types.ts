/** Stato di un tratto / uscita della tangenziale */
export type Status = 'verde' | 'giallo' | 'rosso'

/** Le due direzioni di percorrenza */
export type Direzione = 'capodichino' | 'pozzuoli'

/** Stato di uno svincolo per una specifica direzione */
export interface SvincoloState {
  id: string
  direzione: Direzione
  status: Status
  /** Nota testuale opzionale (es. "chiusa fino alle 6:00") */
  note?: string
}

/** Stato globale della tangenziale */
export interface TangenzialeState {
  /** Elenco degli stati per ogni svincolo × direzione */
  items: SvincoloState[]
  /** ISO timestamp dell'ultimo aggiornamento riuscito */
  updatedAt: string
  /** Testo sorgente usato per la classificazione (estratto dal sito) */
  source: string
  /** true se i dati non sono freschissimi (ultimo update fallito) */
  stale: boolean
}
