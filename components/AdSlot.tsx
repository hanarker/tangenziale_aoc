interface AdSlotProps {
  /** Identificativo dello slot, da mappare su data-ad-slot di AdSense */
  id: string
}

/**
 * Segnaposto per un banner Google AdSense responsive.
 * L'altezza minima riserva lo spazio dei formati standard
 * (320×100 su mobile, 728×90 su desktop) per evitare layout shift
 * quando l'annuncio verrà caricato. Per attivarlo, sostituire il
 * contenuto con <ins className="adsbygoogle" data-ad-slot={id} …/>.
 */
export function AdSlot({ id }: AdSlotProps) {
  return (
    <aside
      aria-label="Spazio pubblicitario"
      data-ad-slot={id}
      className="w-full mt-6 min-h-[100px] sm:min-h-[90px] rounded-lg border border-dashed border-edge flex items-center justify-center"
    >
      <span className="text-[11px] uppercase tracking-widest text-muted">Annuncio</span>
    </aside>
  )
}
