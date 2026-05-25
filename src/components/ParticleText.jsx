import { useEffect, useRef } from 'react'

/*
  ParticleText — canvas-based particle text effect.
  Letters are sampled pixel-by-pixel; each lit pixel becomes a particle.
  On mouse-move the particles scatter; they spring back when the cursor leaves.
*/

const CFG = {
  repelR:   120,   // cursor repel radius (px)
  repelF:   8,     // repel force multiplier
  spring:   0.052, // spring-back stiffness (lower = floatier)
  friction: 0.86,  // velocity damping (lower = more viscous)
  dotR:     1.5,   // particle dot radius (px)
}

export default function ParticleText({
  lines        = ['ATUL', 'BIJU.'],
  color        = '#f0ece4',
  accentLine   = 1,             // which line index gets the accent color
  accentColor  = '#b5fd4f',
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const c   = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mob = window.innerWidth <= 768

    // More spacing on mobile → fewer particles → better perf
    const SPACING = mob ? 5.5 : 3.5

    let particles = []
    let mouse     = { x: -9999, y: -9999 }
    let raf       = null

    /* ── Build particle array from rendered font ── */
    const build = () => {
      const W        = canvas.offsetWidth
      if (W === 0) return

      const fontSize = Math.min(W * 0.195, 215)
      const lineH    = fontSize * 1.08
      const H        = lineH * lines.length + fontSize * 0.18

      canvas.style.height = `${H}px`
      canvas.width        = Math.round(W * dpr)
      canvas.height       = Math.round(H * dpr)
      c.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Offscreen canvas — draw text, then sample pixels
      const off = document.createElement('canvas')
      off.width  = canvas.width
      off.height = canvas.height
      const oc   = off.getContext('2d')
      oc.scale(dpr, dpr)
      oc.font         = `700 ${fontSize}px 'Familjen Grotesk', sans-serif`
      oc.textAlign    = 'left'
      oc.textBaseline = 'top'
      oc.fillStyle    = '#fff'

      lines.forEach((line, i) => oc.fillText(line, 0, i * lineH))

      const { data } = oc.getImageData(0, 0, off.width, off.height)

      particles = []
      for (let y = 0; y < H; y += SPACING) {
        for (let x = 0; x < W; x += SPACING) {
          const ix  = Math.round(x * dpr)
          const iy  = Math.round(y * dpr)
          const idx = (iy * off.width + ix) * 4
          if (data[idx + 3] > 120) {
            const li = Math.floor(y / lineH)
            // Start scattered, animate into place on load
            particles.push({
              x:   x + (Math.random() - 0.5) * 140,
              y:   y + (Math.random() - 0.5) * 140,
              ox:  x,
              oy:  y,
              vx:  (Math.random() - 0.5) * 5,
              vy:  (Math.random() - 0.5) * 5,
              col: li === accentLine ? accentColor : color,
            })
          }
        }
      }
    }

    /* ── RAF animation loop ── */
    const loop = () => {
      const W = canvas.offsetWidth
      const H = canvas.offsetHeight
      c.clearRect(0, 0, W, H)

      const mx = mouse.x
      const my = mouse.y
      const R  = CFG.repelR

      // Group particles by color for batched fill calls
      const grps = {}

      for (const p of particles) {
        const dx = mx - p.x
        const dy = my - p.y
        const d2 = dx * dx + dy * dy

        if (d2 < R * R && d2 > 0.001) {
          const d = Math.sqrt(d2)
          const f = (1 - d / R) * CFG.repelF
          p.vx -= (dx / d) * f
          p.vy -= (dy / d) * f
        }

        // Spring back to origin
        p.vx += (p.ox - p.x) * CFG.spring
        p.vy += (p.oy - p.y) * CFG.spring

        // Friction
        p.vx *= CFG.friction
        p.vy *= CFG.friction

        p.x += p.vx
        p.y += p.vy

        ;(grps[p.col] ??= []).push(p)
      }

      // Batch draw by color
      for (const [col, ps] of Object.entries(grps)) {
        c.fillStyle = col
        for (const p of ps) {
          c.beginPath()
          c.arc(p.x, p.y, CFG.dotR, 0, Math.PI * 2)
          c.fill()
        }
      }

      raf = requestAnimationFrame(loop)
    }

    /* ── Resolve CSS variable accent color (canvas can't use var(--x)) ── */
    const resolveColor = (raw) => {
      if (!raw.startsWith('var(')) return raw
      const name = raw.match(/var\(\s*(--[\w-]+)\s*\)/)?.[1]
      if (!name) return raw
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || raw
    }
    const resolvedAccent = resolveColor(accentColor)

    // Patch accent color in particles after build
    const patchAccent = () => {
      for (const p of particles) {
        if (p.col === accentColor) p.col = resolvedAccent
      }
    }

    /* ── Init after fonts are ready ── */
    document.fonts.ready.then(() => {
      build()
      patchAccent()
      loop()
    })

    /* ── Mouse tracking ── */
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => { mouse = { x: -9999, y: -9999 } }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)

    /* ── Resize via ResizeObserver ── */
    let resizeTimer
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(raf)
        build()
        patchAccent()
        loop()
      }, 120)
    })
    ro.observe(canvas)

    /* ── Reduced motion: freeze particles in place ── */
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      CFG.spring   = 0.18
      CFG.friction = 0.92
      CFG.repelF   = 0
    }

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      ro.disconnect()
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-label={lines.join(' ')}
      role="img"
      style={{ width: '100%', display: 'block' }}
    />
  )
}
