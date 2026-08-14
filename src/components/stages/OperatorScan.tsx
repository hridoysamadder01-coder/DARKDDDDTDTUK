import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSound } from '../../hooks/useSoundToggle'
import { config, zh } from '../../config'
import { hex, randInt } from '../../lib/random'
import { speakLines, supportsSpeech } from '../../lib/voice'
import GlitchText from '../ui/GlitchText'

type Phase = 'idle' | 'requesting' | 'live' | 'scanning' | 'verified' | 'denied'

interface Props {
  onDone: () => void
  /** Header/copy overrides so the same gate can front different steps. */
  kicker?: string
  title?: string
  subtitleEn?: string
  subtitleZh?: string
  verifiedTitle?: string
  verifiedSubEn?: string
  verifiedSubZh?: string
  /** Robot lines spoken once the scan verifies (only when sound is on). */
  speakOnVerify?: string[]
}

/**
 * Cinematic "operator biometric" gate.
 *
 * Turns on the device camera (browser-permission gated) and plays a fake
 * credential scan that ALWAYS passes after a short timed sweep — the scan is
 * theatrical, it does not read, capture, upload, or store anything. The video
 * stays entirely on-device and the camera is released the instant the scan
 * completes or the component unmounts.
 */
const SCAN_LINES: string[] = [
  'CAPTURING OPTICAL FRAME',
  'NORMALIZING EXPOSURE · GAIN',
  'EXTRACTING FEATURE MESH',
  'HASHING CREDENTIAL 0x{H}',
  'MATCHING SIGNATURE TABLE',
  'DEPTH · LIVENESS PROBE :: PASS',
  'CROSS-CHECK NODE VAULT-11',
  'SIGNATURE CONFIDENCE {N}%',
]

