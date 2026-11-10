import { useId, useRef, useState, type FormEvent, type KeyboardEvent, type RefObject } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { parseDue } from '@/lib/date'
import { cn } from '@/lib/utils'

type TaskInputProps = {
  onAdd: (title: string, due: string | null) => boolean
  titleRef: RefObject<HTMLInputElement | null>
}

const fieldClass = 'h-14 border-0 bg-transparent px-4 text-lg shadow-none focus-visible:ring-0'

export function TaskInput({ onAdd, titleRef }: TaskInputProps) {
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [shaking, setShaking] = useState(false)
  const [dueInvalid, setDueInvalid] = useState(false)
  const titleInput = titleRef
  const dueInput = useRef<HTMLInputElement>(null)
  const hintId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = title.trim()
    if (text === '') {
      setShaking(true)
      titleInput.current?.focus()
      return
    }
    const parsed = parseDue(due)
    if (!parsed.ok) {
      setShaking(true)
      setDueInvalid(true)
      dueInput.current?.focus()
      return
    }
    if (onAdd(text, parsed.due)) {
      setTitle('')
      setDue('')
      setDueInvalid(false)
    }
    titleInput.current?.focus()
  }

  function handleTitleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setTitle('')
      event.currentTarget.blur()
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <form
        onSubmit={handleSubmit}
        onAnimationEnd={() => setShaking(false)}
        className={cn(
          'glass flex flex-wrap items-center gap-2 rounded-2xl border p-2 shadow-card',
          shaking && 'animate-shake',
        )}
      >
        <Input
          ref={titleInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder="Was steht an?"
          aria-label="Neue Aufgabe"
          maxLength={200}
          className={cn(fieldClass, 'min-w-48 flex-1')}
        />
        <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
          <Input
            ref={dueInput}
            value={due}
            onChange={(e) => {
              setDue(e.target.value)
              setDueInvalid(false)
            }}
            placeholder="TT.MM.JJJJ"
            aria-label="Frist (optional)"
            inputMode="numeric"
            aria-invalid={dueInvalid || undefined}
            aria-describedby={dueInvalid ? hintId : undefined}
            className={cn(fieldClass, 'w-40 flex-1 sm:flex-none')}
          />
          <Button
            type="submit"
            size="icon"
            className="size-12 shrink-0 rounded-xl bg-primary text-primary-foreground transition-look hover:scale-105 active:scale-95"
            aria-label="Aufgabe hinzufügen"
          >
            <Plus className="size-6" />
          </Button>
        </div>
      </form>
      {dueInvalid && (
        <p id={hintId} className="px-4 text-sm text-foreground">
          Bitte als TT.MM.JJJJ eingeben
        </p>
      )}
    </div>
  )
}
