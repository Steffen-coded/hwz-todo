import { useRef } from 'react'
import { MotionConfig } from 'motion/react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ProgressRing } from '@/components/ProgressRing'
import { EmptyState } from '@/features/tasks/components/EmptyState'
import { FocusTile } from '@/features/tasks/components/FocusTile'
import { TaskInput } from '@/features/tasks/components/TaskInput'
import { Board } from '@/features/tasks/components/Board'
import { isTaskOverdue, selectFocus } from '@/features/tasks/model'
import { useTasks } from '@/features/tasks/useTasks'
import { todayIso } from '@/lib/date'
import { useHotkey } from '@/lib/useHotkey'

const todayLabel = new Intl.DateTimeFormat('de-CH', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export default function App() {
  const { tasks, addTask, toggleTask, toggleStar, removeTask, restoreTask, moveTask } = useTasks()
  const titleRef = useRef<HTMLInputElement>(null)
  useHotkey('n', () => titleRef.current?.focus())
  const focus = selectFocus(tasks)
  const doneCount = tasks.filter((t) => t.status === 'done').length

  function handleDelete(id: string) {
    const removed = removeTask(id)
    if (!removed) return
    toast('Aufgabe gelöscht', {
      action: { label: 'Rückgängig', onClick: () => restoreTask(removed.task, removed.index) },
      duration: 5000,
    })
  }

  return (
    <MotionConfig reducedMotion="user">
      <TooltipProvider>
        <main className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-16">
          <header className="flex items-center justify-between gap-6">
            <div className="min-w-0">
              <h1 className="text-gradient font-heading text-4xl font-bold tracking-tight sm:text-6xl">
                Meine Aufgaben
              </h1>
              <p className="mt-2 text-muted-foreground">{todayLabel.format(new Date())}</p>
            </div>
            <ProgressRing done={doneCount} total={tasks.length} />
          </header>
          {tasks.length > 0 && (
            <FocusTile
              task={focus}
              overdue={focus !== null && isTaskOverdue(focus, todayIso())}
              onToggle={toggleTask}
              onToggleStar={toggleStar}
            />
          )}
          <TaskInput onAdd={addTask} titleRef={titleRef} />
          {tasks.length > 0 ? (
            <Board
              tasks={tasks}
              onToggle={toggleTask}
              onToggleStar={toggleStar}
              onDelete={handleDelete}
              onMove={moveTask}
            />
          ) : (
            <EmptyState />
          )}
        </main>
        <Toaster position="bottom-center" richColors closeButton />
      </TooltipProvider>
    </MotionConfig>
  )
}
