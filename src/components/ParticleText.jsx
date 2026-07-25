import { useEffect, useRef } from 'react'

/*
  ParticleText — cursor-attraction particle text.

  Physics:
  - Radial attraction: pulls particles toward the pointer
  - Inner repel zone: pushes particles sideways once they get too close, which
    creates the visible void and the natural swirl (no explicit tangential force)
  - Ring/vortex comes from pointer circular motion: the pointer outruns the
    particles, so they trail its circular path
  - Spring: slowly returns particles to their text origin (~3-4 s)
  - Per-particle spring variation: staggered return reads as layered depth

  Runs on touch as well as mouse, and parks itself when the hero scrolls away.
*/

// Must match the display face in index.css, since canvas can't read CSS vars.
const CANVAS_FONT = "700 %SIZE%px 'Archivo', sans-serif"

const BASE_CFG = {
  R:        200,   // pointer influence radius
  innerR:   24,    // repel void at the pointer tip; larger = bigger gap + more swirl
  atF:      0.14,  // radial attraction strength
  repelF:   7,     // push-back right at innerR
  spring:   0.006, // very weak spring, so the trail persists 3-4 s before dissolving
  friction: 0.96,  // high but not extreme: trail persists without exploding
  dotRMin:  0.15,
  dotRMax:  0.85,
}

