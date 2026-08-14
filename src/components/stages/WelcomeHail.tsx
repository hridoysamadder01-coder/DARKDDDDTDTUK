import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { config } from '../../config'
import { useSound } from '../../hooks/useSoundToggle'
import { speakLines, cancelSpeech, supportsSpeech } from '../../lib/voice'
import GlitchText from '../ui/GlitchText'

/**
 * One-time robotic "voice hail" on first entry to the terminal.
 *
 * Act 1 — a personal welcome ending on the operator's name.
 * Act 2 — a spoken briefing of the primary target build.
 *
 * Speaks aloud (deep, slow) when sound is enabled; the typed text carries
 * the moment when muted. On-device Web Speech only — no files, no network,
 * no recording.
 */
type Action =
  | { t: 'type'; text: string }
  | { t: 'reveal'; text: string }
  | { t: 'act'; heading: string; title: string }
  | { t: 'hold'; ms: number }
  | { t: 'end' }

export default function WelcomeHail({ onDone }: { onDone: () => void }) {
  const { play, enabled, toggle } = useSound()
  const w = config.welcome

  const [act, setAct] = useState<'welcome' | 'briefing'>('welcome')
  const [lines, setLines] = useState<string[]>([])
  const [typing, setTyping] = useState('')
  const [big, setBig] = useState<string | null>(null)
  const [heading, setHeading] = useState<string | null>(null)
  const [live, setLive] = useState(true)

  const finished = useRef(false)
  const spoke = useRef(false)
  const keepSpeaking = useRef(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const willSpeak = enabled && supportsSpeech()

  const finish = (opts?: { skip?: boolean }) => {
    if (finished.current) return
    finished.current = true
    setLive(false)
    if (opts?.skip) cancelSpeech()
    else keepSpeaking.current = true // let the voice trail into the terminal
    onDone()
  }

  const speak = () => {
    if (spoke.current) return
    spoke.current = true
    speakLines([...w.lines, w.outro, ...w.briefing.lines], {
      rate: w.voice.rate,
      pitch: w.voice.pitch,
    })
  }

  useEffect(() => {
    if (enabled) speak()

    const timers: number[] = []
    let stopped = false

    // Build the full script: Act 1 (welcome) → name → Act 2 (briefing).
    const script: Action[] = [
      ...w.lines.map((text) => ({ t: 'type', text }) as Action),
      { t: 'reveal', text: w.outro },
      { t: 'hold', ms: 2400 },
      { t: 'act', heading: w.briefing.heading, title: w.briefing.title },
      { t: 'hold', ms: 1500 },
      ...w.briefing.lines.map((text) => ({ t: 'type', text }) as Action),
      { t: 'hold', ms: 2200 },
      { t: 'end' },
    ]

    const after = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms))
    }

    const run = (idx: number) => {
      if (stopped || idx >= script.length) return
      const a = script[idx]
      const next = () => run(idx + 1)

      if (a.t === 'type') {
        let ci = 0
        const typeChar = () => {
          if (stopped) return
          if (ci <= a.text.length) {
            setTyping(a.text.slice(0, ci))
            if (ci > 0 && ci % 3 === 0) play('key')
            ci += 1
            after(30 + Math.random() * 28, typeChar)
          } else {
            setLines((prev) => [...prev, a.text])
            setTyping('')
            after(560, next)
          }
        }
        typeChar()
      } else if (a.t === 'reveal') {
        setBig(a.text)
        play('confirm')
        next()
      } else if (a.t === 'act') {
        // Clear act 1 and open the briefing.
        setAct('briefing')
        setLines([])
        setTyping('')
        setBig(a.title)
        setHeading(a.heading)
        play('glitch')
        next()
      } else if (a.t === 'hold') {
        after(a.ms, next)
      } else if (a.t === 'end') {
        // Muted: dismiss now. Speaking: wait for the voice, with a fallback.
        if (!willSpeak) {
          finish()
        } else {
          after(9000, () => finish())
        }
      }
    }

    after(700, () => run(0))
    // absolute safety cap
    const cap = window.setTimeout(() => finish(), 34000)
    timers.push(cap)

    return () => {
      stopped = true
      timers.forEach((t) => window.clearTimeout(t))
      if (!keepSpeaking.current) cancelSpeech()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // keep the newest line in view
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines, typing, big])

  const enableVoice = () => {
    if (!enabled) toggle() // fresh gesture + turns sound on
    spoke.current = false
    speak()
  }

  const isBrief = act === 'briefing'

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
          {isBrief
            ? 'TARGET BRIEFING // SECURE CHANNEL'
            : 'INCOMING VOICE TRANSMISSION // SECURE CHANNEL'}
        </div>

        <div className="hail-wave" data-live={live ? 'true' : 'false'}>
          {Array.from({ length: 32 }).map((_, i) => (
            <span key={i} style={{ animationDelay: `${(i % 16) * 0.05}s` }} />
          ))}
        </div>

        <div className="hail-body" ref={bodyRef}>
          <AnimatePresence mode="wait">
            <motion.div
              key={act}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              {/* briefing header sits above the title */}
              {isBrief && heading && (
                <div className="hail-kicker">{heading}</div>
              )}

              {/* big reveal: the name (act 1) or the target title (act 2) */}
              {big && (
                <motion.div
                  className={`hail-name ${isBrief ? 'target' : ''}`}
                  initial={{ opacity: 0, scale: 0.93 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <GlitchText text={big} always />
                </motion.div>
              )}

              <div className="hail-lines">
                {lines.map((l, i) => (
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
            </motion.div>
          </AnimatePresence>
        </div>

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
