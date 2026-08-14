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

  const deviceClass = engine.deviceClass ?? engine.platform
  const mergeCapability = engine.mergeCapability ?? 'CROSS-MODEL MERGE READY'
  const compatibility = engine.compatibility ?? 'GOOGLE-SUPPORTED COMPATIBILITY LAYER'
  const accessModel = engine.accessModel ?? `${config.accessLabel} CLASS`
  const features = engine.features ?? DEFAULT_FEATURES

  const specs: Array<[string, string]> = useMemo(
    () => [
      ['DEVICE CLASS', deviceClass],
      ['BUILD CLASS', engine.buildClass],
      ['RUNTIME MODE', engine.runtimeMode],
      ['MERGE CAPABILITY', mergeCapability],
      ['COMPATIBILITY', compatibility],
      ['ACCESS MODEL', accessModel],
      ['PRICE', `$${engine.price} ${config.currency}`],
      ['SECURITY LAYER', engine.securityLayer],
      ['PROCESSING', engine.processing],
      ['STATUS', engine.status],
    ],
    [engine, deviceClass, mergeCapability, compatibility, accessModel],
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
          {['Cross-model merge ready', 'Google-supported compatibility layer', 'Lifetime access class', 'Native mobile runtime', 'Direct device execution'].map(
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

        <div className="m-sub" style={{ marginTop: 4 }}>FEATURE GRID</div>
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
          NOTE // Fictional package inside a prank simulation. Nothing is downloadable,
          installable, or real — and "access" costs nothing. {config.simulationLabel}.
        </div>

        <div className="m-actions">
          <button className="btn ghost" onClick={onClose}>
            ◂ BACK TO DIRECTORY
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
