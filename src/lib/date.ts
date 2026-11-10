/** Result of parsing a due date input. Empty input is valid and means "no due date". */
export type ParseDueResult = { ok: true; due: string | null } | { ok: false }

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Parses 'DD.MM.YYYY' (day and month may have one digit) into 'YYYY-MM-DD'. */
export function parseDue(input: string): ParseDueResult {
  const text = input.trim()
  if (text === '') return { ok: true, due: null }

  const match = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text)
  if (!match) return { ok: false }

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)
  // Date silently rolls over (31.02 -> 03.03), so check the parts again.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return { ok: false }
  }
  return { ok: true, due: `${year}-${pad(month)}-${pad(day)}` }
}

/** Formats 'YYYY-MM-DD' as 'DD.MM.YYYY'. */
export function formatDue(due: string): string {
  const [year, month, day] = due.split('-')
  return `${day}.${month}.${year}`
}

/** True if the due date lies strictly before today. Both as 'YYYY-MM-DD'. */
export function isOverdue(due: string | null, today: string): boolean {
  return due !== null && due < today
}

/** Today's local date as 'YYYY-MM-DD' (not UTC). */
export function todayIso(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}
