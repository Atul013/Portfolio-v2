import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Github, Linkedin, Mail, MapPin, ArrowDown, ExternalLink } from 'lucide-react'
import { personalInfo } from '../data'

// Text line reveal: slides up from behind a clip
function Reveal({ children, delay = 0, className = '' }) {
  return (
    <div style={{ overflow: 'hidden' }}>
      <motion.div
        className={className}
        initial={{ y: '110%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.0, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  )
}

const RESUME_URL = 'https://drive.google.com/file/d/1GVGrZt3zj8AddQO8YB0t5ZstVOxkenbA/view?usp=sharing'

function ResumeLink() {
  const [step, setStep] = useState('idle') // 'idle' | 'prompt'
  const timerRef = useRef(null)

  const handleClick = () => {
    if (step === 'idle') {
      setStep('prompt')
      timerRef.current = setTimeout(() => setStep('idle'), 5000)
    } else {
      clearTimeout(timerRef.current)
      window.open(RESUME_URL, '_blank', 'noopener,noreferrer')
      setStep('idle')
    }
  }

  return (
    <button className="hero__resume-btn" onClick={handleClick} aria-label="View resume">
      <AnimatePresence mode="wait">
        {step === 'idle' ? (
          <motion.span
            key="label"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <span style={{ display: 'inline-block', width: 16, textAlign: 'center', flexShrink: 0 }}>↓</span> Resume &nbsp;·&nbsp; <span className="hero__resume-date">Last updated Feb 2026</span>
          </motion.span>
        ) : (
          <motion.span
            key="prompt"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            style={{ color: 'var(--accent)' }}
          >
            Explored everything yet? Click again for the resume
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

export default function Hero() {
  const [roleIdx, setRoleIdx] = useState(0)
  const gridRef = useRef()

  useEffect(() => {
    const t = setInterval(() => setRoleIdx(i => (i + 1) % personalInfo.roles.length), 2800)
    return () => clearInterval(t)
  }, [])

  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    if (gridRef.current) {
      gridRef.current.style.setProperty('--gx', `${x}%`)
      gridRef.current.style.setProperty('--gy', `${y}%`)
      gridRef.current.classList.add('active')
    }
  }

  const onMouseLeave = () => {
    gridRef.current?.classList.remove('active')
  }

  return (
    <section id="hero" className="hero" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave}>
      {/* Animated background */}
      <div className="hero__bg" aria-hidden="true">
        <motion.div className="hero__glow hero__glow--1"
          animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.18, 0.12] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div className="hero__glow hero__glow--2"
          animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.1, 0.06] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        <div className="hero__grid-lines" ref={gridRef} />
      </div>

      <div className="container hero__inner">
        {/* Available badge */}
        <motion.div
          className="hero__avail"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="hero__avail-dot" />
          Open to internships & research collabs
        </motion.div>

        {/* Giant name — word by word blur+slide reveal */}
        <div className="hero__name-wrap">
          {['ATUL', 'BIJU.'].map((word, i) => (
            <div key={word} className="hero__name-line">
              <motion.span
                className={`hero__name${i === 1 ? ' hero__name--accent' : ''}`}
                initial={{ y: '105%', filter: 'blur(12px)', opacity: 0 }}
                animate={{ y: 0, filter: 'blur(0px)', opacity: 1 }}
                transition={{ duration: 1.1, delay: 0.3 + i * 0.16, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'block' }}
              >
                {word}
              </motion.span>
            </div>
          ))}
        </div>

        {/* Cycling role */}
        <div className="hero__role-row">
          <span className="hero__role-sep">—</span>
          <div className="hero__role-cycle">
            <AnimatePresence mode="wait">
              <motion.span
                key={roleIdx}
                className="hero__role-text"
                initial={{ y: 18, opacity: 0, filter: 'blur(6px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                exit={{ y: -18, opacity: 0, filter: 'blur(6px)' }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                {personalInfo.roles[roleIdx]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Location */}
        <motion.div
          className="hero__loc"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <MapPin size={12} />{personalInfo.location}
        </motion.div>

        {/* Bio */}
        <div style={{ overflow: 'hidden' }}>
          <motion.p
            className="hero__bio"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          >
            CS & AI student building intelligent systems at the intersection of AI security, adversarial ML, and scalable backend engineering. From agentic RAG pipelines to lightweight edge models — I build things that matter.
          </motion.p>
        </div>

        {/* CTAs */}
        <motion.div
          className="hero__actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <a href="#projects" className="btn-lime">
            Explore Work <ArrowDown size={15} />
          </a>
          <a href="#contact" className="btn-ghost">
            Get In Touch
          </a>
        </motion.div>

        {/* Socials */}
        <motion.div
          className="hero__socials"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="hero__social">
            <Github size={16} /> GitHub
          </a>
          <span className="hero__social-sep">·</span>
          <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hero__social">
            <Linkedin size={16} /> LinkedIn
          </a>
          <span className="hero__social-sep">·</span>
          <a href={`mailto:${personalInfo.email}`} className="hero__social">
            <Mail size={16} /> Email
          </a>
        </motion.div>

        {/* Resume */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{ marginTop: 18 }}
        >
          <ResumeLink />
        </motion.div>
      </div>


      <style>{`
        .hero__domain-link:hover { color: var(--accent) !important; }
      `}</style>
    </section>
  )
}
