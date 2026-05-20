import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Award } from 'lucide-react'
import { projects } from '../data'

const statusLabel = { live: 'live', 'in-dev': 'dev', complete: 'done' }

// Card with mouse-tracking spotlight glow
function ProjectCard({ project, index }) {
  const ref = useRef()

  const onMouseMove = useCallback((e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    ref.current.style.setProperty('--mouse-x', `${x}%`)
    ref.current.style.setProperty('--mouse-y', `${y}%`)
  }, [])

  const num = String(index + 1).padStart(2, '0')
  const status = statusLabel[project.status]

  return (
    <motion.div
      ref={ref}
      className="proj-item"
      onMouseMove={onMouseMove}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => project.link && window.open(project.link, '_blank')}
      style={{ cursor: project.link ? 'pointer' : 'default' }}
    >
      {/* Number */}
      <span className="proj-num">{num}</span>

      {/* Info */}
      <div className="proj-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <span className="proj-name">{project.name}</span>
          {project.award && (
            <span className="proj-award"><Award size={11} /> Award Winner</span>
          )}
        </div>
        <p className="proj-tagline">{project.tagline}</p>
        <div className="proj-tech">
          {project.tech.slice(0, 5).map(t => (
            <span key={t} className="proj-tech-tag">{t}</span>
          ))}
          {project.tech.length > 5 && (
            <span className="proj-tech-tag" style={{ color: 'var(--text-3)' }}>+{project.tech.length - 5}</span>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="proj-right">
        <div className="proj-arrow">
          <ArrowUpRight size={16} />
        </div>
        <span className={`proj-status ${status}`}>
          {project.status === 'live' ? 'Live' : project.status === 'in-dev' ? 'In Dev' : 'Completed'}
        </span>
      </div>
    </motion.div>
  )
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] },
})

export default function Projects() {
  return (
    <section id="projects">
      <div className="container">
        <motion.div style={{ marginBottom: 56 }} {...fadeUp()}>
          <p className="section-eyebrow">Projects</p>
          <div style={{ overflow: 'hidden' }}>
            <motion.h2
              className="section-title"
              initial={{ y: '105%', opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Things I've built
            </motion.h2>
          </div>
        </motion.div>

        <div className="projects-list">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
