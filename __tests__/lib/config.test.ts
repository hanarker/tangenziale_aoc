import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('loadConfig', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('restituisce la config quando OPENAI_API_KEY è presente', async () => {
    process.env.OPENAI_API_KEY = 'sk-test-key'
    const { loadConfig } = await import('@/lib/config')
    const config = loadConfig()
    expect(config.openaiApiKey).toBe('sk-test-key')
  })

  it('usa TARGET_URL di default se non specificata', async () => {
    process.env.OPENAI_API_KEY = 'sk-test-key'
    delete process.env.TARGET_URL
    const { loadConfig } = await import('@/lib/config')
    const config = loadConfig()
    expect(config.targetUrl).toBe('https://www.tangenzialedinapoli.it')
  })

  it('usa TARGET_URL dalla variabile d\'ambiente se specificata', async () => {
    process.env.OPENAI_API_KEY = 'sk-test-key'
    process.env.TARGET_URL = 'https://example.com'
    const { loadConfig } = await import('@/lib/config')
    const config = loadConfig()
    expect(config.targetUrl).toBe('https://example.com')
  })

  it('usa CRON_INTERVAL di default se nessuna variabile di intervallo è specificata', async () => {
    process.env.OPENAI_API_KEY = 'sk-test-key'
    delete process.env.CRON_INTERVAL
    delete process.env.UPDATE_INTERVAL_MINUTES
    const { loadConfig } = await import('@/lib/config')
    const config = loadConfig()
    expect(config.cronInterval).toBe('*/60 * * * *')
  })

  it('converte UPDATE_INTERVAL_MINUTES in espressione cron', async () => {
    process.env.OPENAI_API_KEY = 'sk-test-key'
    process.env.UPDATE_INTERVAL_MINUTES = '30'
    delete process.env.CRON_INTERVAL
    const { loadConfig } = await import('@/lib/config')
    const config = loadConfig()
    expect(config.cronInterval).toBe('*/30 * * * *')
  })

  it('CRON_INTERVAL ha la precedenza su UPDATE_INTERVAL_MINUTES', async () => {
    process.env.OPENAI_API_KEY = 'sk-test-key'
    process.env.UPDATE_INTERVAL_MINUTES = '30'
    process.env.CRON_INTERVAL = '0 */2 * * *'
    const { loadConfig } = await import('@/lib/config')
    const config = loadConfig()
    expect(config.cronInterval).toBe('0 */2 * * *')
  })

  it('lancia un errore se UPDATE_INTERVAL_MINUTES non è un numero intero positivo', async () => {
    process.env.OPENAI_API_KEY = 'sk-test-key'
    process.env.UPDATE_INTERVAL_MINUTES = 'abc'
    delete process.env.CRON_INTERVAL
    const { loadConfig } = await import('@/lib/config')
    expect(() => loadConfig()).toThrow('UPDATE_INTERVAL_MINUTES')
  })

  it('lancia un errore se OPENAI_API_KEY manca', async () => {
    delete process.env.OPENAI_API_KEY
    const { loadConfig } = await import('@/lib/config')
    expect(() => loadConfig()).toThrow('OPENAI_API_KEY')
  })
})
