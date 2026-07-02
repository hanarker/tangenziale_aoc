import { describe, it, expect } from 'vitest'
import {
  worstStatus,
  statusBySvincolo,
  isWindowActive,
  effectiveStatus,
} from '@/lib/status-util'
import type { TangenzialeState, SvincoloState, ClosureWindow } from '@/lib/types'

describe('worstStatus', () => {
  it('ritorna verde su lista vuota', () => {
    expect(worstStatus([])).toBe('verde')
  })

  it('ritorna verde se tutti verdi', () => {
    expect(worstStatus(['verde', 'verde'])).toBe('verde')
  })

  it('ritorna giallo se il peggiore è giallo', () => {
    expect(worstStatus(['verde', 'giallo', 'verde'])).toBe('giallo')
  })

  it('ritorna rosso se presente almeno un rosso', () => {
    expect(worstStatus(['verde', 'giallo', 'rosso'])).toBe('rosso')
  })

  it('rosso vince su giallo', () => {
    expect(worstStatus(['giallo', 'rosso'])).toBe('rosso')
  })
})

describe('isWindowActive', () => {
  const notte: ClosureWindow = {
    from: '2026-06-30T23:00:00+02:00',
    to: '2026-07-01T06:00:00+02:00',
  }

  it('ritorna true se windows è assente (sempre attivo)', () => {
    expect(isWindowActive(undefined, new Date('2026-07-01T12:00:00+02:00'))).toBe(true)
  })

  it('ritorna true se windows è vuoto (sempre attivo)', () => {
    expect(isWindowActive([], new Date('2026-07-01T12:00:00+02:00'))).toBe(true)
  })

  it('ritorna true se now cade dentro la finestra', () => {
    expect(isWindowActive([notte], new Date('2026-07-01T02:00:00+02:00'))).toBe(true)
  })

  it('ritorna false se now è prima della finestra', () => {
    expect(isWindowActive([notte], new Date('2026-06-30T15:00:00+02:00'))).toBe(false)
  })

  it('ritorna false se now è dopo la finestra', () => {
    expect(isWindowActive([notte], new Date('2026-07-01T12:00:00+02:00'))).toBe(false)
  })

  it('ritorna true se now cade in una qualsiasi tra più finestre', () => {
    const altra: ClosureWindow = {
      from: '2026-07-02T23:00:00+02:00',
      to: '2026-07-03T06:00:00+02:00',
    }
    expect(
      isWindowActive([notte, altra], new Date('2026-07-02T23:30:00+02:00'))
    ).toBe(true)
  })
})

describe('effectiveStatus', () => {
  const notte: ClosureWindow = {
    from: '2026-06-30T23:00:00+02:00',
    to: '2026-07-01T06:00:00+02:00',
  }

  it('ritorna lo status annunciato se la finestra è attiva', () => {
    const item: SvincoloState = {
      id: 'fuorigrotta',
      direzione: 'pozzuoli',
      status: 'rosso',
      windows: [notte],
    }
    expect(effectiveStatus(item, new Date('2026-07-01T02:00:00+02:00'))).toBe('rosso')
  })

  it('ritorna verde se la finestra non è attiva', () => {
    const item: SvincoloState = {
      id: 'fuorigrotta',
      direzione: 'pozzuoli',
      status: 'rosso',
      windows: [notte],
    }
    expect(effectiveStatus(item, new Date('2026-07-01T12:00:00+02:00'))).toBe('verde')
  })

  it('ritorna lo status annunciato se non ci sono finestre (sempre attivo)', () => {
    const item: SvincoloState = {
      id: 'fuorigrotta',
      direzione: 'pozzuoli',
      status: 'giallo',
    }
    expect(effectiveStatus(item, new Date('2026-07-01T12:00:00+02:00'))).toBe('giallo')
  })
})

describe('statusBySvincolo', () => {
  const state: TangenzialeState = {
    items: [
      { id: 'fuorigrotta', direzione: 'pozzuoli', status: 'rosso', note: 'Chiusa' },
      { id: 'fuorigrotta', direzione: 'capodichino', status: 'giallo', note: 'Lavori' },
      { id: 'camaldoli', direzione: 'pozzuoli', status: 'verde' },
    ],
    updatedAt: '2026-06-29T00:00:00.000Z',
    source: 'test',
    stale: false,
  }

  it('calcola lo stato per ogni direzione di fuorigrotta', () => {
    const map = statusBySvincolo(state)
    const f = map.get('fuorigrotta')
    expect(f?.pozzuoli).toBe('rosso')
    expect(f?.capodichino).toBe('giallo')
  })

  it('worst di fuorigrotta è rosso (rosso > giallo)', () => {
    const map = statusBySvincolo(state)
    expect(map.get('fuorigrotta')?.worst).toBe('rosso')
  })

  it('uno svincolo senza items in state ha default verde', () => {
    const map = statusBySvincolo(state)
    // capodimonte non è negli items
    const c = map.get('capodimonte')
    expect(c?.pozzuoli).toBe('verde')
    expect(c?.capodichino).toBe('verde')
    expect(c?.worst).toBe('verde')
  })

  it('camaldoli pozzuoli è verde, capodichino default verde, worst verde', () => {
    const map = statusBySvincolo(state)
    const c = map.get('camaldoli')
    expect(c?.pozzuoli).toBe('verde')
    expect(c?.capodichino).toBe('verde')
    expect(c?.worst).toBe('verde')
  })

  it('uno svincolo rosso con finestra notturna è verde di giorno', () => {
    const stateConFinestra: TangenzialeState = {
      items: [
        {
          id: 'agnano',
          direzione: 'capodichino',
          status: 'rosso',
          windows: [
            { from: '2026-06-30T23:00:00+02:00', to: '2026-07-01T06:00:00+02:00' },
          ],
        },
      ],
      updatedAt: '2026-07-01T12:00:00+02:00',
      source: 'test',
      stale: false,
    }
    const map = statusBySvincolo(stateConFinestra, new Date('2026-07-01T12:00:00+02:00'))
    expect(map.get('agnano')?.capodichino).toBe('verde')
  })

  it('uno svincolo rosso con finestra notturna è rosso di notte (finestra attiva)', () => {
    const stateConFinestra: TangenzialeState = {
      items: [
        {
          id: 'agnano',
          direzione: 'capodichino',
          status: 'rosso',
          windows: [
            { from: '2026-06-30T23:00:00+02:00', to: '2026-07-01T06:00:00+02:00' },
          ],
        },
      ],
      updatedAt: '2026-07-01T00:00:00+02:00',
      source: 'test',
      stale: false,
    }
    const map = statusBySvincolo(stateConFinestra, new Date('2026-07-01T02:00:00+02:00'))
    expect(map.get('agnano')?.capodichino).toBe('rosso')
  })
})
