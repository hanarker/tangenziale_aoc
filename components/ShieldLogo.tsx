import Image from 'next/image'

interface ShieldLogoProps {
  width?: number
  height?: number
  /** 'inverse' per fondi navy (scudetto con sfondo navy pieno), come sulla navbar a portale */
  variant?: 'default' | 'inverse'
}

export function ShieldLogo({ width = 44, height = 48, variant = 'default' }: ShieldLogoProps) {
  const isInverse = variant === 'inverse'

  return (
    <Image
      src={isInverse ? '/logo-shield-inverse.png' : '/logo-shield.png'}
      alt=""
      width={width}
      height={height}
      priority
      className="shrink-0 object-contain"
    />
  )
}
