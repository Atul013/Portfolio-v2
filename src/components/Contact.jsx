import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Github, Linkedin, ArrowUpRight, MapPin, Copy, Check, Send } from 'lucide-react'
import { personalInfo } from '../data'

const FORMSPREE = 'https://formspree.io/f/xnjrzlej'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] },
})

function Terminal() {
  return (
    <motion.div className="contact-terminal" {...fadeUp(0.34)}>
      <div className="ct-header">
        <span className="ct-dot ct-dot--r" />
        <span className="ct-dot ct-dot--y" />
        <span className="ct-dot ct-dot--g" />
        <span className="ct-title">~/atul · zsh</span>
      </div>
      <div className="ct-body">
        <div className="ct-line">
          <span className="ct-user">atul@nodes</span> <span className="ct-path">~/portfolio</span> $ whoami
        </div>
        <div className="ct-out">→ engineer · researcher · 19 · permanently curious</div>

        <div className="ct-line ct-gap">
          <span className="ct-user">atul@nodes</span> <span className="ct-path">~/portfolio</span> $ status --availability
        </div>
        <div className="ct-out">
          → accepting: <span className="ct-hi">research collab</span> · <span className="ct-hi">contract</span> · <span className="ct-hi">open source</span>
        </div>
        <div className="ct-out">→ timezone: IST · async-first</div>

        <div className="ct-line ct-gap">
          <span className="ct-user">atul@nodes</span> <span className="ct-path">~/portfolio</span> ${' '}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'steps(1)' }}
            style={{ color: 'var(--accent)' }}
          >▋</motion.span>
        </div>
      </div>
    </motion.div>
  )
}

function CopyBtn() {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(personalInfo.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button className="contact-copy" onClick={copy}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function ContactForm() {
  const [fields, setFields] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  const set = (k) => (e) => setFields(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch(FORMSPREE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(fields),
      })
      if (res.ok) {
        setStatus('success')
        setFields({ name: '', email: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="cf-success">
        <div className="cf-success-icon">✓</div>
        <p className="cf-success-title">Message sent!</p>
        <p className="cf-success-sub">I'll get back to you soon.</p>
        <button className="cf-retry" onClick={() => setStatus('idle')}>Send another</button>
      </div>
    )
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="cf-row">
        <div className="cf-field">
          <label className="cf-label">Your name</label>
          <input
            className="cf-input"
            type="text"
            placeholder="Roronoa Zoro"
            value={fields.name}
            onChange={set('name')}
            required
            disabled={status === 'sending'}
          />
        </div>
        <div className="cf-field">
          <label className="cf-label">Email address</label>
          <input
            className="cf-input"
            type="email"
            placeholder="zoro@strawhat.crew"
            value={fields.email}
            onChange={set('email')}
            required
            disabled={status === 'sending'}
          />
        </div>
      </div>
      <div className="cf-field">
        <label className="cf-label">Message</label>
        <textarea
          className="cf-input cf-textarea"
          placeholder="I got lost finding this page, but I'm here now. Let's build something great — nothing's impossible when you're aiming to be the best. 🗡️"
          rows={5}
          value={fields.message}
          onChange={set('message')}
          required
          disabled={status === 'sending'}
        />
      </div>
      {status === 'error' && (
        <p className="cf-error">Something went wrong — please try again or email me directly.</p>
      )}
      <button className="cf-submit btn-lime" type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : <><Send size={15} /> Send message</>}
      </button>
    </form>
  )
}

export default function Contact() {
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="contact-inner">

          {/* Left */}
          <div>
            <motion.p className="section-eyebrow" {...fadeUp()}>Contact</motion.p>
            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                className="contact-heading"
                initial={{ y: '105%', opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 1.0, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                Let's build<br />something<br /><span>great.</span>
              </motion.h2>
            </div>
            <motion.p className="contact-sub" {...fadeUp(0.2)}>
              Open to internships, collaborations, freelance projects, and research. If you have an interesting problem — let's talk.
            </motion.p>
            <motion.div className="contact-loc" {...fadeUp(0.28)}>
              <MapPin size={13} />{personalInfo.location}
            </motion.div>
            <Terminal />
          </div>

          {/* Right */}
          <div>
            <motion.div className="contact-cards" {...fadeUp(0.15)}>
              {/* Email */}
              <div className="contact-card">
                <div className="contact-card-icon"><Mail size={20} /></div>
                <div className="contact-card-info">
                  <div className="contact-card-lbl">Email me at</div>
                  <a href={`mailto:${personalInfo.email}`} className="contact-card-val">
                    {personalInfo.email}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CopyBtn />
                  <a href={`mailto:${personalInfo.email}`} className="btn-lime" style={{ fontSize: 13, padding: '8px 18px' }}>
                    Email <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>

              {/* GitHub */}
              <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="contact-card" style={{ textDecoration: 'none' }}>
                <div className="contact-card-icon"><Github size={20} /></div>
                <div className="contact-card-info">
                  <div className="contact-card-lbl">Code on</div>
                  <span className="contact-card-val">GitHub</span>
                </div>
                <ArrowUpRight size={20} className="contact-ext" />
              </a>

              {/* LinkedIn */}
              <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="contact-card" style={{ textDecoration: 'none' }}>
                <div className="contact-card-icon"><Linkedin size={20} /></div>
                <div className="contact-card-info">
                  <div className="contact-card-lbl">Connect on</div>
                  <span className="contact-card-val">LinkedIn</span>
                </div>
                <ArrowUpRight size={20} className="contact-ext" />
              </a>
            </motion.div>

            {/* Form */}
            <motion.div {...fadeUp(0.25)} style={{ marginTop: 20 }}>
              <ContactForm />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
