import { SVINCOLI } from '@/lib/svincoli'
import type { Status, Direzione, TangenzialeState } from '@/lib/types'

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

export interface SvincoloStatusInfo {
  pozzuoli: Status
  capodichino: Status
  worst: Status
}

/**
 * Restituisce una Map id → { pozzuoli, capodichino, worst } per tutti gli svincoli canonici.
 * Gli svincoli assenti in `state.items` hanno default verde.
 */
export function statusBySvincolo(
  state: TangenzialeState
): Map<string, SvincoloStatusInfo> {
  const result = new Map<string, SvincoloStatusInfo>()

  for (const sv of SVINCOLI) {
    const getStatus = (dir: Direzione): Status =>
      state.items.find((i) => i.id === sv.id && i.direzione === dir)?.status ?? 'verde'

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
