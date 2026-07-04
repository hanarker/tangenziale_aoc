import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import type { TangenzialeState } from '@/lib/types'
import { SchematicMap } from '@/components/SchematicMap'

const now = new Date('2026-07-01T02:00:00+02:00')

describe('SchematicMap', () => {
  it('marca giallo il nodo di uno svincolo con chiusura di uscita/ingresso', () => {
    const state: TangenzialeState = {
      items: [{ id: 'fuorigrotta', direzione: 'capodichino', status: 'giallo' }],
      updatedAt: '2026-06-29T00:00:00.000Z',
      source: 'test',
      stale: false,
    }
    const { container } = render(
      <SchematicMap state={state} direction="capodichino" now={now} />
    )
    expect(
      container.querySelector('[data-id="fuorigrotta"][data-dir="capodichino"]')
    ).toHaveAttribute('data-status', 'giallo')
  })

  it('disegna un segmento rosso tra i due estremi di un tratto attivo', () => {
    const state: TangenzialeState = {
      items: [],
      tratti: [
        {
          da: 'camaldoli',
          a: 'arenella',
          direzione: 'capodichino',
          uscitaObbligatoria: 'camaldoli',
          windows: [
            { from: '2026-06-30T23:00:00+02:00', to: '2026-07-01T06:00:00+02:00' },
          ],
        },
      ],
      updatedAt: '2026-06-29T00:00:00.000Z',
      source: 'test',
      stale: false,
    }
    const { container } = render(
      <SchematicMap state={state} direction="capodichino" now={now} />
    )
    const segments = container.querySelectorAll('[data-tratto-chiuso="true"]')
    expect(segments.length).toBeGreaterThan(0)
  })

  it('non disegna il segmento se il tratto è per l\'altra direzione', () => {
    const state: TangenzialeState = {
      items: [],
      tratti: [
        {
          da: 'camaldoli',
          a: 'arenella',
          direzione: 'pozzuoli',
          uscitaObbligatoria: 'arenella',
          windows: [
            { from: '2026-06-30T23:00:00+02:00', to: '2026-07-01T06:00:00+02:00' },
          ],
        },
      ],
      updatedAt: '2026-06-29T00:00:00.000Z',
      source: 'test',
      stale: false,
    }
    const { container } = render(
      <SchematicMap state={state} direction="capodichino" now={now} />
    )
    expect(container.querySelectorAll('[data-tratto-chiuso="true"]')).toHaveLength(0)
  })

  it('marca rosso il nodo di uscita obbligatoria di un tratto attivo', () => {
    const state: TangenzialeState = {
      items: [],
      tratti: [
        {
          da: 'camaldoli',
          a: 'arenella',
          direzione: 'capodichino',
          uscitaObbligatoria: 'camaldoli',
          windows: [
            { from: '2026-06-30T23:00:00+02:00', to: '2026-07-01T06:00:00+02:00' },
          ],
        },
      ],
      updatedAt: '2026-06-29T00:00:00.000Z',
      source: 'test',
      stale: false,
    }
    const { container } = render(
      <SchematicMap state={state} direction="capodichino" now={now} />
    )
    expect(
      container.querySelector('[data-id="camaldoli"][data-dir="capodichino"]')
    ).toHaveAttribute('data-status', 'rosso')
  })

  it('marca rosso anche i nodi intermedi di un tratto attivo, non solo gli estremi', () => {
    const state: TangenzialeState = {
      items: [],
      tratti: [
        {
          da: 'capodichino',
          a: 'capodimonte',
          direzione: 'capodichino',
          uscitaObbligatoria: 'capodichino',
          windows: [
            { from: '2026-06-30T23:00:00+02:00', to: '2026-07-01T06:00:00+02:00' },
          ],
        },
      ],
      updatedAt: '2026-06-29T00:00:00.000Z',
      source: 'test',
      stale: false,
    }
    const { container } = render(
      <SchematicMap state={state} direction="capodichino" now={now} />
    )
    expect(
      container.querySelector('[data-id="secondigliano"][data-dir="capodichino"]')
    ).toHaveAttribute('data-status', 'rosso')
    expect(
      container.querySelector('[data-id="doganella"][data-dir="capodichino"]')
    ).toHaveAttribute('data-status', 'rosso')
  })

  it('non disegna alcun segmento se il tratto non è attivo ora', () => {
    const later = new Date('2026-07-01T12:00:00+02:00')
    const state: TangenzialeState = {
      items: [],
      tratti: [
        {
          da: 'camaldoli',
          a: 'arenella',
          direzione: 'capodichino',
          uscitaObbligatoria: 'camaldoli',
          windows: [
            { from: '2026-06-30T23:00:00+02:00', to: '2026-07-01T06:00:00+02:00' },
          ],
        },
      ],
      updatedAt: '2026-06-29T00:00:00.000Z',
      source: 'test',
      stale: false,
    }
    const { container } = render(
      <SchematicMap state={state} direction="capodichino" now={later} />
    )
    expect(container.querySelectorAll('[data-tratto-chiuso="true"]')).toHaveLength(0)
  })
})

