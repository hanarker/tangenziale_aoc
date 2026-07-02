import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Config } from '@/lib/config'
import type { TangenzialeState } from '@/lib/types'

const { mockScrapeAvvisi, mockInterpretAvvisi, fakeRedisData } = vi.hoisted(() => ({
  mockScrapeAvvisi: vi.fn(),
  mockInterpretAvvisi: vi.fn(),
  fakeRedisData: new Map<string, unknown>(),
}))

vi.mock('@/lib/scraper', () => ({ scrapeAvvisi: mockScrapeAvvisi }))
vi.mock('@/lib/interpreter', () => ({ interpretAvvisi: mockInterpretAvvisi }))
vi.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: () => ({
      get: async (key: string) => (fakeRedisData.has(key) ? fakeRedisData.get(key) : null),
      set: async (key: string, value: unknown) => {
        fakeRedisData.set(key, value)
        return 'OK'
      },
    }),
  },
}))

import { runUpdate } from '@/lib/update-runner'
import { readState } from '@/lib/store'

const TEST_KEY = 'test:update-runner:state'

const config: Config = {
  openaiApiKey: 'sk-test',
  targetUrl: 'https://example.com',
  cronInterval: '*/60 * * * *',
}

const existingState: TangenzialeState = {
  items: [{ id: 'fuorigrotta', direzione: 'pozzuoli', status: 'rosso', note: 'Chiusa' }],
  updatedAt: '2026-07-01T10:00:00.000Z',
  checkedAt: '2026-07-01T10:00:00.000Z',
  source: 'Testo avvisi versione A',
  stale: false,
}

describe('runUpdate', () => {
  beforeEach(() => {
    fakeRedisData.clear()
    mockScrapeAvvisi.mockReset()
    mockInterpretAvvisi.mockReset()
  })

  it('non chiama interpretAvvisi se il testo è identico al precedente', async () => {
    fakeRedisData.set(TEST_KEY, existingState)
    mockScrapeAvvisi.mockResolvedValueOnce('Testo avvisi versione A')

    const now = new Date('2026-07-01T12:00:00.000Z')
    const result = await runUpdate(config, TEST_KEY, now)

    expect(result.outcome).toBe('unchanged')
    expect(mockInterpretAvvisi).not.toHaveBeenCalled()

    const saved = await readState(TEST_KEY)
    expect(saved?.updatedAt).toBe(existingState.updatedAt) // invariato
    expect(saved?.checkedAt).toBe(now.toISOString()) // aggiornato
    expect(saved?.items).toEqual(existingState.items)
    expect(saved?.stale).toBe(false)
  })

  it('chiama interpretAvvisi e riscrive lo stato se il testo è cambiato', async () => {
    fakeRedisData.set(TEST_KEY, existingState)
    mockScrapeAvvisi.mockResolvedValueOnce('Testo avvisi versione B (cambiato)')
    mockInterpretAvvisi.mockResolvedValueOnce([
      { id: 'agnano', direzione: 'capodichino', status: 'rosso', note: 'Chiusa' },
    ])

    const now = new Date('2026-07-01T12:00:00.000Z')
    const result = await runUpdate(config, TEST_KEY, now)

    expect(result.outcome).toBe('updated')
    expect(mockInterpretAvvisi).toHaveBeenCalledWith(
      config.openaiApiKey,
      'Testo avvisi versione B (cambiato)',
      now
    )

    const saved = await readState(TEST_KEY)
    expect(saved?.updatedAt).toBe(now.toISOString())
    expect(saved?.checkedAt).toBe(now.toISOString())
    expect(saved?.source).toBe('Testo avvisi versione B (cambiato)')
    expect(saved?.items[0].id).toBe('agnano')
  })

  it('chiama interpretAvvisi al primo run (nessuno stato precedente)', async () => {
    mockScrapeAvvisi.mockResolvedValueOnce('Primo testo estratto')
    mockInterpretAvvisi.mockResolvedValueOnce([])

    const now = new Date('2026-07-01T12:00:00.000Z')
    const result = await runUpdate(config, TEST_KEY, now)

    expect(result.outcome).toBe('updated')
    expect(mockInterpretAvvisi).toHaveBeenCalledOnce()
  })

  it('marca lo stato come stale e non chiama interpretAvvisi se lo scraping fallisce', async () => {
    fakeRedisData.set(TEST_KEY, existingState)
    mockScrapeAvvisi.mockRejectedValueOnce(new Error('Errore HTTP 503'))

    const now = new Date('2026-07-01T12:00:00.000Z')
    const result = await runUpdate(config, TEST_KEY, now)

    expect(result.outcome).toBe('error')
    expect(mockInterpretAvvisi).not.toHaveBeenCalled()

    const saved = await readState(TEST_KEY)
    expect(saved?.stale).toBe(true)
    expect(saved?.items).toEqual(existingState.items) // stato precedente preservato
  })

  it('marca lo stato come stale se interpretAvvisi fallisce dopo un cambiamento di testo', async () => {
    fakeRedisData.set(TEST_KEY, existingState)
    mockScrapeAvvisi.mockResolvedValueOnce('Testo avvisi versione B (cambiato)')
    mockInterpretAvvisi.mockRejectedValueOnce(new Error('Errore LLM'))

    const now = new Date('2026-07-01T12:00:00.000Z')
    const result = await runUpdate(config, TEST_KEY, now)

    expect(result.outcome).toBe('error')

    const saved = await readState(TEST_KEY)
    expect(saved?.stale).toBe(true)
    expect(saved?.source).toBe(existingState.source) // stato precedente preservato, non sovrascritto
  })
})
