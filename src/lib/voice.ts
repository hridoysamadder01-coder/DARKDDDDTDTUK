/**
 * Browser speech-synthesis helper for the robotic "voice hail".
 *
 * Uses the on-device Web Speech API only — no audio files, no network, no
 * recording. Speech is best-effort: if the API or a voice is unavailable the
 * callbacks still resolve so the UI never hangs.
 */

export function supportsSpeech(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function cancelSpeech(): void {
  if (supportsSpeech()) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      /* noop */
    }
  }
}

interface SpeakOpts {
  rate?: number
  pitch?: number
  onLine?: (index: number) => void
  onEnd?: () => void
}

/** Pick a stable English voice if the platform exposes one. */
function pickVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const voices = synth.getVoices()
  if (!voices.length) return null
  return (
    voices.find((v) => /en[-_]?US/i.test(v.lang) && /Google|Daniel|Alex|Microsoft/i.test(v.name)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    voices[0]
  )
}

/**
 * Speak lines sequentially in a low, deliberate (robotic) voice.
 * Hyphens are flattened to spaces so callsigns read cleanly.
 */
export function speakLines(lines: string[], opts: SpeakOpts = {}): void {
  if (!supportsSpeech()) {
    opts.onEnd?.()
    return
  }
  const synth = window.speechSynthesis
  const rate = opts.rate ?? 0.85
  const pitch = opts.pitch ?? 0.45

  const start = () => {
    synth.cancel()
    const voice = pickVoice(synth)
    lines.forEach((raw, i) => {
      const u = new SpeechSynthesisUtterance(raw.replace(/-/g, ' '))
      u.rate = rate
      u.pitch = pitch
      u.volume = 1
      if (voice) u.voice = voice
      u.onstart = () => opts.onLine?.(i)
      if (i === lines.length - 1) u.onend = () => opts.onEnd?.()
      synth.speak(u)
    })
  }

  // Voices sometimes populate asynchronously on first use.
  if (synth.getVoices().length === 0) {
    let fired = false
    const go = () => {
      if (fired) return
      fired = true
      start()
    }
    try {
      synth.addEventListener('voiceschanged', go, { once: true })
    } catch {
      /* noop */
    }
    // Fallback in case the event never arrives.
    window.setTimeout(go, 260)
  } else {
    start()
  }
}
