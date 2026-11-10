import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('shows the hero title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it.each(['aurora', 'candy', 'neon'])('renders with look %s', (look) => {
    document.documentElement.dataset.look = look
    render(<App />)
    expect(document.documentElement).toHaveAttribute('data-look', look)
    expect(screen.getByRole('heading', { level: 1 })).toBeVisible()
  })
})
