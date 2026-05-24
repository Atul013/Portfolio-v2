import { useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, animate } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { personalInfo } from '../data'

function Counter({ to, suffix = '' }) {
  const ref = useRef()
  const count = useMotionValue(0)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const displayRef = useRef()

  useEffect(() => {
    if (!inView) return
    const ctrl = animate(count, to, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (displayRef.current) displayRef.current.textContent = Math.round(v)
      }
    })
    return () => ctrl.stop()
  }, [inView])

  return (
    <div ref={ref} className="about__stat-num">
      <span ref={displayRef}>0</span>
      <sup>{suffix}</sup>
    </div>
  )
}

const stats = [
  { value: 3, suffix: 'yrs', label: 'Years building' },
  { value: 6, suffix: '+',  label: 'Projects' },
  { value: 2, suffix: '',   label: 'Internships' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
})

export default function About() {
  return (
    <section id="about">
      <div className="container">
        <div className="about__layout">

          {/* Stats */}
          <motion.div className="about__stats" {...fadeUp(0)}>
            {stats.map((s, i) => (
              <motion.div key={s.label} {...fadeUp(i * 0.1)}>
                <Counter to={s.value} suffix={s.suffix} />
                <div className="about__stat-label">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Content */}
          <div className="about__content">
            <motion.span className="about__tag" {...fadeUp(0.1)}>About me</motion.span>

            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                className="about__heading"
                initial={{ y: '105%', opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                Building at the edge of AI & security
              </motion.h2>
            </div>

            <motion.p className="about__text" {...fadeUp(0.25)}>
              I'm a Computer Science and AI student with a relentless focus on cybersecurity,
              artificial intelligence, and scalable backend systems. I enjoy building projects
              that range from agentic AI systems and anomaly detection pipelines to lightweight
              edge AI models — especially where AI security and adversarial ML intersect.
            </motion.p>

            <motion.p className="about__text" style={{ marginTop: -16 }} {...fadeUp(0.3)}>
              When I'm not building, I'm studying attack surfaces, reading papers on adversarial
              ML, or thinking about how AI systems break. Curiosity is the constant.
            </motion.p>

            <motion.div className="about__links" {...fadeUp(0.38)}>
              <a href={personalInfo.github} target="_blank" rel="noopener noreferrer" className="btn-lime" style={{ fontSize: 13, padding: '10px 22px' }}>
                GitHub <ArrowUpRight size={15} />
              </a>
              <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: 13, padding: '10px 22px' }}>
                LinkedIn <ArrowUpRight size={15} />
              </a>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  )
}