export default function ParticleText({
  lines       = ['ATUL', 'BIJU.'],
  color       = '#f0ece4',
  accentLine  = 1,
  accentColor = '#b5fd4f',
}) {
  const canvasRef = useRef(null)
  const spacerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const spacer = spacerRef.current
    if (!canvas || !spacer) return

    // Hoist the canvas to #hero so particles can roam the whole section.
    const hero = document.getElementById('hero')
    if (!hero) return

    hero.appendChild(canvas)
    Object.assign(canvas.style, {
      position:      'absolute',
      top:           '0',
      left:          '0',
      width:         '100%',
      height:        '100%',
      pointerEvents: 'none',
      zIndex:        '1',
    })

    const c   = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    // Per-instance copy. The previous version mutated a module-level object for
    // reduced motion, which leaked that state into every later mount.
    const cfg = { ...BASE_CFG }
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (still) {
      cfg.spring = 0.22
      cfg.friction = 0.94
      cfg.atF = 0
      cfg.repelF = 0
    }

    let particles = []
    let mouse     = { x: -9999, y: -9999 }
    let raf       = null
    let running   = false

    /* ── Build: sample text, emit particles with hero-relative origins ── */
    const build = () => {
      const heroW = hero.offsetWidth
      const heroH = hero.offsetHeight
      if (!heroW || !heroH) return

      canvas.width  = Math.round(heroW * dpr)
      canvas.height = Math.round(heroH * dpr)
      c.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Sampling stride. Coarser on small screens: fewer, slightly larger dots
      // keep the silhouette readable while cutting particle count hard.
      const SPACING = heroW <= 768 ? 3.4 : 1.8

      // Where does the text area sit inside the hero?
      const heroRect   = hero.getBoundingClientRect()
      const spacerRect = spacer.getBoundingClientRect()
      const textX      = spacerRect.left - heroRect.left
      const textY      = spacerRect.top  - heroRect.top

      const W        = spacerRect.width
      if (!W) return
      const fontSize = Math.min(W * 0.195, 215)
      const lineH    = fontSize * 1.08
      const textH    = lineH * lines.length + fontSize * 0.18

      spacer.style.height = `${textH}px`

      // Sample the text on a small offscreen canvas.
      const off = document.createElement('canvas')
      off.width  = Math.round(W     * dpr)
      off.height = Math.round(textH * dpr)
      const oc   = off.getContext('2d', { willReadFrequently: true })
      oc.scale(dpr, dpr)
      oc.font         = CANVAS_FONT.replace('%SIZE%', fontSize)
      oc.textAlign    = 'left'
      oc.textBaseline = 'top'
      oc.fillStyle    = '#fff'
      lines.forEach((line, i) => oc.fillText(line, 0, i * lineH))

      const { data } = oc.getImageData(0, 0, off.width, off.height)
      const halfS    = SPACING * 0.5

      particles = []
      for (let y = 0; y < textH; y += SPACING) {
        for (let x = 0; x < W; x += SPACING) {
          const sx = x + (Math.random() - 0.5) * halfS * 2
          const sy = y + (Math.random() - 0.5) * halfS * 2
          const ix = Math.round(Math.max(0, Math.min(W     - 1, sx)) * dpr)
          const iy = Math.round(Math.max(0, Math.min(textH - 1, sy)) * dpr)

          if (data[(iy * off.width + ix) * 4 + 3] > 120) {
            const li = Math.floor(sy / lineH)
            const ox = textX + sx
            const oy = textY + sy
            particles.push({
              x:   ox + (Math.random() - 0.5) * 160,
              y:   oy + (Math.random() - 0.5) * 160,
              ox,  oy,
              vx:  (Math.random() - 0.5) * 4,
              vy:  (Math.random() - 0.5) * 4,
              r:   cfg.dotRMin + Math.random() * (cfg.dotRMax - cfg.dotRMin),
              // Per-particle spring: different return rates, layered rings
              sp:  cfg.spring * (0.4 + Math.random() * 1.2),
              col: li === accentLine ? accentColor : color,
            })
          }
        }
      }
    }

    /* ── Animation loop ── */
    const loop = () => {
      const heroW = hero.offsetWidth
      const heroH = hero.offsetHeight
      c.clearRect(0, 0, heroW, heroH)

      const mx     = mouse.x
      const my     = mouse.y
      const active = mx > -9000
      const grps   = {}

      for (const p of particles) {
        if (active) {
          const dx = mx - p.x
          const dy = my - p.y
          const d2 = dx * dx + dy * dy

          if (d2 < cfg.R * cfg.R && d2 > 0.001) {
            const d = Math.sqrt(d2)
            const t = 1 - d / cfg.R   // linear influence falloff

            if (d < cfg.innerR) {
              // Repel at the pointer tip: opens the void and deflects particles
              // sideways, which is what produces the swirl.
              const f = (1 - d / cfg.innerR) * cfg.repelF
              p.vx -= (dx / d) * f
              p.vy -= (dy / d) * f
            } else {
              // Pure radial attraction. The ring forms when the pointer circles
              // faster than the particles can follow.
              p.vx += (dx / d) * cfg.atF * t
              p.vy += (dy / d) * cfg.atF * t
            }
          }
        }

        // Spring back to origin (per-particle stiffness, staggered decay)
        p.vx += (p.ox - p.x) * p.sp
        p.vy += (p.oy - p.y) * p.sp

        p.vx *= cfg.friction
        p.vy *= cfg.friction
        p.x  += p.vx
        p.y  += p.vy

        ;(grps[p.col] ??= []).push(p)
      }

      // One path per colour: 2 GPU flushes total regardless of particle count.
      for (const [col, ps] of Object.entries(grps)) {
        c.fillStyle = col
        c.beginPath()
        for (const p of ps) {
          c.moveTo(p.x + p.r, p.y)
          c.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        }
        c.fill()
      }

      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      if (running) return
      running = true
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    /* ── CSS var → hex (canvas fillStyle can't take var()) ── */
    const resolveColor = (raw) => {
      if (!raw.startsWith('var(')) return raw
      const name = raw.match(/var\(\s*(--[\w-]+)\s*\)/)?.[1]
      if (!name) return raw
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || raw
    }
    const resolvedAccent = resolveColor(accentColor)
    const patchAccent = () => {
      for (const p of particles) {
        if (p.col === accentColor) p.col = resolvedAccent
      }
    }

    let cancelled = false
    document.fonts.ready.then(() => {
      if (cancelled) return
      build(); patchAccent(); start()
    })

    /* ── Pointer: one path for mouse and touch ── */
    const setFromEvent = (clientX, clientY) => {
      const r = canvas.getBoundingClientRect()
      mouse = { x: clientX - r.left, y: clientY - r.top }
    }
    const onPointerMove = (e) => setFromEvent(e.clientX, e.clientY)
    const onPointerGone = () => { mouse = { x: -9999, y: -9999 } }

    // Touch drags the field around; lifting the finger lets it spring home.
    const onTouchMove = (e) => {
      const t = e.touches[0]
      if (t) setFromEvent(t.clientX, t.clientY)
    }

    document.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerleave', onPointerGone)
    document.addEventListener('pointercancel', onPointerGone)
    hero.addEventListener('touchmove', onTouchMove, { passive: true })
    hero.addEventListener('touchend', onPointerGone, { passive: true })

    /* ── Resize ── */
    let resizeTimer
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        stop()
        build(); patchAccent(); start()
      }, 150)
    })
    ro.observe(hero)

    // Park the loop when the hero is off-screen or the tab is hidden. Without
    // this the rAF runs for the entire session no matter where the reader is.
    const io = new IntersectionObserver(
      ([entry]) => { entry.isIntersecting ? start() : stop() },
      { threshold: 0 }
    )
    io.observe(hero)

    const onVisibility = () => {
      if (document.hidden) stop()
      else if (hero.getBoundingClientRect().bottom > 0) start()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      stop()
      clearTimeout(resizeTimer)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerleave', onPointerGone)
      document.removeEventListener('pointercancel', onPointerGone)
      document.removeEventListener('visibilitychange', onVisibility)
      hero.removeEventListener('touchmove', onTouchMove)
      hero.removeEventListener('touchend', onPointerGone)
      if (canvas.parentElement === hero) hero.removeChild(canvas)
    }
  }, [])

  return (
    <div style={{ width: '100%' }}>
      <div
        ref={spacerRef}
        role="img"
        aria-label={lines.join(' ')}
        style={{ width: '100%' }}
      />
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  )
}
