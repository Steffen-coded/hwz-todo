import { describe, expect, it } from 'vitest'
import { formatDue, isOverdue, parseDue, todayIso } from '@/lib/date'

describe('parseDue', () => {
  it('accepts a valid date in DD.MM.YYYY', () => {
    expect(parseDue('31.03.2027')).toEqual({ ok: true, due: '2027-03-31' })
  })

  it('accepts single-digit day and month', () => {
    expect(parseDue('1.2.2027')).toEqual({ ok: true, due: '2027-02-01' })
  })

  it('treats empty or blank input as no due date', () => {
    expect(parseDue('')).toEqual({ ok: true, due: null })
    expect(parseDue('   ')).toEqual({ ok: true, due: null })
  })

  it('rejects an impossible date like 31.02.2027', () => {
    expect(parseDue('31.02.2027')).toEqual({ ok: false })
  })

  it('rejects free text like «morgen»', () => {
    expect(parseDue('morgen')).toEqual({ ok: false })
  })

  it('rejects other formats', () => {
    expect(parseDue('2027-03-31')).toEqual({ ok: false })
    expect(parseDue('31.13.2027')).toEqual({ ok: false })
    expect(parseDue('00.01.2027')).toEqual({ ok: false })
  })

  it('accepts 29.02 in a leap year only', () => {
    expect(parseDue('29.02.2028')).toEqual({ ok: true, due: '2028-02-29' })
    expect(parseDue('29.02.2027')).toEqual({ ok: false })
  })
})

describe('formatDue', () => {
  it('formats YYYY-MM-DD as DD.MM.YYYY', () => {
    expect(formatDue('2027-03-31')).toBe('31.03.2027')
  })
})

describe('isOverdue', () => {
  it('is false on the due date itself', () => {
    expect(isOverdue('2026-11-10', '2026-11-10')).toBe(false)
  })

  it('is true the day after the due date', () => {
    expect(isOverdue('2026-11-09', '2026-11-10')).toBe(true)
  })

  it('is false for a future date and for no due date', () => {
    expect(isOverdue('2026-11-11', '2026-11-10')).toBe(false)
    expect(isOverdue(null, '2026-11-10')).toBe(false)
  })
})

describe('todayIso', () => {
  it('uses the local date, not UTC', () => {
    expect(todayIso(new Date(2026, 10, 10, 23, 59))).toBe('2026-11-10')
    expect(todayIso(new Date(2026, 10, 10, 0, 1))).toBe('2026-11-10')
  })
})
