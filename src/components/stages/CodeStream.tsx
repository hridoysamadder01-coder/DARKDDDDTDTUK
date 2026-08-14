import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSound } from '../../hooks/useSoundToggle'
import { makeBuildFile, hx, type BuildFile } from '../../lib/codegen'
import { config } from '../../config'
import { speakLines, cancelSpeech, supportsSpeech } from '../../lib/voice'

interface Row {
  id: number
  html: string
}
interface TreeItem {
  name: string
  done: boolean
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
  const { play, enabled, toggle } = useSound()
  const [phase, setPhase] = useState<'prep' | 'build'>('prep')
  const [cap, setCap] = useState('')
  const [capActive, setCapActive] = useState(true)
  const [rows, setRows] = useState<Row[]>([])
  const [typing, setTyping] = useState('')
  const [fileName, setFileName] = useState('core/vision.pipeline.ts')
  const [pct, setPct] = useState(0)
  const [lineCount, setLineCount] = useState(0)
  const [bytes, setBytes] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [thru, setThru] = useState(96)
  const [cksum, setCksum] = useState(() => hx(8))
  const [mod, setMod] = useState('vision')
  const [tree, setTree] = useState<TreeItem[]>([{ name: 'core/vision.pipeline.ts', done: false }])
  const [black, setBlack] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const t0 = useRef(Date.now())

  useEffect(() => {
    const iv = window.setInterval(() => setElapsed(Math.floor((Date.now() - t0.current) / 1000)), 1000)
    return () => window.clearInterval(iv)
  }, [])
  useEffect(() => {
    const iv = window.setInterval(() => {
      setThru(60 + Math.floor(Math.random() * 140))
      setMod(MODULES[Math.floor(Math.random() * MODULES.length)])
    }, 600)
    return () => window.clearInterval(iv)
  }, [])

  // extra build telemetry (feels like a busy compiler)
  const [threads, setThreads] = useState(12)
  const [temp, setTemp] = useState(58)
  const [queue, setQueue] = useState(34)
  const [heap, setHeap] = useState(41)
  useEffect(() => {
    const iv = window.setInterval(() => {
      setThreads(8 + Math.floor(Math.random() * 24))
      setTemp(52 + Math.floor(Math.random() * 20))
      setQueue(Math.max(0, 60 - Math.floor(Math.random() * 60)))
      setHeap(30 + Math.floor(Math.random() * 60))
    }, 900)
    return () => window.clearInterval(iv)
  }, [])

