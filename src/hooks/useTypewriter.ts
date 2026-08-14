import { useEffect, useRef, useState } from 'react'

interface Options {
  /** ms per character */
  speed?: number
  /** delay before typing starts (ms) */
  startDelay?: number
  /** called once the full string is typed */
  onDone?: () => void
  /** called on each character reveal (for click sounds) */
  onChar?: () => void
  /** disable animation and reveal instantly */
  instant?: boolean
}

/** Types a single string out, character by character. */
export function useTypewriter(text: string, opts: Options = {}): string {
  const { speed = 34, startDelay = 0, onDone, onChar, instant = false } = opts
  const [out, setOut] = useState('')
  const doneRef = useRef(onDone)
  const charRef = useRef(onChar)
  doneRef.current = onDone
  charRef.current = onChar

  useEffect(() => {
    if (instant) {
      setOut(text)
      doneRef.current?.()
      return
    }
    setOut('')
    let i = 0
    let timer: number | undefined

    const startTimer = window.setTimeout(function tick() {
      i += 1
      setOut(text.slice(0, i))
      charRef.current?.()
      if (i < text.length) {
        timer = window.setTimeout(tick, speed + (Math.random() * speed) / 2)
      } else {
        doneRef.current?.()
      }
    }, startDelay)

    return () => {
      window.clearTimeout(startTimer)
      if (timer) window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, startDelay, instant])

  return out
}
