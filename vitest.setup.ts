import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// jsdom kennt diese Browser-Funktionen nicht. sonner, motion und Radix brauchen sie.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

class IntersectionObserverMock {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
globalThis.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver

Element.prototype.scrollIntoView = vi.fn()
HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext

afterEach(() => {
  cleanup()
  localStorage.clear()
})
