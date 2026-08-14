import { motion } from 'framer-motion'
import type { PaymentChannel } from '../../types'
import { config, zh } from '../../config'
import { useSound } from '../../hooks/useSoundToggle'

interface Props {
  onSelect: (c: PaymentChannel) => void
}

/** SELECT PAYMENT CHANNEL — Binance first, then Crypto. Simulation only. */
export default function PaymentSelect({ onSelect }: Props) {
  const { play } = useSound()
  const choose = (c: PaymentChannel) => {
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
        SELECT PAYMENT CHANNEL
      </div>
      <div className="pay-grid">
        <button className="pay-opt binance" onClick={() => choose('binance')}>
          <div className="name">BINANCE</div>
          <div className="subl">FAST // VERIFIED // GLOBAL</div>
          {config.bilingualLabels && (
            <div className="zh-tag mt8">{zh.authorized}</div>
          )}
          <div className="go">OPEN SECURE PAY ▸</div>
        </button>
        <button className="pay-opt crypto" onClick={() => choose('crypto')}>
          <div className="name">CRYPTO</div>
          <div className="subl">PRIVATE // DIRECT // SECURE</div>
          {config.bilingualLabels && (
            <div className="zh-tag mt8" style={{ color: 'var(--green)' }}>{zh.encrypted}</div>
          )}
          <div className="go">OPEN GATEWAY ▸</div>
        </button>
      </div>
      <div className="faded mt16" style={{ fontSize: 11, letterSpacing: '0.14em' }}>
        BOTH CHANNELS ARE SIMULATED · NO REAL PAYMENT IS PROCESSED
      </div>
    </motion.div>
  )
}
