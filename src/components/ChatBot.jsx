import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatBot() {
  const [isOpen, setIsOpen]   = useState(false)
  const [hovered, setHovered] = useState(false)
  const [blink, setBlink]     = useState(false)
  const [pupil, setPupil]     = useState({ x: 0, y: 0 })
  const robotRef = useRef()
  const blinkRef = useRef()

  /* ── Global mouse → pupil offset ── */
  useEffect(() => {
    const onMove = (e) => {
      if (!robotRef.current) return
      const rect  = robotRef.current.getBoundingClientRect()
      const cx    = rect.left + rect.width  / 2
      const cy    = rect.top  + rect.height / 2
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx)
      const dist  = Math.min(2.5, Math.hypot(e.clientX - cx, e.clientY - cy) / 40)
      setPupil({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  /* ── Random blink ── */
  useEffect(() => {
    const schedule = () => {
      blinkRef.current = setTimeout(() => {
        setBlink(true)
        setTimeout(() => { setBlink(false); schedule() }, 110)
      }, 2200 + Math.random() * 3200)
    }
    schedule()
    return () => clearTimeout(blinkRef.current)
  }, [])

  const raised = hovered || isOpen

  return (
    <>
      {/* ── Outer: bottom-right anchor ── */}
      <div className="chatbot-outer">

        <motion.div
          ref={robotRef}
          className="chatbot-robot"
          animate={{ y: raised ? 0 : 54 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onClick={() => setIsOpen(o => !o)}
          whileTap={{ scale: 0.93 }}
        >
          {/* Terminal tooltip */}
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

          {/* Glitch wrapper — CSS animation handles chromatic aberration */}
          <div className="chatbot-glitch-wrap">
            <svg
              width="72" height="90"
              viewBox="0 0 72 90"
              fill="none" xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* CRT scan-line pattern */}
                <pattern id="sl" width="72" height="4" patternUnits="userSpaceOnUse">
                  <rect width="72" height="1.2" fill="rgba(0,0,0,0.28)" />
                </pattern>
              </defs>

              {/* ── Antenna ── */}
              {/* Glow halo */}
              <motion.circle
                cx="36" cy="6" r="8" fill="rgba(181,253,79,0.1)"
                animate={{ r: [8, 13, 8], opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Stem — flickers like a bad connection */}
              <motion.line
                x1="36" y1="7" x2="36" y2="21"
                stroke="#b5fd4f" strokeWidth="1.5" strokeLinecap="square"
                animate={{ opacity: [1, 0.3, 1, 0.6, 1, 0.9, 1] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1, 0.35, 0.4, 0.7, 1] }}
              />
              {/* Tip — square pixel dot */}
              <motion.rect
                x="32" y="2" width="8" height="8" fill="#b5fd4f"
                animate={{ opacity: [1, 0.4, 1, 0.7, 1], scale: [1, 1.1, 1] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '36px 6px' }}
              />

              {/* ── Head (angular, minimal rx) ── */}
              <rect x="2" y="19" width="68" height="68" rx="3"
                fill="#080808" stroke="#b5fd4f" strokeWidth="0.8" strokeOpacity="0.35" />

              {/* Inner CRT screen */}
              <rect x="6" y="23" width="60" height="60" rx="2" fill="#060d06" />

              {/* Scan-lines overlay */}
              <rect x="6" y="23" width="60" height="60" rx="2"
                fill="url(#sl)" opacity="0.7" />

              {/* Corner bracket decorations */}
              <path d="M8 28 L8 23 L13 23"  stroke="#b5fd4f" strokeWidth="1.2" fill="none" strokeOpacity="0.5" />
              <path d="M64 28 L64 23 L59 23" stroke="#b5fd4f" strokeWidth="1.2" fill="none" strokeOpacity="0.5" />
              <path d="M8 74 L8 79 L13 79"  stroke="#b5fd4f" strokeWidth="1.2" fill="none" strokeOpacity="0.5" />
              <path d="M64 74 L64 79 L59 79" stroke="#b5fd4f" strokeWidth="1.2" fill="none" strokeOpacity="0.5" />

              {/* ── Eye sockets (rectangular) ── */}
              <rect x="11" y="34" width="22" height="18" rx="1"
                fill="#040904" stroke="#1a2f1a" strokeWidth="0.8" />
              <rect x="39" y="34" width="22" height="18" rx="1"
                fill="#040904" stroke="#1a2f1a" strokeWidth="0.8" />

              {/* Left eye — square pixel pupil */}
              <motion.g
                animate={{ scaleY: blink ? 0.06 : 1 }}
                style={{ transformOrigin: '22px 43px' }}
                transition={{ duration: 0.06 }}
              >
                <rect
                  x={15 + pupil.x} y={39 + pupil.y}
                  width="14" height="8" rx="0"
                  fill={isOpen ? '#b5fd4f' : '#5db83a'}
                />
                {/* inner scan line */}
                <rect
                  x={15 + pupil.x} y={43 + pupil.y}
                  width="14" height="1.2" fill="rgba(0,0,0,0.45)"
                />
              </motion.g>

              {/* Right eye — square pixel pupil */}
              <motion.g
                animate={{ scaleY: blink ? 0.06 : 1 }}
                style={{ transformOrigin: '50px 43px' }}
                transition={{ duration: 0.06 }}
              >
                <rect
                  x={43 + pupil.x} y={39 + pupil.y}
                  width="14" height="8" rx="0"
                  fill={isOpen ? '#b5fd4f' : '#5db83a'}
                />
                <rect
                  x={43 + pupil.x} y={43 + pupil.y}
                  width="14" height="1.2" fill="rgba(0,0,0,0.45)"
                />
              </motion.g>

              {/* ── Mouth — blinking terminal cursor block ── */}
              <motion.rect
                x="27" y="64" width="18" height="4" rx="0"
                fill={isOpen ? '#b5fd4f' : '#2a4a2a'}
                animate={{ opacity: [1, 1, 0, 0, 1] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'steps(1)', times: [0, 0.45, 0.5, 0.95, 1] }}
              />

              {/* Side vents — pixel blocks */}
              <rect x="2"  y="45" width="3" height="7" rx="1" fill="#101510" stroke="#1a2a1a" strokeWidth="0.5" />
              <rect x="2"  y="55" width="3" height="7" rx="1" fill="#101510" stroke="#1a2a1a" strokeWidth="0.5" />
              <rect x="67" y="45" width="3" height="7" rx="1" fill="#101510" stroke="#1a2a1a" strokeWidth="0.5" />
              <rect x="67" y="55" width="3" height="7" rx="1" fill="#101510" stroke="#1a2a1a" strokeWidth="0.5" />
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
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            {/* Header */}
            <div className="chatbot-panel__header">
              <div className="chatbot-panel__avatar">👾</div>
              <div>
                <p className="chatbot-panel__name">
                  atul_ai<motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'steps(1)' }}
                  >_</motion.span>
                </p>
                <p className="chatbot-panel__status">
                  <span className="chatbot-panel__online" /> online
                </p>
              </div>
            </div>

            {/* Messages */}
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

            {/* Input */}
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
