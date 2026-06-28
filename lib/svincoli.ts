/**
 * Dato canonico degli svincoli della Tangenziale di Napoli.
 * Ordinati da est (Capodichino) a ovest (Pozzuoli-Arco Felice).
 * Questo array è la "fonte di verità" usata sia dallo schema SVG
 * sia dal prompt LLM, garantendo coerenza degli id.
 */
export interface Svincolo {
  /** Identificatore slug unico, usato in SvincoloState.id */
  id: string
  /** Nome da mostrare in UI */
  nome: string
  /** Abbreviazione per etichette compatte sulla mappa */
  breve: string
}

export const SVINCOLI: Svincolo[] = [
  { id: 'capodichino',      nome: 'Capodichino / Aeroporto', breve: 'Capodichino' },
  { id: 'secondigliano',    nome: 'Secondigliano',           breve: 'Secondigliano' },
  { id: 'doganella',        nome: 'Doganella',               breve: 'Doganella' },
  { id: 'corso-malta',      nome: 'Corso Malta',             breve: 'C.Malta' },
  { id: 'capodimonte',      nome: 'Capodimonte',             breve: 'Capodimonte' },
  { id: 'arenella',         nome: 'Arenella / Zona Osp.',    breve: 'Arenella' },
  { id: 'camaldoli',        nome: 'Camaldoli',               breve: 'Camaldoli' },
  { id: 'vomero',           nome: 'Vomero',                  breve: 'Vomero' },
  { id: 'fuorigrotta',      nome: 'Fuorigrotta',             breve: 'Fuorigrotta' },
  { id: 'agnano',           nome: 'Agnano',                  breve: 'Agnano' },
  { id: 'pozzuoli-campana', nome: 'Pozzuoli – Via Campana',  breve: 'Poz.Campana' },
  { id: 'cuma',             nome: 'Cuma',                    breve: 'Cuma' },
  { id: 'pozzuoli-arco',    nome: 'Pozzuoli – Arco Felice',  breve: 'Poz.Arco' },
]

export const SVINCOLO_IDS = SVINCOLI.map((s) => s.id) as string[]
