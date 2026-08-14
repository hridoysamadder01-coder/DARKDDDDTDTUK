import { useState } from 'react'
import { motion } from 'framer-motion'
import type { CryptoAsset, Engine } from '../../types'
import { config, zh } from '../../config'
import { useCountdown } from '../../hooks/useCountdown'
import { useSound } from '../../hooks/useSoundToggle'
import QrDecor from '../ui/QrDecor'
import VerifyFlow from './VerifyFlow'

interface Props {
  engine: Engine
  coin: CryptoAsset
  onBack: () => void
  onDone: () => void
}

const NETWORKS = ['SIM-NET', 'GHOSTCHAIN', 'NODE-X', 'VAULT-NET', 'ZERO-LINK']
const REFS = ['SESSION-X93-A11', 'VAULT-CORE-72', 'NODE-ACCESS-440']

/** Cinematic access session for the chosen asset. Frontend simulation only. */
export default function CryptoSession({ engine, coin, onBack, onDone }: Props) {
  const { play } = useSound()
  const [verifying, setVerifying] = useState(false)
  const [linkBusy, setLinkBusy] = useState(false)
  const [linkMsg, setLinkMsg] = useState('轻触打开支付 · TAP TO OPEN PAYMENT')
  const { remaining, label } = useCountdown(config.countdownSeconds)

  const rows: Array<[string, string, 'green' | 'amber' | 'red' | undefined]> = [
    ['资产 · ASSET', `${coin.sym} · ${coin.name}`, 'green'],
    ['金额 · AMOUNT', `$${engine.price} ${config.currency}`, undefined],
    ['访问 · ACCESS', config.accessLabel, 'amber'],
    ['状态 · STATUS', '等待确认 · WAITING FOR CONFIRMATION', 'amber'],
  ]

  // The payment link is intentionally non-functional — tapping it does nothing
  // real. It exists only to look convincing inside the simulation.
  const openPay = () => {
    if (linkBusy) return
    play('key')
    setLinkBusy(true)
    setLinkMsg('正在连接支付节点… · CONNECTING TO NODE…')
    window.setTimeout(() => {
      setLinkBusy(false)
      setLinkMsg('链接不可用 · LINK UNAVAILABLE · 无真实交易')
      play('warn')
    }, 1150)
  }

  return (
    <div className="cine">
      <motion.div
        className="paypanel panel framed crypto"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      >
        <div className="bar">
          <span className="title">安全访问会话 · SECURE ACCESS</span>
          <span className="chip green">{coin.sym}</span>
        </div>

        <div className="body">
          <div className="amount">${engine.price}</div>
          <div className="amount-sub">
            {config.currency} · {config.accessLabel}
          </div>

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
              <div className="net-row">
                {NETWORKS.map((n) => (
                  <span className="chip" key={n}>
                    {n}
                  </span>
                ))}
              </div>

              <QrDecor />
              <div className="qr-note">DECORATIVE · NON-SCANNABLE</div>

              <div className="wallet">
                SESSION REF · <b>{REFS[0]}</b>
                <div style={{ marginTop: 6, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {REFS.slice(1).map((r) => (
                    <span className="chip" key={r}>
                      {r}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: 10, marginTop: 8, letterSpacing: '0.14em' }} className="faded">
                  合成引用 · SYNTHETIC REFERENCE
                </div>
              </div>

              <div className="paylink">
                <div className="paylink-h">支付链接 · PAYMENT LINK</div>
                <div className="paylink-row">
                  <span className="paylink-url">pay.corevault-sim.net/s/{REFS[0].toLowerCase()}</span>
                  <button className="paylink-btn" onClick={openPay} disabled={linkBusy}>
                    {linkBusy ? '验证中…' : '打开 · OPEN'} ▸
                  </button>
                </div>
                <div className={`paylink-msg ${linkBusy ? 'busy' : ''}`}>{linkMsg}</div>
              </div>

              <div className={`timer ${remaining < 60 ? 'low' : ''}`}>
                会话到期 · EXPIRES IN {label}
                {config.bilingualLabels ? ` · ${zh.verifying}` : ''}
              </div>
            </>
          )}

          {verifying && <VerifyFlow onDone={onDone} />}

          {!verifying && (
            <div className="row-center mt24">
              <button className="btn ghost" onClick={onBack}>
                ◂ CHANGE ASSET
              </button>
              <button
                className="btn primary"
                onClick={() => {
                  play('whoosh')
                  setVerifying(true)
                }}
              >
                VERIFY ACCESS
              </button>
            </div>
          )}
        </div>
      </motion.div>

      <div className="faded mt16" style={{ maxWidth: 460, textAlign: 'center', fontSize: 11, letterSpacing: '0.16em' }}>
        无真实交易 · {config.financialNotice}
      </div>
    </div>
  )
}
