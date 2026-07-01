/**
 * Layout della vista schematica: a differenza della proiezione geografica,
 * qui i nodi sono equidistanti sull'asse X (nessun accavallamento, indipendentemente
 * da quanto siano vicini gli svincoli nella realtà) con una lieve onda decorativa
 * sull'asse Y, puramente estetica.
 */

export interface WaveConfig {
  width: number
  padX: number
  midY: number
  amplitude: number
  /** Numero di "creste" complete lungo l'intero tracciato */
  cycles: number
}

export function computeWavePoints(count: number, config: WaveConfig): [number, number][] {
  const { width, padX, midY, amplitude, cycles } = config
  if (count < 2) return count === 1 ? [[padX, midY]] : []

  const gap = (width - padX * 2) / (count - 1)
  const angularStep = (Math.PI * 2 * cycles) / (count - 1)

  return Array.from({ length: count }, (_, i) => {
    const x = padX + i * gap
    const y = midY + amplitude * Math.sin(i * angularStep)
    return [x, y] as [number, number]
  })
}

// Percorso smussato (curve di Bézier quadratiche passanti per i punti medi):
// evita gli spigoli vivi della polilinea spezzata.
export function toSmoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return ''
  const [x0, y0] = pts[0]
  let d = `M ${x0.toFixed(1)} ${y0.toFixed(1)}`
  for (let i = 1; i < pts.length - 1; i++) {
    const [cx, cy] = pts[i]
    const [nx, ny] = pts[i + 1]
    const mx = (cx + nx) / 2
    const my = (cy + ny) / 2
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`
  }
  const [lx, ly] = pts[pts.length - 1]
  d += ` L ${lx.toFixed(1)} ${ly.toFixed(1)}`
  return d
}
