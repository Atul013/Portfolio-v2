import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion'
import { useStillness } from '../hooks'

/*
  Shared motion primitives.

  Each section used to hand-roll its own `fadeUp` helper, which drifted apart
  over time and none of which honoured reduced motion. These are the single
  source of truth. Every one degrades to a static or instant state when the
  reader has asked for less motion.
*/

const EASE_OUT = [0.16, 1, 0.3, 1]

/**
 * Scroll reveal. `once` by default: re-animating on every pass reads as jitter,
 * not motion, and re-triggers on scroll-up feel like a bug to the reader.
 */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  duration = 0.7,
  className = '',
  as = 'div',
  ...rest
}) {
  const still = useStillness()
  const Tag = motion[as] ?? motion.div

  if (still) {
    const Static = as
    return <Static className={className} {...rest}>{children}</Static>
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: EASE_OUT }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/**
 * Reveal a list with a stagger. Staggering one list is legitimate: it matches
 * reading order. Use it for lists, not for every section on the page.
 */
export function RevealList({ children, step = 0.06, className = '', ...rest }) {
  const still = useStillness()

  if (still) return <div className={className} {...rest}>{children}</div>

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ visible: { transition: { staggerChildren: step } } }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, y = 18, className = '', ...rest }) {
  const still = useStillness()
  if (still) return <div className={className} {...rest}>{children}</div>

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT } },
      }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/**
 * Magnetic hover: the element leans toward the cursor and springs back.
 *
 * Position is held in motion values, never React state, so a pointer sweep
 * costs composited transforms instead of a re-render per frame. Disabled
 * outright on coarse pointers, where there is no hover to respond to.
 */
export function Magnetic({ children, strength = 0.32, radius = 90, className = '', ...rest }) {
  const ref = useRef(null)
  const still = useStillness()

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 260, damping: 18, mass: 0.4 })
  const y = useSpring(my, { stiffness: 260, damping: 18, mass: 0.4 })

  const [fine, setFine] = useState(false)
  useEffect(() => {
    setFine(window.matchMedia('(pointer: fine) and (hover: hover)').matches)
  }, [])

  const onMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    const dist = Math.hypot(dx, dy)
    // Falls off with distance, so the pull eases in rather than snapping.
    const falloff = Math.max(0, 1 - dist / (radius + Math.max(r.width, r.height) / 2))
    mx.set(dx * strength * falloff)
    my.set(dy * strength * falloff)
  }, [mx, my, strength, radius])

  const onLeave = useCallback(() => { mx.set(0); my.set(0) }, [mx, my])

  if (still || !fine) {
    return <div ref={ref} className={className} {...rest}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>[]{}=+*#%$&'

/**
 * Decode-on-reveal for section headings.
 *
 * Justified by register, not novelty: this is a security-and-systems portfolio,
 * and a resolving-cipher heading states that in the type itself. Used only on
 * section labels, never on body copy, and never on a loop.
 *
 * Renders the final text immediately under reduced motion, and always keeps the
 * real string in the DOM for screen readers.
 */
export function Scramble({ text, className = '', speed = 34, as: Tag = 'span' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const still = useStillness()
  const [display, setDisplay] = useState(still ? text : '')

  useEffect(() => {
    if (still) { setDisplay(text); return }
    if (!inView) return

    let frame = 0
    let timer
    const total = text.length * 3

    const tick = () => {
      const revealed = Math.floor(frame / 3)
      let out = ''
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') { out += ' '; continue }
        if (i < revealed) out += text[i]
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }
      setDisplay(out)
      frame += 1
      if (frame <= total) timer = setTimeout(tick, speed)
      else setDisplay(text)
    }
    tick()

    return () => clearTimeout(timer)
  }, [inView, text, speed, still])

  return (
    <Tag ref={ref} className={className}>
      <span aria-hidden="true">{display || text}</span>
      <span className="sr-only">{text}</span>
    </Tag>
  )
}
