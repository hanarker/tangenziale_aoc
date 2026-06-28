import OpenAI from 'openai'
import { z } from 'zod'
import { SVINCOLO_IDS } from '@/lib/svincoli'
import type { SvincoloState } from '@/lib/types'

const SvincoloStateSchema = z.object({
  id: z.string(),
  direzione: z.enum(['capodichino', 'pozzuoli']),
  status: z.enum(['verde', 'giallo', 'rosso']),
  note: z.string().optional(),
})

const ResponseSchema = z.object({
  items: z.array(SvincoloStateSchema),
})

const SYSTEM_PROMPT = `Sei un assistente che interpreta avvisi stradali della Tangenziale di Napoli.
Ti verrà fornito un testo con avvisi ai viaggiatori e dovrai classificare ogni svincolo
per ciascuna direzione usando questi colori:
- "verde": aperto e scorrevole (default)
- "giallo": rallentamenti o lavori in corso
- "rosso": uscita/entrata chiusa

Restituisci SOLO un JSON con questa struttura:
{
  "items": [
    { "id": "<id_svincolo>", "direzione": "capodichino|pozzuoli", "status": "verde|giallo|rosso", "note": "..." }
  ]
}

Includi SOLO i svincoli che hanno uno stato diverso da "verde".
Non inventare svincoli: usa solo questi id: ${SVINCOLO_IDS.join(', ')}.`

/**
 * Chiama l'API OpenAI per interpretare il testo degli avvisi e restituisce
 * gli stati dei svincoli. Valida la risposta con zod (lancia su schema non valido).
 */
export async function interpretAvvisi(
  apiKey: string,
  testoAvvisi: string
): Promise<SvincoloState[]> {
  const client = new OpenAI({ apiKey })

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
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
