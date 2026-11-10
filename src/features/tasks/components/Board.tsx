import { useMemo, useState } from 'react'
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type ClientRect,
  type DragStartEvent,
  type ScreenReaderInstructions,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { AnimatePresence } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { TaskCard, TaskCardOverlay } from '@/features/tasks/components/TaskCard'
import {
  isTaskOverdue,
  resolveDrop,
  STATUSES,
  tasksByStatus,
  type Status,
  type Task,
} from '@/features/tasks/model'
import { celebrate } from '@/lib/celebrate'
import { todayIso } from '@/lib/date'
import { cn } from '@/lib/utils'

const COLUMN_TITLES: Record<Status, string> = {
  todo: 'Offen',
  doing: 'In Arbeit',
  done: 'Erledigt',
}

export const DRAG_INSTRUCTIONS =
  'Leertaste zum Aufnehmen. Pfeiltasten zum Verschieben. Leertaste zum Ablegen, Esc zum Abbrechen.'

const SCREEN_READER_INSTRUCTIONS: ScreenReaderInstructions = { draggable: DRAG_INSTRUCTIONS }

/** German screen reader texts for dnd-kit, built from the current tasks. */
// eslint-disable-next-line react-refresh/only-export-components
export function buildAnnouncements(tasks: Task[]): Announcements {
  const find = (id: UniqueIdentifier) => tasks.find((t) => t.id === String(id))
  const title = (id: UniqueIdentifier) => find(id)?.title ?? ''
  const cancelled = (id: UniqueIdentifier) => {
    const status = find(id)?.status ?? 'todo'
    return `Verschieben abgebrochen. Karte «${title(id)}» bleibt in «${COLUMN_TITLES[status]}».`
  }
  return {
    onDragStart: ({ active }) => `Karte «${title(active.id)}» aufgenommen.`,
    onDragOver: ({ active, over }) => {
      const drop = resolveDrop(tasks, String(active.id), over ? String(over.id) : null)
      if (!drop) return 'Ausserhalb einer Spalte.'
      return `Über Spalte «${COLUMN_TITLES[drop.toStatus]}», Position ${drop.toIndex + 1}.`
    },
    onDragEnd: ({ active, over }) => {
      const drop = resolveDrop(tasks, String(active.id), over ? String(over.id) : null)
      if (!drop) return cancelled(active.id)
      return `Karte «${title(active.id)}» in «${COLUMN_TITLES[drop.toStatus]}» abgelegt.`
    },
    onDragCancel: ({ active }) => cancelled(active.id),
  }
}

/** Center of the dropped card as a fraction of the window, for canvas-confetti. */
function originOf(rect: ClientRect | null): { x: number; y: number } {
  if (!rect) return { x: 0.5, y: 0.5 }
  return {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  }
}

type BoardProps = {
  tasks: Task[]
  onToggle: (id: string) => void
  onToggleStar: (id: string) => void
  onDelete: (id: string) => void
  onMove: (id: string, toStatus: Status, toIndex: number) => void
}

type ColumnProps = Omit<BoardProps, 'tasks' | 'onMove'> & {
  status: Status
  column: Task[]
  today: string
}

function BoardColumn({ status, column, today, onToggle, onToggleStar, onDelete }: ColumnProps) {
  const ids = column.map((t) => t.id)
  const { setNodeRef, isOver, over } = useDroppable({ id: status })
  const highlighted = isOver || (over !== null && ids.includes(String(over.id)))
  const headingId = `column-${status}`
  return (
    <section
      ref={setNodeRef}
      aria-labelledby={headingId}
      className={cn(
        'glass flex min-h-64 w-[85vw] shrink-0 snap-center flex-col gap-3 rounded-2xl border p-3 transition-look md:w-auto',
        highlighted && 'glow scale-[1.01]',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 id={headingId} className="font-heading text-lg">
          {COLUMN_TITLES[status]}
        </h2>
        <Badge variant="secondary" className="font-mono">
          {column.length}
        </Badge>
      </div>
      <SortableContext id={status} items={ids} strategy={verticalListSortingStrategy}>
        <ul className="flex min-w-0 flex-col gap-3">
          <AnimatePresence initial={false} mode="popLayout">
            {column.map((task) => (
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
      </SortableContext>
      {column.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-ring/60 p-6 text-center text-muted-foreground">
          Hierher ziehen
        </div>
      )}
    </section>
  )
}

export function Board({ tasks, onToggle, onToggleStar, onDelete, onMove }: BoardProps) {
  const today = todayIso()
  const [activeId, setActiveId] = useState<string | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const announcements = useMemo(() => buildAnnouncements(tasks), [tasks])
  const activeTask = activeId === null ? null : (tasks.find((t) => t.id === activeId) ?? null)

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(String(active.id))
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null)
    const id = String(active.id)
    const drop = resolveDrop(tasks, id, over ? String(over.id) : null)
    if (!drop) return
    const wasDone = tasks.find((t) => t.id === id)?.status === 'done'
    if (!wasDone && drop.toStatus === 'done') celebrate(originOf(active.rect.current.translated))
    onMove(id, drop.toStatus, drop.toIndex)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      accessibility={{ announcements, screenReaderInstructions: SCREEN_READER_INSTRUCTIONS }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible">
        {STATUSES.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            column={tasksByStatus(tasks, status)}
            today={today}
            onToggle={onToggle}
            onToggleStar={onToggleStar}
            onDelete={onDelete}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCardOverlay task={activeTask} overdue={isTaskOverdue(activeTask, today)} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
