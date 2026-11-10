export function readConfettiColors(): string[] {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--confetti')
  return raw.split(',').map((c) => c.trim()).filter(Boolean)
}
