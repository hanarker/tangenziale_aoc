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

  it('usa CRON_INTERVAL di default se non specificato', async () => {
    process.env.OPENAI_API_KEY = 'sk-test-key'
    delete process.env.CRON_INTERVAL
    const { loadConfig } = await import('@/lib/config')
    const config = loadConfig()
    expect(config.cronInterval).toBe('*/15 * * * *')
  })

  it('lancia un errore se OPENAI_API_KEY manca', async () => {
    delete process.env.OPENAI_API_KEY
    const { loadConfig } = await import('@/lib/config')
    expect(() => loadConfig()).toThrow('OPENAI_API_KEY')
  })
})
