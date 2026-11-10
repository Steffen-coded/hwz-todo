import confetti from 'canvas-confetti'
import { readConfettiColors } from '@/lib/theme'

/** Small confetti burst in the look's colors. origin is relative to the window (0–1). */
export function celebrate(origin: { x: number; y: number }): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  void confetti({
    particleCount: 40,
    spread: 60,
    startVelocity: 25,
    scalar: 0.8,
    ticks: 120,
    colors: readConfettiColors(),
    origin,
  })
}
