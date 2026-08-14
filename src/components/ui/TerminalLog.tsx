import { useEffect, useRef } from 'react'

export interface LogLine {
  id: number
  text: string
  kind?: 'ok' | 'warn' | 'err' | 'dim'
}

/** Auto-scrolling terminal history. */
export default function TerminalLog({
  lines,
  className = '',
}: {
  lines: LogLine[]
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  return (
    <div className={`tlog ${className}`} ref={ref} aria-live="polite">
      {lines.map((l) => (
        <div key={l.id} className={`row ${l.kind ?? 'dim'}`}>
          <span className="tick">›</span>
          <span className="msg">{l.text}</span>
        </div>
      ))}
    </div>
  )
}
