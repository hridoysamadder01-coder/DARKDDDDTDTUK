import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { CryptoAsset, Engine } from '../../types'
import { config } from '../../config'
import { cryptoAmount } from '../../data/coins'
import { useCountdown } from '../../hooks/useCountdown'
import { useSequence, type SequenceStep } from '../../hooks/useSequence'
import { useSound } from '../../hooks/useSoundToggle'
import TopBar from './TopBar'
import QrDecor from '../ui/QrDecor'
import { Check, Copy, ArrowRight } from '../ui/Icons'

interface Props {
  engine: Engine
  coin: CryptoAsset
  onBack: () => void
  onDone: () => void
}

interface VStep {
  label: string
}
const VSTEPS: VStep[] = [
  { label: 'Detecting transaction on network' },
  { label: 'Transaction found in mempool' },
  { label: 'Confirmation 1 of 3' },
  { label: 'Confirmation 2 of 3' },
  { label: 'Confirmation 3 of 3' },
  { label: 'Verifying payment signature' },
  { label: 'Payment confirmed' },
]

export default function Invoice({ engine, coin, onBack, onDone }: Props) {
  const { play } = useSound()
  const [verifying, setVerifying] = useState(false)
  const [copied, setCopied] = useState(false)
  const { remaining, label } = useCountdown(config.countdownSeconds)

  const amount = useMemo(() => cryptoAmount(engine.price, coin), [engine.price, coin])
  const address = useMemo(
    () => `sim1q${coin.sym.toLowerCase()}7x93a11f0demo9k2v4nonpayable8h3`,
    [coin.sym],
  )

  const copy = () => {
    navigator.clipboard?.writeText('DEMO ADDRESS — NON-PAYABLE (simulation)').catch(() => {})
    setCopied(true)
    play('key')
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <div>
      <TopBar onBack={verifying ? undefined : onBack} secure />
      <motion.div
        className="container invoice"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="card invoice-card">
          <div className="inv-head">
            <span className="t">Crypto payment</span>
            <span className="badge">
              <span className="a-coin" style={{ background: coin.color, width: 18, height: 18, fontSize: 9 }}>
                {coin.sym[0]}
              </span>
              {coin.sym} · {coin.network}
            </span>
          </div>

          <div className="inv-amt">
            <div className="fiat">${engine.price}.00</div>
            <div className="crypto">≈ {amount} {coin.sym} · {config.accessLabel}</div>
          </div>

          {!verifying ? (
            <>
              <div className="inv-rows">
                <div className="r"><span className="k">Product</span><span className="v">{config.targetCodename}</span></div>
                <div className="r"><span className="k">Network</span><span className="v">{coin.network}</span></div>
                <div className="r"><span className="k">Status</span><span className="v warn">Awaiting payment</span></div>
              </div>

              <div className="qr-wrap">
                <QrDecor />
                <div className="qr-note">DEMO QR — NON-PAYABLE</div>
              </div>

              <div className="addr">
                <span className="a-txt">{address}</span>
                <button className="copy" onClick={copy}>
                  {copied ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="addr-note">Demo address — not a real wallet. Nothing can be sent here.</div>

              <div className="timer-row">
                Payment window
                <span className={`t ${remaining < 60 ? 'low' : ''}`}>{label}</span>
              </div>

              <div className="inv-actions">
                <button className="btn ghost block" onClick={onBack}>Change currency</button>
                <button
                  className="btn primary block"
                  onClick={() => {
                    play('whoosh')
                    setVerifying(true)
                  }}
                >
                  I've paid — verify <ArrowRight style={{ width: 15, height: 15 }} />
                </button>
              </div>
            </>
          ) : (
            <VerifyFlow onDone={onDone} />
          )}
        </div>

        <p className="faint mt16" style={{ fontSize: 12, textAlign: 'center' }}>
          {config.simulationLabel} — cosmetic mock only. No wallet, no chain, no transaction.
        </p>
      </motion.div>
    </div>
  )
}

function VerifyFlow({ onDone }: { onDone: () => void }) {
  const { play } = useSound()
  const [active, setActive] = useState(0)

  const steps: SequenceStep[] = useMemo(() => {
    const s: SequenceStep[] = []
    VSTEPS.forEach((_, i) => {
      s.push({
        at: i === 0 ? 500 : 620 + Math.round(Math.random() * 260),
        run: () => {
          setActive(i + 1)
          play(i === VSTEPS.length - 1 ? 'confirm' : 'beep')
        },
      })
    })
    s.push({ at: 900, run: () => onDone() })
    return s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useSequence(steps)

  return (
    <div className="verify">
      {VSTEPS.map((st, i) => {
        const done = i < active
        const current = i === active
        return (
          <motion.div
            key={st.label}
            className={`vstep ${done ? 'done' : ''}`}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: done || current ? 1 : 0.3 }}
          >
            {done ? (
              <span className="mark ok"><Check style={{ width: 12, height: 12 }} /></span>
            ) : current ? (
              <span className="spinner" />
            ) : (
              <span className="mark pending">·</span>
            )}
            {st.label}
          </motion.div>
        )
      })}
    </div>
  )
}
