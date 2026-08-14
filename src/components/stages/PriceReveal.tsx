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

  const ladder = useMemo(() => makeLadder(engine.price), [engine.price])
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

  return (
    <div className="cine price">
      <div className="inner">
        {phase === 'calc' && (
          <motion.div
            className="calc"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            CALCULATING PRIVATE ACCESS COST...
          </motion.div>
        )}

        {phase !== 'calc' && (
          <>
            <div className="calc faded" style={{ marginBottom: 4 }}>
              {shortName} // PRIVATE ACCESS COST
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

        {phase === 'final' && <CryptoSelect onSelect={onSelect} />}
      </div>
    </div>
  )
}
