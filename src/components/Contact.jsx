import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Github, Linkedin, ArrowUpRight, MapPin, Copy, Check } from 'lucide-react'
import { personalInfo } from '../data'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] },
})

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
          </div>

          {/* Right */}
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

        </div>
      </div>
    </section>
  )
}
