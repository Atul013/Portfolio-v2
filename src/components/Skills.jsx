import { motion } from 'framer-motion'
import { Code2, Brain, Shield, Server } from 'lucide-react'
import { skillCategories, highlights } from '../data'

const iconMap = { code: Code2, brain: Brain, shield: Shield, server: Server }

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] },
})

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
  viewport: { once: true, margin: '-40px' },
}

const pill = {
  initial: { opacity: 0, scale: 0.8 },
  whileInView: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, ease: 'easeOut' },
}

export default function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <div className="skills__header">
          <motion.p className="section-eyebrow" {...fadeUp()}>Skills</motion.p>
          <div style={{ overflow: 'hidden' }}>
            <motion.h2
              className="section-title"
              initial={{ y: '105%', opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              What I work with
            </motion.h2>
          </div>
        </div>

        {/* Highlights bar */}
        <motion.div className="highlights-bar" {...fadeUp(0.15)}>
          <span className="highlights-label">Top skills</span>
          {highlights.map(h => (
            <span key={h} className="highlight-tag">{h}</span>
          ))}
        </motion.div>

        {/* Skill grid */}
        <div className="skills__grid">
          {skillCategories.map((cat, i) => {
            const Icon = iconMap[cat.icon]
            return (
              <motion.div
                key={cat.id}
                className="skill-row"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.65, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="skill-row__head">
                  <div className="skill-row__icon" style={{ background: `color-mix(in srgb, ${cat.color} 12%, transparent)`, color: cat.color }}>
                    <Icon size={17} />
                  </div>
                  <span className="skill-row__cat">{cat.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text-3)' }}>{cat.skills.length}</span>
                </div>
                <motion.div className="skill-row__pills" variants={stagger} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
                  {cat.skills.map(s => (
                    <motion.span key={s} className="skill-pill" variants={pill}>{s}</motion.span>
                  ))}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
