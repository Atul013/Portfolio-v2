import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MessageCircle } from 'lucide-react'
import { faq } from '../data'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] },
})

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" style={{ background: 'var(--bg-2)' }}>
      <div className="container">
        <div className="faq-layout">

          {/* Sticky header */}
          <motion.div className="faq-sticky" {...fadeUp()}>
            <p className="section-eyebrow">FAQ</p>
            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                className="section-title" style={{ marginBottom: 16 }}
                initial={{ y: '105%', opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                Common questions
              </motion.h2>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 28 }}>
              Things people usually ask. If yours isn't here, just reach out.
            </p>
            <a href="#contact" className="btn-ghost faq-cta" style={{ fontSize: 13, padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <MessageCircle size={15} /> Ask me directly
            </a>
          </motion.div>

          {/* Accordion */}
          <motion.div
            className="faq-list"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {faq.map((item, i) => (
              <motion.div
                key={i}
                className={`faq-item${open === i ? ' open' : ''}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <button className="faq-trigger" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                  <div className="faq-q-wrap">
                    <span className="faq-n">0{i + 1}</span>
                    <span className="faq-q">{item.q}</span>
                  </div>
                  <span className="faq-icon">
                    <Plus size={18} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      className="faq-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <p className="faq-ans">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  )
}
