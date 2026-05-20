import { motion } from 'framer-motion'
import { MapPin, Calendar } from 'lucide-react'
import { experience, education } from '../data'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] },
})

export default function Experience() {
  return (
    <section id="experience" className="exp-section">
      <div className="container">

        {/* Header */}
        <motion.div style={{ marginBottom: 60 }} {...fadeUp()}>
          <p className="section-eyebrow">Experience</p>
          <div style={{ overflow: 'hidden' }}>
            <motion.h2
              className="section-title"
              initial={{ y: '105%', opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Where I've worked
            </motion.h2>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="exp-list">
          {experience.map((item, i) => (
            <motion.div
              key={item.company}
              className="exp-item"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="exp-dot-col">
                <div className={`exp-dot${item.current ? ' active' : ''}`} />
                {i < experience.length - 1 && <div className="exp-line" />}
              </div>
              <div className="exp-card">
                <div className="exp-company">{item.company}</div>
                <div className="exp-role">{item.role}</div>
                <div className="exp-meta">
                  <span><Calendar size={12} />{item.period}</span>
                  <span style={{ color: 'var(--text-3)' }}>·</span>
                  <span><MapPin size={12} />{item.location}</span>
                  {item.current && (
                    <span style={{ color: 'var(--accent)', background: 'rgba(var(--accent-rgb),0.1)', border: '1px solid rgba(var(--accent-rgb),0.2)', padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                      Current
                    </span>
                  )}
                </div>
                <p className="exp-desc">{item.description}</p>
                <div className="exp-tags">
                  {item.tags.map(t => <span key={t} className="exp-tag">{t}</span>)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Education */}
        <motion.div style={{ marginTop: 72 }} {...fadeUp(0.1)}>
          <p className="section-eyebrow" style={{ marginBottom: 24 }}>Education</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {education.map((edu, i) => (
              <motion.div
                key={edu.institution}
                style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ borderColor: 'rgba(var(--accent-rgb), 0.3)', y: -3 }}
              >
                {edu.current && (
                  <span style={{ display: 'inline-block', padding: '3px 10px', background: 'rgba(var(--accent-rgb),0.1)', color: 'var(--accent)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 100, marginBottom: 12, border: '1px solid rgba(var(--accent-rgb),0.2)' }}>
                    Ongoing
                  </span>
                )}
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 6, lineHeight: 1.3 }}>{edu.degree}</div>
                <div style={{ fontSize: 13.5, color: 'var(--text-2)', marginBottom: 4 }}>{edu.institution}</div>
                {edu.detail && <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, marginBottom: 10 }}>{edu.detail}</div>}
                <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text-3)' }}>{edu.period}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
