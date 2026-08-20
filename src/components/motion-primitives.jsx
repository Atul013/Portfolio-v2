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

/**
 * Per-letter weight response to cursor proximity.
 *
 * Letters near the pointer interpolate from `from` to `to` on the font's
 * `wght` axis, falling off with distance. Requires a variable font — Archivo
 * is loaded across `wght@100..900` for exactly this.
 *
 * The whole loop runs on refs and writes styles directly to the letter nodes:
 * a pointer sweep across the name costs one style write per letter per frame,
 * never a React render. The rAF loop is only mounted on fine pointers with
 * motion allowed, so touch devices and reduced-motion users pay nothing.
 *
 * `label` is rendered once visibly (split, aria-hidden) and once flat for
 * screen readers, so the split never reaches the accessibility tree.
 */
export function VariableProximity({
  label,
  from = 400,
  to = 900,
  radius = 160,
  falloff = 'gaussian',
  className = '',
  style,
  ...rest
}) {
  const containerRef = useRef(null)
  const letterRefs = useRef([])
  const still = useStillness()

  const [fine, setFine] = useState(false)
  useEffect(() => {
    setFine(window.matchMedia('(pointer: fine) and (hover: hover)').matches)
  }, [])

  const active = fine && !still

  useEffect(() => {
    if (!active) return

    // Pointer position is tracked in a ref and read by the loop, so moving the
    // mouse never schedules a render on its own.
    const pointer = { x: 0, y: 0, seen: false }
    const onMove = (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.seen = true }
    window.addEventListener('pointermove', onMove, { passive: true })

    const weightAt = (dist) => {
      const norm = Math.min(Math.max(1 - dist / radius, 0), 1)
      if (falloff === 'exponential') return norm ** 2
      if (falloff === 'gaussian') return Math.exp(-((dist / (radius / 2)) ** 2) / 2)
      return norm
    }

    let frameId
    let last = { x: null, y: null }

    const loop = () => {
      frameId = requestAnimationFrame(loop)
      if (!pointer.seen) return
      // Skip the whole pass when the pointer has not moved since last frame.
      if (last.x === pointer.x && last.y === pointer.y) return
      last = { x: pointer.x, y: pointer.y }

      for (const el of letterRefs.current) {
        if (!el) continue
        const r = el.getBoundingClientRect()
        // Fully offscreen letters cannot be near the cursor; skip the math.
        if (r.bottom < 0 || r.top > window.innerHeight) continue

        const dx = pointer.x - (r.left + r.width / 2)
        const dy = pointer.y - (r.top + r.height / 2)
        const dist = Math.hypot(dx, dy)

        const w = dist >= radius ? from : from + (to - from) * weightAt(dist)
        el.style.fontVariationSettings = `'wght' ${Math.round(w)}`
      }
    }
    frameId = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frameId)
      // Leave the letters at the resting weight rather than mid-interpolation.
      for (const el of letterRefs.current) {
        if (el) el.style.fontVariationSettings = `'wght' ${from}`
      }
    }
  }, [active, from, to, radius, falloff])

  // Without the effect running there is nothing to split: render flat text so
  // the markup stays minimal and the font keeps its CSS-declared weight.
  if (!active) {
    return <span ref={containerRef} className={className} style={style} {...rest}>{label}</span>
  }

  letterRefs.current = []

  return (
    <span ref={containerRef} className={className} style={style} {...rest}>
      <span aria-hidden="true">
        {label.split('').map((ch, i) => (
          <span
            key={i}
            ref={(el) => { letterRefs.current[i] = el }}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              fontVariationSettings: `'wght' ${from}`,
            }}
          >
            {ch}
          </span>
        ))}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  )
}
