import { useEffect, useRef } from 'react'

/*
  ParticleText — full-hero canvas particle text.

  The canvas is moved (via JS) to be a direct child of #hero so it
  covers the entire section. Particles can scatter anywhere inside the
  hero without hitting an invisible clipping box.

  Physics: cursor VELOCITY is transferred to particles (they get swept,
  not just attracted). Low spring → 3-4 s drift-back.
*/

const CFG = {
  R:        240,
  innerR:   32,
  sweepF:   2.8,
  repelF:   10,
  spring:   0.013,
  friction: 0.935,
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
  const spacerRef = useRef(null)   // stays in flow → maintains layout height

  useEffect(() => {
    const canvas  = canvasRef.current
    const spacer  = spacerRef.current
    if (!canvas || !spacer) return

    // ── Hoist canvas to #hero so particles can roam the full section ──
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
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mob = window.innerWidth <= 768
    const SPACING = mob ? 3.8 : 1.8

    let particles = []
    let mouse     = { x: -9999, y: -9999 }
    let mvx = 0, mvy = 0
    let lastX = -9999, lastY = -9999
    let raf   = null

    /* ── Build: sample text, build particles with hero-relative coords ── */
    const build = () => {
      const heroW = hero.offsetWidth
      const heroH = hero.offsetHeight
      if (heroW === 0 || heroH === 0) return

      canvas.width  = Math.round(heroW * dpr)
      canvas.height = Math.round(heroH * dpr)
      c.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Where is the spacer (text area) inside the hero?
      const heroRect   = hero.getBoundingClientRect()
      const spacerRect = spacer.getBoundingClientRect()
      const textX      = spacerRect.left - heroRect.left
      const textY      = spacerRect.top  - heroRect.top

      const W        = spacerRect.width
      const fontSize = Math.min(W * 0.195, 215)
      const lineH    = fontSize * 1.08
      const textH    = lineH * lines.length + fontSize * 0.18

      // Update spacer height to keep layout correct
      spacer.style.height = `${textH}px`

      // Sample text on a small offscreen canvas (just the text area size)
      const off = document.createElement('canvas')
      off.width  = Math.round(W    * dpr)
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

          const ix  = Math.round(Math.max(0, Math.min(W     - 1, sx)) * dpr)
          const iy  = Math.round(Math.max(0, Math.min(textH - 1, sy)) * dpr)
          const idx = (iy * off.width + ix) * 4

          if (data[idx + 3] > 120) {
            const li = Math.floor(sy / lineH)
            // Origin = text-local position + hero offset
            const ox = textX + sx
            const oy = textY + sy

            particles.push({
              x:   ox + (Math.random() - 0.5) * 180,
              y:   oy + (Math.random() - 0.5) * 180,
              ox,
              oy,
              vx:  (Math.random() - 0.5) * 5,
              vy:  (Math.random() - 0.5) * 5,
              r:   CFG.dotRMin + Math.random() * (CFG.dotRMax - CFG.dotRMin),
              sp:  CFG.spring * (0.5 + Math.random() * 1.0),
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

      mvx *= 0.82
      mvy *= 0.82

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
            const t = 1 - d / CFG.R

            if (d < CFG.innerR) {
              const f = (1 - d / CFG.innerR) * CFG.repelF
              p.vx -= (dx / d) * f
              p.vy -= (dy / d) * f
            } else {
              p.vx += mvx * t * CFG.sweepF
              p.vy += mvy * t * CFG.sweepF
            }
          }
        }

        p.vx += (p.ox - p.x) * p.sp
        p.vy += (p.oy - p.y) * p.sp
        p.vx *= CFG.friction
        p.vy *= CFG.friction
        p.x  += p.vx
        p.y  += p.vy

        ;(grps[p.col] ??= []).push(p)
      }

      for (const [col, ps] of Object.entries(grps)) {
        c.fillStyle = col
        for (const p of ps) {
          c.beginPath()
          c.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          c.fill()
        }
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

    /* ── Mouse — canvas now fills hero, coords are hero-relative ── */
    const onMove = (e) => {
      const r    = canvas.getBoundingClientRect()
      const newX = e.clientX - r.left
      const newY = e.clientY - r.top

      if (lastX > -9000) {
        const rawVx = Math.max(-35, Math.min(35, newX - lastX))
        const rawVy = Math.max(-35, Math.min(35, newY - lastY))
        mvx = mvx * 0.35 + rawVx * 0.65
        mvy = mvy * 0.35 + rawVy * 0.65
      }
      lastX = newX
      lastY = newY
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
      CFG.sweepF = 0;    CFG.repelF   = 0
    }

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      ro.disconnect()
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      // Return canvas to its original parent on unmount
      if (canvas.parentElement === hero) hero.removeChild(canvas)
    }
  }, [])

  return (
    <div style={{ width: '100%' }}>
      {/* Spacer: stays in normal flow, controls layout height */}
      <div
        ref={spacerRef}
        role="img"
        aria-label={lines.join(' ')}
        style={{ width: '100%' }}
      />
      {/* Canvas: gets hoisted to #hero in useEffect */}
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  )
}
