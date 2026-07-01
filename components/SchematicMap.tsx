'use client'

import { SVINCOLI } from '@/lib/svincoli'
import { statusBySvincolo } from '@/lib/status-util'
import { computeWavePoints, toSmoothPath } from '@/lib/schematic-layout'
import type { TangenzialeState, Status, Direzione } from '@/lib/types'

interface SchematicMapProps {
  state: TangenzialeState
  direction: Direzione
}

const STATUS_VAR: Record<Status, string> = {
  verde: 'var(--status-verde)',
  giallo: 'var(--status-giallo)',
  rosso: 'var(--status-rosso)',
}

const STATUS_LABEL: Record<Status, string> = {
  verde: 'Aperta',
  giallo: 'Lavori in corso',
  rosso: 'Chiusa',
}

const DIREZIONE_LABEL: Record<Direzione, string> = {
  capodichino: 'Capodichino',
  pozzuoli: 'Pozzuoli',
}

// Glifo scuro fisso: sempre leggibile sul giallo in entrambi i temi.
const GIALLO_GLYPH = '#1b2a5c'

// ── Layout ────────────────────────────────────────────────────────────────
// Spaziatura uniforme (indipendente dalla geografia reale) con una lieve onda
// decorativa: evita l'accavallamento di nodi ed etichette ai capolinea, dove
// gli svincoli reali sono molto ravvicinati.
const SVG_W = 960
const SVG_H = 300
const PAD_X = 60
const MID_Y = 150
const AMPLITUDE = 22
const CYCLES = 2.5
const NODE_R = 13
const TERMINUS_R = 19
const ROAD_WIDTH = 15
const LABEL_GAP = 26

const N = SVINCOLI.length
const LAST = N - 1
// SVINCOLI è ordinato da est (Capodichino, indice 0) a ovest (Pozzuoli-Arco Felice,
// ultimo indice); si inverte l'array dei punti così Capodichino appare a destra e
// Pozzuoli-Arco Felice a sinistra, coerente con l'orientamento reale della mappa.
const POINTS = [...computeWavePoints(N, { width: SVG_W, padX: PAD_X, midY: MID_Y, amplitude: AMPLITUDE, cycles: CYCLES })].reverse()
const ROAD_PATH = toSmoothPath(POINTS)

// ── Icone di stato (regola color-not-only: lo stato non è affidato solo al colore) ──
function StatusIcon({ status, r }: { status: Status; r: number }) {
  if (status === 'rosso') {
    const d = r * 0.42
    return (
      <g stroke="#ffffff" strokeWidth={2.4} strokeLinecap="round">
        <line x1={-d} y1={-d} x2={d} y2={d} />
        <line x1={-d} y1={d} x2={d} y2={-d} />
      </g>
    )
  }
  if (status === 'giallo') {
    const h = r * 0.45
    return (
      <g stroke={GIALLO_GLYPH} strokeWidth={2.2} strokeLinecap="round">
        <line x1={-r * 0.28} y1={-h} x2={-r * 0.28} y2={h} />
        <line x1={r * 0.28} y1={-h} x2={r * 0.28} y2={h} />
      </g>
    )
  }
  // verde: segno di spunta, coerente con l'idea "via libera"
  return (
    <path
      d={`M ${-r * 0.35} 0 L ${-r * 0.08} ${r * 0.32} L ${r * 0.4} ${-r * 0.32}`}
      fill="none"
      stroke="#ffffff"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  )
}

interface WaypointProps {
  index: number
  cx: number
  cy: number
  status: Status
  svincolo: (typeof SVINCOLI)[number]
  direction: Direzione
}

