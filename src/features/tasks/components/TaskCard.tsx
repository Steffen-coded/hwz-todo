import { useRef } from 'react'
import { Star, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Task } from '@/features/tasks/model'
import { celebrate } from '@/lib/celebrate'
import { formatDue } from '@/lib/date'

type TaskCardProps = {
  task: Task
  overdue: boolean
  onToggle: (id: string) => void
  onToggleStar: (id: string) => void
  onDelete: (id: string) => void
}

/** Center of an element as a fraction of the window, for canvas-confetti. */
function originOf(element: HTMLElement | null): { x: number; y: number } {
  if (!element) return { x: 0.5, y: 0.5 }
  const rect = element.getBoundingClientRect()
  return {
    x: (rect.left + rect.width / 2) / window.innerWidth,
    y: (rect.top + rect.height / 2) / window.innerHeight,
  }
}

export function TaskCard({ task, overdue, onToggle, onToggleStar, onDelete }: TaskCardProps) {
  const checkboxRef = useRef<HTMLButtonElement>(null)

  function handleToggle() {
    if (!task.done) celebrate(originOf(checkboxRef.current))
    onToggle(task.id)
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      className={cn(
        'group glass flex min-w-0 items-start gap-3 rounded-xl border p-4 shadow-card transition-look hover:-translate-y-0.5 hover:shadow-pop focus-within:glow',
        overdue && 'glow',
      )}
    >
      <Checkbox
        ref={checkboxRef}
        checked={task.done}
        onCheckedChange={handleToggle}
        aria-label={`«${task.title}» erledigt`}
        className="mt-0.5 size-6 rounded-md transition-look data-[state=checked]:animate-pop data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={cn(
            'relative min-w-0 flex-1 break-words [overflow-wrap:anywhere] text-base leading-relaxed',
            task.done && 'text-muted-foreground',
          )}
        >
          {task.title}
          <motion.span
            aria-hidden
            className="absolute left-0 top-1/2 h-0.5 w-full origin-left bg-current"
            initial={false}
            animate={{ scaleX: task.done ? 1 : 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </span>
        {task.due !== null && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{formatDue(task.due)}</span>
            {overdue && <Badge variant="destructive">Überfällig</Badge>}
          </div>
        )}
      </div>
      {!task.done && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`«${task.title}» als Fokus markieren`}
          aria-pressed={task.starred}
          onClick={() => onToggleStar(task.id)}
          className="size-11"
        >
          <Star className={cn('size-4', task.starred && 'fill-current')} />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        aria-label={`«${task.title}» löschen`}
        onClick={() => onDelete(task.id)}
        className="size-11 opacity-60 transition-look group-hover:opacity-100 focus-visible:opacity-100"
      >
        <Trash2 className="size-4" />
      </Button>
    </motion.li>
  )
}
