import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Engine } from '../../types'
import { config, zh } from '../../config'
import GlitchText from '../ui/GlitchText'
import { useSound } from '../../hooks/useSoundToggle'

interface Props {
  engine: Engine
  onClose: () => void
}

export default function DetailModal({ engine, onClose }: Props) {
  const { play } = useSound()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const specs: Array<[string, string]> = [
    ['PLATFORM', engine.platform],
    ['BUILD CLASS', engine.buildClass],
    ['RUNTIME MODE', engine.runtimeMode],
    ['SECURITY LAYER', engine.securityLayer],
    ['PROCESSING', engine.processing],
    ['ACCESS CLASS', engine.accessClass],
    ['STATUS', engine.status],
    ['INTEGRITY', 'SEALED · SIM'],
  ]

  return (
    <motion.div
      className="modal-backdrop"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="modal framed"
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
        </div>

        <p className="m-desc">{engine.summary}</p>

        <div className="spec-grid">
          {specs.map(([k, v]) => (
            <div className="cell" key={k}>
              <div className="k">{k}</div>
              <div className="v">{v}</div>
            </div>
          ))}
        </div>

        <div className="m-desc faded" style={{ fontSize: 11.5 }}>
          NOTE // This is a fictional package inside a prank simulation. Nothing is
          downloadable, installable, or real. {config.simulationLabel}.
        </div>

        <div className="m-actions">
          <button className="btn ghost" onClick={onClose}>
            ◂ BACK TO DIRECTORY
          </button>
          <button className="btn" onClick={() => { play('beep'); onClose() }}>
            ACKNOWLEDGE
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
