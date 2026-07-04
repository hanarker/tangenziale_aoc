'use client'

import { useState } from 'react'
import { SchematicMap } from '@/components/SchematicMap'
import { ArrowIcon } from '@/components/ArrowIcon'
import { buildEveningClosures, formatSerataDate } from '@/lib/closures'
import type { TangenzialeState, Direzione } from '@/lib/types'

interface MapViewSwitcherProps {
  state: TangenzialeState
  /** Istante di riferimento, passato dalla pagina per determinismo */
  now: Date
}

export function MapViewSwitcher({ state, now }: MapViewSwitcherProps) {
  const [direction, setDirection] = useState<Direzione>('capodichino')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { groups } = buildEveningClosures(state, now)
  const selectedGroup = groups.find((g) => g.dateKey === selectedDate)
  const selectedLabel = selectedGroup
    ? formatSerataDate(new Date(selectedGroup.entries[0].from))
    : null

  const tabClass = (active: boolean) =>
    [
      'flex items-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors',
      active
        ? 'bg-primary text-white dark:bg-[#2e4599]'
        : 'bg-surface text-muted hover:text-foreground',
    ].join(' ')

  return (
    <div className="w-full">
      {/* Tab delle serate future con chiusure note: "Ora" + una per serata */}
      {groups.length > 0 && (
        <div
          role="group"
          aria-label="Giorno da visualizzare"
          className="flex flex-wrap mb-3 rounded-[4px] border border-edge overflow-hidden w-fit"
        >
          <button
            type="button"
            aria-pressed={selectedDate === null}
            onClick={() => setSelectedDate(null)}
            className={tabClass(selectedDate === null)}
          >
            Ora
          </button>
          {groups.map((group) => (
            <button
              key={group.dateKey}
              type="button"
              aria-pressed={selectedDate === group.dateKey}
              onClick={() => setSelectedDate(group.dateKey)}
              className={`${tabClass(selectedDate === group.dateKey)} border-l border-edge`}
            >
              {formatSerataDate(new Date(group.entries[0].from))}
            </button>
          ))}
        </div>
      )}

      {selectedLabel && (
        <p
          role="status"
          className="mb-3 rounded-[4px] border border-edge bg-surface px-3 py-2 text-sm text-muted"
        >
          Anteprima chiusure previste per{' '}
          <strong className="text-foreground">{selectedLabel}</strong> — non
          riflette lo stato attuale.
        </p>
      )}

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
        <SchematicMap
          state={state}
          direction={direction}
          orientation="vertical"
          now={now}
          dateKey={selectedDate ?? undefined}
        />
      </div>
      {/* Tablet/desktop: sviluppo orizzontale */}
      <div className="hidden sm:block">
        <SchematicMap
          state={state}
          direction={direction}
          orientation="horizontal"
          now={now}
          dateKey={selectedDate ?? undefined}
        />
      </div>
    </div>
  )
}
