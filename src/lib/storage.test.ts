import { describe, expect, it } from 'vitest'
import { CURRENT_VERSION, STORAGE_KEY, loadState, saveState } from '@/lib/storage'
import type { Task } from '@/features/tasks/model'

const task: Task = {
  id: 'a',
  title: 'Steuererklärung',
  done: false,
  createdAt: 1,
  due: '2027-03-31',
  starred: true,
}

describe('loadState', () => {
  it('returns an empty list when nothing is stored', () => {
    expect(loadState()).toEqual({ version: CURRENT_VERSION, tasks: [] })
  })

  it('returns an empty list for broken JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{kaputt')
    expect(loadState()).toEqual({ version: 1, tasks: [] })
  })

  it('returns an empty list for a wrong shape', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks: 'nope' }))
    expect(loadState()).toEqual({ version: 1, tasks: [] })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(42))
    expect(loadState()).toEqual({ version: 1, tasks: [] })
  })

  it('fills missing due and starred fields', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, tasks: [{ id: 'b', title: 'Alt', done: true, createdAt: 2 }] }),
    )
    expect(loadState().tasks).toEqual([
      { id: 'b', title: 'Alt', done: true, createdAt: 2, due: null, starred: false },
    ])
  })

  it('drops entries that are not tasks', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, tasks: [task, { foo: 1 }, null] }))
    expect(loadState().tasks).toEqual([task])
  })
})

describe('saveState', () => {
  it('stores the state so that loadState returns it after a reload', () => {
    const other: Task = { ...task, id: 'b', done: true, due: null, starred: false }
    saveState({ version: 1, tasks: [task, other] })
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '')).toEqual({
      version: 1,
      tasks: [task, other],
    })
    expect(loadState()).toEqual({ version: 1, tasks: [task, other] })
  })
})
