'use client'

import { useState } from 'react'
import { SchematicMap } from '@/components/SchematicMap'
import type { TangenzialeState, Direzione } from '@/lib/types'

interface MapViewSwitcherProps {
  state: TangenzialeState
}

function ArrowIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true" className="shrink-0">
      <path
        d="M1 6 H13 M9 2 L13 6 L9 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
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
          aria-pressed={direction === 'capodichino'}
          onClick={() => setDirection('capodichino')}
          className={tabClass(direction === 'capodichino')}
        >
          <ArrowIcon />
          Capodichino
        </button>
        <button
          type="button"
          aria-pressed={direction === 'pozzuoli'}
          onClick={() => setDirection('pozzuoli')}
          className={`${tabClass(direction === 'pozzuoli')} border-l border-edge`}
        >
          <ArrowIcon />
          Pozzuoli
        </button>
      </div>

      <SchematicMap state={state} direction={direction} />
    </div>
  )
}
