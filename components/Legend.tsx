const VOCI = [
  { colore: 'bg-green-500', etichetta: 'Scorrevole / Aperto' },
  { colore: 'bg-yellow-400', etichetta: 'Lavori in corso' },
  { colore: 'bg-red-500', etichetta: 'Uscita Chiusa' },
] as const

export function Legend() {
  return (
    <div className="flex flex-wrap gap-4 justify-center py-3">
      {VOCI.map(({ colore, etichetta }) => (
        <div key={etichetta} className="flex items-center gap-2 text-sm font-medium">
          <span className={`inline-block w-4 h-4 rounded-full ${colore}`} aria-hidden="true" />
          <span>{etichetta}</span>
        </div>
      ))}
    </div>
  )
}
