interface ArrowIconProps {
  verso?: 'sinistra' | 'destra'
}

/** Freccia direzionale in stile segnaletica, condivisa tra tab, navbar ed elenchi */
export function ArrowIcon({ verso = 'destra' }: ArrowIconProps) {
  const d = verso === 'destra' ? 'M1 6 H13 M9 2 L13 6 L9 10' : 'M15 6 H3 M7 2 L3 6 L7 10'
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true" className="shrink-0">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
