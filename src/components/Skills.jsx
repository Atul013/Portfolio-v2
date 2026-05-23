import { motion } from 'framer-motion'

const CATS = [
  {
    h: 'Languages',
    items: [
      ['Python',   'primary'],
      ['Go',       'systems'],
      ['C / C++',  'systems'],
      ['SQL',      'data'],
      ['Bash',     'ops'],
    ],
  },
  {
    h: 'AI · Agents',
    items: [
      ['LangChain',   'orchestration'],
      ['Claude APIs', 'reasoning'],
      ['PyTorch',     'models'],
      ['Agentic RAG', 'retrieval'],
      ['LangSmith',   'tracing'],
    ],
  },
  {
    h: 'Infra · Data',
    items: [
      ['FastAPI',     'service'],
      ['Docker',      'runtime'],
      ['pgvector',    'vector'],
      ['PostgreSQL',  'store'],
      ['Git / GitHub','ops'],
    ],
  },
  {
    h: 'Security · Vision',
    items: [
      ['Pentesting',  'discipline'],
      ['Threat Intel','discipline'],
      ['Forensics',   'discipline'],
      ['OpenCV',      'vision'],
      ['Edge AI',     'deployment'],
    ],
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] },
})

export default function Skills() {
  return (
    <section id="skills">
      <div className="container">

        <motion.div className="skills__header" {...fadeUp()}>
          <p className="section-eyebrow">Skills</p>
          <h2 className="section-title">A toolkit <em>engineered</em><br />for systems that think.</h2>
        </motion.div>

        <motion.div className="skills-wrap" {...fadeUp(0.12)}>
          <div className="skills-cats">
            {CATS.map((cat, ci) => (
              <motion.div
                key={cat.h}
                className="skill-cat"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: ci * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <h4>{cat.h}</h4>
                <div className="skill-list">
                  {cat.items.map(([name, lvl]) => (
                    <div className="skill" key={name}>
                      <span>{name}</span>
                      <span className="lvl">{lvl}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  )
}
