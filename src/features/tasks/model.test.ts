import { describe, expect, it } from 'vitest'
import {
  addTask,
  isTaskOverdue,
  legacyOrder,
  moveTask,
  removeTask,
  resolveDrop,
  restoreTask,
  selectFocus,
  tasksByStatus,
  toggleStar,
  toggleTask,
  type Task,
} from '@/features/tasks/model'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: overrides.id ?? 'id',
    title: 'Task',
    status: 'todo',
    createdAt: 0,
    due: null,
    starred: false,
    ...overrides,
  }
}

const ids = (tasks: Task[]) => tasks.map((t) => t.id)

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

  it('adds the new task on top as todo with due date and defaults', () => {
    const existing = [makeTask({ id: 'a' }), makeTask({ id: 'b', status: 'doing' })]
    const result = addTask(existing, 'Steuererklärung', '2027-03-31', 1000)
    expect(result).toHaveLength(3)
    expect(result[0]).toMatchObject({
      title: 'Steuererklärung',
      status: 'todo',
      createdAt: 1000,
      due: '2027-03-31',
      starred: false,
    })
    expect(typeof result[0].id).toBe('string')
    expect(ids(result).slice(1)).toEqual(['a', 'b'])
    expect(tasksByStatus(result, 'todo')[0].title).toBe('Steuererklärung')
  })
})

describe('toggleTask', () => {
  it('marks done and reopens', () => {
    const tasks = [makeTask({ id: 'a' })]
    const done = toggleTask(tasks, 'a')
    expect(done[0].status).toBe('done')
    expect(toggleTask(done, 'a')[0].status).toBe('todo')
  })

  it('marks a doing task done in place', () => {
    const tasks = [makeTask({ id: 'a' }), makeTask({ id: 'b', status: 'doing' })]
    const result = toggleTask(tasks, 'b')
    expect(result.map((t) => [t.id, t.status])).toEqual([
      ['a', 'todo'],
      ['b', 'done'],
    ])
  })

  it('removes the star when a task is checked', () => {
    const tasks = [makeTask({ id: 'a', starred: true })]
    expect(toggleTask(tasks, 'a')[0].starred).toBe(false)
  })

  it('puts a done task back on top as todo', () => {
    const tasks = [
      makeTask({ id: 'a' }),
      makeTask({ id: 'b', status: 'doing' }),
      makeTask({ id: 'c', status: 'done' }),
    ]
    const result = toggleTask(tasks, 'c')
    expect(result.map((t) => [t.id, t.status])).toEqual([
      ['c', 'todo'],
      ['a', 'todo'],
      ['b', 'doing'],
    ])
    expect(tasksByStatus(result, 'todo')[0].id).toBe('c')
  })

  it('returns the same array for an unknown id', () => {
    const tasks = [makeTask({ id: 'a' })]
    expect(toggleTask(tasks, 'nope')).toBe(tasks)
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
    expect(ids(removed)).toEqual(['a', 'b', 'd'])
    const restored = restoreTask(removed, tasks[2], 2)
    expect(restored).toEqual(tasks)
  })
})

describe('toggleStar', () => {
  it('stars only one task at a time', () => {
    const tasks = [makeTask({ id: 'a', starred: true }), makeTask({ id: 'b', status: 'doing' })]
    const result = toggleStar(tasks, 'b')
    expect(result.map((t) => t.starred)).toEqual([false, true])
  })

  it('removes the star when pressed again', () => {
    const tasks = [makeTask({ id: 'a', starred: true })]
    expect(toggleStar(tasks, 'a')[0].starred).toBe(false)
  })

  it('does not star a done task', () => {
    const tasks = [makeTask({ id: 'a', status: 'done' })]
    expect(toggleStar(tasks, 'a')).toEqual(tasks)
  })
})

