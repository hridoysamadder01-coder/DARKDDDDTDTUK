import { useEffect, useRef, useState } from 'react'
import { subscribeFeed, pushFeed, ambientLine, FEED_COMMANDS, type FeedLine } from '../../lib/feed'
import { hex } from '../../lib/random'

/** Always-on "intercept" console for the main terminal. Reacts to clicks. */
export default function LiveFeed() {
  const [lines, setLines] = useState<FeedLine[]>([])
  const [cmd, setCmd] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)

  // subscribe to the shared feed
  useEffect(() => subscribeFeed((l) => setLines((prev) => [...prev, l].slice(-40))), [])

  // ambient traffic
  useEffect(() => {
    let alive = true
    const tick = () => {
      if (!alive) return
      const [t, k] = ambientLine()
      pushFeed(t, k)
      window.setTimeout(tick, 380 + Math.random() * 520)
    }
    const id = window.setTimeout(tick, 300)
    return () => {
      alive = false
      window.clearTimeout(id)
    }
  }, [])

  // rotating command prompt (types → executes → result)
  useEffect(() => {
    let alive = true
    let idx = 0
    let pos = 0
    const run = () => {
      if (!alive) return
      const full = FEED_COMMANDS[idx % FEED_COMMANDS.length]
      if (pos <= full.length) {
        setCmd(full.slice(0, pos))
        pos += 1
        window.setTimeout(run, 42 + Math.random() * 40)
      } else {
        pushFeed(`exec ${full} :: 0x${hex(4)} ok`, 'ok')
        idx += 1
        pos = 0
        window.setTimeout(() => {
          setCmd('')
          run()
        }, 900 + Math.random() * 700)
      }
    }
    const id = window.setTimeout(run, 1400)
    return () => {
      alive = false
      window.clearTimeout(id)
    }
  }, [])

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  return (
    <div className="livefeed panel">
      <div className="lf-head">
        <span className="lf-dot" />
        LIVE FEED // INTERCEPT
        <span className="lf-h-right">NODE-04 · ENCRYPTED</span>
      </div>
      <div className="lf-body" ref={bodyRef}>
        {lines.map((l) => (
          <div key={l.id} className={`lf-line ${l.kind}`}>
            <span className="lf-tick">›</span>
            {l.text}
          </div>
        ))}
      </div>
      <div className="lf-prompt">
        <span className="lf-ps">core@7x:~$</span>
        <span className="lf-cmd">{cmd}</span>
        <span className="cursor" />
      </div>
    </div>
  )
}
