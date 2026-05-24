import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion'
import { Maximize2, Minimize2, Paperclip, X } from 'lucide-react'

const GREETINGS = [
  "Hey! Ask me anything about Atul's work, projects, or experience.",
  "Hi! I'm Atul's AI — what are you curious about?",
  "What's up! Ask me about Atul's projects, skills, or how to reach him.",
  "Hey there! Curious about what Atul's been building? Fire away.",
  "Hi! I know Atul's work inside out — what do you want to know?",
]

/* ── Lightweight markdown → React renderer ── */
function renderInline(text, keyPrefix = '') {
  const parts = []
  let rest = text
  let i = 0

  while (rest.length > 0) {
    const key = `${keyPrefix}-${i++}`

    // [text](url)
    const link = rest.match(/^\[([^\]]+)\]\((https?:\/\/[^)]+)\)/)
    if (link) {
      parts.push(<a key={key} href={link[2]} target="_blank" rel="noopener noreferrer" className="chatbot-md-link">{link[1]}</a>)
      rest = rest.slice(link[0].length); continue
    }
    // **bold**
    const bold = rest.match(/^\*\*([^*]+)\*\*/)
    if (bold) {
      parts.push(<strong key={key}>{bold[1]}</strong>)
      rest = rest.slice(bold[0].length); continue
    }
    // *italic*
    const italic = rest.match(/^\*([^*\n]+)\*/)
    if (italic) {
      parts.push(<em key={key}>{italic[1]}</em>)
      rest = rest.slice(italic[0].length); continue
    }
    // `code`
    const code = rest.match(/^`([^`]+)`/)
    if (code) {
      parts.push(<code key={key} className="chatbot-md-code">{code[1]}</code>)
      rest = rest.slice(code[0].length); continue
    }
    // plain text up to next special char
    const next = rest.search(/[\[*`]/)
    if (next === -1) { parts.push(rest); rest = ''; break }
    parts.push(rest.slice(0, next))
    rest = rest.slice(next)
  }
  return parts
}

function MarkdownText({ text }) {
  // Split into paragraphs on double-newline, lines on single
  const paragraphs = text.split(/\n{2,}/)
  return (
    <>
      {paragraphs.map((para, pi) => {
        const lines = para.split('\n')
        return (
          <span
            key={pi}
            style={{ display: 'block', marginBottom: pi < paragraphs.length - 1 ? '0.7em' : 0 }}
          >
            {lines.map((line, li) => (
              <span key={li}>
                {renderInline(line, `${pi}-${li}`)}
                {li < lines.length - 1 && <br />}
              </span>
            ))}
          </span>
        )
      })}
    </>
  )
}

/* ── Animated typing indicator ── */
function TypingDots() {
  return (
    <span className="chatbot-typing">
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="chatbot-typing__dot"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </span>
  )
}

