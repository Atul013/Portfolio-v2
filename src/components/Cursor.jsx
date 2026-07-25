import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const RING = 34
const DOT = 7
const INTERACTIVE = 'a, button, [data-cursor], input, textarea, select, label, [role="button"]'

export default function Cursor() {
  const [mounted, setMounted] = useState(false)

  const dotX = useMotionValue(-200)
  const dotY = useMotionValue(-200)
  const ringX = useSpring(useMotionValue(-200), { stiffness: 260, damping: 26 })
  const ringY = useSpring(useMotionValue(-200), { stiffness: 260, damping: 26 })

  // Scale, not width/height: layout properties thrash on every frame.
  const ringScale = useSpring(useMotionValue(1), { stiffness: 340, damping: 24 })
  const dotScale = useSpring(useMotionValue(1), { stiffness: 420, damping: 26 })

  const ringRef = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine) and (hover: hover)')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || still.matches) return

    setMounted(true)

    let hovering = false
    let pressing = false
    const apply = () => {
      ringScale.set(hovering ? 1.55 : pressing ? 0.82 : 1)
      dotScale.set(pressing ? 0.5 : hovering ? 0 : 1)
    }

    const onMove = (e) => {
      dotX.set(e.clientX); dotY.set(e.clientY)
      ringX.set(e.clientX); ringY.set(e.clientY)
    }
    const onOver = (e) => {
      if (!e.target?.closest?.(INTERACTIVE)) return
      hovering = true
      ringRef.current?.classList.add('hovered')
      apply()
    }
    const onOut = (e) => {
      if (!e.target?.closest?.(INTERACTIVE)) return
      hovering = false
      ringRef.current?.classList.remove('hovered')
      apply()
    }
    const onDown = () => { pressing = true; apply() }
    const onUp = () => { pressing = false; apply() }
    // The ring is fixed-position; if the pointer leaves the window it should go with it.
    const onLeave = () => { dotX.set(-200); dotY.set(-200); ringX.set(-200); ringY.set(-200) }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  if (!mounted) return null

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{
          width: DOT, height: DOT,
          marginLeft: -DOT / 2, marginTop: -DOT / 2,
          x: dotX, y: dotY, scale: dotScale,
        }}
      />
      <motion.div
        ref={ringRef}
        className="cursor-ring"
        style={{
          width: RING, height: RING,
          marginLeft: -RING / 2, marginTop: -RING / 2,
          x: ringX, y: ringY, scale: ringScale,
        }}
      />
    </>
  )
}
