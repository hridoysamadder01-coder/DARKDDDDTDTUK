import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Engine } from '../../types'
import { engines } from '../../data/engines'
import { config, zh } from '../../config'
import { pushFeed } from '../../lib/feed'
import { hex } from '../../lib/random'
import Hud from './Hud'
import LiveFeed from './LiveFeed'
import EngineCard from './EngineCard'
import DetailModal from './DetailModal'
import GlitchText from '../ui/GlitchText'

interface Props {
  onInitiate: (e: Engine) => void
}

const short = (e: Engine) => e.name.split('//')[0].trim()

export default function Terminal({ onInitiate }: Props) {
  const [detail, setDetail] = useState<Engine | null>(null)

  const target = engines.find((e) => e.isTarget)!
  const others = engines.filter((e) => !e.isTarget)

  // Every open prints intercept traffic — click → text.
  const openDetail = (e: Engine) => {
    pushFeed(`» query ${short(e)}`, 'in')
    pushFeed(`» pull manifest 0x${hex(6)}`, 'dim')
    pushFeed(`» decrypt package :: ok`, 'ok')
    setDetail(e)
  }

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

      <LiveFeed />

      <div className="section-label">FEATURED // PRIMARY TARGET BUILD</div>
      <div className="grid">
        <EngineCard key={target.id} engine={target} onOpen={openDetail} />
      </div>

      <div className="section-label">ENGINE // BUILD MARKETPLACE · {engines.length} BUILDS INDEXED</div>
      <div className="grid">
        {others.map((e) => (
          <EngineCard key={e.id} engine={e} onOpen={openDetail} />
        ))}
      </div>

      <div className="section-label">END OF DIRECTORY // SECURE INDEX</div>

      <AnimatePresence>
        {detail && (
          <DetailModal
            engine={detail}
            onClose={() => setDetail(null)}
            onInitiate={(e) => {
              pushFeed(`» INITIATE ACCESS CHAIN :: ${short(e)}`, 'in')
              pushFeed(`» requesting private node 0x${hex(6)}`, 'warn')
              setDetail(null)
              onInitiate(e)
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
