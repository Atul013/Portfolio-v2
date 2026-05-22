import { useState, useRef, Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import { projects as projectsData } from '../data'

const PROJ_META = {
  'orchestratex': { tag: 'Multi-Model · LLM Mesh',       visual: 'orchestrate' },
  'hackquest':    { tag: 'Award · Real-time Alerting',    visual: 'hackquest'   },
  'agentic-rag':  { tag: 'Retrieval · Reasoning',         visual: 'rag'         },
  'edge-slm':     { tag: 'Edge · Small Language Model',   visual: 'edgepy'      },
  'bob':          { tag: 'Voice · Local Orchestration',   visual: 'bob'         },
  'pazham':       { tag: 'Computer Vision · Playful',     visual: 'pazham'      },
}

/* ── SVG visuals — accent colors via CSS variables ── */
function ProjectVisual({ kind }) {
  if (kind === 'orchestrate') return (
    <svg viewBox="0 0 360 300" fill="none" style={{ width: '100%', height: '100%', maxWidth: 460 }}>
      <defs>
        <radialGradient id="og1" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   style={{ stopColor: 'var(--accent)', stopOpacity: 0.3 }} />
          <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
        </radialGradient>
        <linearGradient id="ol" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   style={{ stopColor: 'var(--accent)', stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.15 }} />
        </linearGradient>
      </defs>
      <circle cx="180" cy="150" r="120" fill="url(#og1)" />
      <circle cx="180" cy="150" r="22" style={{ fill: 'var(--bg-2)', stroke: 'var(--accent)' }} strokeWidth="1.2" />
      <text x="180" y="155" textAnchor="middle" style={{ fill: 'var(--text)' }} fontFamily="monospace" fontSize="9" letterSpacing="2">ORC</text>
      {[
        { x: 60,  y: 80,  l: 'CLAUDE'  },
        { x: 300, y: 80,  l: 'GPT'     },
        { x: 60,  y: 220, l: 'OSS'     },
        { x: 300, y: 220, l: 'CRITIC'  },
        { x: 180, y: 30,  l: 'ROUTER'  },
        { x: 180, y: 270, l: 'REFINER' },
      ].map((n, i) => (
        <g key={i}>
          <line x1="180" y1="150" x2={n.x} y2={n.y} stroke="url(#ol)" strokeWidth="0.8" strokeDasharray="2 3" />
          <circle cx={n.x} cy={n.y} r="14" style={{ fill: 'var(--surface)', stroke: 'var(--border-2)' }} strokeWidth="1" />
          <circle cx={n.x} cy={n.y} r="3"  style={{ fill: 'var(--accent)' }} opacity="0.85" />
          <text x={n.x} y={n.y + 28} textAnchor="middle" style={{ fill: 'var(--text-3)' }} fontFamily="monospace" fontSize="8" letterSpacing="1.6">{n.l}</text>
        </g>
      ))}
    </svg>
  )

  if (kind === 'edgepy') return (
    <svg viewBox="0 0 360 300" fill="none" style={{ width: '100%', height: '100%', maxWidth: 460 }}>
      <defs>
        <linearGradient id="chipFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   style={{ stopColor: 'var(--accent)', stopOpacity: 0.14 }} />
          <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.04 }} />
        </linearGradient>
      </defs>
      <rect x="100" y="80"  width="160" height="160" rx="14" style={{ fill: 'var(--bg-2)', stroke: 'var(--accent)' }} strokeOpacity="0.35" />
      <rect x="120" y="100" width="120" height="120" rx="6"  fill="url(#chipFill)" style={{ stroke: 'var(--accent)' }} strokeOpacity="0.4" />
      <text x="180" y="158" textAnchor="middle" style={{ fill: 'var(--text)' }} fontFamily="monospace" fontSize="11" letterSpacing="3">EDGEPY</text>
      <text x="180" y="172" textAnchor="middle" style={{ fill: 'var(--accent)' }} fontFamily="monospace" fontSize="8"  letterSpacing="2">SLM · 128MB</text>
      {Array.from({ length: 10 }).map((_, i) => (
        <Fragment key={i}>
          <rect x={108 + i * 15} y="70"  width="8" height="14" rx="1" style={{ fill: 'var(--border-2)' }} />
          <rect x={108 + i * 15} y="236" width="8" height="14" rx="1" style={{ fill: 'var(--border-2)' }} />
        </Fragment>
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <Fragment key={'v' + i}>
          <rect x="86"  y={88 + i * 15} width="14" height="8" rx="1" style={{ fill: 'var(--border-2)' }} />
          <rect x="260" y={88 + i * 15} width="14" height="8" rx="1" style={{ fill: 'var(--border-2)' }} />
        </Fragment>
      ))}
      <circle cx="180" cy="160" r="44" fill="none" style={{ stroke: 'var(--accent)' }} strokeOpacity="0.3">
        <animate attributeName="r"       values="22;60" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0" dur="2.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  )

  if (kind === 'hackquest') return (
    <svg viewBox="0 0 360 300" fill="none" style={{ width: '100%', height: '100%', maxWidth: 460 }}>
      <g transform="translate(180 150)">
        {[40, 70, 100, 130].map((r, i) => (
          <circle key={r} cx="0" cy="0" r={r}
            fill="none"
            style={{ stroke: i === 1 ? 'var(--accent)' : 'var(--border)' }}
            strokeWidth={i === 1 ? '1.2' : '0.6'}
            strokeDasharray={i === 1 ? '0' : '3 4'}
          />
        ))}
        <circle cx="0" cy="0" r="8" style={{ fill: 'var(--accent)' }} />
        <circle cx="0" cy="0" r="14" fill="none" style={{ stroke: 'var(--accent-dark)' }} strokeWidth="0.8" opacity="0.7">
          <animate attributeName="r"       values="8;38" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0" dur="2s" repeatCount="indefinite" />
        </circle>
        {[
          { x:  50, y: -30, l: 'T·01' },
          { x: -70, y:  20, l: 'T·02' },
          { x:  30, y:  75, l: 'T·03' },
          { x: -50, y: -50, l: 'T·04' },
        ].map((t, i) => (
          <g key={i}>
            <circle cx={t.x} cy={t.y} r="3" style={{ fill: 'var(--accent-dark)' }} />
            <text x={t.x + 7} y={t.y + 3} style={{ fill: 'var(--text-3)' }} fontFamily="monospace" fontSize="7">{t.l}</text>
          </g>
        ))}
      </g>
      <text x="20" y="40" style={{ fill: 'var(--text-3)' }} fontFamily="monospace" fontSize="9" letterSpacing="2">GEOFENCE · 1.2km</text>
      <text x="20" y="54" style={{ fill: 'var(--accent)' }} fontFamily="monospace" fontSize="9" letterSpacing="2">ALERT · ACTIVE</text>
    </svg>
  )

  if (kind === 'rag') return (
    <svg viewBox="0 0 360 300" fill="none" style={{ width: '100%', height: '100%', maxWidth: 460 }}>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${60 + i * 8} ${60 + i * 8})`}>
          <rect width="120" height="160" rx="4" style={{ fill: 'var(--bg-2)', stroke: 'var(--border)' }} />
          {Array.from({ length: 6 }).map((_, k) => (
            <rect key={k} x="12" y={20 + k * 16} width={80 - k * 4} height="3" rx="1.5" style={{ fill: 'var(--border-2)' }} />
          ))}
        </g>
      ))}
      <g transform="translate(220 80)">
        <rect width="120" height="140" rx="8" style={{ fill: 'var(--accent-dim)', stroke: 'var(--accent)' }} strokeOpacity="0.4" />
        <text x="10" y="18" style={{ fill: 'var(--accent)' }} fontFamily="monospace" fontSize="8" letterSpacing="1.8">VECTOR · 1536D</text>
        {Array.from({ length: 70 }).map((_, i) => {
          const x  = (i % 10) * 11 + 8
          const y  = Math.floor(i / 10) * 16 + 32
          const op = 0.25 + (i % 7) * 0.1
          return <rect key={i} x={x} y={y} width="8" height="8" rx="1" style={{ fill: 'var(--accent)' }} opacity={op} />
        })}
      </g>
      <path d="M170 140 Q200 160 220 150" style={{ stroke: 'var(--accent)' }} strokeDasharray="2 3" strokeWidth="0.8" fill="none" />
      <text x="50" y="272" style={{ fill: 'var(--text-3)' }} fontFamily="monospace" fontSize="8" letterSpacing="2">INGEST · EMBED · RETRIEVE</text>
    </svg>
  )

  if (kind === 'pazham') return (
    <svg viewBox="0 0 360 300" fill="none" style={{ width: '100%', height: '100%', maxWidth: 460 }}>
      <g transform="translate(180 150)">
        <circle r="90" fill="none" style={{ stroke: 'var(--border)' }} strokeDasharray="2 4" />
        <circle r="70" style={{ fill: 'var(--accent-dim)', stroke: 'var(--accent)' }} strokeOpacity="0.35" />
        <circle r="50" style={{ fill: 'var(--accent-dim)', stroke: 'var(--accent)' }} strokeOpacity="0.45" />
        {[
          [-20, -10], [0, -14], [20, -10],
          [-22,   6], [0,   4], [22,   6],
          [-16,  22], [0,  22], [16,  22],
        ].map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r="3.5" style={{ fill: 'var(--accent-dark)' }} />
            <circle cx={p[0]} cy={p[1]} r="10"  fill="none" style={{ stroke: 'var(--accent)' }} strokeWidth="0.6" opacity="0.6" />
            <text x={p[0] + 11} y={p[1] + 3} style={{ fill: 'var(--text-3)' }} fontFamily="monospace" fontSize="6">{i + 1}</text>
          </g>
        ))}
        <line x1="-80" y1="0"   x2="80"  y2="0"   style={{ stroke: 'var(--border)' }} strokeWidth="0.5" />
        <line x1="0"   y1="-80" x2="0"   y2="80"  style={{ stroke: 'var(--border)' }} strokeWidth="0.5" />
      </g>
      <text x="20" y="40" style={{ fill: 'var(--text-3)' }} fontFamily="monospace" fontSize="9" letterSpacing="2">CV · CROSS-SECTION</text>
      <text x="20" y="54" style={{ fill: 'var(--accent)' }} fontFamily="monospace" fontSize="9" letterSpacing="2">SEED COUNT · 09 · conf 0.94</text>
    </svg>
  )

  if (kind === 'bob') return (
    <svg viewBox="0 0 360 300" fill="none" style={{ width: '100%', height: '100%', maxWidth: 460 }}>
      <g transform="translate(0 90)">
        {Array.from({ length: 60 }).map((_, i) => {
          const h = 6 + Math.abs(Math.sin(i * 0.45) * 36) + (i % 5) * 2.8
          return <rect key={i} x={20 + i * 5.4} y={40 - h / 2} width="2" height={h} rx="1"
            style={{ fill: i > 18 && i < 42 ? 'var(--accent)' : 'var(--border-2)' }} />
        })}
      </g>
      <g transform="translate(180 220)">
        <circle cx="0" cy="0" r="10" style={{ fill: 'var(--bg-2)', stroke: 'var(--accent)' }} />
        {[
          { x: -90, y: -10, l: 'LAMP' },
          { x: -45, y:  30, l: 'DOOR' },
          { x:   0, y:  50, l: 'TV'   },
          { x:  45, y:  30, l: 'SPK'  },
          { x:  90, y: -10, l: 'AC'   },
        ].map((d, i) => (
          <g key={i}>
            <line x1="0" y1="0" x2={d.x} y2={d.y} style={{ stroke: 'var(--accent)' }} strokeOpacity="0.4" strokeWidth="0.6" strokeDasharray="2 2" />
            <circle cx={d.x} cy={d.y} r="6" style={{ fill: 'var(--surface)', stroke: 'var(--border-2)' }} />
            <text x={d.x} y={d.y + 18} textAnchor="middle" style={{ fill: 'var(--text-3)' }} fontFamily="monospace" fontSize="7" letterSpacing="1">{d.l}</text>
          </g>
        ))}
      </g>
      <text x="20" y="30" style={{ fill: 'var(--text-3)' }} fontFamily="monospace" fontSize="9" letterSpacing="2">WAKE · "BOB"</text>
      <text x="20" y="46" style={{ fill: 'var(--accent)' }} fontFamily="monospace" fontSize="9" letterSpacing="2">INTENT · dim lamp 40%</text>
    </svg>
  )

  return null
}

function ProjectRow({ project, index, expanded, onToggle }) {
  const ref  = useRef(null)
  const meta = PROJ_META[project.id] || { tag: '', visual: null }
  const num  = String(index + 1).padStart(2, '0')

  const onMove = (e) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    ref.current.style.setProperty('--mx', (e.clientX - r.left) + 'px')
    ref.current.style.setProperty('--my', (e.clientY - r.top) + 'px')
  }

  return (
    <motion.div
      ref={ref}
      className={`project-row${expanded ? ' project-row--open' : ''}`}
      onMouseMove={onMove}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="project-row__hd" onClick={() => onToggle(project.id)}>
        <div className="pr-idx">P · {num}</div>
        <div className="pr-name-col">
          <h3 className="pr-name">{project.name}</h3>
          <span className="pr-tag">{meta.tag}</span>
        </div>
        <div className="pr-blurb">{project.tagline}</div>
        <div className={`pr-toggle${expanded ? ' pr-toggle--open' : ''}`}>+</div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pr-body">
              <div className="pr-body-left">
                <div>
                  <p className="pr-section-label">Overview</p>
                  <p className="pr-desc">{project.description}</p>
                </div>
                <div>
                  <p className="pr-section-label">Engineering highlights</p>
                  <ul className="pr-bullets">
                    {project.features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="pr-section-label">Stack</p>
                  <div className="pr-chips">
                    {project.tech.map((t, i) => (
                      <span key={t} className={`pr-chip${i === 0 ? ' pr-chip--accent' : ''}`}>{t}</span>
                    ))}
                  </div>
                </div>
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="pr-live">
                    <ExternalLink size={13} /> Visit live site
                  </a>
                )}
              </div>
              <div className="pr-body-right">
                <div className="pr-visual">
                  <ProjectVisual kind={meta.visual} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [expanded, setExpanded] = useState('orchestratex')
  const onToggle = (id) => setExpanded(cur => cur === id ? null : id)

  return (
    <section id="projects">
      <div className="container">
        <motion.div {...fadeUp()} style={{ marginBottom: 56 }}>
          <div className="proj-header">
            <p className="section-eyebrow">Projects</p>
            <p className="proj-expand-hint">click to expand</p>
          </div>
        </motion.div>

        <div className="projects-v1">
          {projectsData.map((p, i) => (
            <ProjectRow
              key={p.id}
              project={p}
              index={i}
              expanded={expanded === p.id}
              onToggle={onToggle}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
