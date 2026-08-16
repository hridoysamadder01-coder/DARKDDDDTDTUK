import { useEffect, useState } from 'react'

/**
 * Occasional full-screen glitch shear — a brief RGB/scanline tear that fires
 * on a randomized long interval to keep the whole thing feeling unstable.
 * Pointer-transparent and purely cosmetic.
 */
export default function GlitchBurst() {
  const [on, setOn] = useState(false)

  useEffect(() => {
    let alive = true
    let t = 0
    let clear = 0
    const loop = () => {
      t = window.setTimeout(() => {
        if (!alive) return
        setOn(true)
        clear = window.setTimeout(() => alive && setOn(false), 340)
        loop()
      }, 20000 + Math.random() * 30000)
    }
    loop()
    return () => {
      alive = false
      window.clearTimeout(t)
      window.clearTimeout(clear)
    }
  }, [])

  return on ? <div className="glitchburst" aria-hidden /> : null
}
