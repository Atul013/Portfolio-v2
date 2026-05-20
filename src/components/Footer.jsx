import { Github, Linkedin, Mail, Heart } from 'lucide-react'
import { personalInfo } from '../data'

const navLinks = ['Skills','Experience','Projects','FAQ','Contact']

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#hero" className="footer-logo">
              {personalInfo.initials}<span className="footer-logo-dot">.</span>
            </a>
            <p className="footer-tagline">{personalInfo.tagline}</p>
          </div>
          <nav className="footer-nav">
            {navLinks.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="footer-nav-link">{l}</a>
            ))}
          </nav>
          <div className="footer-socials">
            <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="footer-social"><Github size={16} /></a>
            <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="footer-social"><Linkedin size={16} /></a>
            <a href={`mailto:${personalInfo.email}`} className="footer-social"><Mail size={16} /></a>
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">
          <span className="footer-copy">© {new Date().getFullYear()} {personalInfo.name} · {personalInfo.domain}</span>
          <span className="footer-made">
            Built with <Heart size={11} className="footer-heart" /> React + Framer Motion
          </span>
        </div>
      </div>
    </footer>
  )
}
