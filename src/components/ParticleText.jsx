import { useEffect, useRef } from 'react'

/*
  ParticleText — orbital vortex particle text.

  Physics:
  - Radial attraction: pulls particles toward cursor
  - Tangential force: pushes particles sideways (perpendicular to radius)
  → Combined: particles orbit the cursor like a galaxy / vortex
  - Spring: slowly decays orbits back to text origin (~3–4 s)
  - Per-particle spring variation: staggered return = layered rings
*/

const CFG = {
  R:       140,    // cursor influence radius
  innerR:  16,     // repel zone at cursor tip
  sweepF:  3.8,    // cursor velocity → particle velocity (the sweep force)
  repelF:  6,
  spring:  0.008,  // very weak spring → particles drift back slowly
  friction:0.974,  // very high → particles keep momentum → ring persists
  dotRMin: 0.15,
  dotRMax: 0.85,
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

    // Hoist canvas to #hero → particles can roam the full section
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
    const mob = window.innerWidth <= 768
    const SPACING = mob ? 3.8 : 1.8

    let particles = []
    let mouse     = { x: -9999, y: -9999 }
    let mvx = 0, mvy = 0          // smoothed cursor velocity
    let lastX = -9999, lastY = -9999
    let raf       = null

    /* ── Build: sample text → particles with hero-relative origins ── */
    const build = () => {
      const heroW = hero.offsetWidth
      const heroH = hero.offsetHeight
      if (!heroW || !heroH) return

      canvas.width  = Math.round(heroW * dpr)
      canvas.height = Math.round(heroH * dpr)
      c.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Where does the text area sit inside the hero?
      const heroRect   = hero.getBoundingClientRect()
      const spacerRect = spacer.getBoundingClientRect()
      const textX      = spacerRect.left - heroRect.left
      const textY      = spacerRect.top  - heroRect.top

      const W        = spacerRect.width
      const fontSize = Math.min(W * 0.195, 215)
      const lineH    = fontSize * 1.08
      const textH    = lineH * lines.length + fontSize * 0.18

      spacer.style.height = `${textH}px`

      // Sample text on small offscreen canvas
      const off = document.createElement('canvas')
      off.width  = Math.round(W     * dpr)
      off.height = Math.round(textH * dpr)
      const oc   = off.getContext('2d')
      oc.scale(dpr, dpr)
      oc.font         = `700 ${fontSize}px 'Familjen Grotesk', sans-serif`
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
              r:   CFG.dotRMin + Math.random() * (CFG.dotRMax - CFG.dotRMin),
              // Per-particle spring → particles return at different rates
              // → layered orbital rings, staggered decay
              sp:  CFG.spring * (0.4 + Math.random() * 1.2),
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

      // Decay cursor velocity each frame — goes to zero if mouse stops
      mvx *= 0.80
      mvy *= 0.80

      const mx     = mouse.x
      const my     = mouse.y
      const active = mx > -9000
      const grps   = {}

      for (const p of particles) {
        if (active) {
          const dx = mx - p.x
          const dy = my - p.y
          const d2 = dx * dx + dy * dy

          if (d2 < CFG.R * CFG.R && d2 > 0.001) {
            const d = Math.sqrt(d2)
            const t = 1 - d / CFG.R   // influence falloff

            if (d < CFG.innerR) {
              // Tiny repel right at cursor tip
              const f = (1 - d / CFG.innerR) * CFG.repelF
              p.vx -= (dx / d) * f
              p.vy -= (dy / d) * f
            } else {
              // Transfer cursor velocity to particle — this is the sweep
              // Moving in a circle → cursor velocity is tangential to circle
              // → particles get tangential kick → they trace the circle path
              p.vx += mvx * t * CFG.sweepF
              p.vy += mvy * t * CFG.sweepF
            }
          }
        }

        // Spring back to origin (per-particle stiffness)
        p.vx += (p.ox - p.x) * p.sp
        p.vy += (p.oy - p.y) * p.sp

        p.vx *= CFG.friction
        p.vy *= CFG.friction
        p.x  += p.vx
        p.y  += p.vy

        ;(grps[p.col] ??= []).push(p)
      }

      // Single path per color → 2 GPU flushes total regardless of particle count
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

    /* ── CSS var → hex ── */
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

    document.fonts.ready.then(() => { build(); patchAccent(); loop() })

    /* ── Mouse — track position + smoothed velocity ── */
    const onMove = (e) => {
      const r    = canvas.getBoundingClientRect()
      const newX = e.clientX - r.left
      const newY = e.clientY - r.top
      if (lastX > -9000) {
        const rawVx = Math.max(-40, Math.min(40, newX - lastX))
        const rawVy = Math.max(-40, Math.min(40, newY - lastY))
        mvx = mvx * 0.3 + rawVx * 0.7
        mvy = mvy * 0.3 + rawVy * 0.7
      }
      lastX = newX; lastY = newY
      mouse = { x: newX, y: newY }
    }
    const onLeave = () => {
      mouse = { x: -9999, y: -9999 }
      lastX = -9999; lastY = -9999
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onLeave)

    /* ── Resize ── */
    let resizeTimer
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(raf)
        build(); patchAccent(); loop()
      }, 150)
    })
    ro.observe(hero)

    /* ── Reduced motion ── */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      CFG.spring = 0.22; CFG.friction = 0.94
      CFG.sweepF = 0;    CFG.repelF = 0
    }

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      ro.disconnect()
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
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
