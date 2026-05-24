import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { personalInfo } from '../data'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Skills', href: '#skills' },
  { label: 'Work', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar({ theme, toggleTheme }) {
  const [scrolled,       setScrolled]       = useState(false)
  const [open,           setOpen]           = useState(false)
  const [activeSection,  setActiveSection]  = useState('')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  /* ── Active section via IntersectionObserver ── */
  useEffect(() => {
    const ids      = links.map(l => l.href.slice(1))
    const elements = ids.map(id => document.getElementById(id)).filter(Boolean)
    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    )
    elements.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <motion.header
        className={`navbar${scrolled ? ' scrolled' : ''}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container navbar__inner">
          <a href="#hero" className="navbar__logo">
            {personalInfo.initials}
            <span className="navbar__logo-dot">.</span>
          </a>

          <nav className="navbar__links">
            {links.map(l => (
              <a
                key={l.href}
                href={l.href}
                className={`navbar__link${activeSection === l.href.slice(1) ? ' active' : ''}`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="navbar__actions">
            <button className="navbar__theme" onClick={toggleTheme} aria-label="Toggle theme">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: 'flex' }}
                >
                  {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                </motion.span>
              </AnimatePresence>
            </button>
            <a href="mailto:atulbiju13@gmail.com" className="navbar__hire">Hire me</a>
            <button className="navbar__menu" onClick={() => setOpen(v => !v)} aria-label="Menu">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="mob-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {/* Top bar */}
            <div className="mob-menu__top">
              <a href="#hero" className="navbar__logo" onClick={() => setOpen(false)}>
                {personalInfo.initials}<span className="navbar__logo-dot">.</span>
              </a>
              <button className="mob-menu__close" onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={18} />
              </button>
            </div>

            {/* Numbered links */}
            <div className="mob-menu__links">
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  className={`mob-menu__link${activeSection === l.href.slice(1) ? ' active' : ''}`}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.055 + 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="mob-menu__num">0{i + 1}</span>
                  <span className="mob-menu__label">{l.label}</span>
                </motion.a>
              ))}
            </div>

            {/* Footer */}
            <div className="mob-menu__foot">
              <button className="mob-menu__theme" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                {theme === 'dark' ? 'Light mode' : 'Dark mode'}
              </button>
              <a href="mailto:atulbiju13@gmail.com" className="btn-lime" style={{ fontSize: 13, padding: '10px 22px' }} onClick={() => setOpen(false)}>
                Get in touch
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
