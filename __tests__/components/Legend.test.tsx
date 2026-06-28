import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Legend } from '@/components/Legend'

describe('Legend', () => {
  it('mostra le tre voci (verde, giallo, rosso)', () => {
    render(<Legend />)
    expect(screen.getByText(/scorrevole/i)).toBeInTheDocument()
    expect(screen.getByText(/lavori/i)).toBeInTheDocument()
    expect(screen.getByText(/chiusa/i)).toBeInTheDocument()
  })
})
