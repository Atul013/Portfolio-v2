import { motion, useScroll, useSpring } from 'framer-motion'
import { useStillness } from '../hooks'

/**
 * Reading-progress hairline pinned under the navbar.
 *
 * Justification: this page is one long scroll with seven sections and an
 * expandable project list, so "how much is left" is real information, not
 * decoration. Driven straight off the scroll motion value via scaleX, so it
 * costs one composited transform per frame and zero React renders.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const still = useStillness()

  // A touch of spring keeps the bar from twitching on trackpad scroll.
  // Under reduced motion it tracks scroll exactly, with no easing.
  const smooth = useSpring(scrollYProgress, { stiffness: 240, damping: 34, restDelta: 0.001 })
  const scaleX = still ? scrollYProgress : smooth

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX }}
      aria-hidden="true"
    />
  )
}
