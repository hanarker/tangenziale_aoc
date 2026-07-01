interface StatusBarProps {
  updatedAt: string
  stale: boolean
}

function WarningIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M12 3 L22 20 H2 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="12" y1="10" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.1" fill="currentColor" />
    </svg>
  )
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
    <div className="flex flex-col items-center gap-2 py-2">
      <p className="text-center text-xs text-muted">
        Ultimo aggiornamento:{' '}
        <span className="tabular-nums font-medium">{formatted}</span>
      </p>
      {stale && (
        <p className="flex items-center gap-1.5 rounded-[3px] border border-amber-500/60 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
          <WarningIcon />
          Dati precedenti — aggiornamento non riuscito
        </p>
      )}
    </div>
  )
}
