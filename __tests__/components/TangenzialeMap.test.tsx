import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { TangenzialeState } from '@/lib/types'
import { SchematicMap } from '@/components/SchematicMap'

const stateExample: TangenzialeState = {
  items: [
    { id: 'fuorigrotta', direzione: 'pozzuoli', status: 'rosso', note: 'Chiusa' },
    { id: 'camaldoli', direzione: 'capodichino', status: 'giallo', note: 'Lavori' },
  ],
  updatedAt: '2026-06-28T23:00:00.000Z',
  source: 'Avviso di esempio',
  stale: false,
}

describe('SchematicMap', () => {
  it('renderizza tutti gli svincoli canonici', () => {
    render(<SchematicMap state={stateExample} direction="capodichino" />)
    // Fuorigrotta deve apparire come etichetta
    expect(screen.getAllByText(/fuorigrotta/i).length).toBeGreaterThan(0)
  })

  it('applica il colore rosso a Fuorigrotta in direzione Pozzuoli', () => {
    const { container } = render(<SchematicMap state={stateExample} direction="pozzuoli" />)
    const nodo = container.querySelector('[data-id="fuorigrotta"][data-dir="pozzuoli"]')
    expect(nodo).toHaveAttribute('data-status', 'rosso')
  })

  it('applica il colore giallo a Camaldoli in direzione Capodichino', () => {
    const { container } = render(<SchematicMap state={stateExample} direction="capodichino" />)
    const nodo = container.querySelector('[data-id="camaldoli"][data-dir="capodichino"]')
    expect(nodo).toHaveAttribute('data-status', 'giallo')
  })

  it('renderizza un solo nodo per svincolo, con la direzione richiesta', () => {
    const { container } = render(<SchematicMap state={stateExample} direction="pozzuoli" />)
    expect(container.querySelectorAll('[data-dir="pozzuoli"]').length).toBe(13)
    expect(container.querySelectorAll('[data-dir="capodichino"]').length).toBe(0)
  })

  it("mostra un'evidenza (icona ✕) sulle uscite chiuse, non solo il colore", () => {
    const { container } = render(<SchematicMap state={stateExample} direction="pozzuoli" />)
    const nodo = container.querySelector('[data-id="fuorigrotta"][data-dir="pozzuoli"]')
    expect(nodo?.getAttribute('aria-label')).toMatch(/chiusa/i)
    // anello pulsante di evidenza per le chiuse
    expect(container.querySelector('.schematic-pulse')).not.toBeNull()
  })

  it('default orizzontale: viewBox più largo che alto', () => {
    const { container } = render(<SchematicMap state={stateExample} direction="pozzuoli" />)
    expect(container.querySelector('[data-orientation="horizontal"]')).not.toBeNull()
    const viewBox = container.querySelector('svg')?.getAttribute('viewBox') ?? ''
    const [, , w, h] = viewBox.split(' ').map(Number)
    expect(w).toBeGreaterThan(h)
  })
})

describe('SchematicMap verticale (mobile)', () => {
  it('renderizza tutti i 13 svincoli anche in verticale', () => {
    const { container } = render(
      <SchematicMap state={stateExample} direction="pozzuoli" orientation="vertical" />
    )
    expect(container.querySelectorAll('[data-dir="pozzuoli"]').length).toBe(13)
  })

  it('espone data-orientation e viewBox più alto che largo (sviluppo verticale)', () => {
    const { container } = render(
      <SchematicMap state={stateExample} direction="pozzuoli" orientation="vertical" />
    )
    expect(container.querySelector('[data-orientation="vertical"]')).not.toBeNull()
    const viewBox = container.querySelector('svg')?.getAttribute('viewBox') ?? ''
    const [, , w, h] = viewBox.split(' ').map(Number)
    expect(h).toBeGreaterThan(w)
  })

  it('applica lo stato corretto ai nodi anche in verticale', () => {
    const { container } = render(
      <SchematicMap state={stateExample} direction="pozzuoli" orientation="vertical" />
    )
    const nodo = container.querySelector('[data-id="fuorigrotta"][data-dir="pozzuoli"]')
    expect(nodo).toHaveAttribute('data-status', 'rosso')
  })

  it('mostra le etichette degli svincoli in verticale', () => {
    render(
      <SchematicMap state={stateExample} direction="capodichino" orientation="vertical" />
    )
    expect(screen.getAllByText(/fuorigrotta/i).length).toBeGreaterThan(0)
  })

  it('non usa un contenitore a scorrimento orizzontale', () => {
    const { container } = render(
      <SchematicMap state={stateExample} direction="pozzuoli" orientation="vertical" />
    )
    expect(container.querySelector('.overflow-x-auto')).toBeNull()
  })
})
