import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const fixtureOk = readFileSync(
  join(process.cwd(), 'fixtures/html/avviso-viaggiatori.html'),
  'utf-8'
)
const fixtureEmpty = readFileSync(
  join(process.cwd(), 'fixtures/html/nessun-avviso.html'),
  'utf-8'
)

// Mock globale di fetch prima di importare lo scraper
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('scrapeAvvisi', () => {
  beforeEach(() => {
    vi.resetModules()
    mockFetch.mockReset()
  })

  it('estrae il testo della sezione avviso dai viaggiatori', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(fixtureOk),
    })

    const { scrapeAvvisi } = await import('@/lib/scraper')
    const testo = await scrapeAvvisi('https://example.com')

    expect(testo).toContain('Fuorigrotta')
    expect(testo).toContain('Pozzuoli')
    expect(testo).toContain('Camaldoli')
  })

  it('lancia un errore se la sezione avvisi non è trovata nella pagina', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(fixtureEmpty),
    })

    const { scrapeAvvisi } = await import('@/lib/scraper')
    await expect(scrapeAvvisi('https://example.com')).rejects.toThrow(
      'Sezione avvisi non trovata'
    )
  })

  it('lancia un errore se la richiesta HTTP fallisce', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
    })

    const { scrapeAvvisi } = await import('@/lib/scraper')
    await expect(scrapeAvvisi('https://example.com')).rejects.toThrow('503')
  })
})
