import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function Cursor() {
  const [isPointer, setIsPointer] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dotX = useMotionValue(-200)
  const dotY = useMotionValue(-200)
  const ringX = useSpring(useMotionValue(-200), { stiffness: 260, damping: 26 })
  const ringY = useSpring(useMotionValue(-200), { stiffness: 260, damping: 26 })
  const ringRef = useRef()

  useEffect(() => {
    // Only activate on devices with a fine pointer (mouse), not touch
    const isFinePointer = window.matchMedia('(pointer: fine) and (hover: hover)').matches
    if (!isFinePointer) return

    setMounted(true)

    const onMove = (e) => {
      dotX.set(e.clientX)
      dotY.set(e.clientY)
      ringX.set(e.clientX)
      ringY.set(e.clientY)
    }

    const onOver = (e) => {
      const t = e.target?.closest('a, button, [data-cursor], input, textarea, select, label, [role="button"]')
      if (t) {
        setIsPointer(true)
        ringRef.current?.classList.add('hovered')
      }
    }

    const onOut = (e) => {
      const t = e.target?.closest('a, button, [data-cursor], input, textarea, select, label, [role="button"]')
      if (t) {
        setIsPointer(false)
        ringRef.current?.classList.remove('hovered')
      }
    }

    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
    }
  }, [])

  if (!mounted) return null

  return (
    <>
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0,
          width: 7, height: 7,
          borderRadius: '50%',
          background: 'var(--accent)',
          translateX: '-50%', translateY: '-50%',
          pointerEvents: 'none',
          zIndex: 9999,
          x: dotX, y: dotY,
        }}
      />
      <motion.div
        ref={ringRef}
        className="cursor-ring"
        style={{ x: ringX, y: ringY }}
      />
    </>
  )
}
