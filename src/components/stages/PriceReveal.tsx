import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PaymentChannel } from '../../types'
import { config } from '../../config'
import { useSound } from '../../hooks/useSoundToggle'
import GlitchText from '../ui/GlitchText'
import PaymentSelect from './PaymentSelect'

type Phase = 'calc' | 'ladder' | 'final'

export default function PriceReveal({ onSelect }: { onSelect: (c: PaymentChannel) => void }) {
  const { play } = useSound()
  const [phase, setPhase] = useState<Phase>('calc')
  const [display, setDisplay] = useState<number | null>(null)
  const timers = useRef<number[]>([])

  const ladder = useMemo(() => config.priceLadder, [])

  useEffect(() => {
    const push = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms)
      timers.current.push(id)
    }

    // Phase 1: calculating
    push(() => setPhase('ladder'), 1500)

    // Phase 2: ladder of numbers
    let acc = 1500
    ladder.forEach((n, i) => {
      acc += 260 + i * 30
      push(() => {
        setDisplay(n)
        play('key')
      }, acc)
    })

    // Phase 3: land on final price
    acc += 520
    push(() => {
      setDisplay(config.price)
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
              OBSIDIAN CORE X // PRIVATE ACCESS COST
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
                  <GlitchText text={`$${config.price} ${config.currency}`} always intensity={0.3} />
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
                ONE-TIME PRIVATE ACCESS
              </motion.div>
            )}
          </>
        )}

        {phase === 'final' && <PaymentSelect onSelect={onSelect} />}
      </div>
    </div>
  )
}
