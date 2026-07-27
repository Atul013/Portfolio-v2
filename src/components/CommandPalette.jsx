import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ArrowRight, Github, Linkedin, Mail, FileText,
  Sun, Moon, CornerDownLeft, Terminal,
} from 'lucide-react'
import { personalInfo } from '../data'
import { useStillness } from '../hooks'

const RESUME_URL = 'https://drive.google.com/file/d/1GVGrZt3zj8AddQO8YB0t5ZstVOxkenbA/view?usp=sharing'

/**
 * Command palette. Cmd/Ctrl+K, or "/" from anywhere outside a text field.
 *
 * Justified for this register: the audience is engineers and recruiters who
 * live in editors and terminals, and the page is a long single scroll where
 * jumping is genuinely faster than scrolling. It is a real navigation
 * affordance, not a flourish.
 */
export default function CommandPalette({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const still = useStillness()

  const go = useCallback((hash) => {
    const el = document.querySelector(hash)
    if (el) el.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' })
  }, [still])

  // Sections that can be absent at runtime (Activity hides itself when the
  // GitHub API is unreachable) would otherwise leave a command that silently
  // does nothing, so anything with a `hash` is dropped unless it's on the page.
  const commands = useMemo(() => [
    { id: 'about',    group: 'Jump to', label: 'About',          hint: 'Who I am',              icon: ArrowRight, hash: '#about' },
    { id: 'skills',   group: 'Jump to', label: 'The stack',      hint: 'Languages, AI, infra',  icon: ArrowRight, hash: '#skills' },
    { id: 'activity', group: 'Jump to', label: 'Activity',       hint: 'Live GitHub graph',     icon: ArrowRight, hash: '#activity' },
    { id: 'exp',      group: 'Jump to', label: 'Experience',     hint: 'Where I have worked',   icon: ArrowRight, hash: '#experience' },
    { id: 'projects', group: 'Jump to', label: 'Selected work',  hint: 'Six projects',          icon: ArrowRight, hash: '#projects' },
    { id: 'faq',      group: 'Jump to', label: 'Questions',      hint: 'Common questions',      icon: ArrowRight, hash: '#faq' },
    { id: 'contact',  group: 'Jump to', label: 'Contact',        hint: 'Get in touch',          icon: ArrowRight, hash: '#contact' },

    { id: 'resume',   group: 'Links', label: 'Resume',   hint: 'Opens in a new tab', icon: FileText, run: () => window.open(RESUME_URL, '_blank', 'noopener,noreferrer') },
    { id: 'github',   group: 'Links', label: 'GitHub',   hint: '@Atul013',           icon: Github,   run: () => window.open(personalInfo.github, '_blank', 'noopener,noreferrer') },
    { id: 'linkedin', group: 'Links', label: 'LinkedIn', hint: 'atul-biju',          icon: Linkedin, run: () => window.open(personalInfo.linkedin, '_blank', 'noopener,noreferrer') },
    { id: 'email',    group: 'Links', label: 'Copy email address', hint: personalInfo.email, icon: Mail,
      run: async () => { try { await navigator.clipboard.writeText(personalInfo.email) } catch { window.location.href = `mailto:${personalInfo.email}` } } },

    { id: 'theme', group: 'Display', label: theme === 'dark' ? 'Switch to light' : 'Switch to dark',
      hint: 'Toggle theme', icon: theme === 'dark' ? Sun : Moon, run: toggleTheme },
  ].map(c => (c.hash ? { ...c, run: () => go(c.hash) } : c)), [go, theme, toggleTheme])

  const results = useMemo(() => {
    // Re-checked on every open, since a section can mount after first paint.
    const present = commands.filter(c => !c.hash || document.querySelector(c.hash))
    const q = query.trim().toLowerCase()
    if (!q) return present
    return present.filter(c =>
      c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q)
    )
  }, [commands, query, open])

  // Keep the highlight in range as the result set shrinks.
  useEffect(() => { setActive(0) }, [query])

  /* ── Global open shortcut ── */
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key?.toLowerCase()
      if ((e.metaKey || e.ctrlKey) && k === 'k') {
        e.preventDefault()
        setOpen(v => !v)
        return
      }
      // "/" opens too, but never while the reader is typing somewhere.
      const el = document.activeElement
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
      if (e.key === '/' && !typing && !open) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  /* ── Lock scroll and focus the field while open ── */
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => inputRef.current?.focus(), 20)
    return () => {
      document.body.style.overflow = prev
      clearTimeout(t)
      setQuery('')
    }
  }, [open])

  const runAt = (i) => {
    const cmd = results[i]
    if (!cmd) return
    setOpen(false)
    // Let the overlay unmount before scrolling, so the scroll lock is released.
    requestAnimationFrame(() => cmd.run())
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); return }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(i => (i + 1) % Math.max(results.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(i => (i - 1 + results.length) % Math.max(results.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      runAt(active)
    }
  }

  // Keep the active row scrolled into view during keyboard traversal.
  useEffect(() => {
    if (!open) return
    const el = listRef.current?.querySelector(`[data-idx="${active}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  let lastGroup = null

  return (
    <>
      <button
        className="cmdk-trigger"
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
      >
        <Terminal size={14} />
        <span className="cmdk-trigger__label">Jump to</span>
        <kbd className="cmdk-kbd">{navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl'} K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="cmdk-backdrop"
              initial={still ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="cmdk-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              initial={still ? false : { opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={still ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onKeyDown={onKeyDown}
            >
              <div className="cmdk-field">
                <Search size={16} className="cmdk-field__icon" />
                <input
                  ref={inputRef}
                  className="cmdk-input"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search sections and links"
                  aria-label="Search commands"
                  autoComplete="off"
                  spellCheck="false"
                />
                <kbd className="cmdk-kbd">Esc</kbd>
              </div>

              <div className="cmdk-list" ref={listRef} role="listbox">
                {results.length === 0 && (
                  <p className="cmdk-empty">
                    Nothing matches "{query}". Try "work", "resume", or "email".
                  </p>
                )}
                {results.map((cmd, i) => {
                  const Icon = cmd.icon
                  const showGroup = cmd.group !== lastGroup
                  lastGroup = cmd.group
                  return (
                    <div key={cmd.id}>
                      {showGroup && <p className="cmdk-group">{cmd.group}</p>}
                      <button
                        data-idx={i}
                        role="option"
                        aria-selected={i === active}
                        className={`cmdk-item${i === active ? ' is-active' : ''}`}
                        onMouseMove={() => setActive(i)}
                        onClick={() => runAt(i)}
                      >
                        <Icon size={15} className="cmdk-item__icon" />
                        <span className="cmdk-item__label">{cmd.label}</span>
                        <span className="cmdk-item__hint">{cmd.hint}</span>
                        {i === active && <CornerDownLeft size={13} className="cmdk-item__enter" />}
                      </button>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
