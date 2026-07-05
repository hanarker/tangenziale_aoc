import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { Navbar } from '@/components/Navbar'

describe('Navbar', () => {
  it('mostra i link di navigazione principali', () => {
    render(<Navbar />)
    const nav = screen.getByRole('navigation', { name: /principale/i })
    expect(within(nav).getByRole('link', { name: /mappa/i })).toHaveAttribute('href', '/#mappa')
    expect(within(nav).getByRole('link', { name: /chiusure serali/i })).toHaveAttribute(
      'href',
      '/#chiusure-serali'
    )
    expect(within(nav).getByRole('link', { name: /chi sono/i })).toHaveAttribute(
      'href',
      '/#chi-sono'
    )
    expect(within(nav).getByRole('link', { name: /perché/i })).toHaveAttribute('href', '/#perche')
    expect(within(nav).getByRole('link', { name: /cosa non mi piace/i })).toHaveAttribute(
      'href',
      '/#cosa-non-mi-piace'
    )
  })

  it('parte con il menu mobile chiuso', () => {
    render(<Navbar />)
    expect(screen.getByRole('button', { name: /apri menu/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    expect(screen.queryByRole('navigation', { name: /menu mobile/i })).not.toBeInTheDocument()
  })

  it('apre il menu mobile al click sul burger', () => {
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /apri menu/i }))
    expect(screen.getByRole('button', { name: /chiudi menu/i })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(screen.getByRole('navigation', { name: /menu mobile/i })).toBeInTheDocument()
  })

  it('chiude il menu mobile al secondo click sul burger', () => {
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /apri menu/i }))
    fireEvent.click(screen.getByRole('button', { name: /chiudi menu/i }))
    expect(screen.queryByRole('navigation', { name: /menu mobile/i })).not.toBeInTheDocument()
  })

  it('chiude il menu mobile al click su un link', () => {
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /apri menu/i }))
    const menuMobile = screen.getByRole('navigation', { name: /menu mobile/i })
    fireEvent.click(within(menuMobile).getByRole('link', { name: /chi sono/i }))
    expect(screen.queryByRole('navigation', { name: /menu mobile/i })).not.toBeInTheDocument()
  })

  it('chiude il menu mobile premendo Escape', () => {
    render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: /apri menu/i }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('navigation', { name: /menu mobile/i })).not.toBeInTheDocument()
  })
})
