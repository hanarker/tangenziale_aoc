import type { ReactNode } from 'react'

interface SectionPanelProps {
  id: string
  titolo: string
  icona: ReactNode
  children: ReactNode
}

/**
 * Sezione con intestazione in stile pannello segnaletico:
 * fondo navy con filetto chiaro interno, come i cartelli reali.
 */
export function SectionPanel({ id, titolo, icona, children }: SectionPanelProps) {
  return (
    <section id={id} className="w-full scroll-mt-20">
      <h2 className="rounded-[6px] bg-sign p-1 shadow-sm">
        <span className="flex items-center gap-2.5 rounded-[4px] border border-sign-line px-3.5 py-2.5 text-sign-foreground">
          {icona}
          <span className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide leading-none">
            {titolo}
          </span>
        </span>
      </h2>
      <div className="mt-3 px-1">{children}</div>
    </section>
  )
}
