import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useSound } from '../../hooks/useSoundToggle'
import { makeBuildFile, type BuildFile } from '../../lib/codegen'

interface Row {
  id: number
  html: string
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const KW =
  /("[^"]*"|'[^']*')|(0x[0-9A-Fa-f]+)|\b(import|from|export|const|async|function|await|return|for|of|static|include|define|new|let|struct|void|size_t)\b/g

function highlight(line: string): string {
  if (/^\s*(\/\/|\*|#(?!include|define))/.test(line))
    return `<span class="c-com">${esc(line)}</span>`
  if (/^\[[a-z]+\]/.test(line)) {
    const e = esc(line)
    const tag = e.match(/^\[[a-z]+\]/)![0]
    const cls = tag === '[warn]' ? 'c-warn' : 'c-log'
    return `<span class="${cls}">${tag}</span>${e.slice(tag.length)}`
  }
  return esc(line).replace(KW, (m, str, num, kw) => {
    if (str) return `<span class="c-str">${str}</span>`
    if (num) return `<span class="c-num">${num}</span>`
    if (kw) return `<span class="c-kw">${kw}</span>`
    return m
  })
}

const MODULES = ['vision', 'runtime', 'merge', 'tensor', 'bridge', 'kernel', 'graph', 'device']

export default function CodeStream({ onExit }: { onExit: () => void }) {
  const { play } = useSound()
  const [rows, setRows] = useState<Row[]>([])
  const [typing, setTyping] = useState('')
  const [fileName, setFileName] = useState('core/vision.pipeline.ts')
  const [pct, setPct] = useState(0)
  const [lineCount, setLineCount] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [mod, setMod] = useState('vision')
  const [black, setBlack] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const start = useMemo(() => Date.now, [])

  // elapsed clock (uses render time diff, no forbidden Date in workflow — this is app runtime)
  useEffect(() => {
    const t0 = start()
    const iv = window.setInterval(() => setElapsed(Math.floor((start() - t0) / 1000)), 1000)
    return () => window.clearInterval(iv)
  }, [start])

  useEffect(() => {
    const mv = window.setInterval(() => setMod(MODULES[Math.floor(Math.random() * MODULES.length)]), 700)
    return () => window.clearInterval(mv)
  }, [])

  // typing engine
  useEffect(() => {
    let id = 0
    let fileIdx = 0
    let cur: BuildFile = makeBuildFile(fileIdx)
    let lineIdx = 0
    let charPos = 0
    let sinceKey = 0
    setFileName(cur.name)

    const commit = (line: string) => {
      const html = highlight(line)
      setRows((prev) => {
        const next = prev.length > 150 ? prev.slice(prev.length - 150) : prev
        return [...next, { id: id++, html }]
      })
    }

    const iv = window.setInterval(() => {
      const line = cur.lines[lineIdx] ?? ''
      if (charPos < line.length) {
        charPos += 2 + Math.floor(Math.random() * 3)
        setTyping(line.slice(0, charPos))
      } else {
        commit(line)
        setTyping('')
        charPos = 0
        lineIdx += 1
        setLineCount((c) => c + 1)
        setPct(Math.min(99, Math.round((lineIdx / cur.lines.length) * 100)))
        if (++sinceKey % 3 === 0) play('key')
        if (lineIdx >= cur.lines.length) {
          // next file → brief black cut (multi-screen feel)
          setBlack(true)
          play('glitch')
          window.setTimeout(() => setBlack(false), 190)
          fileIdx += 1
          cur = makeBuildFile(fileIdx)
          lineIdx = 0
          charPos = 0
          setFileName(cur.name)
          setPct(0)
        }
      }
    }, 22)

    return () => window.clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // auto-scroll to newest
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [rows, typing])

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  return (
    <motion.div
      className="codestream"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="cs-head">
        <div className="cs-left">
          <span className="cs-dot" />
          <span className="cs-title">WRITING BUILD</span>
          <span className="cs-file">{fileName}</span>
        </div>
        <div className="cs-right">
          <span className="cs-stat">MOD <b>{mod}</b></span>
          <span className="cs-stat">COMPILING <b>{pct}%</b></span>
          <span className="cs-stat">LINES <b>{lineCount.toLocaleString()}</b></span>
          <span className="cs-stat">{mm}:{ss}</span>
          <button className="cs-stop" onClick={onExit}>■ STOP</button>
        </div>
      </div>

      <div className="cs-bar"><div className="cs-fill" style={{ width: `${pct}%` }} /></div>

      <div className="cs-body" ref={bodyRef}>
        {rows.map((r, i) => (
          <div className="cs-line" key={r.id}>
            <span className="cs-ln">{String(i + 1).padStart(3, '0')}</span>
            <code dangerouslySetInnerHTML={{ __html: r.html || '&nbsp;' }} />
          </div>
        ))}
        <div className="cs-line cs-active">
          <span className="cs-ln">{String(rows.length + 1).padStart(3, '0')}</span>
          <code>
            {typing}
            <span className="cs-caret" />
          </code>
        </div>
      </div>

      <div className="cs-foot">
        WRITING {fileName.split('/').pop()} · CROSS-MODEL VISION CORE · {mm}:{ss}
      </div>

      {black && <div className="black-cut" />}
    </motion.div>
  )
}
