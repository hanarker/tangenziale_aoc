import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { TangenzialeState } from '@/lib/types'
import { MapViewSwitcher } from '@/components/MapViewSwitcher'

const stateExample: TangenzialeState = {
  items: [
    { id: 'fuorigrotta', direzione: 'pozzuoli', status: 'rosso', note: 'Chiusa' },
    { id: 'fuorigrotta', direzione: 'capodichino', status: 'giallo', note: 'Lavori' },
  ],
  updatedAt: '2026-06-29T00:00:00.000Z',
  source: 'test',
  stale: false,
}

describe('MapViewSwitcher', () => {
  it('mostra la direzione Capodichino per default', () => {
    render(<MapViewSwitcher state={stateExample} />)
    expect(screen.getByRole('button', { name: /capodichino/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /pozzuoli/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('passa alla direzione Pozzuoli al click sul bottone Pozzuoli', () => {
    render(<MapViewSwitcher state={stateExample} />)
    fireEvent.click(screen.getByRole('button', { name: /pozzuoli/i }))
    expect(screen.getByRole('button', { name: /pozzuoli/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /capodichino/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('torna alla direzione Capodichino al click sul relativo bottone', () => {
    render(<MapViewSwitcher state={stateExample} />)
    fireEvent.click(screen.getByRole('button', { name: /pozzuoli/i }))
    fireEvent.click(screen.getByRole('button', { name: /capodichino/i }))
    expect(screen.getByRole('button', { name: /capodichino/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('mostra un solo nodo per svincolo in ogni variante, con lo stato della direzione selezionata', () => {
    const { container } = render(<MapViewSwitcher state={stateExample} />)
    // Default: Capodichino → fuorigrotta è giallo
    expect(
      container.querySelector('[data-id="fuorigrotta"][data-dir="capodichino"]')
    ).toHaveAttribute('data-status', 'giallo')

    fireEvent.click(screen.getByRole('button', { name: /pozzuoli/i }))
    // Dopo lo switch: fuorigrotta è rosso in direzione Pozzuoli
    expect(
      container.querySelector('[data-id="fuorigrotta"][data-dir="pozzuoli"]')
    ).toHaveAttribute('data-status', 'rosso')
    expect(
      container.querySelectorAll('[data-orientation="horizontal"] [data-dir]').length
    ).toBe(13)
  })

  it('renderizza la variante verticale per mobile e quella orizzontale per desktop', () => {
    const { container } = render(<MapViewSwitcher state={stateExample} />)
    const vertical = container.querySelector('[data-orientation="vertical"]')
    const horizontal = container.querySelector('[data-orientation="horizontal"]')
    expect(vertical).not.toBeNull()
    expect(horizontal).not.toBeNull()
    expect(vertical!.querySelectorAll('[data-dir]').length).toBe(13)
    expect(horizontal!.querySelectorAll('[data-dir]').length).toBe(13)
    // Visibilità responsive: verticale solo sotto sm, orizzontale da sm in su
    expect(vertical!.closest('.sm\\:hidden')).not.toBeNull()
    expect(horizontal!.closest('.hidden.sm\\:block')).not.toBeNull()
  })
})
