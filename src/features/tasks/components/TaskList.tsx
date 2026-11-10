import { AnimatePresence } from 'motion/react'
import { TaskCard } from '@/features/tasks/components/TaskCard'
import { isTaskOverdue, sortTasks, type Task } from '@/features/tasks/model'
import { todayIso } from '@/lib/date'

type TaskListProps = {
  tasks: Task[]
  onToggle: (id: string) => void
  onToggleStar: (id: string) => void
  onDelete: (id: string) => void
}

export function TaskList({ tasks, onToggle, onToggleStar, onDelete }: TaskListProps) {
  const today = todayIso()
  const sorted = sortTasks(tasks)
  return (
    <ul className="flex flex-col gap-3">
      <AnimatePresence initial={false} mode="popLayout">
        {sorted.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            overdue={isTaskOverdue(task, today)}
            onToggle={onToggle}
            onToggleStar={onToggleStar}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </ul>
  )
}
