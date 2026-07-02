import { SVINCOLI } from '@/lib/svincoli'
import type {
  Status,
  Direzione,
  TangenzialeState,
  SvincoloState,
  ClosureWindow,
} from '@/lib/types'

const STATUS_PRIORITY: Record<Status, number> = {
  verde: 0,
  giallo: 1,
  rosso: 2,
}

/**
 * Restituisce lo stato peggiore tra quelli forniti.
 * Ordine: rosso > giallo > verde. Default verde su lista vuota.
 */
export function worstStatus(statuses: Status[]): Status {
  return statuses.reduce<Status>((worst, s) => {
    return STATUS_PRIORITY[s] > STATUS_PRIORITY[worst] ? s : worst
  }, 'verde')
}

/**
 * Restituisce true se `now` cade dentro una delle finestre fornite.
 * Assenza o lista vuota di finestre = sempre attivo (chiusura permanente).
 */
export function isWindowActive(
  windows: ClosureWindow[] | undefined,
  now: Date
): boolean {
  if (!windows || windows.length === 0) {
    return true
  }

  return windows.some((w) => {
    const from = new Date(w.from)
    const to = new Date(w.to)
    return now >= from && now <= to
  })
}

/**
 * Restituisce lo status effettivo di uno svincolo: lo status annunciato se
 * la sua finestra temporale è attiva ora, altrimenti "verde".
 */
export function effectiveStatus(item: SvincoloState, now: Date): Status {
  return isWindowActive(item.windows, now) ? item.status : 'verde'
}

export interface SvincoloStatusInfo {
  pozzuoli: Status
  capodichino: Status
  worst: Status
}

/**
 * Restituisce una Map id → { pozzuoli, capodichino, worst } per tutti gli svincoli canonici.
 * Gli svincoli assenti in `state.items` hanno default verde. Lo status di ogni
 * svincolo è quello *effettivo* rispetto a `now`: una chiusura con finestra
 * temporale non attiva ora è considerata verde.
 */
export function statusBySvincolo(
  state: TangenzialeState,
  now: Date = new Date()
): Map<string, SvincoloStatusInfo> {
  const result = new Map<string, SvincoloStatusInfo>()

  for (const sv of SVINCOLI) {
    const getStatus = (dir: Direzione): Status => {
      const item = state.items.find((i) => i.id === sv.id && i.direzione === dir)
      return item ? effectiveStatus(item, now) : 'verde'
    }

    const pozzuoli = getStatus('pozzuoli')
    const capodichino = getStatus('capodichino')

    result.set(sv.id, {
      pozzuoli,
      capodichino,
      worst: worstStatus([pozzuoli, capodichino]),
    })
  }

  return result
}
