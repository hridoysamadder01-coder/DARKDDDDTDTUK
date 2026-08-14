import { motion } from 'framer-motion'
import type { CryptoAsset } from '../../types'
import { coins } from '../../data/coins'
import { config, zh } from '../../config'
import { useSound } from '../../hooks/useSoundToggle'
import GlitchText from '../ui/GlitchText'

interface Props {
  onSelect: (c: CryptoAsset) => void
}

/** SELECT CRYPTO ASSET — coin grid. Simulation only, no real assets. */
export default function CryptoSelect({ onSelect }: Props) {
  const { play } = useSound()
  const choose = (c: CryptoAsset) => {
    play('whoosh')
    onSelect(c)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="section-label" style={{ justifyContent: 'center' }}>
        SELECT DIGITAL ASSET
      </div>

      <div className="coin-grid">
        {coins.map((c, i) => (
          <motion.button
            key={c.sym}
            className={`coin-opt ${c.strong ? 'strong' : ''}`}
            onClick={() => choose(c)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 + i * 0.05 }}
            aria-label={`Select ${c.name} (${c.sym})`}
          >
            <div className="coin-top">
              <GlitchText as="span" className="coin-sym" text={c.sym} intensity={c.strong ? 0.18 : 0.08} />
              {c.strong && <span className="chip amber">TOP</span>}
            </div>
            <div className="coin-name">{c.name}</div>
            <div className="coin-sub">{c.sub}</div>
            <div className="coin-go">OPEN SESSION ▸</div>
          </motion.button>
        ))}
      </div>

      <div className="faded mt16" style={{ fontSize: 11, letterSpacing: '0.14em' }}>
        {config.financialNotice}
        {config.bilingualLabels ? ` · ${zh.encrypted}` : ''}
      </div>
    </motion.div>
  )
}