/* ── Render a single message bubble ── */
function Bubble({ msg, index }) {
  const isUser = msg.role === 'user'
  // Extract text from string or multipart content array
  const text = typeof msg.content === 'string'
    ? msg.content
    : Array.isArray(msg.content)
      ? msg.content.find(c => c.type === 'text')?.text ?? ''
      : ''

  return (
    <motion.div
      className={`chatbot-panel__bubble chatbot-panel__bubble--${msg.role}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {!isUser && <span className="chatbot-prompt">{'> '}</span>}
      {/* Attached image */}
      {msg._img && (
        <img src={msg._img.dataUrl} alt="attached" className="chatbot-msg-img" />
      )}
      {/* Message text — rendered markdown */}
      {text && <MarkdownText text={text} />}
    </motion.div>
  )
}

export default function ChatBot() {
  const [isOpen,    setIsOpen]    = useState(false)
  const [expanded,  setExpanded]  = useState(false)
  const [hovered,   setHovered]   = useState(false)
  const [atBottom,  setAtBottom]  = useState(false)
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [pendingImg, setPendingImg] = useState(null) // { dataUrl, mime }

  const wrapRef     = useRef()
  const bodyRef     = useRef()
  const inputRef    = useRef()
  const fileRef     = useRef()
  const greetingRef = useRef(GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
  const isMobile    = useRef(typeof window !== 'undefined' && window.innerWidth <= 768)

  useEffect(() => {
    const check = () => { isMobile.current = window.innerWidth <= 768 }
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* ── Spring-smoothed face parallax ── */
  const rawX  = useMotionValue(0)
  const rawY  = useMotionValue(0)
  const faceX = useSpring(rawX, { stiffness: 120, damping: 20 })
  const faceY = useSpring(rawY, { stiffness: 120, damping: 20 })

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

  /* ── Rise when contact section enters view ── */
  useEffect(() => {
    const contact = document.getElementById('contact')
    if (!contact) return
    const obs = new IntersectionObserver(
      ([entry]) => setAtBottom(entry.isIntersecting),
      { threshold: 0.1 }
    )
    obs.observe(contact)
    return () => obs.disconnect()
  }, [])

  /* ── Auto-scroll body on new messages / loading ── */
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages, loading])

  /* ── Focus input when panel opens ── */
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 220)
  }, [isOpen])

  /* ── Close expanded when panel closes ── */
  useEffect(() => {
    if (!isOpen) setExpanded(false)
  }, [isOpen])

  const raised = hovered || isOpen || atBottom

  /* ── File → base64 ── */
  const readImage = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve({ dataUrl: e.target.result, mime: file.type })
      reader.readAsDataURL(file)
    })

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setPendingImg(await readImage(file))
    e.target.value = ''
  }

  /* ── Paste image from clipboard ── */
  const handlePaste = async (e) => {
    const items  = Array.from(e.clipboardData?.items ?? [])
    const imgItem = items.find(it => it.type.startsWith('image/'))
    if (!imgItem) return
    e.preventDefault()
    setPendingImg(await readImage(imgItem.getAsFile()))
  }

  /* ── Send message to /api/chat ── */
  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text && !pendingImg) return
    if (loading) return

    // Build content: multipart if image present, plain string otherwise
    const userContent = pendingImg
      ? [
          ...(text ? [{ type: 'text', text }] : []),
          { type: 'image_url', image_url: { url: pendingImg.dataUrl } },
        ]
      : text

    const userMsg = { role: 'user', content: userContent, _img: pendingImg }
    const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }))

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setPendingImg(null)
    setLoading(true)

    try {
      const res  = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: history }),
      })
      if (!res.ok) throw new Error('API error')
      const { reply } = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: 'Hmm, something went wrong on my end — try again?',
      }])
    } finally {
      setLoading(false)
    }
  }, [input, pendingImg, loading, messages])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* ── Bottom-right anchor ── */}
      <div className="chatbot-outer">
        <motion.div
          className="chatbot-robot"
          animate={{ y: raised ? 0 : 52, opacity: raised ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          onClick={() => setIsOpen(o => !o)}
          whileTap={{ scale: 0.93 }}
        >
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

          <div ref={wrapRef} className="chatbot-img-wrap chatbot-glitch-wrap">
            <motion.img
              src="/robot-bg.png"
              alt="Atul AI"
              className="chatbot-img"
              draggable={false}
              style={{ x: faceX, y: faceY, width: 118, height: 118, margin: -6 }}
            />
          </div>
        </motion.div>
      </div>

      {/* ── Frosted backdrop on mobile when chat is open ── */}
      <AnimatePresence>
        {isOpen && isMobile.current && (
          <motion.div
            className="chatbot-mob-frost"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Backdrop for expanded mode (desktop only) ── */}
      <AnimatePresence>
        {isOpen && expanded && !isMobile.current && (
          <motion.div
            className="chatbot-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Chat panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`chatbot-panel${expanded ? ' chatbot-panel--expanded' : ''}`}
            style={expanded && isMobile.current ? {
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              width: '100%',
              height: '100dvh',
              maxHeight: '100dvh',
              borderRadius: 0,
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            } : undefined}
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            {/* ── Header ── */}
            <div className="chatbot-panel__header">
              <div className="chatbot-panel__avatar">
                <img src="/robot-bg.png" alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
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
              <button
                className="chatbot-panel__icon-btn"
                onClick={() => setExpanded(e => !e)}
                title={expanded ? 'Collapse' : 'Expand'}
              >
                {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
            </div>

            {/* ── Body ── */}
            <div className="chatbot-panel__body" ref={bodyRef} data-lenis-prevent>
              {/* Greeting */}
              <motion.div
                className="chatbot-panel__bubble chatbot-panel__bubble--assistant"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
              >
                <span className="chatbot-prompt">{'> '}</span>
                {greetingRef.current}
              </motion.div>

              {/* Conversation history */}
              {messages.map((msg, i) => (
                <Bubble key={i} msg={msg} index={i} />
              ))}

              {/* Typing indicator */}
              {loading && (
                <motion.div
                  className="chatbot-panel__bubble chatbot-panel__bubble--assistant"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span className="chatbot-prompt">{'> '}</span>
                  <TypingDots />
                </motion.div>
              )}
            </div>

            {/* ── Pending image preview ── */}
            <AnimatePresence>
              {pendingImg && (
                <motion.div
                  className="chatbot-img-preview"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <img src={pendingImg.dataUrl} alt="pending" className="chatbot-img-preview__thumb" />
                  <button
                    className="chatbot-img-preview__remove"
                    onClick={() => setPendingImg(null)}
                  >
                    <X size={10} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Input row ── */}
            <div className="chatbot-panel__input-row">
              <span className="chatbot-prompt chatbot-prompt--input">{'>'}</span>
              <input
                ref={inputRef}
                className="chatbot-panel__input"
                placeholder="ask_anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                disabled={loading}
                autoComplete="off"
                spellCheck={false}
              />
              {/* Hidden file input */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              {/* Attach button */}
              <button
                className="chatbot-panel__icon-btn"
                onClick={() => fileRef.current?.click()}
                title="Attach image"
                disabled={loading}
                style={{ marginRight: 4 }}
              >
                <Paperclip size={13} />
              </button>
              {/* Send */}
              <button
                className="chatbot-panel__send"
                onClick={handleSend}
                disabled={loading || (!input.trim() && !pendingImg)}
              >
                ↑
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