function Waypoint({ index, cx, cy, status, svincolo, direction }: WaypointProps) {
  const isTerminus = index === 0 || index === LAST
  const r = isTerminus ? TERMINUS_R : NODE_R
  const above = index % 2 === 0
  const labelY = above ? cy - r - LABEL_GAP : cy + r + LABEL_GAP
  const isClosed = status === 'rosso'

  return (
    <g>
      {/* Linea guida etichetta */}
      <line
        x1={cx}
        y1={above ? labelY + 5 : labelY - 5}
        x2={cx}
        y2={above ? cy - r - 3 : cy + r + 3}
        stroke="var(--map-guide)"
        strokeWidth={1}
      />
      <text
        x={cx}
        y={labelY}
        textAnchor="middle"
        fontSize={isTerminus ? 12.5 : 11}
        fontWeight={800}
        fill={isClosed ? 'var(--status-rosso)' : 'var(--map-label)'}
        letterSpacing="0.3"
      >
        {svincolo.breve.toUpperCase()}
      </text>

      {/* Anello pulsante sulle uscite chiuse: massima evidenza sui capolinea */}
      {isClosed && (
        <circle
          cx={cx}
          cy={cy}
          r={r + 3}
          fill="none"
          stroke="var(--status-rosso)"
          strokeWidth={2}
          className="schematic-pulse"
        />
      )}

      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={STATUS_VAR[status]}
        stroke="var(--node-ring)"
        strokeWidth={2.5}
        filter="url(#badgeShadow)"
        data-status={status}
        data-id={svincolo.id}
        data-dir={direction}
        role="img"
        aria-label={`${svincolo.nome} in direzione ${DIREZIONE_LABEL[direction]}: ${STATUS_LABEL[status]}`}
      />
      <g transform={`translate(${cx} ${cy})`} aria-hidden="true">
        <StatusIcon status={status} r={r} />
      </g>
    </g>
  )
}

export function SchematicMap({ state, direction }: SchematicMapProps) {
  const statusMap = statusBySvincolo(state)
  const arrowLabel =
    direction === 'capodichino' ? 'Direzione Capodichino →' : '← Direzione Pozzuoli'

  return (
    <div className="w-full" aria-label={`Mappa stilizzata della Tangenziale — direzione ${DIREZIONE_LABEL[direction]}`}>
      <style>{`
        @keyframes schematic-pulse-ring {
          0%   { r: ${NODE_R + 3}; opacity: 0.55; }
          100% { r: ${NODE_R + 12}; opacity: 0; }
        }
        .schematic-pulse { animation: schematic-pulse-ring 1.6s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .schematic-pulse { animation: none; opacity: 0.35; }
        }
      `}</style>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          width={SVG_W}
          height={SVG_H}
          className="min-w-full"
          role="presentation"
          style={{ fontFamily: 'var(--font-barlow-condensed)' }}
        >
          <defs>
            <filter id="badgeShadow" x="-60%" y="-60%" width="220%" height="220%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.3" floodColor="#1b2a5c" floodOpacity="0.28" />
            </filter>
          </defs>

          {/* ── Sede stradale ───────────────────────────────────────────── */}
          <path d={ROAD_PATH} fill="none" stroke="var(--road-navy)" strokeWidth={ROAD_WIDTH} strokeLinecap="round" strokeLinejoin="round" />
          <path d={ROAD_PATH} fill="none" stroke="var(--road-dash)" strokeWidth={2} strokeDasharray="10 9" strokeLinecap="round" />

          {/* ── Indicatore di senso di marcia ───────────────────────────── */}
          <text
            x={SVG_W / 2}
            y={SVG_H - 12}
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
            fill="var(--map-guide)"
            letterSpacing="0.4"
          >
            {arrowLabel}
          </text>

          {/* ── Nodi ─────────────────────────────────────────────────────── */}
          {SVINCOLI.map((sv, i) => {
            const [cx, cy] = POINTS[i]
            const info = statusMap.get(sv.id)
            const status = (direction === 'pozzuoli' ? info?.pozzuoli : info?.capodichino) ?? 'verde'
            return (
              <Waypoint
                key={sv.id}
                index={i}
                cx={cx}
                cy={cy}
                status={status}
                svincolo={sv}
                direction={direction}
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}
