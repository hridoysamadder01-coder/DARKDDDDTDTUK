import { useEffect, useRef, useState } from 'react'
import { glyph } from '../lib/random'

/**
 * Reveals `text` with a "decoding" scramble effect: characters resolve
 * left-to-right while unresolved characters keep flickering.
 */
export function useScramble(
  text: string,
  opts: { speed?: number; active?: boolean } = {},
): string {
  const { speed = 26, active = true } = opts
  const [out, setOut] = useState(active ? '' : text)
  const frame = useRef(0)

  useEffect(() => {
    if (!active) {
      setOut(text)
      return
    }
    frame.current = 0
    let raf = 0
    let last = 0
    const total = text.length

    const step = (t: number) => {
      if (t - last >= speed) {
        last = t
        frame.current += 1
        const resolved = Math.floor(frame.current / 2)
        let s = ''
        for (let i = 0; i < total; i++) {
          if (text[i] === ' ') s += ' '
          else if (i < resolved) s += text[i]
          else s += glyph()
        }
        setOut(s)
        if (resolved >= total) {
          setOut(text)
          return
        }
      }
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [text, speed, active])

  return out
}
