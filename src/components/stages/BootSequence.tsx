import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTypewriter } from '../../hooks/useTypewriter'
import { useSequence, type SequenceStep } from '../../hooks/useSequence'
import { useSound } from '../../hooks/useSoundToggle'
import { config, zh } from '../../config'
import GlitchText from '../ui/GlitchText'

interface Check {
  label: string
  value: string
  kind: 'ok' | 'warn'
}

const CHECKS: Check[] = [
  { label: 'BOOT SECTOR', value: 'OK', kind: 'ok' },
  { label: 'MEMORY INTEGRITY', value: 'OK', kind: 'ok' },
  { label: 'PRIVATE NODE', value: 'FOUND', kind: 'ok' },
  { label: 'SECURE CHANNEL', value: 'ESTABLISHED', kind: 'ok' },
  { label: 'ENGINE INDEX', value: 'LOADED', kind: 'ok' },
  { label: 'ACCESS CLASS', value: 'RESTRICTED', kind: 'warn' },
]

export default function BootSequence({ onDone }: { onDone: () => void }) {
  const { play } = useSound()
  const [introDone, setIntroDone] = useState(false)
  const [visible, setVisible] = useState(0)
  const [phase, setPhase] = useState<'checks' | 'alert' | 'override' | 'out'>('checks')
  const [black, setBlack] = useState(false)

  const intro = useTypewriter('INITIALIZING CORE TERMINAL...', {
    speed: 42,
    onChar: () => play('key'),
    onDone: () => setIntroDone(true),
  })

  // Pace the boot to roughly config.bootDurationMs.
  const perCheck = Math.max(240, Math.min(520, config.bootDurationMs / (CHECKS.length + 4)))

  const steps: SequenceStep[] = useMemo(() => {
    const s: SequenceStep[] = []
    CHECKS.forEach((_, i) => {
      s.push({
        at: i === 0 ? 500 : perCheck,
        run: () => {
          setVisible(i + 1)
          play(CHECKS[i].kind === 'warn' ? 'warn' : 'beep')
        },
      })
    })
    s.push({ at: perCheck + 260, run: () => { setPhase('alert'); play('warn') } })
    // brief distortion → black frame
    s.push({
      at: 1150,
      run: () => {
        setBlack(true)
        play('glitch')
        window.setTimeout(() => setBlack(false), 260)
      },
    })
    s.push({ at: 420, run: () => { setPhase('override'); play('confirm') } })
    s.push({ at: 1050, run: () => setPhase('out') })
    s.push({ at: 560, run: () => onDone() })
    return s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useSequence(steps, undefined, { active: introDone })

  return (
    <motion.div
      className="boot jitter"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'out' ? 0 : 1 }}
      transition={{ duration: 0.55 }}
    >
      <div className="term">
        <div className="head">
          {intro}
          {!introDone && <span className="cursor" />}
        </div>

        {introDone && (
          <div>
            {CHECKS.slice(0, visible).map((c, i) => (
              <motion.div
                key={c.label}
                className="leader"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22 }}
              >
                <span className="lbl">{c.label}</span>
                <span className="dots" />
                <span className={`val ${c.kind}`}>{c.value}</span>
                {i === CHECKS.length - 1 && config.bilingualLabels && (
                  <span className="zh" style={{ marginLeft: 10, color: 'var(--amber)', fontSize: 11 }}>
                    {zh.restricted}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {phase === 'alert' && (
            <motion.div
              className="alert glow-red"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0, 1, 0.4, 1, 0.7, 1], scale: 1 }}
              transition={{ duration: 0.9 }}
            >
              <GlitchText text="UNAUTHORIZED ROUTE DETECTED" always />
            </motion.div>
          )}
        </AnimatePresence>

        {(phase === 'override' || phase === 'out') && (
          <motion.div
            className="override"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            &gt; OVERRIDE ACCEPTED<span className="cursor" />
          </motion.div>
        )}
      </div>
      {black && <div className="black-cut" />}
    </motion.div>
  )
}
