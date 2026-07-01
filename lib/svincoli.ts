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
  /** Coordinate geografiche reali dell'uscita (WGS84) */
  coord: { lat: number; lng: number }
}

export const SVINCOLI: Svincolo[] = [
  { id: 'capodichino',      nome: 'Capodichino / Aeroporto', breve: 'Capodichino',  coord: { lat: 40.886, lng: 14.291 } },
  { id: 'secondigliano',    nome: 'Secondigliano',           breve: 'Secondigliano',coord: { lat: 40.879, lng: 14.270 } },
  { id: 'doganella',        nome: 'Doganella',               breve: 'Doganella',    coord: { lat: 40.873, lng: 14.259 } },
  { id: 'corso-malta',      nome: 'Corso Malta',             breve: 'C.Malta',      coord: { lat: 40.865, lng: 14.272 } },
  { id: 'capodimonte',      nome: 'Capodimonte',             breve: 'Capodimonte',  coord: { lat: 40.867, lng: 14.247 } },
  { id: 'arenella',         nome: 'Arenella / Zona Osp.',    breve: 'Arenella',     coord: { lat: 40.854, lng: 14.228 } },
  { id: 'camaldoli',        nome: 'Camaldoli',               breve: 'Camaldoli',    coord: { lat: 40.853, lng: 14.211 } },
  { id: 'vomero',           nome: 'Vomero',                  breve: 'Vomero',       coord: { lat: 40.845, lng: 14.218 } },
  { id: 'fuorigrotta',      nome: 'Fuorigrotta',             breve: 'Fuorigrotta',  coord: { lat: 40.829, lng: 14.193 } },
  { id: 'agnano',           nome: 'Agnano',                  breve: 'Agnano',       coord: { lat: 40.825, lng: 14.170 } },
  { id: 'pozzuoli-campana', nome: 'Pozzuoli – Via Campana',  breve: 'Poz.Campana',  coord: { lat: 40.843, lng: 14.140 } },
  { id: 'cuma',             nome: 'Cuma',                    breve: 'Cuma',         coord: { lat: 40.852, lng: 14.073 } },
  { id: 'pozzuoli-arco',    nome: 'Pozzuoli – Arco Felice',  breve: 'Poz.Arco',     coord: { lat: 40.812, lng: 14.103 } },
]

export const SVINCOLO_IDS = SVINCOLI.map((s) => s.id) as string[]
