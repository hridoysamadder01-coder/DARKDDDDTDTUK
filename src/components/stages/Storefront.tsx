import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Engine } from '../../types'
import { engines } from '../../data/engines'
import { config } from '../../config'
import TopBar from './TopBar'
import ProductCard from './ProductCard'
import ProductDetail from './ProductDetail'
import { Check, ArrowRight, Sparkle } from '../ui/Icons'

interface Props {
  onGetAccess: (e: Engine) => void
}

export default function Storefront({ onGetAccess }: Props) {
  const [detail, setDetail] = useState<Engine | null>(null)
  const target = engines.find((e) => e.isTarget)!
  const others = engines.filter((e) => !e.isTarget)
  const heroTitle = target.name.split('//')[0].trim()

  const heroPills = ['Android + iPhone', 'Cross-model merge', 'Low-latency runtime', config.accessLabel]

  return (
    <div>
      <TopBar showLinks secure />

      <motion.div
        className="container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* HERO — featured target */}
        <section className="hero">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="row wrap" style={{ gap: 8 }}>
                <span className="badge accent">
                  <Sparkle style={{ width: 12, height: 12 }} /> Featured build
                </span>
                <span className="badge success">{config.accessLabel}</span>
              </div>
              <h1>{heroTitle}</h1>
              <p className="lede">{target.targetLines?.[0] ?? target.summary}</p>

              <div className="pill-row">
                {heroPills.map((p) => (
                  <span className="pill" key={p}>
                    <Check /> {p}
                  </span>
                ))}
              </div>

              <div className="hero-cta">
                <div className="hero-price">
                  <span className="amt">${target.price}</span>
                  <span className="per">{config.currency} · one-time</span>
                </div>
                <button className="btn primary lg" onClick={() => onGetAccess(target)}>
                  Get access <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
                <button className="btn ghost lg" onClick={() => setDetail(target)}>
                  View details
                </button>
              </div>
            </div>

            <div className="hero-preview" aria-hidden>
              <div className="win-bar">
                <i /><i /><i />
              </div>
              <div className="win-body">
                <div className="line w1" />
                <div className="line w2" />
                <div className="line w3" />
                <div className="chart" />
                <div className="line w4" />
              </div>
            </div>
          </div>
        </section>

        {/* CATALOG */}
        <div className="sec-head" id="catalog">
          <div>
            <h2>Build catalog</h2>
            <p>{engines.length} private builds · verified distribution</p>
          </div>
          <span className="badge">Restricted access</span>
        </div>

        <div className="products">
          {others.map((e) => (
            <ProductCard key={e.id} engine={e} onOpen={setDetail} />
          ))}
        </div>

        <div style={{ height: 80 }} />
      </motion.div>

      <AnimatePresence>
        {detail && (
          <ProductDetail
            engine={detail}
            onClose={() => setDetail(null)}
            onGetAccess={(e) => {
              setDetail(null)
              onGetAccess(e)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
