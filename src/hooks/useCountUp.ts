import { useEffect, useRef, useState } from 'react'

/** Smoothly animates a number from `from` to `to` over `duration` ms. */
export function useCountUp(
  to: number,
  { from = 0, duration = 1200, active = true }: { from?: number; duration?: number; active?: boolean } = {},
): number {
  const [value, setValue] = useState(active ? from : to)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) {
      setValue(to)
      return
    }
    startRef.current = null
    let raf = 0
    const step = (t: number) => {
      if (startRef.current === null) startRef.current = t
      const elapsed = t - startRef.current
      const p = Math.min(1, elapsed / duration)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(from + (to - from) * eased)
      if (p < 1) raf = requestAnimationFrame(step)
      else setValue(to)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [to, from, duration, active])

  return value
}