describe('tasksByStatus', () => {
  const tasks = [
    makeTask({ id: 'd1', status: 'done' }),
    makeTask({ id: 't1' }),
    makeTask({ id: 'g1', status: 'doing' }),
    makeTask({ id: 't2' }),
    makeTask({ id: 'd2', status: 'done' }),
  ]

  it('filters by status without reordering', () => {
    expect(ids(tasksByStatus(tasks, 'todo'))).toEqual(['t1', 't2'])
    expect(ids(tasksByStatus(tasks, 'doing'))).toEqual(['g1'])
    expect(ids(tasksByStatus(tasks, 'done'))).toEqual(['d1', 'd2'])
  })
})

describe('legacyOrder', () => {
  it('puts open tasks with due date first, then open without (newest first), then done', () => {
    const tasks = [
      makeTask({ id: 'done', status: 'done', due: '2026-01-01' }),
      makeTask({ id: 'old-nodue', createdAt: 1 }),
      makeTask({ id: 'dec', due: '2026-12-15' }),
      makeTask({ id: 'new-nodue', createdAt: 2 }),
      makeTask({ id: 'nov', due: '2026-11-20' }),
    ]
    expect(ids(legacyOrder(tasks))).toEqual(['nov', 'dec', 'new-nodue', 'old-nodue', 'done'])
  })

  it('does not mutate the input', () => {
    const tasks = [makeTask({ id: 'b', createdAt: 1 }), makeTask({ id: 'a', createdAt: 2 })]
    legacyOrder(tasks)
    expect(ids(tasks)).toEqual(['b', 'a'])
  })
})

describe('selectFocus', () => {
  const todo1 = makeTask({ id: 'todo1', due: '2026-12-15' })
  const todo2 = makeTask({ id: 'todo2', due: '2026-11-20' })
  const doing1 = makeTask({ id: 'doing1', status: 'doing' })
  const doing2 = makeTask({ id: 'doing2', status: 'doing' })

  it('takes the star before the top doing before the top todo', () => {
    const star = makeTask({ id: 'star', starred: true })
    expect(selectFocus([todo1, doing1, doing2, star])?.id).toBe('star')
    expect(selectFocus([todo1, doing1, doing2])?.id).toBe('doing1')
    expect(selectFocus([todo1, makeTask({ id: 'done', status: 'done' })])?.id).toBe('todo1')
    expect(selectFocus([makeTask({ id: 'done', status: 'done' })])).toBeNull()
  })

  it('takes a starred doing task', () => {
    const star = { ...doing2, starred: true }
    expect(selectFocus([todo1, doing1, star])?.id).toBe('doing2')
  })

  it('takes the top todo by array order, not by due date', () => {
    expect(selectFocus([todo1, todo2])?.id).toBe('todo1')
  })

  it('ignores done tasks and returns null when nothing is open', () => {
    const doneTask = makeTask({ id: 'done', status: 'done', starred: true })
    expect(selectFocus([doneTask, todo1])?.id).toBe('todo1')
    expect(selectFocus([doneTask])).toBeNull()
    expect(selectFocus([])).toBeNull()
  })
})

describe('isTaskOverdue', () => {
  it('is true only for tasks not done with a due date before today', () => {
    const today = '2026-11-10'
    expect(isTaskOverdue(makeTask({ due: '2026-11-09' }), today)).toBe(true)
    expect(isTaskOverdue(makeTask({ due: '2026-11-09', status: 'doing' }), today)).toBe(true)
    expect(isTaskOverdue(makeTask({ due: '2026-11-10' }), today)).toBe(false)
    expect(isTaskOverdue(makeTask({ due: '2026-11-09', status: 'done' }), today)).toBe(false)
    expect(isTaskOverdue(makeTask({ due: null }), today)).toBe(false)
  })
})

