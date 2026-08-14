import { useState } from 'react'
import { motion } from 'framer-motion'
import type { PaymentChannel } from '../../types'
import { config, zh } from '../../config'
import { useCountdown } from '../../hooks/useCountdown'
import { useSound } from '../../hooks/useSoundToggle'
import QrDecor from '../ui/QrDecor'
import VerifyFlow from './VerifyFlow'
import GlitchText from '../ui/GlitchText'

interface Props {
  channel: PaymentChannel
  onBack: () => void
  onDone: () => void
}

const isBinance = (c: PaymentChannel) => c === 'binance'

export default function PayScreen({ channel, onBack, onDone }: Props) {
  const { play } = useSound()
  const [verifying, setVerifying] = useState(false)
  const { remaining, label } = useCountdown(config.countdownSeconds)

  const binance = isBinance(channel)
  const title = binance ? 'BINANCE SECURE PAY' : 'CRYPTO SECURE GATEWAY'

  const rows: Array<[string, string, 'green' | 'amber' | 'red' | undefined]> = binance
    ? [
        ['AMOUNT', `$${config.price} ${config.currency}`, undefined],
        ['METHOD', 'BINANCE', 'amber'],
        ['NETWORK', 'SIM-BEP20', undefined],
        ['SESSION', 'AWAITING PAYMENT', 'amber'],
      ]
    : [
        ['AMOUNT', `$${config.price} ${config.currency}`, undefined],
        ['STATUS', 'CHANNEL OPEN', 'green'],
        ['NETWORK', 'SIM-NET · GHOSTCHAIN', undefined],
        ['ROUTE', 'NODE-X → VAULT-NET', undefined],
      ]

  return (
    <div className="cine">
      <motion.div
        className={`paypanel panel framed ${binance ? 'binance' : 'crypto'}`}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      >
        <div className="bar">
          <span className="title">{title}</span>
          <span className="chip amber">{config.bilingualLabels ? zh.verifying : 'DEMO'}</span>
        </div>

        <div className="body">
          <div className="amount">${config.price}</div>
          <div className="amount-sub">{config.currency} · ONE-TIME PRIVATE ACCESS</div>

          <div className="rows">
            {rows.map(([k, v, tone]) => (
              <div className="stat" key={k}>
                <span className="k">{k}</span>
                <span className={`v ${tone ?? ''}`}>{v}</span>
              </div>
            ))}
          </div>

          {!verifying && (
            <>
              <QrDecor />
              <div className="qr-note">DEMO QR // NON-PAYABLE</div>
              <div className="wallet">
                {binance ? 'DEPOSIT REF' : 'ROUTE REF'} ·{' '}
                <b>{binance ? 'DEMO-WALLET-7X93-A11F' : 'SIM-VAULT-GHOST-4F0X'}</b>
                <div style={{ fontSize: 10, marginTop: 6, letterSpacing: '0.14em' }} className="faded">
                  NOT A REAL ADDRESS · SIMULATION LABEL ONLY
                </div>
              </div>
              <div className={`timer ${remaining < 60 ? 'low' : ''}`}>
                SESSION EXPIRES IN {label}
              </div>
            </>
          )}

          {verifying && <VerifyFlow onDone={onDone} />}

          {!verifying && (
            <div className="row-center mt24">
              <button className="btn ghost" onClick={onBack}>
                ◂ BACK
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  play('whoosh')
                  setVerifying(true)
                }}
              >
                VERIFY PAYMENT
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="faded mt16" style={{ maxWidth: 460, textAlign: 'center', fontSize: 11, letterSpacing: '0.1em' }}>
        <GlitchText text={config.simulationLabel} intensity={0.05} /> — this screen is a
        cosmetic mock. No wallet, no transaction, no payment API is involved.
      </div>
    </div>
  )
}