export default function OperatorScan({
  onDone,
  kicker = 'RESTRICTED GATE // 生物识别验证',
  title = 'OPERATOR VERIFICATION',
  subtitleEn = 'PRESENT AUTHORIZED CREDENTIAL TO THE OPTICAL SENSOR',
  subtitleZh = '出示凭证以继续',
  verifiedTitle = 'IDENTITY VERIFIED',
  verifiedSubEn = 'ACCESS GRANTED',
  verifiedSubZh = zh.authorized,
  speakOnVerify,
}: Props) {
  const { play, enabled, toggle } = useSound()
  const [phase, setPhase] = useState<Phase>('idle')
  const [pct, setPct] = useState(0)
  const [log, setLog] = useState<string[]>([])
  const [flash, setFlash] = useState(false)

  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const stopCamera = useCallback(() => {
    const s = streamRef.current
    if (s) {
      s.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  // Always release the camera when leaving this screen.
  useEffect(() => stopCamera, [stopCamera])

  // Attach the live stream once the <video> element is mounted.
  useEffect(() => {
    const v = videoRef.current
    const s = streamRef.current
    if (v && s && v.srcObject !== s) {
      v.srcObject = s
      v.play().catch(() => {})
    }
  }, [phase])

  // Robot confirmation once the scan verifies (only when sound is on).
  const spoke = useRef(false)
  useEffect(() => {
    if (phase !== 'verified' || spoke.current) return
    if (!speakOnVerify?.length || !enabled) return
    spoke.current = true
    speakLines(speakOnVerify, {
      rate: config.welcome.voice.rate,
      pitch: config.welcome.voice.pitch,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const speakNow = () => {
    if (!speakOnVerify?.length) return
    spoke.current = true
    speakLines(speakOnVerify, {
      rate: config.welcome.voice.rate,
      pitch: config.welcome.voice.pitch,
    })
  }

  const enable = async () => {
    if (phase === 'requesting') return
    setPhase('requesting')
    play('beep')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      setPhase('live')
      play('confirm')
    } catch {
      setPhase('denied')
      play('warn')
    }
  }

  const scan = () => {
    if (phase !== 'live') return
    setPhase('scanning')
    setLog([])
    setPct(0)
    play('beep')
    let i = 0
    const tick = () => {
      if (i < SCAN_LINES.length) {
        const line = SCAN_LINES[i]
          .replace('{H}', hex(8))
          .replace('{N}', String(randInt(88, 99)))
        setLog((prev) => [...prev, line].slice(-8))
        setPct(Math.round(((i + 1) / SCAN_LINES.length) * 100))
        play(i % 2 ? 'key' : 'beep')
        i += 1
        window.setTimeout(tick, 400 + Math.random() * 260)
      } else {
        // Grant. Freeze the last frame, then release the hardware.
        try {
          videoRef.current?.pause()
        } catch {
          /* noop */
        }
        stopCamera()
        setPct(100)
        setFlash(true)
        window.setTimeout(() => setFlash(false), 460)
        play('confirm')
        play('glitch')
        setPhase('verified')
      }
    }
    window.setTimeout(tick, 300)
  }

  const showVideo = phase === 'live' || phase === 'scanning' || phase === 'verified'

  return (
    <motion.div
      className="opscan"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="opscan-head">
        <div className="opscan-kicker">{kicker}</div>
        <GlitchText as="h2" text={title} intensity={0.06} />
        <div className="opscan-sub">
          {subtitleEn}
          {config.bilingualLabels && subtitleZh && (
            <span className="zh"> · {subtitleZh}</span>
          )}
        </div>
      </div>

      <div className={`opscan-frame ${phase}`}>
        <span className="br tl" />
        <span className="br tr" />
        <span className="br bl" />
        <span className="br br2" />
        <div className="opscan-grid" />

        {showVideo && (
          <video
            ref={videoRef}
            className="opscan-video"
            autoPlay
            muted
            playsInline
          />
        )}

        {(phase === 'idle' || phase === 'requesting' || phase === 'denied') && (
          <div className="opscan-offline">
            <div className="opscan-ring" />
            <div className="opscan-offline-txt">
              {phase === 'requesting'
                ? 'REQUESTING SENSOR…'
                : phase === 'denied'
                ? 'OPTICAL SENSOR UNAVAILABLE'
                : 'OPTICAL SENSOR OFFLINE'}
            </div>
          </div>
        )}

        {(phase === 'scanning' || phase === 'verified') && (
          <div className="opscan-scanline" />
        )}

        {phase === 'scanning' && <div className="opscan-reticle" />}

        {/* corner HUD readouts on live/scanning */}
        {(phase === 'live' || phase === 'scanning') && (
          <>
            <div className="opscan-hud tl">
              SENSOR ONLINE
              <br />
              LUMA {randInt(40, 90)} · GAIN {randInt(2, 9)}
            </div>
            <div className="opscan-hud tr">
              CH 7X · NODE-04
              <br />
              FOCUS {phase === 'scanning' ? 'LOCK' : 'AUTO'}
            </div>
            <div className="opscan-hud bl">
              FRAME 0x{hex(4)}
            </div>
            <div className="opscan-hud br">
              {phase === 'scanning' ? `SCAN ${pct}%` : 'READY'}
            </div>
          </>
        )}

        <AnimatePresence>
          {phase === 'verified' && (
            <motion.div
              className="opscan-verified"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              <GlitchText text={verifiedTitle} always />
              <div className="opscan-granted">
                {verifiedSubEn}
                {config.bilingualLabels && verifiedSubZh && (
                  <span className="zh"> · {verifiedSubZh}</span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {flash && <div className="opscan-flash" />}
      </div>

      {/* scan telemetry log */}
      {(phase === 'scanning' || phase === 'verified') && (
        <div className="opscan-log panel">
          {log.map((l, i) => (
            <div key={i} className="opscan-log-line">
              <span className="tick">›</span>
              {l}
            </div>
          ))}
          <div className="opscan-bar">
            <span style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* controls */}
      <div className="opscan-controls">
        {phase === 'idle' && (
          <button className="btn primary" onClick={enable}>
            ▶ ENABLE OPTICAL SCANNER
          </button>
        )}
        {phase === 'requesting' && (
          <button className="btn primary" disabled>
            REQUESTING SENSOR…
          </button>
        )}
        {phase === 'live' && (
          <motion.button
            className="btn primary"
            onClick={scan}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ◉ SCAN CREDENTIAL
          </motion.button>
        )}
        {phase === 'denied' && (
          <>
            <button className="btn amber" onClick={enable}>
              RETRY SENSOR
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                play('whoosh')
                onDone()
              }}
            >
              MANUAL OVERRIDE ▸
            </button>
          </>
        )}
        {phase === 'verified' && (
          <>
            {speakOnVerify?.length && supportsSpeech() && !enabled && (
              <motion.button
                className="btn amber"
                onClick={() => {
                  if (!enabled) toggle()
                  speakNow()
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                🔊 ENABLE VOICE
              </motion.button>
            )}
            <motion.button
              className="btn primary"
              onClick={() => {
                play('whoosh')
                onDone()
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              CONTINUE ▸
            </motion.button>
          </>
        )}
      </div>

      <div className="opscan-note">
        LOCAL PROCESSING · NOT RECORDED · 本地处理 · 无上传
      </div>
    </motion.div>
  )
}
