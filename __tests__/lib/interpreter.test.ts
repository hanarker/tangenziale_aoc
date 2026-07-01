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
})
