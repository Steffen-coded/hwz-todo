import { describe, expect, it } from 'vitest'
import {
  addTask,
  isTaskOverdue,
  removeTask,
  restoreTask,
  selectFocus,
  sortTasks,
  toggleStar,
  toggleTask,
  type Task,
} from '@/features/tasks/model'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? 'id',
    title: 'Task',
    done: false,
    createdAt: 0,
    due: null,
    starred: false,
    ...overrides,
  }
}

describe('addTask', () => {
  it('ignores an empty or blank title', () => {
    expect(addTask([], '')).toEqual([])
    expect(addTask([], '   ')).toEqual([])
  })

  it('trims the title and cuts it to 200 characters', () => {
    const long = 'x'.repeat(250)
    const [task] = addTask([], `  ${long}  `)
    expect(task.title).toHaveLength(200)
    expect(addTask([], '  Milch  ')[0].title).toBe('Milch')
  })

  it('adds the new task on top with due date and defaults', () => {
    const existing = [makeTask({ id: 'a' })]
    const result = addTask(existing, 'Steuererklärung', '2027-03-31', 1000)
    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      title: 'Steuererklärung',
      done: false,
      createdAt: 1000,
      due: '2027-03-31',
      starred: false,
    })
    expect(typeof result[0].id).toBe('string')
    expect(result[1].id).toBe('a')
  })
})

describe('toggleTask', () => {
  it('marks done and reopens', () => {
    const tasks = [makeTask({ id: 'a' })]
    const done = toggleTask(tasks, 'a')
    expect(done[0].done).toBe(true)
    expect(toggleTask(done, 'a')[0].done).toBe(false)
  })

  it('removes the star when a task is checked', () => {
    const tasks = [makeTask({ id: 'a', starred: true })]
    expect(toggleTask(tasks, 'a')[0].starred).toBe(false)
  })
})

describe('removeTask and restoreTask', () => {
  it('restores a removed task at its old position with its due date', () => {
    const tasks = [
      makeTask({ id: 'a' }),
      makeTask({ id: 'b' }),
      makeTask({ id: 'c', due: '2026-12-01' }),
      makeTask({ id: 'd' }),
    ]
    const removed = removeTask(tasks, 'c')
    expect(removed.map((t) => t.id)).toEqual(['a', 'b', 'd'])
    const restored = restoreTask(removed, tasks[2], 2)
    expect(restored).toEqual(tasks)
  })
})

describe('toggleStar', () => {
  it('stars only one task at a time', () => {
    const tasks = [makeTask({ id: 'a', starred: true }), makeTask({ id: 'b' })]
    const result = toggleStar(tasks, 'b')
    expect(result.map((t) => t.starred)).toEqual([false, true])
  })

  it('removes the star when pressed again', () => {
    const tasks = [makeTask({ id: 'a', starred: true })]
    expect(toggleStar(tasks, 'a')[0].starred).toBe(false)
  })

  it('does not star a done task', () => {
    const tasks = [makeTask({ id: 'a', done: true })]
    expect(toggleStar(tasks, 'a')).toEqual(tasks)
  })
})

describe('sortTasks', () => {
  it('puts open tasks with due date first, then open without (newest first), then done', () => {
    const tasks = [
      makeTask({ id: 'done', done: true, due: '2026-01-01' }),
      makeTask({ id: 'old-nodue', createdAt: 1 }),
      makeTask({ id: 'dec', due: '2026-12-15' }),
      makeTask({ id: 'new-nodue', createdAt: 2 }),
      makeTask({ id: 'nov', due: '2026-11-20' }),
    ]
    expect(sortTasks(tasks).map((t) => t.id)).toEqual([
      'nov',
      'dec',
      'new-nodue',
      'old-nodue',
      'done',
    ])
  })

  it('does not mutate the input', () => {
    const tasks = [makeTask({ id: 'b', createdAt: 1 }), makeTask({ id: 'a', createdAt: 2 })]
    sortTasks(tasks)
    expect(tasks.map((t) => t.id)).toEqual(['b', 'a'])
  })
})

describe('selectFocus', () => {
  const dec = makeTask({ id: 'dec', due: '2026-12-15', createdAt: 1 })
  const nov = makeTask({ id: 'nov', due: '2026-11-20', createdAt: 2 })
  const noDue = makeTask({ id: 'nodue', createdAt: 0 })

  it('takes the open task with the earliest due date', () => {
    expect(selectFocus([dec, nov, noDue])?.id).toBe('nov')
  })

  it('takes the starred task before the earliest due date', () => {
    const starred = { ...dec, starred: true }
    expect(selectFocus([starred, nov, noDue])?.id).toBe('dec')
  })

  it('takes the oldest open task when no task has a due date', () => {
    const older = makeTask({ id: 'older', createdAt: 1 })
    const newer = makeTask({ id: 'newer', createdAt: 5 })
    expect(selectFocus([newer, older])?.id).toBe('older')
  })

  it('ignores done tasks and returns null when nothing is open', () => {
    const doneNov = { ...nov, done: true }
    expect(selectFocus([doneNov, dec])?.id).toBe('dec')
    expect(selectFocus([doneNov])).toBeNull()
    expect(selectFocus([])).toBeNull()
  })
})

describe('isTaskOverdue', () => {
  it('is true only for open tasks with a due date before today', () => {
    const today = '2026-11-10'
    expect(isTaskOverdue(makeTask({ due: '2026-11-09' }), today)).toBe(true)
    expect(isTaskOverdue(makeTask({ due: '2026-11-10' }), today)).toBe(false)
    expect(isTaskOverdue(makeTask({ due: '2026-11-09', done: true }), today)).toBe(false)
    expect(isTaskOverdue(makeTask({ due: null }), today)).toBe(false)
  })
})
