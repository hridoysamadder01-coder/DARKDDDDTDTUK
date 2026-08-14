import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CryptoAsset, Engine } from '../../types'
import { config } from '../../config'
import { makeLadder } from '../../lib/price'
import { useSound } from '../../hooks/useSoundToggle'
import GlitchText from '../ui/GlitchText'
import CryptoSelect from './CryptoSelect'

type Phase = 'calc' | 'ladder' | 'final'

interface Props {
  engine: Engine
  onSelect: (c: CryptoAsset) => void
}

export default function PriceReveal({ engine, onSelect }: Props) {
  const { play } = useSound()
  const [phase, setPhase] = useState<Phase>('calc')
  const [display, setDisplay] = useState<number | null>(null)
  const timers = useRef<number[]>([])

  const ladder = useMemo(
    () => (engine.price === config.price ? config.priceLadder : makeLadder(engine.price)),
    [engine.price],
  )
  const shortName = useMemo(() => engine.name.split('//')[0].trim(), [engine.name])

  useEffect(() => {
    const push = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms)
      timers.current.push(id)
    }

    push(() => setPhase('ladder'), 1500)

    let acc = 1500
    ladder.forEach((n, i) => {
      acc += 260 + i * 30
      push(() => {
        setDisplay(n)
        play('key')
      }, acc)
    })

    acc += 520
    push(() => {
      setDisplay(engine.price)
      setPhase('final')
      play('confirm')
    }, acc)

    return () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const detail: Array<[string, string]> = [
    ['BUILD', engine.buildClass],
    ['ACCESS CLASS', engine.accessClass],
    ['CLEARANCE', engine.securityLayer],
    ['TARGET', engine.platform],
  ]

  return (
    <div className="cine price">
      <div className="inner">
        <motion.div
          className="checkout panel framed"
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        >
          <div className="checkout-bar">
            <span className="checkout-title">{shortName} // SECURE CHECKOUT</span>
            <span className={`chip ${phase === 'final' ? 'green' : 'amber'}`}>
              {phase === 'final' ? 'ACCESS UNLOCKED' : 'CALCULATING'}
            </span>
          </div>

          <div className="checkout-body">
            {phase === 'calc' && (
              <motion.div
                className="calc"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                CALCULATING ACCESS CLASS...
              </motion.div>
            )}

            {phase !== 'calc' && (
              <>
                <div className="calc faded" style={{ marginBottom: 4 }}>
                  {shortName} // ACCESS CLASS
                </div>
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={`${phase}-${display}`}
                    className={`ladder ${phase === 'final' ? 'final' : ''}`}
                    initial={{ opacity: 0, y: phase === 'final' ? 0 : 6, scale: phase === 'final' ? 0.7 : 1 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: phase === 'final' ? 0.4 : 0.12 }}
                  >
                    {phase === 'final' ? (
                      <GlitchText text={`$${engine.price} ${config.currency}`} always intensity={0.3} />
                    ) : (
                      `$${display}`
                    )}
                  </motion.div>
                </AnimatePresence>

                {phase === 'final' && (
                  <motion.div
                    className="final-sub"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    {config.accessLabel}
                  </motion.div>
                )}
              </>
            )}

            {phase === 'final' && (
              <motion.div
                className="checkout-detail"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
              >
                {detail.map(([k, v]) => (
                  <div className="checkout-kv" key={k}>
                    <span className="k">{k}</span>
                    <span className="v">{v}</span>
                  </div>
                ))}
              </motion.div>
            )}

            {phase === 'final' && (
              <div className="checkout-sep">
                <span>SETTLEMENT</span>
              </div>
            )}

            {phase === 'final' && <CryptoSelect onSelect={onSelect} />}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