  // opening robot narration + typed transmission caption
  const spoke = useRef(false)
  const speakBrief = () => {
    if (spoke.current) return
    spoke.current = true
    speakLines(config.codeStream.narration, {
      rate: config.codeStream.voice.rate,
      pitch: config.codeStream.voice.pitch,
    })
  }
  useEffect(() => {
    const narration = config.codeStream.narration
    if (enabled) speakBrief()

    let stopped = false
    const timers: number[] = []
    let li = 0
    let ci = 0
    const type = () => {
      if (stopped) return
      const full = narration[li] ?? ''
      if (ci <= full.length) {
        setCap(full.slice(0, ci))
        ci += 1
        timers.push(window.setTimeout(type, 40 + Math.random() * 34))
      } else {
        li += 1
        ci = 0
        if (li === 1) setPhase('build') // console appears after the intro line
        if (li < narration.length) {
          timers.push(window.setTimeout(type, 950))
        } else {
          timers.push(window.setTimeout(() => setCapActive(false), 1800))
        }
      }
    }
    timers.push(window.setTimeout(type, 550))
    return () => {
      stopped = true
      timers.forEach((t) => window.clearTimeout(t))
      cancelSpeech()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        const next = prev.length > 130 ? prev.slice(prev.length - 130) : prev
        return [...next, { id: id++, html }]
      })
      setBytes((b) => b + line.length + 1)
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
          // seal file → next (multi-screen black cut)
          setBlack(true)
          play('glitch')
          window.setTimeout(() => setBlack(false), 180)
          setCksum(hx(8))
          setTree((t) => {
            const marked = t.map((x, i) => (i === t.length - 1 ? { ...x, done: true } : x))
            fileIdx += 1
            cur = makeBuildFile(fileIdx)
            lineIdx = 0
            charPos = 0
            setFileName(cur.name)
            setPct(0)
            const next = [...marked, { name: cur.name, done: false }]
            return next.length > 9 ? next.slice(next.length - 9) : next
          })
        }
      }
    }, 22)

    return () => window.clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [rows, typing])

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')
  const kb = bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
  const short = fileName.split('/').pop()

  return (
    <motion.div
      className="codestream"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="cs-topbar">
        <div className="cs-brand">
          <span className="cs-dot" />
          <b>CORE BUILD ENGINE</b>
          <span className="cs-bid">BUILD 0x{cksum}</span>
        </div>
        <div className="cs-tele">
          <span>{config.targetCodename}</span>
          <span>THROUGHPUT <b>{thru} MB/s</b></span>
          <span>{mm}:{ss}</span>
          <button className="cs-stop" onClick={onExit}>■ STOP</button>
        </div>
      </div>

      {/* robot transmission caption during the opening brief */}
      <AnimatePresence>
        {capActive && phase === 'build' && (
          <motion.div
            className="cs-caption"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <span className="cs-cap-dot" />
            <span className="cs-cap-tag">VOICE // ENGINE BRIEF</span>
            <span className="cs-cap-txt">
              {cap}
              <span className="cs-caret" />
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="cs-main">
        <aside className="cs-tree">
          <div className="cs-tree-h">BUILD TREE</div>
          <div className="cs-tree-list">
            {tree.map((f, i) => (
              <div key={i} className={`cs-tree-item ${f.done ? 'done' : 'active'}`}>
                <span className="cs-tree-ic">{f.done ? '✓' : '›'}</span>
                <span className="cs-tree-nm">{f.name}</span>
              </div>
            ))}
          </div>
          <div className="cs-tree-foot">
            <div className="cs-kv"><span>MODULE</span><b>{mod}</b></div>
            <div className="cs-kv"><span>WRITTEN</span><b>{kb}</b></div>
            <div className="cs-kv"><span>LINES</span><b>{lineCount.toLocaleString()}</b></div>
            <div className="cs-kv"><span>THREADS</span><b>{threads}</b></div>
            <div className="cs-kv"><span>HEAP</span><b>{heap}%</b></div>
            <div className="cs-kv"><span>QUEUE</span><b>{queue}</b></div>
            <div className="cs-kv"><span>CORE °C</span><b>{temp}</b></div>
            <div className="cs-kv"><span>CKSUM</span><b>0x{cksum.slice(0, 6)}</b></div>
          </div>
        </aside>

        <section className="cs-editor">
          <div className="cs-tabbar">
            <span className="cs-tab">{fileName}</span>
            <span className="cs-compiling">COMPILING <b>{pct}%</b></span>
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
          <div className="cs-status">
            <span>WRITING <b>{short}</b></span>
            <span>{lineCount.toLocaleString()} LINES</span>
            <span>{kb}</span>
            <span>{thru} MB/s</span>
            <span className="cs-status-tgt">TARGET · ANDROID + IPHONE</span>
          </div>
        </section>
      </div>

      {/* opening "preparing your engine" splash + robot voice */}
      <AnimatePresence>
        {phase === 'prep' && (
          <motion.div
            className="cs-prep"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="cs-prep-brand">
              <span className="cs-dot" /> CORE BUILD ENGINE
            </div>
            <div className="cs-prep-wave">
              {Array.from({ length: 28 }).map((_, i) => (
                <span key={i} style={{ animationDelay: `${(i % 14) * 0.06}s` }} />
              ))}
            </div>
            <div className="cs-prep-title">{config.codeStream.prepTitle}</div>
            <div className="cs-prep-sub">{config.codeStream.prepSub}</div>
            <div className="cs-prep-line">
              {cap}
              <span className="cs-caret" />
            </div>
            <div className="cs-prep-shimmer"><span /></div>
            {supportsSpeech() && !enabled && (
              <button
                className="btn amber"
                onClick={() => {
                  if (!enabled) toggle()
                  speakBrief()
                }}
              >
                🔊 ENABLE VOICE
              </button>
            )}
            <div className="cs-prep-note">
              COMPILING NATIVE RUNTIME · DO NOT CLOSE THIS WINDOW
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {black && <div className="black-cut" />}
    </motion.div>
  )
}
