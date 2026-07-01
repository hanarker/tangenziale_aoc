'use client'

import { useState } from 'react'
import { SchematicMap } from '@/components/SchematicMap'
import type { TangenzialeState, Direzione } from '@/lib/types'

interface MapViewSwitcherProps {
  state: TangenzialeState
}

export function MapViewSwitcher({ state }: MapViewSwitcherProps) {
  const [direction, setDirection] = useState<Direzione>('capodichino')

  return (
    <div className="w-full">
      {/* Segmented control: direzione di marcia */}
      <div
        role="group"
        aria-label="Direzione di marcia"
        className="flex mb-4 rounded-lg border border-gray-200 overflow-hidden w-fit"
      >
        <button
          type="button"
          aria-pressed={direction === 'capodichino'}
          onClick={() => setDirection('capodichino')}
          className={[
            'px-4 py-1.5 text-sm font-medium transition-colors',
            direction === 'capodichino'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50',
          ].join(' ')}
        >
          → Capodichino
        </button>
        <button
          type="button"
          aria-pressed={direction === 'pozzuoli'}
          onClick={() => setDirection('pozzuoli')}
          className={[
            'px-4 py-1.5 text-sm font-medium transition-colors border-l border-gray-200',
            direction === 'pozzuoli'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50',
          ].join(' ')}
        >
          → Pozzuoli
        </button>
      </div>

      <SchematicMap state={state} direction={direction} />
    </div>
  )
}
