import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted garantisce che mockCreate sia disponibile dentro vi.mock (che viene hoistato)
const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }))

vi.mock('openai', () => {
  class MockOpenAI {
    chat = { completions: { create: mockCreate } }
  }
  return { default: MockOpenAI }
})

import { interpretAvvisi } from '@/lib/interpreter'

const AVVISO_ESEMPIO = `Fuorigrotta chiusa in direzione Pozzuoli dalle 23:00 alle 06:00.
Lavori in corso tra Camaldoli e Arenella in direzione Capodichino.`

describe('interpretAvvisi', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it('classifica correttamente Fuorigrotta come rossa in direzione pozzuoli', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              items: [
                { id: 'fuorigrotta', direzione: 'pozzuoli', status: 'rosso', note: 'Chiusa 23:00-06:00' },
                { id: 'camaldoli', direzione: 'capodichino', status: 'giallo', note: 'Lavori notturni' },
              ],
            }),
          },
        },
      ],
    })

    const items = await interpretAvvisi('sk-test', AVVISO_ESEMPIO)
    const fuorigrotta = items.find(
      (i) => i.id === 'fuorigrotta' && i.direzione === 'pozzuoli'
    )
    expect(fuorigrotta?.status).toBe('rosso')
  })

  it('classifica Camaldoli come gialla in direzione capodichino', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              items: [
                { id: 'fuorigrotta', direzione: 'pozzuoli', status: 'rosso' },
                { id: 'camaldoli', direzione: 'capodichino', status: 'giallo', note: 'Lavori notturni' },
              ],
            }),
          },
        },
      ],
    })

    const items = await interpretAvvisi('sk-test', AVVISO_ESEMPIO)
    const camaldoli = items.find(
      (i) => i.id === 'camaldoli' && i.direzione === 'capodichino'
    )
    expect(camaldoli?.status).toBe('giallo')
  })

  it('lancia un errore se la risposta LLM è JSON malformato', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: 'questo non è json valido!!!' } }],
    })

    await expect(interpretAvvisi('sk-test', AVVISO_ESEMPIO)).rejects.toThrow()
  })

  it('lancia un errore se la risposta contiene uno status non valido', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              items: [{ id: 'fuorigrotta', direzione: 'pozzuoli', status: 'blu' }],
            }),
          },
        },
      ],
    })

    await expect(interpretAvvisi('sk-test', AVVISO_ESEMPIO)).rejects.toThrow()
  })

  it('lancia un errore se la risposta contiene una direzione non valida (es. "autostrade")', async () => {
    // Regressione: il sito sorgente usa "in direzione Autostrade" come sinonimo di
    // "capodichino" — se il prompt non lo normalizza esplicitamente, l'LLM copia il
    // testo originale e produce un valore fuori enum, facendo fallire l'update.
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              items: [{ id: 'fuorigrotta', direzione: 'autostrade', status: 'rosso' }],
            }),
          },
        },
      ],
    })

    await expect(interpretAvvisi('sk-test', AVVISO_ESEMPIO)).rejects.toThrow()
  })

  it('istruisce il modello a normalizzare i sinonimi di direzione presenti nel sito sorgente', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({ items: [] }),
          },
        },
      ],
    })

    await interpretAvvisi('sk-test', AVVISO_ESEMPIO)

    const [{ messages }] = mockCreate.mock.calls[0]
    const systemPrompt: string = messages[0].content
    expect(systemPrompt).toMatch(/autostrade/i)
    expect(systemPrompt).toMatch(/capodichino/i)
    expect(systemPrompt).toMatch(/normalizz/i)
  })

  it('istruisce il modello sul caso "ore 24,00 del giorno X" come mezzanotte di fine giornata (non giorno X)', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ items: [] }) } }],
    })

    await interpretAvvisi('sk-test', AVVISO_ESEMPIO)

    const [{ messages }] = mockCreate.mock.calls[0]
    const systemPrompt: string = messages[0].content
    expect(systemPrompt).toMatch(/ore 24,00/)
    expect(systemPrompt).toMatch(/mezzanotte/i)
    // Regressione diretta del bug osservato su "capodichino": l'esempio deve
    // mostrare lo shift al giorno successivo (X+1), non il giorno X.
    expect(systemPrompt).toContain('2026-07-04T00:00:00+02:00')
    expect(systemPrompt).toContain('2026-07-04T06:00:00+02:00')
  })

  it('istruisce il modello a enumerare tutte le clausole/date di una frase composta senza ometterne nessuna', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ items: [] }) } }],
    })

    await interpretAvvisi('sk-test', AVVISO_ESEMPIO)

    const [{ messages }] = mockCreate.mock.calls[0]
    const systemPrompt: string = messages[0].content
    // Regressione diretta del bug osservato su "camaldoli": la clausola
    // "24,00 del giorno 3 luglio" veniva omessa insieme ad altre a "23,00".
    expect(systemPrompt).toMatch(/SENZA\s+OMETTERNE\s+NESSUNA/)
    expect(systemPrompt).toMatch(/clausola/i)
    expect(systemPrompt).toMatch(/orario di inizio/i)
  })

  it('accetta e restituisce il campo windows con finestre temporali', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              items: [
                {
                  id: 'fuorigrotta',
                  direzione: 'pozzuoli',
                  status: 'rosso',
                  note: 'Chiusa 23:00-06:00',
                  windows: [
                    { from: '2026-06-30T23:00:00+02:00', to: '2026-07-01T06:00:00+02:00' },
                  ],
                },
              ],
            }),
          },
        },
      ],
    })

    const items = await interpretAvvisi('sk-test', AVVISO_ESEMPIO)
    expect(items[0].windows).toEqual([
      { from: '2026-06-30T23:00:00+02:00', to: '2026-07-01T06:00:00+02:00' },
    ])
  })

  it('include nel prompt la data/ora corrente (parametro now) con offset Europe/Rome', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ items: [] }) } }],
    })

    // 1 luglio 2026, 12:00 UTC → estate, offset Europe/Rome = +02:00
    const now = new Date('2026-07-01T12:00:00.000Z')
    await interpretAvvisi('sk-test', AVVISO_ESEMPIO, now)

    const [{ messages }] = mockCreate.mock.calls[0]
    const systemPrompt: string = messages[0].content
    expect(systemPrompt).toContain('2026-07-01T14:00:00+02:00')
    expect(systemPrompt).toMatch(/windows/i)
  })

  it('usa la data corrente reale come default quando "now" non è passato', async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ items: [] }) } }],
    })

    await interpretAvvisi('sk-test', AVVISO_ESEMPIO)

    const [{ messages }] = mockCreate.mock.calls[0]
    const systemPrompt: string = messages[0].content
    const currentYear = new Date().getFullYear().toString()
    expect(systemPrompt).toContain(currentYear)
  })
})
