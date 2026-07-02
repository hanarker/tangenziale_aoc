interface ShieldLogoProps {
  width?: number
  height?: number
  /** 'inverse' per fondi navy (scudetto chiaro, T scura), come sulla navbar a portale */
  variant?: 'default' | 'inverse'
}

export function ShieldLogo({ width = 44, height = 48, variant = 'default' }: ShieldLogoProps) {
  const isInverse = variant === 'inverse'

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 44 48"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M22 2 L41 8 V24 C41 36 32 44 22 46 C12 44 3 36 3 24 V8 Z"
        className={isInverse ? undefined : 'fill-primary'}
        style={isInverse ? { fill: 'var(--sign-foreground)' } : undefined}
      />
      <text
        x="22"
        y="31"
        textAnchor="middle"
        fontSize="20"
        fontWeight="700"
        style={{
          fontFamily: 'var(--font-barlow-condensed)',
          fill: isInverse ? 'var(--sign)' : 'var(--shield-glyph)',
        }}
      >
        T
      </text>
    </svg>
  )
}
