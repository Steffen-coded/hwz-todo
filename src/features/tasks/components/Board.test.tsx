import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Active, Over } from '@dnd-kit/core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { celebrate } from '@/lib/celebrate'
import { buildAnnouncements, DRAG_INSTRUCTIONS } from '@/features/tasks/components/Board'
import { STATUSES, type Task } from '@/features/tasks/model'
import { STORAGE_KEY } from '@/lib/storage'

vi.mock('@/lib/celebrate', () => ({ celebrate: vi.fn() }))

const COLUMNS = ['Offen', 'In Arbeit', 'Erledigt']

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
  return raw ? (JSON.parse(raw) as { tasks: Task[] }).tasks : []
}

function column(name: string): HTMLElement {
  return screen.getByRole('region', { name: new RegExp(`^${name}`) })
}

function cardTitles(name: string): string[] {
  return within(column(name))
    .queryAllByRole('listitem')
    .map((li) => li.textContent ?? '')
}

describe('Board', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the three columns in order with their counts', () => {
    seed([
      makeTask({ title: 'A' }),
      makeTask({ title: 'B' }),
      makeTask({ title: 'C', status: 'doing' }),
      makeTask({ title: 'D', status: 'done' }),
      makeTask({ title: 'E', status: 'done' }),
      makeTask({ title: 'F', status: 'done' }),
    ])
    render(<App />)
    const headings = screen
      .getAllByRole('heading', { level: 2 })
      .map((h) => h.textContent ?? '')
      .filter((text) => COLUMNS.includes(text))
    expect(headings).toEqual(COLUMNS)
    expect(within(column('Offen')).getByText('2')).toBeInTheDocument()
    expect(within(column('In Arbeit')).getByText('1')).toBeInTheDocument()
    expect(within(column('Erledigt')).getByText('3')).toBeInTheDocument()
  })

  it('puts each card into the column of its status in stored order', () => {
    seed([
      makeTask({ title: 'Zwei', status: 'doing' }),
      makeTask({ title: 'Eins' }),
      makeTask({ title: 'Drei', status: 'done' }),
      makeTask({ title: 'Vier' }),
    ])
    render(<App />)
    expect(cardTitles('Offen')).toEqual([expect.stringContaining('Eins'), expect.stringContaining('Vier')])
    expect(cardTitles('In Arbeit')).toEqual([expect.stringContaining('Zwei')])
    expect(cardTitles('Erledigt')).toEqual([expect.stringContaining('Drei')])
  })

  it('shows a drop area in an empty column only', () => {
    seed([makeTask({ title: 'Eins' }), makeTask({ title: 'Fertig', status: 'done' })])
    render(<App />)
    expect(within(column('In Arbeit')).getByText('Hierher ziehen')).toBeInTheDocument()
    expect(within(column('Offen')).queryByText('Hierher ziehen')).not.toBeInTheDocument()
    expect(within(column('Erledigt')).queryByText('Hierher ziehen')).not.toBeInTheDocument()
  })

  it('adds a new task as the top card in «Offen»', async () => {
    const user = userEvent.setup()
    seed([makeTask({ title: 'Alt' }), makeTask({ title: 'Läuft', status: 'doing' })])
    render(<App />)
    await user.type(screen.getByRole('textbox', { name: 'Neue Aufgabe' }), 'Neu{Enter}')
    const titles = cardTitles('Offen')
    expect(titles).toHaveLength(2)
    expect(titles[0]).toContain('Neu')
    expect(titles[1]).toContain('Alt')
    expect(cardTitles('In Arbeit')).toEqual([expect.stringContaining('Läuft')])
  })
})

function active(id: string): Active {
  return { id } as unknown as Active
}

function over(id: string | null): Over | null {
  return id === null ? null : ({ id } as unknown as Over)
}

describe('Board announcements', () => {
  const eins = makeTask({ title: 'Eins' })
  const zwei = makeTask({ title: 'Zwei' })
  const fertig = makeTask({ title: 'Fertig', status: 'done' })
  const announcements = buildAnnouncements([eins, zwei, fertig])

  it('announces pick up, position, drop and cancel in German', () => {
    expect(announcements.onDragStart({ active: active(eins.id) })).toBe('Karte «Eins» aufgenommen.')
    expect(announcements.onDragOver({ active: active(eins.id), over: over('doing') })).toBe(
      'Über Spalte «In Arbeit», Position 1.',
    )
    expect(announcements.onDragOver({ active: active(eins.id), over: over(zwei.id) })).toBe(
      'Über Spalte «Offen», Position 2.',
    )
    expect(announcements.onDragOver({ active: active(eins.id), over: over(fertig.id) })).toBe(
      'Über Spalte «Erledigt», Position 1.',
    )
    expect(announcements.onDragOver({ active: active(eins.id), over: null })).toBe('Ausserhalb einer Spalte.')
    expect(announcements.onDragEnd({ active: active(eins.id), over: over('done') })).toBe(
      'Karte «Eins» in «Erledigt» abgelegt.',
    )
    expect(announcements.onDragCancel({ active: active(eins.id), over: null })).toBe(
      'Verschieben abgebrochen. Karte «Eins» bleibt in «Offen».',
    )
  })

  it('treats a drop outside every column as a cancel', () => {
    expect(announcements.onDragEnd({ active: active(eins.id), over: null })).toBe(
      'Verschieben abgebrochen. Karte «Eins» bleibt in «Offen».',
    )
  })

  it('has German screen reader instructions', () => {
    expect(DRAG_INSTRUCTIONS).toBe(
      'Leertaste zum Aufnehmen. Pfeiltasten zum Verschieben. Leertaste zum Ablegen, Esc zum Abbrechen.',
    )
  })
})

