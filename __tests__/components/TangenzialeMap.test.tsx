import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { TangenzialeState } from '@/lib/types'
import { TangenzialeMap } from '@/components/TangenzialeMap'

const stateExample: TangenzialeState = {
  items: [
    { id: 'fuorigrotta', direzione: 'pozzuoli', status: 'rosso', note: 'Chiusa' },
    { id: 'camaldoli', direzione: 'capodichino', status: 'giallo', note: 'Lavori' },
  ],
  updatedAt: '2026-06-28T23:00:00.000Z',
  source: 'Avviso di esempio',
  stale: false,
}

describe('TangenzialeMap', () => {
  it('renderizza tutti gli svincoli canonici', () => {
    render(<TangenzialeMap state={stateExample} />)
    // Fuorigrotta deve apparire come etichetta
    expect(screen.getAllByText(/fuorigrotta/i).length).toBeGreaterThan(0)
  })

  it('applica il colore rosso a Fuorigrotta in direzione Pozzuoli', () => {
    const { container } = render(<TangenzialeMap state={stateExample} />)
    const rossi = container.querySelectorAll('[data-status="rosso"]')
    expect(rossi.length).toBeGreaterThan(0)
  })

  it('applica il colore giallo a Camaldoli in direzione Capodichino', () => {
    const { container } = render(<TangenzialeMap state={stateExample} />)
    const gialli = container.querySelectorAll('[data-status="giallo"]')
    expect(gialli.length).toBeGreaterThan(0)
  })

  it('mostra le etichette delle due direzioni', () => {
    render(<TangenzialeMap state={stateExample} />)
    expect(screen.getAllByText(/pozzuoli/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/capodichino/i).length).toBeGreaterThan(0)
  })
})
