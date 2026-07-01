import { describe, it, expect } from 'vitest'
import { worstStatus, statusBySvincolo } from '@/lib/status-util'
import type { TangenzialeState } from '@/lib/types'

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
})
