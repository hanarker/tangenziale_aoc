import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Legend } from '@/components/Legend'

describe('Legend', () => {
  it('mostra le tre voci (verde, giallo, rosso)', () => {
    render(<Legend />)
    expect(screen.getByText(/^aperta$/i)).toBeInTheDocument()
    expect(screen.getByText(/uscita\/ingresso chiuso/i)).toBeInTheDocument()
    expect(screen.getByText(/tratto chiuso/i)).toBeInTheDocument()
  })
})
