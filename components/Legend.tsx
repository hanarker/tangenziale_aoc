const VOCI = [
  { chip: 'bg-green-600', simbolo: '✓', etichetta: 'Aperta' },
  { chip: 'bg-amber-500', simbolo: '‖', etichetta: 'Lavori in corso' },
  { chip: 'bg-red-600', simbolo: '✕', etichetta: 'Chiusa' },
] as const

export function Legend() {
  return (
    <div className="flex flex-wrap gap-2 justify-center py-3">
      {VOCI.map(({ chip, simbolo, etichetta }) => (
        <div
          key={etichetta}
          className="flex items-center gap-2 rounded-[3px] border border-edge bg-surface pl-1.5 pr-2.5 py-1"
        >
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded-[2px] text-white text-[11px] font-bold ${chip}`}
            aria-hidden="true"
          >
            {simbolo}
          </span>
          <span className="text-sm font-semibold uppercase tracking-wide text-foreground">
            {etichetta}
          </span>
        </div>
      ))}
    </div>
  )
}
