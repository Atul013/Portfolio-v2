import { useState, useEffect, lazy, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Lenis from 'lenis'
import Cursor from './components/Cursor'
import Navbar from './components/Navbar'
import ScrollProgress from './components/ScrollProgress'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import GitHubActivity from './components/GitHubActivity'
import Experience from './components/Experience'
import Projects from './components/Projects'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
import Footer from './components/Footer'
import { useStillness } from './hooks'

// 486 lines that most visitors never open. Keep it out of the initial bundle.
const ChatBot = lazy(() => import('./components/ChatBot'))

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const still = useStillness()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Smooth scroll. Skipped entirely under reduced motion: easing someone's
  // scroll when they've asked for less motion is the exact thing they opted out of.
  useEffect(() => {
    if (still) return
    const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) })
    let raf
    function tick(time) { lenis.raf(time); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [still])

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <ScrollProgress />
      <Navbar theme={theme} toggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <GitHubActivity />
        <Experience />
        <Projects />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
      <Analytics />
    </>
  )
}
