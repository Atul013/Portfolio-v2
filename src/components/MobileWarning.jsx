import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Smartphone, Copy, Check, ArrowRight } from 'lucide-react'

export default function MobileWarning() {
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const isMobile = window.innerWidth < 900
    const dismissed = sessionStorage.getItem('mob_dismissed')
    if (isMobile && !dismissed) {
      // Let the hero animation breathe first
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
  }, [])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const dismiss = () => {
    sessionStorage.setItem('mob_dismissed', '1')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            style={{
              position: 'fixed', inset: 0,
              zIndex: 8000,
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={dismiss}
          />

          {/* Card */}
          <motion.div
            style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              zIndex: 8001,
              background: '#111111',
              borderTop: '1px solid #2a2a2a',
              borderRadius: '24px 24px 0 0',
              padding: '32px 28px 40px',
              maxWidth: 480,
              margin: '0 auto',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
          >
            {/* Drag handle */}
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: '#333', margin: '0 auto 28px',
            }} />

            {/* Icons */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 16,
              marginBottom: 28,
            }}>
              <motion.div
                style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: 'rgba(181,253,79,0.1)',
                  border: '1px solid rgba(181,253,79,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#b5fd4f',
                }}
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 18 }}
              >
                <Smartphone size={24} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                style={{ color: '#444' }}
              >
                <ArrowRight size={20} />
              </motion.div>

              <motion.div
                style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: '#1a1a1a',
                  border: '1px solid #2a2a2a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#888',
                }}
                initial={{ scale: 0, rotate: 12 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 18 }}
              >
                <Monitor size={24} />
              </motion.div>
            </div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{ textAlign: 'center', marginBottom: 28 }}
            >
              <h3 style={{
                fontSize: '1.35rem', fontWeight: 800,
                color: '#f0ece4', letterSpacing: '-0.03em',
                marginBottom: 10, lineHeight: 1.2,
                fontFamily: 'Inter, sans-serif',
              }}>
                Best on desktop
              </h3>
              <p style={{
                fontSize: '0.9rem', color: '#777',
                lineHeight: 1.7, maxWidth: 300, margin: '0 auto',
                fontFamily: 'Inter, sans-serif',
              }}>
                This portfolio was crafted for desktop — with custom cursor interactions, 3D hover effects, and full-screen animations that really shine on a bigger screen.
              </p>
            </motion.div>

            {/* Divider */}
            <div style={{ height: 1, background: '#1e1e1e', marginBottom: 20 }} />

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <button
                onClick={copyLink}
                style={{
                  width: '100%', padding: '14px',
                  background: '#b5fd4f', color: '#080808',
                  border: 'none', borderRadius: 100,
                  fontSize: 14, fontWeight: 700,
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                {copied
                  ? <><Check size={16} /> Link Copied!</>
                  : <><Copy size={16} /> Copy Link for Desktop</>
                }
              </button>

              <button
                onClick={dismiss}
                style={{
                  width: '100%', padding: '14px',
                  background: 'transparent', color: '#666',
                  border: '1px solid #2a2a2a', borderRadius: 100,
                  fontSize: 14, fontWeight: 600,
                  fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                }}
              >
                Continue on Mobile
              </button>
            </motion.div>

            {/* Subtle branding */}
            <p style={{
              textAlign: 'center', marginTop: 20,
              fontSize: 11, color: '#333',
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.06em',
            }}>
              icarus13.in
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