describe('SchematicMap con dateKey', () => {
  it('usa dateKey al posto di now: marca giallo lo svincolo la cui finestra inizia in quella data', () => {
    const state: TangenzialeState = {
      items: [
        {
          id: 'fuorigrotta',
          direzione: 'capodichino',
          status: 'giallo',
          windows: [
            { from: '2026-07-06T23:00:00+02:00', to: '2026-07-07T06:00:00+02:00' },
          ],
        },
      ],
      updatedAt: '2026-06-29T00:00:00.000Z',
      source: 'test',
      stale: false,
    }
    const { container } = render(
      <SchematicMap state={state} direction="capodichino" now={now} dateKey="2026-07-06" />
    )
    expect(
      container.querySelector('[data-id="fuorigrotta"][data-dir="capodichino"]')
    ).toHaveAttribute('data-status', 'giallo')
  })

  it('con dateKey ignora now: verde se nessuna finestra inizia nella data selezionata', () => {
    const state: TangenzialeState = {
      items: [
        {
          id: 'fuorigrotta',
          direzione: 'capodichino',
          status: 'giallo',
          windows: [
            { from: '2026-07-06T23:00:00+02:00', to: '2026-07-07T06:00:00+02:00' },
          ],
        },
      ],
      updatedAt: '2026-06-29T00:00:00.000Z',
      source: 'test',
      stale: false,
    }
    const { container } = render(
      <SchematicMap state={state} direction="capodichino" now={now} dateKey="2026-07-13" />
    )
    expect(
      container.querySelector('[data-id="fuorigrotta"][data-dir="capodichino"]')
    ).toHaveAttribute('data-status', 'verde')
  })

  it('disegna il segmento del tratto per la data selezionata anche se now non è dentro la finestra', () => {
    const state: TangenzialeState = {
      items: [],
      tratti: [
        {
          da: 'camaldoli',
          a: 'arenella',
          direzione: 'capodichino',
          uscitaObbligatoria: 'camaldoli',
          windows: [
            { from: '2026-07-06T23:00:00+02:00', to: '2026-07-07T06:00:00+02:00' },
          ],
        },
      ],
      updatedAt: '2026-06-29T00:00:00.000Z',
      source: 'test',
      stale: false,
    }
    const { container } = render(
      <SchematicMap state={state} direction="capodichino" now={now} dateKey="2026-07-06" />
    )
    expect(container.querySelectorAll('[data-tratto-chiuso="true"]').length).toBeGreaterThan(0)
  })

  it('non disegna il segmento del tratto se dateKey non corrisponde a nessuna finestra', () => {
    const state: TangenzialeState = {
      items: [],
      tratti: [
        {
          da: 'camaldoli',
          a: 'arenella',
          direzione: 'capodichino',
          uscitaObbligatoria: 'camaldoli',
          windows: [
            { from: '2026-07-06T23:00:00+02:00', to: '2026-07-07T06:00:00+02:00' },
          ],
        },
      ],
      updatedAt: '2026-06-29T00:00:00.000Z',
      source: 'test',
      stale: false,
    }
    const { container } = render(
      <SchematicMap state={state} direction="capodichino" now={now} dateKey="2026-07-13" />
    )
    expect(container.querySelectorAll('[data-tratto-chiuso="true"]')).toHaveLength(0)
  })
})
