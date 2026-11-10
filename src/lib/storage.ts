import type { Task } from '@/features/tasks/model'

export const STORAGE_KEY = 'hwz-todo'
export const CURRENT_VERSION = 1

export type StoredState = { version: number; tasks: Task[] }

function emptyState(): StoredState {
  return { version: CURRENT_VERSION, tasks: [] }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/** Returns a complete Task or null if the required fields are missing. */
function normalizeTask(value: unknown): Task | null {
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

/** Reads the state. Missing or broken data gives an empty list, never an error. */
export function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return emptyState()
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || !Array.isArray(parsed.tasks)) return emptyState()
    const tasks = parsed.tasks.map(normalizeTask).filter((t): t is Task => t !== null)
    return { version: CURRENT_VERSION, tasks }
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
