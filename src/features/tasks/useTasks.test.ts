import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useTasks } from '@/features/tasks/useTasks'
import { STORAGE_KEY, loadState } from '@/lib/storage'

describe('useTasks', () => {
  it('loads tasks from storage', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        tasks: [{ id: 'a', title: 'Gespeichert', done: false, createdAt: 1, due: null, starred: false }],
      }),
    )
    const { result } = renderHook(() => useTasks())
    expect(result.current.tasks.map((t) => t.title)).toEqual(['Gespeichert'])
  })

  it('saves after every change and survives a reload', () => {
    const { result, unmount } = renderHook(() => useTasks())
    act(() => {
      result.current.addTask('Steuererklärung', '2027-03-31')
    })
    act(() => {
      result.current.addTask('Milch')
    })
    const id = result.current.tasks[0].id
    act(() => {
      result.current.toggleStar(id)
    })
    expect(loadState().tasks.map((t) => [t.title, t.due, t.starred])).toEqual([
      ['Milch', null, true],
      ['Steuererklärung', '2027-03-31', false],
    ])
    unmount()

    const reloaded = renderHook(() => useTasks())
    expect(reloaded.result.current.tasks).toHaveLength(2)
    expect(reloaded.result.current.tasks[0].starred).toBe(true)
  })

  it('reports whether a task was added', () => {
    const { result } = renderHook(() => useTasks())
    let added = true
    act(() => {
      added = result.current.addTask('   ')
    })
    expect(added).toBe(false)
    expect(result.current.tasks).toHaveLength(0)
  })

  it('toggles, removes and restores a task at its old position', () => {
    const { result } = renderHook(() => useTasks())
    act(() => result.current.addTask('C'))
    act(() => result.current.addTask('B'))
    act(() => result.current.addTask('A'))
    const b = result.current.tasks[1]

    act(() => result.current.toggleTask(b.id))
    expect(result.current.tasks[1].done).toBe(true)

    let removed: ReturnType<typeof result.current.removeTask> = null
    act(() => {
      removed = result.current.removeTask(b.id)
    })
    expect(result.current.tasks.map((t) => t.title)).toEqual(['A', 'C'])
    expect(removed).not.toBeNull()

    act(() => {
      if (removed) result.current.restoreTask(removed.task, removed.index)
    })
    expect(result.current.tasks.map((t) => t.title)).toEqual(['A', 'B', 'C'])
    expect(loadState().tasks.map((t) => t.title)).toEqual(['A', 'B', 'C'])
  })
})
