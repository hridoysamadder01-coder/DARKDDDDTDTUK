import { useEffect, useRef, useState } from 'react'

export interface SequenceStep {
  /** delay in ms BEFORE this step fires (relative to previous) */
  at: number
  run: () => void
}

/**
 * Runs an ordered list of timed steps once, then calls `onComplete`.
 * Cleans up all timers on unmount. Timings are cumulative-relative
 * (each step's `at` is measured from the previous step).
 */
export function useSequence(
  steps: SequenceStep[],
  onComplete?: () => void,
  { active = true }: { active?: boolean } = {},
): { index: number; done: boolean; skip: () => void } {
  const [index, setIndex] = useState(-1)
  const [done, setDone] = useState(false)
  const timers = useRef<number[]>([])
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete

  const clearAll = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  const skip = () => {
    clearAll()
    steps.forEach((s) => s.run())
    setIndex(steps.length - 1)
    setDone(true)
    completeRef.current?.()
  }

  useEffect(() => {
    if (!active) return
    clearAll()
    setIndex(-1)
    setDone(false)
    let acc = 0
    steps.forEach((step, i) => {
      acc += step.at
      const id = window.setTimeout(() => {
        step.run()
        setIndex(i)
        if (i === steps.length - 1) {
          setDone(true)
          completeRef.current?.()
        }
      }, acc)
      timers.current.push(id)
    })
    return clearAll
    // steps identity is stable per-mount by construction
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return { index, done, skip }
}
