import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { STORAGE_KEY } from '@/lib/storage'

function storedTitles(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  const state = JSON.parse(raw) as { tasks: { title: string }[] }
  return state.tasks.map((t) => t.title)
}

describe('TaskInput', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('adds a task with due date on Enter and clears both fields', async () => {
    const user = userEvent.setup()
    render(<App />)
    const title = screen.getByRole('textbox', { name: 'Neue Aufgabe' })
    const due = screen.getByRole('textbox', { name: 'Frist (optional)' })
    await user.type(title, 'Steuererklärung')
    await user.type(due, '31.03.2027{Enter}')
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(1)
    expect(items[0]).toHaveTextContent('Steuererklärung')
    expect(items[0]).toHaveTextContent('31.03.2027')
    expect(title).toHaveValue('')
    expect(due).toHaveValue('')
    expect(title).toHaveFocus()
  })

  it('adds nothing for an empty or blank title', async () => {
    const user = userEvent.setup()
    render(<App />)
    const title = screen.getByRole('textbox', { name: 'Neue Aufgabe' })
    await user.type(title, '{Enter}')
    await user.type(title, '   {Enter}')
    await user.click(screen.getByRole('button', { name: 'Aufgabe hinzufügen' }))
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(storedTitles()).toEqual([])
    expect(title).toHaveFocus()
  })

  it('rejects an invalid due date with a hint', async () => {
    const user = userEvent.setup()
    render(<App />)
    const title = screen.getByRole('textbox', { name: 'Neue Aufgabe' })
    const due = screen.getByRole('textbox', { name: 'Frist (optional)' })
    await user.type(title, 'Rechnung')
    await user.type(due, '31.02.2027{Enter}')
    expect(screen.getByText('Bitte als TT.MM.JJJJ eingeben')).toBeInTheDocument()
    expect(due).toHaveAttribute('aria-invalid', 'true')
    expect(due).toHaveAccessibleDescription('Bitte als TT.MM.JJJJ eingeben')
    expect(due).toHaveFocus()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('focuses the title field when N is pressed outside of fields', async () => {
    const user = userEvent.setup()
    render(<App />)
    const title = screen.getByRole('textbox', { name: 'Neue Aufgabe' })
    expect(title).not.toHaveFocus()
    await user.keyboard('n')
    expect(title).toHaveFocus()
    expect(title).toHaveValue('')
  })

  it('clears the title and removes focus on Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    const title = screen.getByRole('textbox', { name: 'Neue Aufgabe' })
    await user.type(title, 'Entwurf{Escape}')
    expect(title).toHaveValue('')
    expect(title).not.toHaveFocus()
  })

  it('stores at most 200 characters', () => {
    render(<App />)
    const title = screen.getByRole('textbox', { name: 'Neue Aufgabe' })
    expect(title).toHaveAttribute('maxLength', '200')
    fireEvent.change(title, { target: { value: 'x'.repeat(250) } })
    fireEvent.submit(title.closest('form') as HTMLFormElement)
    expect(storedTitles()).toEqual(['x'.repeat(200)])
  })
})
