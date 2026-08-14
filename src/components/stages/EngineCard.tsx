import { motion } from 'framer-motion'
import type { Engine } from '../../types'
import { config, zh } from '../../config'
import GlitchText from '../ui/GlitchText'

const statusClass = (s: Engine['status']): 'green' | 'amber' | 'red' => {
  if (s.startsWith('AVAILABLE') || s.startsWith('UNIVERSAL')) return 'green'
  if (s.startsWith('VERIFIED') || s.startsWith('PRIVATE')) return 'amber'
  return 'red'
}

interface Props {
  engine: Engine
  onOpen: (e: Engine) => void
}

export default function EngineCard({ engine, onOpen }: Props) {
  const isTarget = !!engine.isTarget

  return (
    <motion.div
      className={`card ${isTarget ? 'target' : ''}`}
      onClick={() => onOpen(engine)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(engine)
        }
      }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      aria-label={`${engine.name} — $${engine.price} — view access`}
    >
      <span className="idx">#{String(engine.index).padStart(2, '0')}</span>

      {isTarget ? (
        <GlitchText as="div" className="cname" text={engine.name} intensity={0.2} />
      ) : (
        <div className="cname">{engine.name}</div>
      )}

      <div className="meta">
        <span className="chip">{engine.platform}</span>
        <span className="chip">{engine.buildClass}</span>
        <span className={`chip ${statusClass(engine.status)}`}>{engine.status}</span>
      </div>

      {isTarget ? (
        <TargetBody engine={engine} />
      ) : (
        <div className="desc">{engine.summary}</div>
      )}

      <div className="foot">
        <span className="price-tag">
          ${engine.price}
          <em>{config.currency}</em>
        </span>
        <span className="view">VIEW ACCESS ▸</span>
      </div>
    </motion.div>
  )
}

function TargetBody({ engine }: { engine: Engine }) {
  return (
    <div className="target-layout">
      <div className="target-copy">
        {engine.targetLines?.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
        {engine.features && (
          <ul className="target-feats">
            {engine.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="target-spec">
        <div className="stat"><span className="k">RUNTIME</span><span className="v">{engine.runtimeMode}</span></div>
        <div className="stat"><span className="k">MERGE</span><span className="v amber">CROSS-MODEL</span></div>
        <div className="stat"><span className="k">COMPAT</span><span className="v">GEMINI WORKFLOWS</span></div>
        <div className="stat"><span className="k">ACCESS</span><span className="v amber">{config.accessLabel}</span></div>
        <div className="stat"><span className="k">SECURITY</span><span className="v red">{engine.securityLayer}</span></div>
        {config.bilingualLabels && (
          <div className="mt8">
            <span className="zh-tag">{zh.coreEngine} · {zh.mobileNative} · {zh.authorized}</span>
          </div>
        )}
      </div>
    </div>
  )
}
