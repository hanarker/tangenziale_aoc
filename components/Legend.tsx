const VOCI = [
  { colore: 'bg-green-600', simbolo: '✓', etichetta: 'Aperta' },
  { colore: 'bg-amber-500', simbolo: '‖', etichetta: 'Lavori in corso' },
  { colore: 'bg-red-600', simbolo: '✕', etichetta: 'Chiusa' },
] as const

export function Legend() {
  return (
    <div className="flex flex-wrap gap-4 justify-center py-3">
      {VOCI.map(({ colore, simbolo, etichetta }) => (
        <div key={etichetta} className="flex items-center gap-2 text-sm font-medium">
          <span
            className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-bold ${colore}`}
            aria-hidden="true"
          >
            {simbolo}
          </span>
          <span>{etichetta}</span>
        </div>
      ))}
    </div>
  )
}
