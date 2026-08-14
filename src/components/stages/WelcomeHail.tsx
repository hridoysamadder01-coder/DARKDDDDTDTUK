import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { config } from '../../config'
import { useSound } from '../../hooks/useSoundToggle'
import { speakLines, cancelSpeech, supportsSpeech } from '../../lib/voice'
import GlitchText from '../ui/GlitchText'

/**
 * One-time robotic "voice hail" played on first entry to the terminal.
 * Types the welcome lines, ends on the operator's name, then reveals the
 * terminal. Speaks the lines aloud when sound is enabled; the text alone
 * carries the moment when muted.
 */
export default function WelcomeHail({ onDone }: { onDone: () => void }) {
  const { play, enabled, toggle } = useSound()
  const [done, setDone] = useState<string[]>([])
  const [typing, setTyping] = useState('')
  const [outro, setOutro] = useState(false)
  const finished = useRef(false)
  const spoke = useRef(false)

  const lines = config.welcome.lines
  const outroName = config.welcome.outro

  const finish = (opts?: { skip?: boolean }) => {
    if (finished.current) return
    finished.current = true
    if (opts?.skip) cancelSpeech()
    onDone()
  }

  const speak = () => {
    if (spoke.current) return
    spoke.current = true
    speakLines([...lines, outroName], {
      onLine: () => play('key'),
    })
  }

  // Visual type-out sequence (independent of speech so it never hangs).
  useEffect(() => {
    if (enabled) speak()

    const timers: number[] = []
    let li = 0
    let ci = 0

    const typeChar = () => {
      const full = lines[li]
      if (ci <= full.length) {
        setTyping(full.slice(0, ci))
        if (ci > 0 && ci % 2 === 0) play('key')
        ci += 1
        timers.push(window.setTimeout(typeChar, 34 + Math.random() * 30))
      } else {
        // line complete → commit and pause
        setDone((prev) => [...prev, full])
        setTyping('')
        li += 1
        ci = 0
        if (li < lines.length) {
          timers.push(window.setTimeout(typeChar, 620))
        } else {
          // reveal the outro name, hold, then finish
          timers.push(
            window.setTimeout(() => {
              setOutro(true)
              play('confirm')
              timers.push(window.setTimeout(() => finish(), 2600))
            }, 520),
          )
        }
      }
    }

    timers.push(window.setTimeout(typeChar, 700))
    // hard safety cap so the overlay always clears
    timers.push(window.setTimeout(() => finish(), 20000))

    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      cancelSpeech()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const enableVoice = () => {
    if (!enabled) toggle() // turns sound on (also a fresh user gesture)
    spoke.current = false
    speak()
  }

  return (
    <motion.div
      className="hail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => finish({ skip: true })}
    >
      <div className="hail-inner" onClick={(e) => e.stopPropagation()}>
        <div className="hail-head">
          <span className="hail-dot" />
          INCOMING VOICE TRANSMISSION // SECURE CHANNEL
        </div>

        <div className="hail-wave" data-live={outro ? 'false' : 'true'}>
          {Array.from({ length: 32 }).map((_, i) => (
            <span key={i} style={{ animationDelay: `${(i % 16) * 0.05}s` }} />
          ))}
        </div>

        <div className="hail-lines">
          {done.map((l, i) => (
            <div key={i} className="hail-line">
              {l}
            </div>
          ))}
          {typing && (
            <div className="hail-line active">
              {typing}
              <span className="cursor" />
            </div>
          )}
        </div>

        <AnimatePresence>
          {outro && (
            <motion.div
              className="hail-name"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <GlitchText text={outroName} always />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="hail-foot">
          {supportsSpeech() && !enabled && (
            <button
              className="btn amber"
              onClick={(e) => {
                e.stopPropagation()
                enableVoice()
              }}
            >
              🔊 ENABLE VOICE
            </button>
          )}
          <button
            className="btn ghost"
            onClick={(e) => {
              e.stopPropagation()
              finish({ skip: true })
            }}
          >
            ENTER TERMINAL ▸
          </button>
        </div>
      </div>
    </motion.div>
  )
}
