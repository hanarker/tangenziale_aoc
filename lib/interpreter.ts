import OpenAI from 'openai'
import { z } from 'zod'
import { SVINCOLO_IDS } from '@/lib/svincoli'
import type { SvincoloState } from '@/lib/types'

const ClosureWindowSchema = z.object({
  from: z.string(),
  to: z.string(),
})

const SvincoloStateSchema = z.object({
  id: z.string(),
  direzione: z.enum(['capodichino', 'pozzuoli']),
  status: z.enum(['verde', 'giallo', 'rosso']),
  note: z.string().optional(),
  windows: z.array(ClosureWindowSchema).optional(),
})

const ResponseSchema = z.object({
  items: z.array(SvincoloStateSchema),
})

const ROME_TIMEZONE = 'Europe/Rome'

/**
 * Formatta `now` nel fuso Europe/Rome come "YYYY-MM-DDTHH:mm:ss+HH:mm",
 * così il prompt indica sia l'istante corrente sia l'offset da usare
 * per le finestre temporali generate dall'LLM.
 */
function formatNowWithRomeOffset(now: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ROME_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const localIso = `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`

  // Calcola l'offset corrente di Europe/Rome (+01:00 o +02:00) confrontando
  // l'istante UTC con la stessa data/ora interpretata come locale.
  const offsetMinutes = Math.round(
    (new Date(`${localIso}Z`).getTime() - now.getTime()) / 60000
  )
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const abs = Math.abs(offsetMinutes)
  const offset = `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`

  return `${localIso}${offset}`
}

function buildSystemPrompt(now: Date): string {
  const nowIso = formatNowWithRomeOffset(now)

  return `Sei un assistente che interpreta avvisi stradali della Tangenziale di Napoli.
Ti verrà fornito un testo con avvisi ai viaggiatori e dovrai classificare ogni svincolo
per ciascuna direzione usando questi colori:
- "verde": aperto e scorrevole (default)
- "giallo": rallentamenti o lavori in corso
- "rosso": uscita/entrata chiusa

Il campo "direzione" ammette SOLO due valori: "capodichino" oppure "pozzuoli".
Il testo sorgente usa spesso sinonimi che NON vanno copiati letteralmente: normalizzali
sempre a una delle due etichette valide.
- "autostrade", "Napoli", "aeroporto" → "capodichino"
- "mare", "Pozzuoli", "Cuma" → "pozzuoli"
Se un avviso indica "entrambe le direzioni", genera due item separati (uno per
"capodichino" e uno per "pozzuoli") con lo stesso stato e la stessa nota.

La data e ora corrente è: ${nowIso} (fuso Europe/Rome).
Molte chiusure sono PROGRAMMATE solo in specifiche fasce orarie e date (es. "dalle ore
23,00 del giorno 30 giugno alle ore 6,00 del giorno successivo"), non chiusure permanenti.
Per ogni chiusura con orario/data specifici, DEVI calcolare le finestre temporali reali
in cui è attiva e restituirle nel campo "windows" come coppie "from"/"to" in formato ISO
8601 con offset Europe/Rome (es. "2026-06-30T23:00:00+02:00"). Usa la data corrente sopra
per risolvere riferimenti relativi ("il giorno successivo", mese/anno impliciti). Se
l'avviso cita più giorni (es. "dei giorni 1 e 2 luglio"), genera una finestra per
ciascuna notte. Se una chiusura NON ha un orario/data specifico (es. lavori permanenti
o divieti senza fascia oraria), ometti il campo "windows" (sempre attiva).

Restituisci SOLO un JSON con questa struttura:
{
  "items": [
    {
      "id": "<id_svincolo>",
      "direzione": "capodichino|pozzuoli",
      "status": "verde|giallo|rosso",
      "note": "...",
      "windows": [{ "from": "2026-06-30T23:00:00+02:00", "to": "2026-07-01T06:00:00+02:00" }]
    }
  ]
}

Includi SOLO i svincoli che hanno uno stato diverso da "verde".
Non inventare svincoli: usa solo questi id: ${SVINCOLO_IDS.join(', ')}.`
}

/**
 * Chiama l'API OpenAI per interpretare il testo degli avvisi e restituisce
 * gli stati dei svincoli. Valida la risposta con zod (lancia su schema non valido).
 */
export async function interpretAvvisi(
  apiKey: string,
  testoAvvisi: string,
  now: Date = new Date()
): Promise<SvincoloState[]> {
  const client = new OpenAI({ apiKey })

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: buildSystemPrompt(now) },
      { role: 'user', content: `Avvisi da classificare:\n\n${testoAvvisi}` },
    ],
    response_format: { type: 'json_object' },
    temperature: 0,
  })

  const rawContent = completion.choices[0]?.message?.content
  if (!rawContent) {
    throw new Error('Risposta LLM vuota o malformata')
  }

  const parsed = JSON.parse(rawContent)
  const validated = ResponseSchema.parse(parsed)

  return validated.items as SvincoloState[]
}
