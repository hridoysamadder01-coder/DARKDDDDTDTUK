import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSound } from '../../hooks/useSoundToggle'
import { pick } from '../../lib/random'
import GlitchText from '../ui/GlitchText'

const ALERTS = [
  'COUNTER-TRACE DETECTED · REROUTING VIA GHOSTCHAIN',
  'INTRUSION SWEEP ON NODE-04 · EVADED',
  'SIGNATURE PROBE INBOUND · MASKED',
  'FIREWALL HANDSHAKE · GHOSTED',
  'DEEP PACKET INSPECTION · SPOOFED',
  'TRACE ORIGIN LOCKED · SCRAMBLING VECTOR',
  'HOSTILE NODE PINGING VAULT-11 · BLOCKED',
  'KILL-SWITCH BEACON · SUPPRESSED',
]

/**
 * Ambient danger. While active, a red counter-intrusion banner periodically
 * cuts in, glitches, and clears — keeping the session feeling hunted.
 */
export default function ThreatOverlay({ active }: { active: boolean }) {
  const { play } = useSound()
  const [msg, setMsg] = useState<string | null>(null)
  const [edge, setEdge] = useState(false)
  const playRef = useRef(play)
  playRef.current = play

  useEffect(() => {
    if (!active) {
      setMsg(null)
      setEdge(false)
      return
    }
    let alive = true
    let t = 0
    let hide = 0

    const fire = () => {
      if (!alive) return
      setMsg(pick(ALERTS))
      setEdge(true)
      playRef.current('warn')
      hide = window.setTimeout(() => {
        if (!alive) return
        setMsg(null)
        setEdge(false)
      }, 2400)
      t = window.setTimeout(fire, 11000 + Math.random() * 18000)
    }

    t = window.setTimeout(fire, 6000 + Math.random() * 9000)
    return () => {
      alive = false
      window.clearTimeout(t)
      window.clearTimeout(hide)
    }
  }, [active])

  return (
    <>
      {edge && <div className="threat-edge" />}
      <AnimatePresence>
        {msg && (
          <motion.div
            className="threat"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.28 }}
          >
            <span className="threat-ic">⚠</span>
            <GlitchText text={msg} always />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
