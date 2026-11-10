import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { celebrate } from '@/lib/celebrate'
import type { Task } from '@/features/tasks/model'
import { STORAGE_KEY } from '@/lib/storage'

vi.mock('@/lib/celebrate', () => ({ celebrate: vi.fn() }))

// jsdom has no pointer capture; the sonner toast calls it on pointer down.
Element.prototype.setPointerCapture ??= vi.fn()
Element.prototype.releasePointerCapture ??= vi.fn()

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

function tile() {
  return screen.getByRole('region', { name: 'Nächster Schritt' })
}

const threeTasks = () => [
  makeTask({ title: 'Dezember', due: '2026-12-15', createdAt: 1 }),
  makeTask({ title: 'November', due: '2026-11-20', createdAt: 2 }),
  makeTask({ title: 'Ohne Frist', createdAt: 3 }),
]

describe('FocusTile', () => {
  beforeEach(() => {
    vi.mocked(celebrate).mockClear()
  })

  it('shows the top open task', () => {
    seed(threeTasks())
    render(<App />)
    expect(within(tile()).getByText('Dezember')).toBeInTheDocument()
    expect(within(tile()).getByText('15.12.2026')).toBeInTheDocument()
    expect(within(tile()).queryByText('November')).not.toBeInTheDocument()
  })

  it('shows the top task in progress before the top open task', () => {
    const tasks = threeTasks()
    tasks[1].status = 'doing'
    tasks[2].status = 'doing'
    seed(tasks)
    render(<App />)
    expect(within(tile()).getByText('November')).toBeInTheDocument()
    expect(within(tile()).queryByText('Dezember')).not.toBeInTheDocument()
  })

  it('shows the starred task instead', () => {
    const tasks = threeTasks()
    tasks[2].starred = true
    seed(tasks)
    render(<App />)
    expect(within(tile()).getByText('Ohne Frist')).toBeInTheDocument()
    expect(within(tile()).queryByText('Dezember')).not.toBeInTheDocument()
  })

  it('follows a star set in the list', async () => {
    const user = userEvent.setup()
    seed(threeTasks())
    render(<App />)
    expect(within(tile()).getByText('Dezember')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '«Ohne Frist» als Fokus markieren' }))
    expect(within(tile()).getByText('Ohne Frist')).toBeInTheDocument()
    expect(within(tile()).queryByText('Dezember')).not.toBeInTheDocument()
  })

  it('prefers a starred open task over the task in progress, and falls back after unstarring', async () => {
    const user = userEvent.setup()
    const tasks = threeTasks()
    tasks[1].status = 'doing'
    seed(tasks)
    render(<App />)
    expect(within(tile()).getByText('November')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '«Ohne Frist» als Fokus markieren' }))
    expect(within(tile()).getByText('Ohne Frist')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '«Ohne Frist» als Fokus markieren' }))
    expect(within(tile()).getByText('November')).toBeInTheDocument()
    expect(within(tile()).queryByText('Ohne Frist')).not.toBeInTheDocument()
  })

  it('shows the coffee message when only done tasks are left', () => {
    seed([makeTask({ title: 'Fertig', status: 'done' })])
    render(<App />)
    expect(within(tile()).getByText('Alles erledigt. Zeit für Kaffee.')).toBeInTheDocument()
    expect(within(tile()).queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('checking in the tile shows the next step, then the coffee message', async () => {
    const user = userEvent.setup()
    seed(threeTasks())
    render(<App />)
    await user.click(within(tile()).getByRole('checkbox'))
    expect(celebrate).toHaveBeenCalledTimes(1)
    expect(within(tile()).getByText('November')).toBeInTheDocument()
    await user.click(within(tile()).getByRole('checkbox'))
    expect(within(tile()).getByText('Ohne Frist')).toBeInTheDocument()
    await user.click(within(tile()).getByRole('checkbox'))
    expect(within(tile()).getByText('Alles erledigt. Zeit für Kaffee.')).toBeInTheDocument()
    expect(within(tile()).queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('shows the empty state instead of the tile without tasks', () => {
    seed([])
    render(<App />)
    expect(screen.queryByRole('region', { name: 'Nächster Schritt' })).not.toBeInTheDocument()
    expect(screen.getByText('Alles erledigt. Zeit für Kaffee.')).toBeInTheDocument()
    expect(screen.getByText('Tippe oben eine neue Aufgabe ein oder drücke N.')).toBeInTheDocument()
  })
})
