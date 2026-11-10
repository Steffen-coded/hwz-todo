import { isOverdue } from '@/lib/date'

export type Status = 'todo' | 'doing' | 'done'

export const STATUSES: readonly Status[] = ['todo', 'doing', 'done']

export type Task = {
  id: string // crypto.randomUUID()
  title: string // trimmed, 1 to 200 characters
  status: Status // replaces done (version 2)
  createdAt: number // Date.now()
  due: string | null // 'YYYY-MM-DD', null = no due date
  starred: boolean // at most one task that is not done is starred
}

export const MAX_TITLE_LENGTH = 200

/** Adds a new task with status 'todo' on top. Returns the same array if the title is blank. */
export function addTask(
  tasks: Task[],
  title: string,
  due: string | null = null,
  now: number = Date.now(),
): Task[] {
  const clean = title.trim().slice(0, MAX_TITLE_LENGTH)
  if (clean === '') return tasks
  const task: Task = {
    id: crypto.randomUUID(),
    title: clean,
    status: 'todo',
    createdAt: now,
    due,
    starred: false,
  }
  return [task, ...tasks]
}

/**
 * Not done: becomes 'done' in place and loses its star.
 * Done: becomes 'todo' and moves to the very top, so it is the first card in «Offen».
 */
export function toggleTask(tasks: Task[], id: string): Task[] {
  const target = tasks.find((t) => t.id === id)
  if (!target) return tasks
  if (target.status === 'done') {
    const reopened: Task = { ...target, status: 'todo' }
    return [reopened, ...tasks.filter((t) => t.id !== id)]
  }
  return tasks.map((t) => (t.id === id ? { ...t, status: 'done', starred: false } : t))
}

export function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((t) => t.id !== id)
}

/** Puts a task back at the given index (clamped to the list length). */
export function restoreTask(tasks: Task[], task: Task, index: number): Task[] {
  const at = Math.max(0, Math.min(index, tasks.length))
  return [...tasks.slice(0, at), task, ...tasks.slice(at)]
}

/** Stars one task that is not done and unstars all others. Pressing again removes the star. */
export function toggleStar(tasks: Task[], id: string): Task[] {
  const target = tasks.find((t) => t.id === id)
  if (!target || target.status === 'done') return tasks
  const starred = !target.starred
  return tasks.map((t) => {
    if (t.id === id) return { ...t, starred }
    return t.starred ? { ...t, starred: false } : t
  })
}

/** Tasks with the given status in array order (the order of the column). */
export function tasksByStatus(tasks: Task[], status: Status): Task[] {
  return tasks.filter((t) => t.status === status)
}

/**
 * Moves a card into the column `toStatus` so that it ends up at position `toIndex` there.
 * Convention: `toIndex` counts the target column WITHOUT the moved card (clamped to 0..length),
 * so the result equals arrayMove from @dnd-kit/sortable inside one column.
 * An empty target column receives the card at the end of the array.
 * Moving to 'done' removes the star. Unknown id: the same array is returned.
 */
export function moveTask(tasks: Task[], id: string, toStatus: Status, toIndex: number): Task[] {
  const target = tasks.find((t) => t.id === id)
  if (!target) return tasks
  const moved: Task = {
    ...target,
    status: toStatus,
    starred: toStatus === 'done' ? false : target.starred,
  }
  const rest = tasks.filter((t) => t.id !== id)
  const column = tasksByStatus(rest, toStatus)
  const at = Math.max(0, Math.min(toIndex, column.length))
  let insertAt = rest.length
  if (at < column.length) insertAt = rest.indexOf(column[at])
  else if (column.length > 0) insertAt = rest.indexOf(column[column.length - 1]) + 1
  return [...rest.slice(0, insertAt), moved, ...rest.slice(insertAt)]
}

export type Drop = { toStatus: Status; toIndex: number }

/**
 * Turns a dnd-kit drop target into arguments for moveTask.
 * Column id: the end of that column (counted without the active card).
 * Card id: the column of that card and its index in that column as it is now. Inside the
 * same column this gives arrayMove semantics (up and down), across columns it inserts
 * before the target card. Missing or unknown ids: null.
 */
export function resolveDrop(tasks: Task[], activeId: string, overId: string | null): Drop | null {
  if (overId === null || !tasks.some((t) => t.id === activeId)) return null
  const status = STATUSES.find((s) => s === overId)
  if (status) {
    const length = tasksByStatus(tasks, status).filter((t) => t.id !== activeId).length
    return { toStatus: status, toIndex: length }
  }
  const over = tasks.find((t) => t.id === overId)
  if (!over) return null
  const toIndex = tasksByStatus(tasks, over.status).findIndex((t) => t.id === overId)
  return { toStatus: over.status, toIndex }
}

function byDueThenOldest(a: Task, b: Task): number {
  if (a.due !== b.due) return (a.due ?? '') < (b.due ?? '') ? -1 : 1
  return a.createdAt - b.createdAt
}

/**
 * The display order of version 1, used once by the migration:
 * open with due date (earliest first, older first on a tie), open without (newest first),
 * done last (newest first).
 */
export function legacyOrder(tasks: Task[]): Task[] {
  const open = tasks.filter((t) => t.status !== 'done')
  const openDue = open.filter((t) => t.due !== null).sort(byDueThenOldest)
  const openNoDue = open.filter((t) => t.due === null).sort((a, b) => b.createdAt - a.createdAt)
  const done = tasksByStatus(tasks, 'done').sort((a, b) => b.createdAt - a.createdAt)
  return [...openDue, ...openNoDue, ...done]
}

/** Starred task (not done), else the top 'doing', else the top 'todo', else null. */
export function selectFocus(tasks: Task[]): Task | null {
  const starred = tasks.find((t) => t.starred && t.status !== 'done')
  if (starred) return starred
  return tasksByStatus(tasks, 'doing')[0] ?? tasksByStatus(tasks, 'todo')[0] ?? null
}

/** Overdue means: not done and the due date lies before today. */
export function isTaskOverdue(task: Task, today: string): boolean {
  return task.status !== 'done' && isOverdue(task.due, today)
}
