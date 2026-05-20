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
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

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
              <a key={l.href} href={l.href} className="navbar__link">{l.label}</a>
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
          <>
            <motion.div className="mob-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.nav className="mob-menu" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 360, damping: 36 }}>
              <div className="mob-menu__top">
                <button onClick={() => setOpen(false)} style={{ color: 'var(--text-2)' }}><X size={22} /></button>
              </div>
              <div className="mob-menu__links">
                {links.map((l, i) => (
                  <motion.a key={l.href} href={l.href} className="mob-menu__link" onClick={() => setOpen(false)} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 + 0.1 }}>
                    {l.label}
                  </motion.a>
                ))}
              </div>
              <div className="mob-menu__foot">
                <button onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: 14, padding: '12px 0' }}>
                  {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
                <a href="mailto:atulbiju13@gmail.com" className="btn-lime" style={{ justifyContent: 'center' }}>Get In Touch</a>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
