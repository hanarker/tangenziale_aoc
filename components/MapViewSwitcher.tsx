'use client'

import { useState } from 'react'
import { SchematicMap } from '@/components/SchematicMap'
import { ArrowIcon } from '@/components/ArrowIcon'
import type { TangenzialeState, Direzione } from '@/lib/types'

interface MapViewSwitcherProps {
  state: TangenzialeState
}

export function MapViewSwitcher({ state }: MapViewSwitcherProps) {
  const [direction, setDirection] = useState<Direzione>('capodichino')

  const tabClass = (active: boolean) =>
    [
      'flex items-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors',
      active
        ? 'bg-primary text-white dark:bg-[#2e4599]'
        : 'bg-surface text-muted hover:text-foreground',
    ].join(' ')

  return (
    <div className="w-full">
      {/* Tab direzionali in stile cartello */}
      <div
        role="group"
        aria-label="Direzione di marcia"
        className="flex mb-4 rounded-[4px] border border-edge overflow-hidden w-fit"
      >
        <button
          type="button"
          aria-pressed={direction === 'pozzuoli'}
          onClick={() => setDirection('pozzuoli')}
          className={tabClass(direction === 'pozzuoli')}
        >
          <ArrowIcon verso="sinistra" />
          Pozzuoli
        </button>
        <button
          type="button"
          aria-pressed={direction === 'capodichino'}
          onClick={() => setDirection('capodichino')}
          className={`${tabClass(direction === 'capodichino')} border-l border-edge`}
        >
          Capodichino
          <ArrowIcon verso="destra" />
        </button>
      </div>

      {/* Mobile: sviluppo verticale stile linea metro, senza scroll orizzontale */}
      <div className="sm:hidden">
        <SchematicMap state={state} direction={direction} orientation="vertical" />
      </div>
      {/* Tablet/desktop: sviluppo orizzontale */}
      <div className="hidden sm:block">
        <SchematicMap state={state} direction={direction} orientation="horizontal" />
      </div>
    </div>
  )
}