/**
 * jsdom has no layout, so every rect is 0. dnd-kit needs real rects for the keyboard sensor:
 * columns side by side (400 px apart), cards stacked inside their column, everything else
 * (for example the drag overlay) the size of a card at the top of the first column.
 */
function fakeRect(element: Element): DOMRect {
  const make = (left: number, top: number, width: number, height: number) =>
    ({
      x: left,
      y: top,
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      toJSON: () => ({}),
    }) as DOMRect
  const section = element.closest('section[aria-labelledby^="column-"]')
  const columnIndex = section
    ? STATUSES.indexOf((section.getAttribute('aria-labelledby') ?? '').replace('column-', '') as Task['status'])
    : -1
  if (section && element === section) return make(columnIndex * 400, 0, 300, 600)
  if (section && element.tagName === 'LI') {
    const index = Array.from(section.querySelectorAll('li')).indexOf(element as HTMLLIElement)
    return make(columnIndex * 400 + 10, 60 + index * 80, 280, 60)
  }
  return make(10, 60, 280, 60)
}

describe('Board keyboard drag and drop', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.mocked(celebrate).mockClear()
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      return fakeRect(this)
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function firstCard(name: string): HTMLElement {
    return within(column(name)).getAllByRole('listitem')[0]
  }

  it('moves a card from «Offen» into the next column with Space, Arrow right, Space', async () => {
    const user = userEvent.setup()
    const eins = makeTask({ title: 'Eins' })
    seed([eins, makeTask({ title: 'Fertig', status: 'done' })])
    render(<App />)
    firstCard('Offen').focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowRight}')
    await user.keyboard(' ')
    expect(storedTasks().find((t) => t.id === eins.id)?.status).toBe('doing')
    await waitFor(() => expect(cardTitles('In Arbeit')).toEqual([expect.stringContaining('Eins')]))
    expect(await screen.findByText('Karte «Eins» in «In Arbeit» abgelegt.')).toBeInTheDocument()
  })

  it('celebrates once and counts the ring up when a card lands in «Erledigt»', async () => {
    const user = userEvent.setup()
    const eins = makeTask({ title: 'Eins' })
    seed([eins, makeTask({ title: 'Fertig', status: 'done' })])
    render(<App />)
    expect(screen.getByRole('img', { name: '1 von 2 erledigt' })).toBeInTheDocument()
    firstCard('Offen').focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowRight}')
    await user.keyboard('{ArrowRight}')
    await user.keyboard(' ')
    expect(storedTasks().find((t) => t.id === eins.id)?.status).toBe('done')
    expect(celebrate).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('img', { name: '2 von 2 erledigt' })).toBeInTheDocument()
  })

  it('does not celebrate when a card moves within «Erledigt»', async () => {
    const user = userEvent.setup()
    const a = makeTask({ title: 'Fertig A', status: 'done' })
    const b = makeTask({ title: 'Fertig B', status: 'done' })
    seed([a, b])
    render(<App />)
    firstCard('Erledigt').focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowDown}')
    await user.keyboard(' ')
    expect(storedTasks().map((t) => t.id)).toEqual([b.id, a.id])
    expect(celebrate).not.toHaveBeenCalled()
  })

  it('toggles the checkbox with Space instead of starting a drag', async () => {
    const user = userEvent.setup()
    const eins = makeTask({ title: 'Eins' })
    seed([eins])
    render(<App />)
    screen.getByRole('checkbox', { name: '«Eins» erledigt' }).focus()
    await user.keyboard(' ')
    expect(storedTasks().find((t) => t.id === eins.id)?.status).toBe('done')
    expect(screen.queryByText('Karte «Eins» aufgenommen.')).not.toBeInTheDocument()
  })

  it('keeps the card in place when Esc cancels the drag', async () => {
    const user = userEvent.setup()
    const eins = makeTask({ title: 'Eins' })
    seed([eins, makeTask({ title: 'Fertig', status: 'done' })])
    render(<App />)
    firstCard('Offen').focus()
    await user.keyboard(' ')
    await user.keyboard('{ArrowRight}')
    await user.keyboard('{Escape}')
    expect(storedTasks().find((t) => t.id === eins.id)?.status).toBe('todo')
    expect(cardTitles('Offen')).toEqual([expect.stringContaining('Eins')])
    expect(cardTitles('In Arbeit')).toEqual([])
    expect(
      await screen.findByText('Verschieben abgebrochen. Karte «Eins» bleibt in «Offen».'),
    ).toBeInTheDocument()
  })
})
