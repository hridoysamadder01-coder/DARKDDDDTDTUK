import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { config } from '../../config'
import { useSequence, type SequenceStep } from '../../hooks/useSequence'
import { useSound } from '../../hooks/useSoundToggle'
import { Logo } from '../ui/Icons'

const STEPS = [
  'Connecting to distribution node…',
  'Authenticating secure session…',
  'Loading build catalog…',
  'Ready',
]

export default function Splash({ onDone }: { onDone: () => void }) {
  const { play } = useSound()
  const [status, setStatus] = useState(STEPS[0])
  const [pct, setPct] = useState(6)
  const per = Math.max(500, config.bootDurationMs / STEPS.length)

  const steps: SequenceStep[] = useMemo(() => {
    const s: SequenceStep[] = []
    STEPS.forEach((line, i) => {
      s.push({
        at: i === 0 ? 400 : per,
        run: () => {
          setStatus(line)
          setPct(Math.round(((i + 1) / STEPS.length) * 100))
          play(i === STEPS.length - 1 ? 'confirm' : 'key')
        },
      })
    })
    s.push({ at: 520, run: () => onDone() })
    return s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useSequence(steps)

  return (
    <div className="splash">
      <motion.div
        className="brand-lg"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="logo-xl"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16 }}
        >
          <Logo style={{ color: '#fff' }} />
        </motion.div>
        <div className="title">
          {config.brandName}
          <small>{config.brandTagline}</small>
        </div>
      </motion.div>

      <div className="prog">
        <div className="bar">
          <div className="fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="status">
          {status}
          {pct < 100 && <span className="caret" />}
        </div>
      </div>
    </div>
  )
}
