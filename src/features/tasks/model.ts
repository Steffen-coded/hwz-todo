import { isOverdue } from '@/lib/date'

export type Task = {
  id: string // crypto.randomUUID()
  title: string // trimmed, 1 to 200 characters
  done: boolean
  createdAt: number // Date.now()
  due: string | null // 'YYYY-MM-DD', null = no due date
  starred: boolean // at most one open task is starred
}

export const MAX_TITLE_LENGTH = 200

/** Adds a new task on top. Returns the same array if the title is blank. */
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
    done: false,
    createdAt: now,
    due,
    starred: false,
  }
  return [task, ...tasks]
}

/** Toggles done. Checking a task removes its star. */
export function toggleTask(tasks: Task[], id: string): Task[] {
  return tasks.map((t) => {
    if (t.id !== id) return t
    const done = !t.done
    return { ...t, done, starred: done ? false : t.starred }
  })
}

export function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((t) => t.id !== id)
}

/** Puts a task back at the given index (clamped to the list length). */
export function restoreTask(tasks: Task[], task: Task, index: number): Task[] {
  const at = Math.max(0, Math.min(index, tasks.length))
  return [...tasks.slice(0, at), task, ...tasks.slice(at)]
}

/** Stars one open task and unstars all others. Pressing again removes the star. */
export function toggleStar(tasks: Task[], id: string): Task[] {
  const target = tasks.find((t) => t.id === id)
  if (!target || target.done) return tasks
  const starred = !target.starred
  return tasks.map((t) => {
    if (t.id === id) return { ...t, starred }
    return t.starred ? { ...t, starred: false } : t
  })
}

function byDueThenOldest(a: Task, b: Task): number {
  if (a.due !== b.due) return (a.due ?? '') < (b.due ?? '') ? -1 : 1
  return a.createdAt - b.createdAt
}

/** Open with due date (earliest first), open without (newest first), done last (newest first). */
export function sortTasks(tasks: Task[]): Task[] {
  const openDue = tasks.filter((t) => !t.done && t.due !== null).sort(byDueThenOldest)
  const openNoDue = tasks
    .filter((t) => !t.done && t.due === null)
    .sort((a, b) => b.createdAt - a.createdAt)
  const done = tasks.filter((t) => t.done).sort((a, b) => b.createdAt - a.createdAt)
  return [...openDue, ...openNoDue, ...done]
}

/** Starred open task, else open task with the earliest due date, else oldest open task, else null. */
export function selectFocus(tasks: Task[]): Task | null {
  const open = tasks.filter((t) => !t.done)
  const starred = open.find((t) => t.starred)
  if (starred) return starred
  const withDue = open.filter((t) => t.due !== null).sort(byDueThenOldest)
  if (withDue.length > 0) return withDue[0]
  const oldest = [...open].sort((a, b) => a.createdAt - b.createdAt)
  return oldest[0] ?? null
}

/** Overdue means: still open and the due date lies before today. */
export function isTaskOverdue(task: Task, today: string): boolean {
  return !task.done && isOverdue(task.due, today)
}
