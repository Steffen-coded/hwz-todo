import { STATUSES, legacyOrder, type Status, type Task } from '@/features/tasks/model'

export const STORAGE_KEY = 'hwz-todo'
export const CURRENT_VERSION = 2

export type StoredState = { version: number; tasks: Task[] }

/** A task as Bau 1 stored it (version 1). */
export type TaskV1 = {
  id: string
  title: string
  done: boolean
  createdAt: number
  due: string | null
  starred: boolean
}

function emptyState(): StoredState {
  return { version: CURRENT_VERSION, tasks: [] }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isStatus(value: unknown): value is Status {
  return STATUSES.includes(value as Status)
}

/** Returns a complete version-1 task or null if the required fields are missing. */
function normalizeV1(value: unknown): TaskV1 | null {
  if (!isRecord(value)) return null
  const { id, title, done, createdAt, due, starred } = value
  if (
    typeof id !== 'string' ||
    typeof title !== 'string' ||
    typeof done !== 'boolean' ||
    typeof createdAt !== 'number'
  ) {
    return null
  }
  return {
    id,
    title,
    done,
    createdAt,
    due: typeof due === 'string' ? due : null,
    starred: typeof starred === 'boolean' ? starred : false,
  }
}

/** Returns a complete version-2 task, or null if a field is missing or the status is unknown. */
function normalizeV2(value: unknown): Task | null {
  if (!isRecord(value)) return null
  const { id, title, status, createdAt, due, starred } = value
  if (
    typeof id !== 'string' ||
    typeof title !== 'string' ||
    !isStatus(status) ||
    typeof createdAt !== 'number'
  ) {
    return null
  }
  return {
    id,
    title,
    status,
    createdAt,
    due: typeof due === 'string' ? due : null,
    starred: typeof starred === 'boolean' ? starred : false,
  }
}

/**
 * Version 1 to 2: first the former display order, then done becomes 'done', open becomes 'todo'.
 * Title, due date, star and createdAt stay as they were.
 */
export function migrateV1toV2(tasks: TaskV1[]): Task[] {
  return legacyOrder(
    tasks.map(
      (t): Task => ({
        id: t.id,
        title: t.title,
        status: t.done ? 'done' : 'todo',
        createdAt: t.createdAt,
        due: t.due,
        starred: t.starred,
      }),
    ),
  )
}

/** Reads the state and migrates older versions. Missing or broken data gives an empty list. */
export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return emptyState()
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || !Array.isArray(parsed.tasks)) return emptyState()
    if (parsed.version === CURRENT_VERSION) {
      const tasks = parsed.tasks.map(normalizeV2).filter((t): t is Task => t !== null)
      return { version: CURRENT_VERSION, tasks }
    }
    // Version 1, or no version at all: tasks with done fields.
    const v1 = parsed.tasks.map(normalizeV1).filter((t): t is TaskV1 => t !== null)
    return { version: CURRENT_VERSION, tasks: migrateV1toV2(v1) }
  } catch {
    return emptyState()
  }
}

/** Writes the whole state. */
export function saveState(state: StoredState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or blocked: keep the app running.
  }
}
