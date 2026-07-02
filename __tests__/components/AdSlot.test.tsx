import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AdSlot } from '@/components/AdSlot'

describe('AdSlot', () => {
  it('espone lo slot con etichetta accessibile e id per AdSense', () => {
    render(<AdSlot id="header-banner" />)
    const slot = screen.getByRole('complementary', { name: /spazio pubblicitario/i })
    expect(slot).toHaveAttribute('data-ad-slot', 'header-banner')
  })

  it('riserva spazio verticale per evitare layout shift', () => {
    render(<AdSlot id="footer-banner" />)
    const slot = screen.getByRole('complementary', { name: /spazio pubblicitario/i })
    expect(slot.className).toContain('min-h-')
  })
})
