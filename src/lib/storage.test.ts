import { describe, expect, it } from 'vitest'
import {
  CURRENT_VERSION,
  STORAGE_KEY,
  loadState,
  migrateV1toV2,
  saveState,
  type TaskV1,
} from '@/lib/storage'
import type { Task } from '@/features/tasks/model'

const task: Task = {
  id: 'a',
  title: 'Steuererklärung',
  status: 'todo',
  createdAt: 1,
  due: '2027-03-31',
  starred: true,
}

describe('loadState', () => {
  it('uses version 2', () => {
    expect(CURRENT_VERSION).toBe(2)
  })

  it('returns an empty list when nothing is stored', () => {
    expect(loadState()).toEqual({ version: CURRENT_VERSION, tasks: [] })
  })

  it('returns an empty list for broken JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{kaputt')
    expect(loadState()).toEqual({ version: 2, tasks: [] })
  })

  it('returns an empty list for a wrong shape', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, tasks: 'nope' }))
    expect(loadState()).toEqual({ version: 2, tasks: [] })
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks: 'nope' }))
    expect(loadState()).toEqual({ version: 2, tasks: [] })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(42))
    expect(loadState()).toEqual({ version: 2, tasks: [] })
  })

  it('fills missing due and starred fields in version 2', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 2, tasks: [{ id: 'b', title: 'Alt', status: 'doing', createdAt: 2 }] }),
    )
    expect(loadState().tasks).toEqual([
      { id: 'b', title: 'Alt', status: 'doing', createdAt: 2, due: null, starred: false },
    ])
  })

  it('fills missing due and starred fields in version 1 and migrates them', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, tasks: [{ id: 'b', title: 'Alt', done: true, createdAt: 2 }] }),
    )
    expect(loadState().tasks).toEqual([
      { id: 'b', title: 'Alt', status: 'done', createdAt: 2, due: null, starred: false },
    ])
  })

  it('drops entries that are not tasks', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, tasks: [task, { foo: 1 }, null] }))
    expect(loadState().tasks).toEqual([task])
  })

  it('drops version-2 entries with an unknown status', () => {
    const broken = { ...task, id: 'x', status: 'later' }
    const legacy = { id: 'y', title: 'Alt', done: false, createdAt: 3, due: null, starred: false }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, tasks: [task, broken, legacy] }))
    expect(loadState().tasks).toEqual([task])
  })
})

describe('migrateV1toV2', () => {
  it('turns real version-1 data into version 2 in the former display order', () => {
    // Exactly as Bau 1 stored it.
    const v1 = JSON.stringify({
      version: 1,
      tasks: [
        { id: 'done-old', title: 'Alt erledigt', done: true, createdAt: 1, due: '2026-10-01', starred: false },
        { id: 'nodue-old', title: 'Ohne Frist alt', done: false, createdAt: 2, due: null, starred: false },
        { id: 'dec', title: 'Dezember', done: false, createdAt: 3, due: '2026-12-15', starred: true },
        { id: 'done-new', title: 'Neu erledigt', done: true, createdAt: 4, due: null, starred: false },
        { id: 'nodue-new', title: 'Ohne Frist neu', done: false, createdAt: 5, due: null, starred: false },
        { id: 'nov-b', title: 'November jung', done: false, createdAt: 7, due: '2026-11-20', starred: false },
        { id: 'nov-a', title: 'November alt', done: false, createdAt: 6, due: '2026-11-20', starred: false },
      ],
    })
    localStorage.setItem(STORAGE_KEY, v1)
    const state = loadState()
    expect(state.version).toBe(2)
    expect(state.tasks).toEqual([
      { id: 'nov-a', title: 'November alt', status: 'todo', createdAt: 6, due: '2026-11-20', starred: false },
      { id: 'nov-b', title: 'November jung', status: 'todo', createdAt: 7, due: '2026-11-20', starred: false },
      { id: 'dec', title: 'Dezember', status: 'todo', createdAt: 3, due: '2026-12-15', starred: true },
      { id: 'nodue-new', title: 'Ohne Frist neu', status: 'todo', createdAt: 5, due: null, starred: false },
      { id: 'nodue-old', title: 'Ohne Frist alt', status: 'todo', createdAt: 2, due: null, starred: false },
      { id: 'done-new', title: 'Neu erledigt', status: 'done', createdAt: 4, due: null, starred: false },
      { id: 'done-old', title: 'Alt erledigt', status: 'done', createdAt: 1, due: '2026-10-01', starred: false },
    ])
  })

  it('migrates data without a version field', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tasks: [{ id: 'z', title: 'Ganz alt', done: false, createdAt: 1 }] }),
    )
    expect(loadState()).toEqual({
      version: 2,
      tasks: [{ id: 'z', title: 'Ganz alt', status: 'todo', createdAt: 1, due: null, starred: false }],
    })
  })

  it('does not mutate its input', () => {
    const input: TaskV1[] = [
      { id: 'b', title: 'B', done: false, createdAt: 1, due: null, starred: false },
      { id: 'a', title: 'A', done: false, createdAt: 2, due: null, starred: false },
    ]
    const copy = structuredClone(input)
    expect(migrateV1toV2(input).map((t) => t.id)).toEqual(['a', 'b'])
    expect(input).toEqual(copy)
  })
})

describe('saveState', () => {
  it('stores the state so that loadState returns it after a reload', () => {
    const other: Task = { ...task, id: 'b', status: 'done', due: null, starred: false }
    const doing: Task = { ...task, id: 'c', status: 'doing', starred: false }
    saveState({ version: CURRENT_VERSION, tasks: [task, other, doing] })
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual({
      version: 2,
      tasks: [task, other, doing],
    })
    expect(loadState()).toEqual({ version: 2, tasks: [task, other, doing] })
  })
})
