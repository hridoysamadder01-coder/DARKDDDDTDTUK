import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Engine } from '../../types'
import { config } from '../../config'
import { useSequence, type SequenceStep } from '../../hooks/useSequence'
import { useSound } from '../../hooks/useSoundToggle'
import { Check, CheckCircle, Sparkle } from '../ui/Icons'

type Phase = 'provisioning' | 'success' | 'reveal'

const PROV = [
  'Confirming payment',
  'Validating license',
  'Provisioning access',
  'Preparing build package',
  'Finalizing setup',
]

export default function Complete({ engine, onRestart }: { engine: Engine; onRestart: () => void }) {
  const { play } = useSound()
  const [phase, setPhase] = useState<Phase>('provisioning')
  const [active, setActive] = useState(0)
  const [pct, setPct] = useState(0)

  const codename = engine.name.split('//')[0].trim()
  const variant = engine.name.split('//')[1]?.trim() ?? engine.buildClass

  const steps: SequenceStep[] = useMemo(() => {
    const s: SequenceStep[] = []
    PROV.forEach((_, i) => {
      s.push({
        at: i === 0 ? 500 : 560 + Math.round(Math.random() * 200),
        run: () => {
          setActive(i + 1)
          setPct(Math.round(((i + 1) / PROV.length) * 100))
          play('beep')
        },
      })
    })
    s.push({ at: 700, run: () => { setPhase('success'); play('confirm') } })
    s.push({ at: 2100, run: () => { setPhase('reveal'); play('whoosh') } })
    return s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useSequence(steps)

  return (
    <div className="complete">
      <AnimatePresence mode="wait">
        {phase === 'provisioning' && (
          <motion.div
            key="prov"
            className="inner"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="card prov-card">
              <div className="prov-icon"><span className="spinner lg" style={{ margin: '0 auto' }} /></div>
              <div className="prov-title">Setting up your access</div>
              <div className="prov-sub">This usually takes a few seconds</div>
              <div className="mt24"><div className="bar"><div className="fill" style={{ width: `${pct}%` }} /></div></div>
              <div className="prov-steps">
                {PROV.map((label, i) => {
                  const done = i < active
                  const current = i === active
                  return (
                    <div key={label} className="vstep" style={{ opacity: done || current ? 1 : 0.35 }}>
                      {done ? (
                        <span className="mark ok"><Check style={{ width: 12, height: 12 }} /></span>
                      ) : current ? (
                        <span className="spinner" />
                      ) : (
                        <span className="mark pending">·</span>
                      )}
                      {label}
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'success' && (
          <motion.div
            key="success"
            className="inner"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          >
            <div className="success-emblem"><CheckCircle /></div>
            <h2>Access activated</h2>
            <div className="prod-line">{codename} · {variant}</div>
            <div className="lic">License key · <b>CE-OBSX-7X93-A11F-9K2V</b></div>
            <div className="prov-sub mt16">Your build is ready to download.</div>
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            className="reveal"
            style={{ minHeight: 'auto' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inner">
              <motion.div
                className="emblem"
                initial={{ scale: 0.8, rotate: -8, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <Sparkle />
              </motion.div>
              <h1>{config.finalPrankMessage}</h1>
              <div className="sub">{config.finalPrankSubtitle}</div>
              <p className="note">{config.finalPrankNote}</p>
              <p className="note small">
                You explored a fictional software marketplace. Every price, currency,
                address, and confirmation was pure front-end theatre — nothing was ever
                sent, stored, or charged.
              </p>
              <div className="actions">
                <button className="btn primary" onClick={onRestart}>Start over</button>
                <button
                  className="btn ghost"
                  onClick={() => navigator.clipboard?.writeText(window.location.href).catch(() => {})}
                >
                  Copy link to prank a friend
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
