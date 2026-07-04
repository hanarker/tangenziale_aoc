import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { TangenzialeState } from '@/lib/types'
import { MapViewSwitcher } from '@/components/MapViewSwitcher'

const now = new Date('2026-07-01T02:00:00+02:00')

const stateExample: TangenzialeState = {
  items: [
    { id: 'fuorigrotta', direzione: 'pozzuoli', status: 'rosso', note: 'Chiusa' },
    { id: 'fuorigrotta', direzione: 'capodichino', status: 'giallo', note: 'Lavori' },
  ],
  updatedAt: '2026-06-29T00:00:00.000Z',
  source: 'test',
  stale: false,
}

const stateConChiusuraFutura: TangenzialeState = {
  items: [
    {
      id: 'agnano',
      direzione: 'capodichino',
      status: 'rosso',
      windows: [
        { from: '2026-07-06T23:00:00+02:00', to: '2026-07-07T06:00:00+02:00' },
      ],
    },
  ],
  updatedAt: '2026-06-29T00:00:00.000Z',
  source: 'test',
  stale: false,
}

describe('MapViewSwitcher', () => {
  it('mostra la direzione Capodichino per default', () => {
    render(<MapViewSwitcher state={stateExample} now={now} />)
    expect(screen.getByRole('button', { name: /capodichino/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /pozzuoli/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('passa alla direzione Pozzuoli al click sul bottone Pozzuoli', () => {
    render(<MapViewSwitcher state={stateExample} now={now} />)
    fireEvent.click(screen.getByRole('button', { name: /pozzuoli/i }))
    expect(screen.getByRole('button', { name: /pozzuoli/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /capodichino/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('torna alla direzione Capodichino al click sul relativo bottone', () => {
    render(<MapViewSwitcher state={stateExample} now={now} />)
    fireEvent.click(screen.getByRole('button', { name: /pozzuoli/i }))
    fireEvent.click(screen.getByRole('button', { name: /capodichino/i }))
    expect(screen.getByRole('button', { name: /capodichino/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('mostra un solo nodo per svincolo in ogni variante, con lo stato della direzione selezionata', () => {
    const { container } = render(<MapViewSwitcher state={stateExample} now={now} />)
    expect(
      container.querySelector('[data-id="fuorigrotta"][data-dir="capodichino"]')
    ).toHaveAttribute('data-status', 'giallo')

    fireEvent.click(screen.getByRole('button', { name: /pozzuoli/i }))
    expect(
      container.querySelector('[data-id="fuorigrotta"][data-dir="pozzuoli"]')
    ).toHaveAttribute('data-status', 'rosso')
    expect(
      container.querySelectorAll('[data-orientation="horizontal"] [data-dir]').length
    ).toBe(13)
  })

  it('renderizza la variante verticale per mobile e quella orizzontale per desktop', () => {
    const { container } = render(<MapViewSwitcher state={stateExample} now={now} />)
    const vertical = container.querySelector('[data-orientation="vertical"]')
    const horizontal = container.querySelector('[data-orientation="horizontal"]')
    expect(vertical).not.toBeNull()
    expect(horizontal).not.toBeNull()
    expect(vertical!.querySelectorAll('[data-dir]').length).toBe(13)
    expect(horizontal!.querySelectorAll('[data-dir]').length).toBe(13)
    expect(vertical!.closest('.sm\\:hidden')).not.toBeNull()
    expect(horizontal!.closest('.hidden.sm\\:block')).not.toBeNull()
  })

  it('non mostra tab data se non ci sono chiusure future con finestre', () => {
    render(<MapViewSwitcher state={stateExample} now={now} />)
    expect(screen.queryByRole('button', { name: /^ora$/i })).toBeNull()
  })

  it('mostra la tab "Ora" e una tab per la serata futura, etichettata giorno+data', () => {
    render(<MapViewSwitcher state={stateConChiusuraFutura} now={now} />)
    expect(screen.getByRole('button', { name: /^ora$/i })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /lun 6 lug/i })).toBeInTheDocument()
  })

  it('selezionando la tab data, la mappa mostra lo stato di quella serata e compare il banner di anteprima', () => {
    const { container } = render(<MapViewSwitcher state={stateConChiusuraFutura} now={now} />)
    // "Ora": la finestra futura non è ancora attiva → verde
    expect(
      container.querySelector('[data-id="agnano"][data-dir="capodichino"]')
    ).toHaveAttribute('data-status', 'verde')

    fireEvent.click(screen.getByRole('button', { name: /lun 6 lug/i }))

    expect(
      container.querySelector('[data-id="agnano"][data-dir="capodichino"]')
    ).toHaveAttribute('data-status', 'rosso')
    expect(screen.getByRole('status').textContent).toMatch(/lun 6 lug/i)
  })

  it('tornando su "Ora" dopo aver selezionato una data, ripristina lo stato attuale e nasconde il banner', () => {
    const { container } = render(<MapViewSwitcher state={stateConChiusuraFutura} now={now} />)
    fireEvent.click(screen.getByRole('button', { name: /lun 6 lug/i }))
    fireEvent.click(screen.getByRole('button', { name: /^ora$/i }))

    expect(
      container.querySelector('[data-id="agnano"][data-dir="capodichino"]')
    ).toHaveAttribute('data-status', 'verde')
    expect(screen.queryByRole('status')).toBeNull()
  })
})