describe('moveTask', () => {
  const board = () => [
    makeTask({ id: 't1' }),
    makeTask({ id: 'g1', status: 'doing' }),
    makeTask({ id: 't2' }),
    makeTask({ id: 't3', starred: true }),
    makeTask({ id: 'd1', status: 'done' }),
  ]
  const column = (tasks: Task[], status: Task['status']) => ids(tasksByStatus(tasks, status))

  it('moves a card from todo to doing at index 0', () => {
    const result = moveTask(board(), 't2', 'doing', 0)
    expect(column(result, 'doing')).toEqual(['t2', 'g1'])
    expect(column(result, 'todo')).toEqual(['t1', 't3'])
    expect(result.find((t) => t.id === 't2')?.status).toBe('doing')
  })

  it('reorders inside todo from bottom to top', () => {
    const result = moveTask(board(), 't3', 'todo', 0)
    expect(column(result, 'todo')).toEqual(['t3', 't1', 't2'])
  })

  it('reorders inside todo from top to bottom', () => {
    const result = moveTask(board(), 't1', 'todo', 2)
    expect(column(result, 'todo')).toEqual(['t2', 't3', 't1'])
  })

  it('removes the star when moved to done', () => {
    const result = moveTask(board(), 't3', 'done', 1)
    const moved = result.find((t) => t.id === 't3')
    expect(moved?.status).toBe('done')
    expect(moved?.starred).toBe(false)
    expect(column(result, 'done')).toEqual(['d1', 't3'])
  })

  it('clamps the index and accepts an empty target column', () => {
    expect(column(moveTask(board(), 't1', 'doing', 99), 'doing')).toEqual(['g1', 't1'])
    expect(column(moveTask(board(), 't1', 'doing', -5), 'doing')).toEqual(['t1', 'g1'])
    const noDone = board().filter((t) => t.status !== 'done')
    expect(column(moveTask(noDone, 't1', 'done', 0), 'done')).toEqual(['t1'])
  })

  it('returns the same array for an unknown id and does not mutate', () => {
    const tasks = board()
    const copy = structuredClone(tasks)
    expect(moveTask(tasks, 'nope', 'done', 0)).toBe(tasks)
    moveTask(tasks, 't3', 'done', 0)
    expect(tasks).toEqual(copy)
  })
})

describe('resolveDrop', () => {
  const tasks = [
    makeTask({ id: 't1' }),
    makeTask({ id: 'g1', status: 'doing' }),
    makeTask({ id: 't2' }),
    makeTask({ id: 't3' }),
    makeTask({ id: 'g2', status: 'doing' }),
  ]

  it('gives the end of the column for a column id', () => {
    expect(resolveDrop(tasks, 't1', 'doing')).toEqual({ toStatus: 'doing', toIndex: 2 })
    expect(resolveDrop(tasks, 't1', 'done')).toEqual({ toStatus: 'done', toIndex: 0 })
    expect(resolveDrop(tasks, 't1', 'todo')).toEqual({ toStatus: 'todo', toIndex: 2 })
  })

  it('gives the column and index of the card for a card id', () => {
    expect(resolveDrop(tasks, 't1', 'g2')).toEqual({ toStatus: 'doing', toIndex: 1 })
    expect(resolveDrop(tasks, 't1', 't3')).toEqual({ toStatus: 'todo', toIndex: 2 })
  })

  it('returns null for a missing or unknown target', () => {
    expect(resolveDrop(tasks, 't1', null)).toBeNull()
    expect(resolveDrop(tasks, 't1', 'nope')).toBeNull()
    expect(resolveDrop(tasks, 'nope', 't2')).toBeNull()
  })

  const dropOrder = (activeId: string, overId: string, status: Task['status'] = 'todo') => {
    const drop = resolveDrop(tasks, activeId, overId)
    if (!drop) throw new Error('no drop')
    return ids(tasksByStatus(moveTask(tasks, activeId, drop.toStatus, drop.toIndex), status))
  }

  it('works like arrayMove when dragging down in the same column', () => {
    expect(dropOrder('t1', 't3')).toEqual(['t2', 't3', 't1'])
    expect(dropOrder('t1', 't2')).toEqual(['t2', 't1', 't3'])
  })

  it('works like arrayMove when dragging up in the same column', () => {
    expect(dropOrder('t3', 't1')).toEqual(['t3', 't1', 't2'])
  })

  it('inserts before the target card when changing columns', () => {
    expect(dropOrder('t2', 'g2', 'doing')).toEqual(['g1', 't2', 'g2'])
    expect(dropOrder('g2', 't1', 'todo')).toEqual(['g2', 't1', 't2', 't3'])
  })
})
