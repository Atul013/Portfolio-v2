import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Github, GitCommit, GitPullRequest, FolderGit2 } from 'lucide-react'
import { personalInfo } from '../data'
import { useStillness } from '../hooks'
import { Reveal } from './motion-primitives'

const CACHE_KEY = 'gh_activity_v1'
const CACHE_TTL = 1000 * 60 * 60 * 6 // 6h; the edge cache does the real work

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { at, data } = JSON.parse(raw)
    if (Date.now() - at > CACHE_TTL) return null
    return data
  } catch { return null }
}

function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data })) } catch { /* quota, private mode */ }
}

/** Month labels positioned over the week columns where the month changes. */
function monthSpans(weeks) {
  const out = []
  let last = -1
  weeks.forEach((week, i) => {
    const first = week[0]
    if (!first) return
    const m = new Date(first.date).getMonth()
    if (m !== last) { out.push({ i, label: MONTHS[m] }); last = m }
  })
  // Drop a leading label that would collide with the next one.
  return out.filter((s, i) => i === 0 || s.i - out[i - 1].i >= 3)
}

function Stat({ icon: Icon, value, label }) {
  return (
    <div className="gh-stat">
      <Icon size={15} className="gh-stat__icon" />
      <span className="gh-stat__value">{value.toLocaleString()}</span>
      <span className="gh-stat__label">{label}</span>
    </div>
  )
}

export default function GitHubActivity() {
  const [state, setState] = useState(() => {
    const cached = readCache()
    return cached ? { status: 'ready', data: cached } : { status: 'loading', data: null }
  })
  const still = useStillness()
  const scrollerRef = useRef(null)

  useEffect(() => {
    let alive = true
    fetch('/api/github')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then(data => {
        if (!alive) return
        writeCache(data)
        setState({ status: 'ready', data })
      })
      .catch(() => { if (alive) setState(s => (s.data ? s : { status: 'error', data: null })) })
    return () => { alive = false }
  }, [])

  // The graph reads most recent first; start it scrolled to today on small screens.
  useEffect(() => {
    if (state.status !== 'ready') return
    const el = scrollerRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [state.status])

  // Never show visitors a broken widget. If GitHub is unreachable and there is
  // no cached copy, the section simply is not part of the page.
  if (state.status === 'error') return null

  const { data } = state
  const loading = state.status === 'loading'
  const weeks = data?.weeks ?? []
  const spans = weeks.length ? monthSpans(weeks) : []

  return (
    <section id="activity" className="gh">
      <div className="container">
        <Reveal>
          <h2 className="section-title">Still shipping.</h2>
          <p className="gh-lede">
            Public contribution activity over the last year, pulled live from GitHub.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="gh-card">
          <div className="gh-card__top">
            <a
              href={personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="gh-handle"
            >
              <Github size={16} />
              <span>@{data?.login ?? 'Atul013'}</span>
            </a>

            {loading ? (
              <div className="gh-stats" aria-hidden="true">
                <span className="gh-skel gh-skel--stat" />
                <span className="gh-skel gh-skel--stat" />
                <span className="gh-skel gh-skel--stat" />
              </div>
            ) : (
              <div className="gh-stats">
                <Stat icon={GitCommit} value={data.commits} label="commits" />
                <Stat icon={GitPullRequest} value={data.pullRequests} label="PRs" />
                <Stat icon={FolderGit2} value={data.publicRepos} label="repos" />
              </div>
            )}
          </div>

          <div className="gh-graph-scroll" ref={scrollerRef}>
            {loading ? (
              // Skeleton matches the real grid's shape, so nothing shifts on load.
              <div className="gh-grid" aria-hidden="true">
                {Array.from({ length: 53 }).map((_, w) => (
                  <div className="gh-week" key={w}>
                    {Array.from({ length: 7 }).map((_, d) => (
                      <span className="gh-day gh-day--skel" key={d} />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="gh-months" aria-hidden="true">
                  {spans.map(s => (
                    <span key={s.i} className="gh-month" style={{ gridColumn: s.i + 1 }}>
                      {s.label}
                    </span>
                  ))}
                </div>
                <div
                  className="gh-grid"
                  role="img"
                  aria-label={`${data.totalContributions.toLocaleString()} GitHub contributions in the last year`}
                >
                  {weeks.map((week, wi) => (
                    <div className="gh-week" key={wi}>
                      {week.map(day => (
                        <motion.span
                          key={day.date}
                          className="gh-day"
                          data-level={day.level}
                          title={`${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`}
                          initial={still ? false : { opacity: 0, scale: 0.4 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={still ? { duration: 0 } : {
                            duration: 0.3,
                            // Sweep left to right across the year, matching how it reads.
                            delay: Math.min(wi * 0.008, 0.5),
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="gh-card__foot">
            <span className="gh-total">
              {loading
                ? 'Loading contributions'
                : `${data.totalContributions.toLocaleString()} contributions in the last year`}
            </span>
            <div className="gh-legend" aria-hidden="true">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map(l => <span key={l} className="gh-day" data-level={l} />)}
              <span>More</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
