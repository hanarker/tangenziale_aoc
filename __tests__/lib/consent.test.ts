import { describe, it, expect, beforeEach } from 'vitest'
import { getStoredConsent, storeConsent, CONSENT_STORAGE_KEY } from '@/lib/consent'

describe('getStoredConsent', () => {
  beforeEach(() => {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY)
  })

  it('ritorna null se non è mai stato salvato alcun consenso', () => {
    expect(getStoredConsent()).toBeNull()
  })

  it('ritorna il record salvato in precedenza', () => {
    storeConsent('accepted')

    const result = getStoredConsent()

    expect(result).toEqual({ status: 'accepted', timestamp: expect.any(Number) })
  })

  it('ritorna null se il contenuto salvato è JSON corrotto', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, '{not valid json')

    expect(getStoredConsent()).toBeNull()
  })

  it('ritorna null se il contenuto salvato ha uno shape inatteso', () => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ foo: 'bar' }))

    expect(getStoredConsent()).toBeNull()
  })
})

describe('storeConsent', () => {
  beforeEach(() => {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY)
  })

  it('salva lo stato "accepted" con un timestamp e lo ritorna', () => {
    const before = Date.now()

    const result = storeConsent('accepted')

    expect(result.status).toBe('accepted')
    expect(result.timestamp).toBeGreaterThanOrEqual(before)
    expect(getStoredConsent()).toEqual(result)
  })

  it('salva lo stato "rejected"', () => {
    const result = storeConsent('rejected')

    expect(result.status).toBe('rejected')
  })
})
