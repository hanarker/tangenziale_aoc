import { SVINCOLI } from '@/lib/svincoli'
import type {
  Status,
  Direzione,
  TangenzialeState,
  SvincoloState,
  TrattoState,
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
      const matches = state.items.filter(
        (i) => i.id === sv.id && i.direzione === dir
      )
      return worstStatus(matches.map((item) => effectiveStatus(item, now)))
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

/**
 * Restituisce i tratti chiusi con uscita obbligatoria per `direzione`, la cui
 * finestra temporale è attiva ora (assente/vuota = sempre attivo).
 */
export function activeTratti(
  state: TangenzialeState,
  direzione: Direzione,
  now: Date = new Date()
): TrattoState[] {
  return (state.tratti ?? []).filter(
    (t) => t.direzione === direzione && isWindowActive(t.windows, now)
  )
}

const SVINCOLO_INDEX = new Map(SVINCOLI.map((s, i) => [s.id, i]))

/**
 * Restituisce gli id di tutti gli svincoli compresi tra `da` e `a` (estremi
 * inclusi) per ciascun tratto: la strada in quel tratto è fisicamente chiusa,
 * quindi anche gli svincoli intermedi (non solo l'uscita obbligatoria) sono
 * impraticabili.
 */
function trattoNodeIds(tratti: TrattoState[]): Set<string> {
  const ids = new Set<string>()
  for (const t of tratti) {
    const ia = SVINCOLO_INDEX.get(t.da) ?? 0
    const ib = SVINCOLO_INDEX.get(t.a) ?? 0
    const [start, end] = ia <= ib ? [ia, ib] : [ib, ia]
    for (let i = start; i <= end; i++) {
      ids.add(SVINCOLI[i].id)
    }
  }
  return ids
}

/**
 * Restituisce lo status "per la mappa" di ogni svincolo: quello di
 * `statusBySvincolo` (chiusure di svincolo, giallo) elevato a "rosso" per
 * tutti gli svincoli compresi in un tratto attivo in quella direzione (estremi
 * e intermedi, non solo l'uscita obbligatoria: il tratto è fisicamente
 * chiuso). Il rosso vince sempre (worstStatus), coerente con la gravità.
 */
export function statusBySvincoloForMap(
  state: TangenzialeState,
  now: Date = new Date()
): Map<string, SvincoloStatusInfo> {
  const base = statusBySvincolo(state, now)
  const chiusiPozzuoli = trattoNodeIds(activeTratti(state, 'pozzuoli', now))
  const chiusiCapodichino = trattoNodeIds(activeTratti(state, 'capodichino', now))

  const result = new Map<string, SvincoloStatusInfo>()
  for (const sv of SVINCOLI) {
    const info = base.get(sv.id) ?? { pozzuoli: 'verde', capodichino: 'verde', worst: 'verde' }
    const pozzuoli = chiusiPozzuoli.has(sv.id) ? 'rosso' : info.pozzuoli
    const capodichino = chiusiCapodichino.has(sv.id) ? 'rosso' : info.capodichino

    result.set(sv.id, {
      pozzuoli,
      capodichino,
      worst: worstStatus([pozzuoli, capodichino]),
    })
  }

  return result
}
