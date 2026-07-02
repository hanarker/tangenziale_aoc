import { describe, it, expect, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBar } from '@/components/StatusBar'

describe('StatusBar', () => {
  const ORIGINAL_TZ = process.env.TZ

  afterEach(() => {
    process.env.TZ = ORIGINAL_TZ
  })

  it('mostra l\'orario in Europe/Rome anche se il server gira in UTC (es. Vercel)', () => {
    process.env.TZ = 'UTC'
    // 21:49 UTC = 23:49 ora italiana (CEST, UTC+2) — non deve mostrare "21:49"
    render(<StatusBar updatedAt="2026-07-02T21:49:33.678Z" stale={false} />)
    expect(screen.getByText(/23:49/)).toBeInTheDocument()
    expect(screen.queryByText(/21:49/)).not.toBeInTheDocument()
  })

  it('mostra l\'orario dell\'ultimo aggiornamento', () => {
    render(
      <StatusBar updatedAt="2026-06-28T23:00:00.000Z" stale={false} />
    )
    // Deve contenere anno o data formattata
    expect(screen.getByText(/2026|28 giu|28\/06/i)).toBeInTheDocument()
  })

  it('mostra un avviso quando i dati sono stale', () => {
    render(
      <StatusBar updatedAt="2026-06-28T23:00:00.000Z" stale={true} />
    )
    expect(screen.getByText(/non aggiornati|dati precedenti|stale/i)).toBeInTheDocument()
  })

  it('non mostra l\'avviso stale quando i dati sono freschi', () => {
    render(
      <StatusBar updatedAt="2026-06-28T23:00:00.000Z" stale={false} />
    )
    expect(screen.queryByText(/non aggiornati|dati precedenti|stale/i)).not.toBeInTheDocument()
  })

  it('mostra "Verificato" quando checkedAt è successivo a updatedAt', () => {
    render(
      <StatusBar
        updatedAt="2026-06-28T23:00:00.000Z"
        checkedAt="2026-07-02T18:00:00.000Z"
        stale={false}
      />
    )
    expect(screen.getByText(/verificat/i)).toBeInTheDocument()
  })

  it('non mostra "Verificato" quando checkedAt è assente', () => {
    render(<StatusBar updatedAt="2026-06-28T23:00:00.000Z" stale={false} />)
    expect(screen.queryByText(/verificat/i)).not.toBeInTheDocument()
  })

  it('non mostra "Verificato" quando checkedAt coincide con updatedAt', () => {
    render(
      <StatusBar
        updatedAt="2026-06-28T23:00:00.000Z"
        checkedAt="2026-06-28T23:00:00.000Z"
        stale={false}
      />
    )
    expect(screen.queryByText(/verificat/i)).not.toBeInTheDocument()
  })
})
