import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion'

export default function ChatBot() {
  const [isOpen, setIsOpen]   = useState(false)
  const [hovered, setHovered] = useState(false)
  const wrapRef = useRef()

  // Spring-smoothed face parallax (mouse-following)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const faceX = useSpring(rawX, { stiffness: 120, damping: 20 })
  const faceY = useSpring(rawY, { stiffness: 120, damping: 20 })

  /* ── Global mouse → face parallax ── */
  useEffect(() => {
    const onMove = (e) => {
      if (!wrapRef.current) return
      const rect  = wrapRef.current.getBoundingClientRect()
      const cx    = rect.left + rect.width  / 2
      const cy    = rect.top  + rect.height / 2
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx)
      const dist  = Math.min(5, Math.hypot(e.clientX - cx, e.clientY - cy) / 30)
      rawX.set(Math.cos(angle) * dist)
      rawY.set(Math.sin(angle) * dist)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  const raised = hovered || isOpen

  return (
    <>
      {/* ── Bottom-right anchor ── */}
      <div className="chatbot-outer">
        <motion.div
          className="chatbot-robot"
          animate={{ y: raised ? 0 : 52 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onClick={() => setIsOpen(o => !o)}
          whileTap={{ scale: 0.93 }}
        >
          {/* Terminal label */}
          <AnimatePresence>
            {raised && (
              <motion.div
                key={isOpen ? 'close' : 'open'}
                className={`chatbot-label${isOpen ? ' chatbot-label--open' : ''}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                {isOpen ? '✕ close' : '> chat_atul'}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Robot image — face parallax tracks the mouse */}
          <div ref={wrapRef} className="chatbot-img-wrap chatbot-glitch-wrap">
            <motion.img
              src="/robot.png"
              alt="Atul AI"
              className="chatbot-img"
              draggable={false}
              style={{
                x: faceX,
                y: faceY,
                // slightly over-size so parallax shift doesn't expose edges
                width: 118,
                height: 118,
                margin: -6,
              }}
            />
          </div>

        </motion.div>
      </div>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-panel"
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className="chatbot-panel__header">
              <div className="chatbot-panel__avatar">
                <img src="/robot.png" alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />
              </div>
              <div>
                <p className="chatbot-panel__name">
                  atul_ai
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'steps(1)' }}
                  >_</motion.span>
                </p>
                <p className="chatbot-panel__status">
                  <span className="chatbot-panel__online" /> online
                </p>
              </div>
            </div>

            <div className="chatbot-panel__body">
              <motion.div
                className="chatbot-panel__bubble"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                <span className="chatbot-prompt">{'>'} </span>
                Hey! I'm Atul's AI twin 👾<br />
                Ask me anything about his work, projects, or experience.
              </motion.div>
            </div>

            <div className="chatbot-panel__input-row">
              <span className="chatbot-prompt chatbot-prompt--input">{'>'}</span>
              <input
                className="chatbot-panel__input"
                placeholder="ask_anything..."
                autoFocus
              />
              <button className="chatbot-panel__send">↑</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
