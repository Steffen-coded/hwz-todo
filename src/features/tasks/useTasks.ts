import { useCallback, useEffect, useState } from 'react'
import * as model from '@/features/tasks/model'
import type { Status, Task } from '@/features/tasks/model'
import { CURRENT_VERSION, loadState, saveState } from '@/lib/storage'

export type RemovedTask = { task: Task; index: number }

/** Connects model.ts with storage.ts. Saves after every change. */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => loadState().tasks)

  useEffect(() => {
    saveState({ version: CURRENT_VERSION, tasks })
  }, [tasks])

  /** Returns false if the title was blank and nothing was added. */
  const addTask = useCallback(
    (title: string, due: string | null = null): boolean => {
      if (title.trim() === '') return false
      setTasks((current) => model.addTask(current, title, due))
      return true
    },
    [],
  )

  const toggleTask = useCallback((id: string) => {
    setTasks((current) => model.toggleTask(current, id))
  }, [])

  const toggleStar = useCallback((id: string) => {
    setTasks((current) => model.toggleStar(current, id))
  }, [])

  /** Removes a task and returns it with its old index, for «Rückgängig». */
  const removeTask = useCallback(
    (id: string): RemovedTask | null => {
      const index = tasks.findIndex((t) => t.id === id)
      if (index === -1) return null
      const task = tasks[index]
      setTasks((current) => model.removeTask(current, id))
      return { task, index }
    },
    [tasks],
  )

  const restoreTask = useCallback((task: Task, index: number) => {
    setTasks((current) => model.restoreTask(current, task, index))
  }, [])

  const moveTask = useCallback((id: string, toStatus: Status, toIndex: number) => {
    setTasks((current) => model.moveTask(current, id, toStatus, toIndex))
  }, [])

  return { tasks, addTask, toggleTask, toggleStar, removeTask, restoreTask, moveTask }
}
