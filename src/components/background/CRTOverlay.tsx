import { useEffect, useRef } from 'react'
import { intensityProfile, config } from '../../config'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Layer C — CRT atmosphere: scanlines, grain, flicker, and random
 * horizontal tear streaks driven by JS for controlled randomness.
 */
export default function CRTOverlay() {
  const tearRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const tear = tearRef.current
    if (!tear) return
    const rate = intensityProfile[config.animationIntensity].glitchRate
    let timer: number

    const fire = () => {
      const top = Math.random() * window.innerHeight
      tear.style.top = `${top}px`
      tear.style.opacity = '0.6'
      tear.style.transform = `scaleY(${1 + Math.random() * 2})`
      tear.style.filter = `blur(${Math.random() * 1.5}px)`
      window.setTimeout(() => {
        if (tear) tear.style.opacity = '0'
      }, 60 + Math.random() * 90)
      timer = window.setTimeout(fire, (1400 + Math.random() * 4200) / rate)
    }
    timer = window.setTimeout(fire, 1600)
    return () => window.clearTimeout(timer)
  }, [reduced])

  return (
    <>
      <div className="crt-grain" aria-hidden />
      <div className="crt-scanlines" aria-hidden />
      <div className="crt-flicker" aria-hidden />
      <div className="crt-tear" ref={tearRef} aria-hidden />
    </>
  )
}
