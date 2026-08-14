import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Engine } from '../../types'
import { config, zh } from '../../config'
import { DEFAULT_FEATURES } from '../../data/engines'
import GlitchText from '../ui/GlitchText'
import { useSound } from '../../hooks/useSoundToggle'

interface Props {
  engine: Engine
  onClose: () => void
  onInitiate: (e: Engine) => void
}

export default function DetailModal({ engine, onClose, onInitiate }: Props) {
  const { play } = useSound()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const compatibility = engine.compatibility ?? 'COMPATIBLE WITH GEMINI VISION WORKFLOWS'
  const features = engine.features ?? DEFAULT_FEATURES
  const buildId = engine.id.toUpperCase().replace(/-/g, '-')

  const specs: Array<[string, string]> = useMemo(
    () => [
      ['BUILD ID', `CE-${buildId}`],
      ['PLATFORM', engine.platform],
      ['RUNTIME MODE', engine.runtimeMode],
      ['ENGINE CLASS', engine.buildClass],
      ['PROCESSING MODE', engine.processing],
      ['COMPATIBILITY', compatibility],
      ['ACCESS CLASS', engine.accessClass],
      ['PRICE', `$${engine.price} ${config.currency}`],
      ['SECURITY LAYER', engine.securityLayer],
      ['STATUS', engine.status],
    ],
    [engine, compatibility, buildId],
  )

  const isTarget = !!engine.isTarget

  return (
    <motion.div
      className="modal-backdrop"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`modal framed ${isTarget ? 'modal-target' : ''}`}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        role="dialog"
        aria-modal="true"
        aria-label={engine.name}
      >
        <button className="close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="m-sub">
          RESTRICTED PACKAGE INSPECTION{config.bilingualLabels ? ` // ${zh.restricted}` : ''}
        </div>
        <GlitchText as="h3" text={engine.name} intensity={0.16} />

        <div className="meta mt8">
          <span className="chip amber">{engine.status}</span>
          <span className="chip">{engine.accessClass}</span>
          <span className="chip green">SIGNATURE · VALID</span>
          <span className="chip green">{config.accessLabel}</span>
        </div>

        <p className="m-desc">
          {isTarget && engine.targetLines ? engine.targetLines[0] : engine.summary}
        </p>

        {/* premium phrase strip */}
        <div className="phrase-strip">
          {['Cross-model merge ready', 'Compatible with Gemini vision workflows', 'Lifetime access class', 'Native mobile runtime', 'Direct device execution'].map(
            (p) => (
              <span className="phrase" key={p}>
                {p}
              </span>
            ),
          )}
        </div>

        <div className="spec-grid">
          {specs.map(([k, v]) => (
            <div className="cell" key={k}>
              <div className="k">{k}</div>
              <div className="v">{v}</div>
            </div>
          ))}
        </div>

        <div className="m-sub" style={{ marginTop: 4 }}>FEATURE MATRIX</div>
        <ul className="feature-grid">
          {features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        {isTarget && engine.marketing && (
          <div className="phrase-strip" style={{ marginTop: 12 }}>
            {engine.marketing.map((m) => (
              <span className="phrase amber" key={m}>
                {m}
              </span>
            ))}
          </div>
        )}

        <div className="m-desc faded" style={{ fontSize: 11.5 }}>
          NOTE // Fictional build inside a private distribution index. Restricted access ·
          verified channel only.
        </div>

        <div className="m-actions">
          <button className="btn ghost" onClick={onClose}>
            ◂ RETURN TO DIRECTORY
          </button>
          <button
            className={`btn ${isTarget ? 'amber' : 'primary'}`}
            onClick={() => {
              play('whoosh')
              onInitiate(engine)
            }}
          >
            INITIATE ACCESS ▸
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
