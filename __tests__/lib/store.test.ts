import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { writeFileSync, existsSync, unlinkSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { TangenzialeState } from '@/lib/types'

const TEST_PATH = join(process.cwd(), 'data', 'test-state.json')

const stateOk: TangenzialeState = {
  items: [
    { id: 'fuorigrotta', direzione: 'pozzuoli', status: 'rosso', note: 'Chiusa' },
  ],
  updatedAt: '2026-06-28T23:00:00.000Z',
  source: 'Testo avviso di esempio',
  stale: false,
}

describe('store', () => {
  beforeEach(() => {
    mkdirSync(join(process.cwd(), 'data'), { recursive: true })
    if (existsSync(TEST_PATH)) unlinkSync(TEST_PATH)
  })

  afterEach(() => {
    if (existsSync(TEST_PATH)) unlinkSync(TEST_PATH)
  })

  it('scrive lo stato su file e lo rilegge correttamente', async () => {
    const { writeState, readState } = await import('@/lib/store')
    await writeState(stateOk, TEST_PATH)
    const read = await readState(TEST_PATH)
    expect(read?.items[0].id).toBe('fuorigrotta')
    expect(read?.updatedAt).toBe(stateOk.updatedAt)
  })

  it('readState restituisce null se il file non esiste', async () => {
    const { readState } = await import('@/lib/store')
    const result = await readState(TEST_PATH)
    expect(result).toBeNull()
  })

  it('non sovrascrive il file se il nuovo stato è invalido', async () => {
    // Prima scriviamo uno stato valido
    writeFileSync(TEST_PATH, JSON.stringify(stateOk), 'utf-8')
    const { writeState, readState } = await import('@/lib/store')

    // Tentiamo di scrivere uno stato non valido (items mancante)
    const invalid = { items: null, updatedAt: 'bad', source: '', stale: false } as unknown as TangenzialeState
    await expect(writeState(invalid, TEST_PATH)).rejects.toThrow()

    // Il file deve contenere ancora il vecchio stato valido
    const read = await readState(TEST_PATH)
    expect(read?.items[0].id).toBe('fuorigrotta')
  })

  it('readState restituisce stale=true se il file ha stale=true', async () => {
    const staleState: TangenzialeState = { ...stateOk, stale: true }
    writeFileSync(TEST_PATH, JSON.stringify(staleState), 'utf-8')
    const { readState } = await import('@/lib/store')
    const read = await readState(TEST_PATH)
    expect(read?.stale).toBe(true)
  })

  it('scrive e rilegge correttamente il campo windows opzionale', async () => {
    const stateConFinestra: TangenzialeState = {
      items: [
        {
          id: 'agnano',
          direzione: 'capodichino',
          status: 'rosso',
          windows: [
            { from: '2026-06-30T23:00:00+02:00', to: '2026-07-01T06:00:00+02:00' },
          ],
        },
      ],
      updatedAt: '2026-07-01T12:00:00.000Z',
      source: 'Testo avviso di esempio',
      stale: false,
    }
    const { writeState, readState } = await import('@/lib/store')
    await writeState(stateConFinestra, TEST_PATH)
    const read = await readState(TEST_PATH)
    expect(read?.items[0].windows).toEqual([
      { from: '2026-06-30T23:00:00+02:00', to: '2026-07-01T06:00:00+02:00' },
    ])
  })

  it('scrive e rilegge correttamente il campo checkedAt opzionale', async () => {
    const stateConCheckedAt: TangenzialeState = {
      ...stateOk,
      checkedAt: '2026-07-02T18:00:00.000Z',
    }
    const { writeState, readState } = await import('@/lib/store')
    await writeState(stateConCheckedAt, TEST_PATH)
    const read = await readState(TEST_PATH)
    expect(read?.checkedAt).toBe('2026-07-02T18:00:00.000Z')
  })

  it('readState legge correttamente uno state.json senza checkedAt (retro-compatibilità)', async () => {
    writeFileSync(TEST_PATH, JSON.stringify(stateOk), 'utf-8')
    const { readState } = await import('@/lib/store')
    const read = await readState(TEST_PATH)
    expect(read?.checkedAt).toBeUndefined()
    expect(read?.items[0].id).toBe('fuorigrotta')
  })
})
