import { useState } from 'react'
import { useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion'

/**
 * Scroll utilities built on Motion's scroll motion value.
 *
 * These deliberately avoid `window.addEventListener('scroll')`: that fires on
 * every scroll frame, unbatched, and calling setState from it re-renders the
 * React tree continuously. Motion reads scroll off a single rAF-batched
 * listener, and the hooks below only call setState when a *boolean flips* —
 * so a full scroll of the page costs a handful of renders, not hundreds.
 */

/** True once the page has scrolled past `threshold` px. Flips at most twice per pass. */
export function useScrolledPast(threshold = 50) {
  const { scrollY } = useScroll()
  const [past, setPast] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const next = y > threshold
    setPast((cur) => (cur === next ? cur : next))
  })

  return past
}

/**
 * Current scroll direction, 'up' | 'down'.
 * `deadzone` ignores sub-pixel jitter and trackpad rubber-banding.
 */
export function useScrollDirection(deadzone = 6) {
  const { scrollY } = useScroll()
  const [dir, setDir] = useState('down')

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    const delta = y - prev
    if (Math.abs(delta) < deadzone) return
    const next = delta > 0 ? 'down' : 'up'
    setDir((cur) => (cur === next ? cur : next))
  })

  return dir
}

/**
 * Motion's reduced-motion preference, but never `null`.
 * Motion returns null before hydration; treat that as "motion allowed" so the
 * first paint isn't a flash of the static fallback.
 */
export function useStillness() {
  return useReducedMotion() === true
}
