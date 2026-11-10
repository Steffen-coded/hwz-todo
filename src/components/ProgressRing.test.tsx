import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '@/App'
import { ProgressRing } from '@/components/ProgressRing'
import type { Task } from '@/features/tasks/model'
import { STORAGE_KEY } from '@/lib/storage'

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Aufgabe',
    done: false,
    createdAt: 1,
    due: null,
    starred: false,
    ...overrides,
  }
}

describe('ProgressRing', () => {
  it('shows done of total in the app header', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        tasks: [makeTask({ title: 'A', done: true }), makeTask({ title: 'B' })],
      }),
    )
    render(<App />)
    const ring = screen.getByRole('img', { name: '1 von 2 erledigt' })
    expect(ring).toHaveTextContent('1/2')
  })

  it('shows 0/0 without tasks', () => {
    render(<ProgressRing done={0} total={0} />)
    expect(screen.getByRole('img', { name: '0 von 0 erledigt' })).toHaveTextContent('0/0')
  })
})
