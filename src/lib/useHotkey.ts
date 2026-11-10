import { useEffect, useRef } from 'react'

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.matches('input, textarea, [contenteditable]') || target.isContentEditable
}

/** Calls onPress when the key is pressed outside of input fields. */
export function useHotkey(key: string, onPress: () => void) {
  const handler = useRef(onPress)

  useEffect(() => {
    handler.current = onPress
  }, [onPress])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (event.key.toLowerCase() !== key.toLowerCase()) return
      if (isEditable(event.target)) return
      event.preventDefault()
      handler.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key])
}
