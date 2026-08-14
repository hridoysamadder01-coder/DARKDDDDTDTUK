import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Engine } from '../../types'
import { engines } from '../../data/engines'
import { config, zh } from '../../config'
import Hud from './Hud'
import EngineCard from './EngineCard'
import DetailModal from './DetailModal'
import GlitchText from '../ui/GlitchText'

interface Props {
  onTarget: (e: Engine) => void
}

export default function Terminal({ onTarget }: Props) {
  const [detail, setDetail] = useState<Engine | null>(null)

  // Order: keep the target build featured near the top of the directory.
  const target = engines.find((e) => e.isTarget)!
  const others = engines.filter((e) => !e.isTarget)
  const beforeTarget = others.slice(0, 4)
  const afterTarget = others.slice(4)

  return (
    <motion.div
      className="shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <Hud />

      <div className="masthead">
        <GlitchText as="h1" text="CORE ENGINE ACCESS TERMINAL" intensity={0.08} />
        <div className="sub">PRIVATE SOFTWARE DISTRIBUTION NODE</div>
        <div className="ticker">
          <span>CH <b>7X-PROTOCOL</b></span>
          <span>LNK <b>OMEGA-4</b></span>
          <span>GATE <b>EU-GATE-9</b></span>
          <span>VLT <b>VAULT-11</b></span>
          {config.bilingualLabels && <span className="zh" style={{ color: 'var(--amber)' }}>{zh.connected}</span>}
        </div>
      </div>

      <div className="section-label">ENGINE // BUILD DIRECTORY</div>

      <div className="grid">
        {beforeTarget.map((e) => (
          <EngineCard key={e.id} engine={e} onOpen={setDetail} onTarget={onTarget} />
        ))}
        <EngineCard key={target.id} engine={target} onOpen={setDetail} onTarget={onTarget} />
        {afterTarget.map((e) => (
          <EngineCard key={e.id} engine={e} onOpen={setDetail} onTarget={onTarget} />
        ))}
      </div>

      <div className="section-label">END OF DIRECTORY // {engines.length} BUILDS INDEXED</div>

      <AnimatePresence>
        {detail && <DetailModal engine={detail} onClose={() => setDetail(null)} />}
      </AnimatePresence>
    </motion.div>
  )
}
