'use client'

import { SVINCOLI } from '@/lib/svincoli'
import type { TangenzialeState, Status, Direzione } from '@/lib/types'

interface TangenzialeMapProps {
  state: TangenzialeState
}

const STATUS_COLOR: Record<Status, string> = {
  verde: '#22c55e',
  giallo: '#facc15',
  rosso: '#ef4444',
}

const STATUS_LABEL: Record<Status, string> = {
  verde: 'aperto',
  giallo: 'lavori',
  rosso: 'chiuso',
}

// Dimensioni SVG
const NODE_RADIUS = 14
const NODE_GAP = 64          // distanza orizzontale tra nodi
const TRACK_GAP = 44         // distanza verticale tra i due binari
const PADDING_X = 80
const PADDING_Y = 48
const LABEL_OFFSET_Y = 26    // offset etichetta sotto il nodo

const TOTAL_NODES = SVINCOLI.length
const SVG_WIDTH = PADDING_X * 2 + (TOTAL_NODES - 1) * NODE_GAP
const SVG_HEIGHT = PADDING_Y * 2 + TRACK_GAP + LABEL_OFFSET_Y + 14

function nodeX(index: number) {
  return PADDING_X + index * NODE_GAP
}

const Y_POZZUOLI = PADDING_Y
const Y_CAPODICHINO = PADDING_Y + TRACK_GAP

function getStatus(
  svincoloId: string,
  direzione: Direzione,
  state: TangenzialeState
): Status {
  const found = state.items.find(
    (i) => i.id === svincoloId && i.direzione === direzione
  )
  return found?.status ?? 'verde'
}

function getNote(
  svincoloId: string,
  direzione: Direzione,
  state: TangenzialeState
): string | undefined {
  return state.items.find(
    (i) => i.id === svincoloId && i.direzione === direzione
  )?.note
}

interface NodeProps {
  cx: number
  cy: number
  svincolo: (typeof SVINCOLI)[number]
  status: Status
  note?: string
  showLabel: boolean
}

function MapNode({ cx, cy, svincolo, status, note, showLabel }: NodeProps) {
  const color = STATUS_COLOR[status]
  const label = STATUS_LABEL[status]
  return (
    <g role="img" aria-label={`${svincolo.nome} — ${label}${note ? `: ${note}` : ''}`}>
      <circle
        cx={cx}
        cy={cy}
        r={NODE_RADIUS}
        fill={color}
        stroke="white"
        strokeWidth={2.5}
        data-status={status}
        data-id={svincolo.id}
      />
      {showLabel && (
        <text
          x={cx}
          y={cy + NODE_RADIUS + LABEL_OFFSET_Y - 12}
          textAnchor="middle"
          fontSize={9}
          fill="#374151"
          fontFamily="system-ui, sans-serif"
        >
          {svincolo.breve}
        </text>
      )}
    </g>
  )
}

export function TangenzialeMap({ state }: TangenzialeMapProps) {
  const linePoints = SVINCOLI.map((_, i) => nodeX(i))

  return (
    <div className="w-full overflow-x-auto" aria-label="Mappa stilizzata della Tangenziale di Napoli">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        className="min-w-full"
        role="presentation"
      >
        {/* ── Direzione Pozzuoli (binario superiore) ── */}
        <g>
          {/* Freccia direzione */}
          <text x={PADDING_X - 4} y={Y_POZZUOLI + 4} textAnchor="end" fontSize={10} fill="#6b7280" fontFamily="system-ui">
            ← Pozzuoli
          </text>
          {/* Linea */}
          <line
            x1={linePoints[0]}
            y1={Y_POZZUOLI}
            x2={linePoints[linePoints.length - 1]}
            y2={Y_POZZUOLI}
            stroke="#d1d5db"
            strokeWidth={4}
          />
          {/* Nodi */}
          {SVINCOLI.map((sv, i) => {
            const status = getStatus(sv.id, 'pozzuoli', state)
            const note = getNote(sv.id, 'pozzuoli', state)
            return (
              <MapNode
                key={`pozzuoli-${sv.id}`}
                cx={nodeX(i)}
                cy={Y_POZZUOLI}
                svincolo={sv}
                status={status}
                note={note}
                showLabel={false}
              />
            )
          })}
        </g>

        {/* ── Direzione Capodichino (binario inferiore) ── */}
        <g>
          <text x={PADDING_X - 4} y={Y_CAPODICHINO + 4} textAnchor="end" fontSize={10} fill="#6b7280" fontFamily="system-ui">
            ← Capodichino
          </text>
          <line
            x1={linePoints[0]}
            y1={Y_CAPODICHINO}
            x2={linePoints[linePoints.length - 1]}
            y2={Y_CAPODICHINO}
            stroke="#d1d5db"
            strokeWidth={4}
          />
          {SVINCOLI.map((sv, i) => {
            const status = getStatus(sv.id, 'capodichino', state)
            const note = getNote(sv.id, 'capodichino', state)
            return (
              <MapNode
                key={`capodichino-${sv.id}`}
                cx={nodeX(i)}
                cy={Y_CAPODICHINO}
                svincolo={sv}
                status={status}
                note={note}
                showLabel={true}  // etichette solo sul binario inferiore
              />
            )
          })}
        </g>
      </svg>
    </div>
  )
}
