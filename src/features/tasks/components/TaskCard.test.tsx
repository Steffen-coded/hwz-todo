import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { celebrate } from '@/lib/celebrate'
import type { Task } from '@/features/tasks/model'
import { todayIso } from '@/lib/date'
import { STORAGE_KEY } from '@/lib/storage'

vi.mock('@/lib/celebrate', () => ({ celebrate: vi.fn() }))

// jsdom has no pointer capture; the sonner toast calls it on pointer down.
Element.prototype.setPointerCapture ??= vi.fn()
Element.prototype.releasePointerCapture ??= vi.fn()

function isoOffset(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return todayIso(date)
}

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: crypto.randomUUID(),
    title: 'Aufgabe',
    status: 'todo',
    createdAt: 1,
    due: null,
    starred: false,
    ...overrides,
  }
}

function seed(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, tasks }))
}

function storedTasks(): Task[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  return (JSON.parse(raw) as { tasks: Task[] }).tasks
}

describe('TaskList and TaskCard', () => {
  it('shows version-1 tasks in their former due date order', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        tasks: [
          { id: 'a', title: 'Später', done: false, createdAt: 1, due: isoOffset(10), starred: false },
          { id: 'b', title: 'Früher', done: false, createdAt: 2, due: isoOffset(2), starred: false },
        ],
      }),
    )
    render(<App />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Früher')
    expect(items[1]).toHaveTextContent('Später')
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') as { version: number; tasks: Task[] }
    expect(stored.version).toBe(2)
    expect(stored.tasks.map((t) => [t.title, t.status])).toEqual([
      ['Früher', 'todo'],
      ['Später', 'todo'],
    ])
  })

  it('shows version-2 tasks in stored order, done ones last', () => {
    seed([
      makeTask({ title: 'Erledigt', status: 'done' }),
      makeTask({ title: 'Später', due: isoOffset(10) }),
      makeTask({ title: 'Früher', due: isoOffset(2) }),
    ])
    render(<App />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Später')
    expect(items[1]).toHaveTextContent('Früher')
    expect(items[2]).toHaveTextContent('Erledigt')
  })

  it('marks a task due yesterday as overdue but not one due today', () => {
    const yesterday = isoOffset(-1)
    seed([
      makeTask({ title: 'Gestern fällig', due: yesterday }),
      makeTask({ title: 'Heute fällig', due: todayIso() }),
    ])
    render(<App />)
    const items = screen.getAllByRole('listitem')
    const overdue = items.find((li) => li.textContent?.includes('Gestern fällig'))
    const today = items.find((li) => li.textContent?.includes('Heute fällig'))
    expect(overdue).toBeDefined()
    expect(today).toBeDefined()
    expect(within(overdue!).getByText('Überfällig')).toBeInTheDocument()
    const [y, m, d] = yesterday.split('-')
    expect(within(overdue!).getByText(`${d}.${m}.${y}`)).toBeInTheDocument()
    expect(within(today!).queryByText('Überfällig')).not.toBeInTheDocument()
  })

  describe('toggle, star and delete', () => {
    beforeEach(() => {
      vi.mocked(celebrate).mockClear()
    })

    it('checks a task with confetti and reopens it without confetti', async () => {
      const user = userEvent.setup()
      seed([makeTask({ title: 'Einkaufen' })])
      render(<App />)
      // The card moves to another column and remounts (the old one animates out),
      // so the checkbox is queried again inside the target column.
      const checkbox = (column: string) =>
        within(screen.getByRole('region', { name: column })).getByRole('checkbox', {
          name: '«Einkaufen» erledigt',
        })
      await user.click(checkbox('Offen'))
      expect(checkbox('Erledigt')).toHaveAttribute('aria-checked', 'true')
      expect(storedTasks()[0].status).toBe('done')
      expect(celebrate).toHaveBeenCalledTimes(1)
      await user.click(checkbox('Erledigt'))
      expect(checkbox('Offen')).toHaveAttribute('aria-checked', 'false')
      expect(storedTasks()[0].status).toBe('todo')
      expect(celebrate).toHaveBeenCalledTimes(1)
    })

    it('reopens a done task as the top card in the open tasks', async () => {
      const user = userEvent.setup()
      seed([makeTask({ title: 'Eins' }), makeTask({ title: 'Zwei', status: 'done' })])
      render(<App />)
      await user.click(screen.getByRole('checkbox', { name: '«Zwei» erledigt' }))
      expect(storedTasks().map((t) => [t.title, t.status])).toEqual([
        ['Zwei', 'todo'],
        ['Eins', 'todo'],
      ])
      const items = screen.getAllByRole('listitem')
      expect(items[0]).toHaveTextContent('Zwei')
      expect(celebrate).not.toHaveBeenCalled()
    })

    it('moves the star from the first task to the second', async () => {
      const user = userEvent.setup()
      seed([
        makeTask({ title: 'Erste', starred: true, createdAt: 2 }),
        makeTask({ title: 'Zweite', createdAt: 1 }),
      ])
      render(<App />)
      await user.click(screen.getByRole('button', { name: '«Zweite» als Fokus markieren' }))
      expect(screen.getByRole('button', { name: '«Erste» als Fokus markieren' })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
      expect(screen.getByRole('button', { name: '«Zweite» als Fokus markieren' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      const starred = storedTasks().filter((t) => t.starred)
      expect(starred).toHaveLength(1)
      expect(starred[0].title).toBe('Zweite')
    })

    it('deletes the third task and restores it with its due date via «Rückgängig»', async () => {
      const user = userEvent.setup()
      const due = isoOffset(3)
      seed([
        makeTask({ title: 'Eins', due: isoOffset(1) }),
        makeTask({ title: 'Zwei', due: isoOffset(2) }),
        makeTask({ title: 'Drei', due }),
      ])
      render(<App />)
      await user.click(screen.getByRole('button', { name: '«Drei» löschen' }))
      expect(storedTasks().map((t) => t.title)).toEqual(['Eins', 'Zwei'])
      await user.click(await screen.findByRole('button', { name: 'Rückgängig' }))
      const stored = storedTasks()
      expect(stored).toHaveLength(3)
      expect(stored[2].title).toBe('Drei')
      expect(stored[2].due).toBe(due)
      const [y, m, d] = due.split('-')
      expect(await screen.findByText(`${d}.${m}.${y}`)).toBeInTheDocument()
      expect(screen.getByText('Drei')).toBeInTheDocument()
    })
  })
})
