import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Rendered size of the robot image
const W = 106
const H = 106

// Eye centers as px within the W×H render (tweak if needed)
const L_EYE = { cx: 40, cy: 49 }   // left eye  (viewer's left)
const R_EYE = { cx: 60, cy: 48 }   // right eye (slightly smaller — perspective angle)

export default function ChatBot() {
  const [isOpen, setIsOpen]   = useState(false)
  const [hovered, setHovered] = useState(false)
  const [blink, setBlink]     = useState(false)
  const [pupil, setPupil]     = useState({ x: 0, y: 0 })
  const wrapRef  = useRef()
  const blinkRef = useRef()

  /* ── Global mouse → pupil offset ── */
  useEffect(() => {
    const onMove = (e) => {
      if (!wrapRef.current) return
      const rect  = wrapRef.current.getBoundingClientRect()
      const cx    = rect.left + rect.width  / 2
      const cy    = rect.top  + rect.height / 2
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx)
      const dist  = Math.min(3.5, Math.hypot(e.clientX - cx, e.clientY - cy) / 38)
      setPupil({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  /* ── Random blink every 2.5–5.5 s ── */
  useEffect(() => {
    const schedule = () => {
      blinkRef.current = setTimeout(() => {
        setBlink(true)
        setTimeout(() => { setBlink(false); schedule() }, 110)
      }, 2500 + Math.random() * 3000)
    }
    schedule()
    return () => clearTimeout(blinkRef.current)
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

          {/* Robot image + SVG eye overlay */}
          <div ref={wrapRef} className="chatbot-img-wrap chatbot-glitch-wrap">

            <img
              src="/robot.png"
              alt="Atul AI"
              className="chatbot-img"
              draggable={false}
              width={W}
              height={H}
            />

            {/* Eye tracking SVG — sits exactly over the image */}
            <svg
              className="chatbot-eye-svg"
              viewBox={`0 0 ${W} ${H}`}
              width={W}
              height={H}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* ── Left eye ── */}
              <motion.g
                animate={{ scaleY: blink ? 0.05 : 1 }}
                style={{ transformOrigin: `${L_EYE.cx}px ${L_EYE.cy}px` }}
                transition={{ duration: 0.07 }}
              >
                {/* Outer glow */}
                <ellipse
                  cx={L_EYE.cx + pupil.x}
                  cy={L_EYE.cy + pupil.y}
                  rx="8" ry="5.5"
                  fill="rgba(181,253,79,0.22)"
                />
                {/* Iris */}
                <ellipse
                  cx={L_EYE.cx + pupil.x}
                  cy={L_EYE.cy + pupil.y}
                  rx="5.5" ry="4"
                  fill="rgba(181,253,79,0.55)"
                />
                {/* Pupil */}
                <ellipse
                  cx={L_EYE.cx + pupil.x}
                  cy={L_EYE.cy + pupil.y}
                  rx="2.5" ry="2"
                  fill="rgba(0,8,0,0.85)"
                />
                {/* Specular highlight */}
                <circle
                  cx={L_EYE.cx + pupil.x + 2}
                  cy={L_EYE.cy + pupil.y - 1.8}
                  r="1.1"
                  fill="rgba(255,255,255,0.7)"
                />
              </motion.g>

              {/* ── Right eye (slightly smaller — angled away) ── */}
              <motion.g
                animate={{ scaleY: blink ? 0.05 : 1 }}
                style={{ transformOrigin: `${R_EYE.cx}px ${R_EYE.cy}px` }}
                transition={{ duration: 0.07 }}
              >
                <ellipse
                  cx={R_EYE.cx + pupil.x * 0.75}
                  cy={R_EYE.cy + pupil.y * 0.75}
                  rx="6.5" ry="4.5"
                  fill="rgba(181,253,79,0.18)"
                />
                <ellipse
                  cx={R_EYE.cx + pupil.x * 0.75}
                  cy={R_EYE.cy + pupil.y * 0.75}
                  rx="4.5" ry="3.2"
                  fill="rgba(181,253,79,0.5)"
                />
                <ellipse
                  cx={R_EYE.cx + pupil.x * 0.75}
                  cy={R_EYE.cy + pupil.y * 0.75}
                  rx="2" ry="1.6"
                  fill="rgba(0,8,0,0.85)"
                />
                <circle
                  cx={R_EYE.cx + pupil.x * 0.75 + 1.5}
                  cy={R_EYE.cy + pupil.y * 0.75 - 1.5}
                  r="0.9"
                  fill="rgba(255,255,255,0.65)"
                />
              </motion.g>
            </svg>
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
