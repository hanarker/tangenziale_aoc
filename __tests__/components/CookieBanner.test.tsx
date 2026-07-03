import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CookieBanner } from '@/components/CookieBanner'
import { CONSENT_STORAGE_KEY, getStoredConsent } from '@/lib/consent'

describe('CookieBanner', () => {
  beforeEach(() => {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY)
  })

  it('mostra il banner quando nessun consenso è stato salvato', () => {
    render(<CookieBanner />)
    expect(screen.getByRole('region', { name: /consenso cookie/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /rifiuta/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /accetta tutti/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy/i })).toHaveAttribute('href', '/privacy')
  })

  it('non mostra il banner se un consenso è già stato salvato', () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ status: 'accepted', timestamp: Date.now() })
    )
    render(<CookieBanner />)
    expect(screen.queryByRole('region', { name: /consenso cookie/i })).not.toBeInTheDocument()
  })

  it('salva "accepted" e nasconde il banner al click su "Accetta tutti"', async () => {
    const user = userEvent.setup()
    render(<CookieBanner />)

    await user.click(screen.getByRole('button', { name: /accetta tutti/i }))

    expect(screen.queryByRole('region', { name: /consenso cookie/i })).not.toBeInTheDocument()
    expect(getStoredConsent()?.status).toBe('accepted')
  })

  it('salva "rejected" e nasconde il banner al click su "Rifiuta"', async () => {
    const user = userEvent.setup()
    render(<CookieBanner />)

    await user.click(screen.getByRole('button', { name: /rifiuta/i }))

    expect(screen.queryByRole('region', { name: /consenso cookie/i })).not.toBeInTheDocument()
    expect(getStoredConsent()?.status).toBe('rejected')
  })
})
