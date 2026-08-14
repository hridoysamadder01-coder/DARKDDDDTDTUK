import { motion } from 'framer-motion'
import type { Engine } from '../../types'
import { config, zh } from '../../config'
import GlitchText from '../ui/GlitchText'

const statusClass = (s: Engine['status']): 'green' | 'amber' | 'red' => {
  if (s.startsWith('AVAILABLE') || s.startsWith('UNIVERSAL')) return 'green'
  if (s.startsWith('RESTRICTED')) return 'amber'
  return 'red'
}

interface Props {
  engine: Engine
  onOpen: (e: Engine) => void
  onTarget: (e: Engine) => void
}

export default function EngineCard({ engine, onOpen, onTarget }: Props) {
  const isTarget = !!engine.isTarget
  const openHandler = () => (isTarget ? onTarget(engine) : onOpen(engine))

  return (
    <motion.div
      className={`card ${isTarget ? 'target' : ''}`}
      onClick={openHandler}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          openHandler()
        }
      }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4 }}
      aria-label={`${engine.name} — view access`}
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
        <span className="chip green">{engine.accessClass}</span>
        <span className="view">{isTarget ? 'INITIATE ACCESS ▸' : 'VIEW ACCESS ▸'}</span>
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
        <div className="stat"><span className="k">SECURITY</span><span className="v amber">{engine.securityLayer}</span></div>
        <div className="stat"><span className="k">PROCESSING</span><span className="v">{engine.processing}</span></div>
        <div className="stat"><span className="k">ACCESS</span><span className="v red">{engine.accessClass}</span></div>
        {config.bilingualLabels && (
          <div className="mt8">
            <span className="zh-tag">{zh.coreEngine} · {zh.mobileNative} · {zh.restricted}</span>
          </div>
        )}
      </div>
    </div>
  )
}
