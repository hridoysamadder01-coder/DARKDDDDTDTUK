import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Engine } from '../../types'
import { config } from '../../config'
import { DEFAULT_FEATURES } from '../../data/engines'
import { Check, Close, ArrowRight } from '../ui/Icons'
import { statusBadge, monogram } from './ProductCard'
import { useSound } from '../../hooks/useSoundToggle'

interface Props {
  engine: Engine
  onClose: () => void
  onGetAccess: (e: Engine) => void
}

export default function ProductDetail({ engine, onClose, onGetAccess }: Props) {
  const { play } = useSound()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const title = engine.name.split('//')[0].trim()
  const variant = engine.name.split('//')[1]?.trim() ?? engine.buildClass
  const st = statusBadge(engine.status)
  const features = engine.features ?? DEFAULT_FEATURES

  const specs: Array<[string, string]> = [
    ['Device class', engine.deviceClass ?? engine.platform],
    ['Build class', engine.buildClass],
    ['Runtime', engine.runtimeMode],
    ['Merge capability', engine.mergeCapability ?? 'Cross-model merge ready'],
    ['Compatibility', engine.compatibility ?? 'Google-supported layer'],
    ['Access model', engine.accessModel ?? config.accessLabel],
    ['Security', engine.securityLayer],
    ['Processing', engine.processing],
  ]

  return (
    <motion.div
      className="overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 26, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        role="dialog"
        aria-modal="true"
        aria-label={engine.name}
      >
        <div className="sheet-head">
          <span className={`p-icon ${engine.isTarget ? 'accent' : ''}`}>{monogram(engine.name)}</span>
          <div>
            <h3>{title}</h3>
            <div className="sub">{variant}</div>
          </div>
          <button className="close" onClick={onClose} aria-label="Close">
            <Close style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div className="sheet-body">
          <div className="row wrap" style={{ gap: 8 }}>
            <span className={`badge ${st.cls}`}>{st.label}</span>
            <span className="badge">{engine.platform}</span>
            <span className="badge accent">{engine.accessClass}</span>
            <span className="badge success">{config.accessLabel}</span>
          </div>

          <h4>Overview</h4>
          <p>{engine.isTarget && engine.targetLines ? engine.targetLines[0] : engine.summary}</p>
          {engine.isTarget && engine.targetLines?.[1] && <p>{engine.targetLines[1]}</p>}

          <h4>Specifications</h4>
          <div className="spec-list">
            {specs.map(([k, v]) => (
              <div className="row-i" key={k}>
                <div className="k">{k}</div>
                <div className="v">{v}</div>
              </div>
            ))}
          </div>

          <h4>What's included</h4>
          <ul className="feat-list">
            {features.map((f) => (
              <li key={f}>
                <Check /> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="sheet-foot">
          <div className="price">
            <span className="amt mono">${engine.price}</span>
            <span className="per">{config.currency} · {config.accessLabel}</span>
          </div>
          <button
            className="btn primary"
            onClick={() => {
              play('whoosh')
              onGetAccess(engine)
            }}
          >
            Get access <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
