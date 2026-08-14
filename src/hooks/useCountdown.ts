import { useEffect, useState } from 'react'

/** Simple mm:ss countdown from `seconds` → 0. Cosmetic only. */
export function useCountdown(seconds: number, active = true) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0))
    }, 1000)
    return () => window.clearInterval(id)
  }, [active])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  return { remaining, label: `${mm}:${ss}` }
}
