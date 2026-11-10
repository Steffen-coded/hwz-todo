import { useId, useRef } from 'react'
import { Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import type { Task } from '@/features/tasks/model'
import { celebrate } from '@/lib/celebrate'
import { formatDue } from '@/lib/date'

type FocusTileProps = {
  /** The task from selectFocus, or null when nothing is open. */
  task: Task | null
  overdue: boolean
  onToggle: (id: string) => void
  onToggleStar: (id: string) => void
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

export function FocusTile({ task, overdue, onToggle, onToggleStar }: FocusTileProps) {
  const labelId = useId()
  const checkboxRef = useRef<HTMLButtonElement>(null)

  function handleToggle() {
    if (!task) return
    if (task.status !== 'done') celebrate(originOf(checkboxRef.current))
    onToggle(task.id)
  }

  return (
    <section
      aria-labelledby={labelId}
      className="glass flex min-w-0 flex-col gap-3 rounded-2xl border-2 p-6 shadow-pop transition-look"
    >
      <h2 id={labelId} className="font-heading text-sm text-muted-foreground">
        Nächster Schritt
      </h2>
      {task ? (
        <div className="flex min-w-0 items-start gap-3">
          <Checkbox
            key={task.id}
            ref={checkboxRef}
            checked={task.status === 'done'}
            onCheckedChange={handleToggle}
            aria-label={`Nächster Schritt «${task.title}» erledigt`}
            className="mt-1.5 size-6 rounded-md transition-look data-[state=checked]:animate-pop data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="min-w-0 break-words [overflow-wrap:anywhere] font-heading text-2xl leading-snug">
              {task.title}
            </p>
            {task.due !== null && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">{formatDue(task.due)}</span>
                {overdue && <Badge variant="destructive">Überfällig</Badge>}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Nächster Schritt «${task.title}» als Fokus markieren`}
            aria-pressed={task.starred}
            onClick={() => onToggleStar(task.id)}
            className="size-11"
          >
            <Star className={cn('size-4', task.starred && 'fill-current')} />
          </Button>
        </div>
      ) : (
        <p className="font-heading text-xl">Alles erledigt. Zeit für Kaffee.</p>
      )}
    </section>
  )
}
