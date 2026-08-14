import { motion } from 'framer-motion'
import type { CryptoAsset, Engine } from '../../types'
import { config } from '../../config'
import { coins } from '../../data/coins'
import { useSound } from '../../hooks/useSoundToggle'
import TopBar from './TopBar'
import { monogram } from './ProductCard'

interface Props {
  engine: Engine
  onBack: () => void
  onSelect: (c: CryptoAsset) => void
}

function Stepper({ step }: { step: number }) {
  const items = ['Review', 'Payment', 'Access']
  return (
    <div className="stepper">
      {items.map((label, i) => (
        <span key={label} style={{ display: 'contents' }}>
          <span className={`st ${i === step ? 'active' : i < step ? 'done' : ''}`}>
            <span className="n">{i < step ? '✓' : i + 1}</span>
            <span className="lbl">{label}</span>
          </span>
          {i < items.length - 1 && <span className="sep" />}
        </span>
      ))}
    </div>
  )
}

export default function Checkout({ engine, onBack, onSelect }: Props) {
  const { play } = useSound()
  const title = engine.name.split('//')[0].trim()
  const variant = engine.name.split('//')[1]?.trim() ?? engine.buildClass

  const choose = (c: CryptoAsset) => {
    play('whoosh')
    onSelect(c)
  }

  return (
    <div>
      <TopBar onBack={onBack} secure />
      <motion.div
        className="container checkout"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Stepper step={0} />

        <div className="co-title">
          <h2>Complete your order</h2>
          <p>Choose a payment currency to continue</p>
        </div>

        {/* order summary */}
        <div className="card summary">
          <div className="li">
            <div className="l">
              <span className={`p-icon ${engine.isTarget ? 'accent' : ''}`}>{monogram(engine.name)}</span>
              <div>
                <div className="name">{title}</div>
                <div className="meta">{variant} · {config.accessLabel}</div>
              </div>
            </div>
            <span className="amt">${engine.price}.00</span>
          </div>
          <div className="li">
            <div className="l"><div className="meta">Network &amp; processing (simulated)</div></div>
            <span className="amt">$0.00</span>
          </div>
          <div className="total">
            <span className="k">Total due</span>
            <span className="amt">${engine.price}.00</span>
          </div>
        </div>

        {/* payment currency */}
        <h4 style={{ margin: '26px 0 12px', fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
          Select payment currency
        </h4>
        <div className="assets">
          {coins.map((c) => (
            <motion.button
              key={c.sym}
              className={`asset ${c.strong ? 'strong' : ''}`}
              onClick={() => choose(c)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              aria-label={`Pay with ${c.name}`}
            >
              {c.strong && <span className="a-flag">POPULAR</span>}
              <div className="a-top">
                <span className="a-coin" style={{ background: c.color }}>{c.sym[0]}</span>
                <div>
                  <div className="a-sym">{c.sym}</div>
                  <div className="a-name">{c.name}</div>
                </div>
              </div>
              <div className="a-sub">{c.sub}</div>
            </motion.button>
          ))}
        </div>

        <p className="faint mt24" style={{ fontSize: 12.5, textAlign: 'center' }}>
          This is a simulated checkout. No wallet is connected and no transaction is ever created.
        </p>
      </motion.div>
    </div>
  )
}
