interface StatusBarProps {
  updatedAt: string
  stale: boolean
}

export function StatusBar({ updatedAt, stale }: StatusBarProps) {
  const formatted = new Date(updatedAt).toLocaleString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="text-center text-xs text-gray-500 py-2 space-y-1">
      <p>Ultimo aggiornamento: {formatted}</p>
      {stale && (
        <p className="text-amber-600 font-semibold">
          ⚠ Dati precedenti — aggiornamento non riuscito
        </p>
      )}
    </div>
  )
}
