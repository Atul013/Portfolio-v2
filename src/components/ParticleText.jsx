import { useEffect, useRef } from 'react'

/*
  ParticleText — cursor-attraction particle text.

  Physics:
  - Radial attraction: pulls particles toward cursor position
  - Inner repel zone: pushes particles sideways when they get too close → creates
    the visible void + natural swirl (no explicit tangential force needed)
  - Ring/vortex effect comes from cursor circular motion: cursor moves faster
    than particles can follow → particles trail the cursor's circular path → ring
  - Spring: slowly returns particles to text origin (~3–4 s)
  - Per-particle spring variation: staggered return = layered depth
*/

const CFG = {
  R:        200,   // cursor influence radius
  innerR:   24,    // repel void at cursor tip — larger = more visible gap + more swirl
  atF:      0.14,  // radial attraction strength
  repelF:   7,     // push-back right at innerR
  spring:   0.006, // very weak spring → trail persists 3–4 s before dissolving
  friction: 0.96,  // high but not extreme → trail persists without explosion
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
              // Per-particle spring → different return rates → layered rings
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
            const t = 1 - d / CFG.R   // linear influence falloff

            if (d < CFG.innerR) {
              // Repel right at cursor tip → visible void + deflects particles sideways
              // The sideways deflection is what creates the natural swirl / ring look
              const f = (1 - d / CFG.innerR) * CFG.repelF
              p.vx -= (dx / d) * f
              p.vy -= (dy / d) * f
            } else {
              // Pure radial attraction — draws particles toward cursor
              // Ring/vortex forms when cursor moves in a circle faster than
              // particles can follow → they trail the cursor's circular path
              p.vx += (dx / d) * CFG.atF * t
              p.vy += (dy / d) * CFG.atF * t
            }
          }
        }

        // Spring back to origin (per-particle stiffness → staggered decay)
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

    /* ── Mouse — track position only (no velocity needed for orbital model) ── */
    const onMove = (e) => {
      const r  = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => {
      mouse = { x: -9999, y: -9999 }
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
      CFG.spring   = 0.22; CFG.friction = 0.94
      CFG.atF      = 0;    CFG.repelF   = 0
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
