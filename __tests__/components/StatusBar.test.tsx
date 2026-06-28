import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBar } from '@/components/StatusBar'

describe('StatusBar', () => {
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
})
