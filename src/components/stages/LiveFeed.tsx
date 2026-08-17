import { useEffect, useRef, useState } from 'react'
import { subscribeFeed, pushFeed, ambientLine, type FeedLine, type FeedKind } from '../../lib/feed'
import { hex, pick, randInt } from '../../lib/random'
import { useSound } from '../../hooks/useSoundToggle'

const NODES = ['NODE-7X', 'OMEGA-4', 'VAULT-11', 'EU-GATE-9', 'BLACKNODE-21', 'GHOST-3', 'RELAY-88', 'SINK-0', 'ZERO-LINK']

type Out = [string, FeedKind]

/**
 * Interactive intercept console. Ambient traffic streams in the background and
 * the operator can type commands (help/scan/trace/decrypt/exploit/…) that print
 * themed fictional responses. Nothing here executes anything real.
 */
export default function LiveFeed() {
  const { play } = useSound()
  const [lines, setLines] = useState<FeedLine[]>([])
  const [input, setInput] = useState('')
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const t0 = useRef(Date.now())
  const history = useRef<string[]>([])
  const hIdx = useRef(-1)

  // shared feed subscription
  useEffect(() => subscribeFeed((l) => setLines((prev) => [...prev, l].slice(-60))), [])

  // ambient background traffic
  useEffect(() => {
    let alive = true
    const tick = () => {
      if (!alive) return
      const [t, k] = ambientLine()
      pushFeed(t, k)
      window.setTimeout(tick, 560 + Math.random() * 720)
    }
    const id = window.setTimeout(tick, 400)
    return () => { alive = false; window.clearTimeout(id) }
  }, [])

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  // gentle onboarding hint (no scroll grab)
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true })
    const id = window.setTimeout(() => pushFeed("type 'help' for commands", 'dim'), 700)
    return () => window.clearTimeout(id)
  }, [])

  const uptime = () => {
    const s = Math.floor((Date.now() - t0.current) / 1000)
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  }

  function respond(raw: string): Out[] {
    const parts = raw.trim().split(/\s+/)
    const cmd = (parts[0] || '').toLowerCase()
    const arg = parts.slice(1).join(' ')
    const need = (u: string): Out[] => [[`usage: ${u}`, 'warn']]
    switch (cmd) {
      case '':
        return []
      case 'help':
        return [
          ['commands ::', 'ok'],
          ['  help  ls  whoami  status  sysinfo  clear', 'dim'],
          ['  scan  nmap [host]  trace <t>  ping <h>', 'dim'],
          ['  connect <node>  decrypt <file>  cat <file>', 'dim'],
          ['  crack <hash>  download <file>  sudo  exploit <t>', 'dim'],
        ]
      case 'ls':
        return [
          ['core.vision.bin', 'dim'],
          ['runtime.native', 'dim'],
          ['merge.crossmodel.ts', 'dim'],
          ['device.android.kt', 'dim'],
          ['vault.key :: sealed', 'warn'],
          ['obsidian.core.x :: LOCKED', 'warn'],
        ]
      case 'whoami':
        return [['operator :: GHOST-7X', 'ok'], ['clearance :: OMEGA · node CORE-04', 'dim']]
      case 'status':
        return [
          ['session ACTIVE · channel ENCRYPTED', 'ok'],
          [`uptime ${uptime()} · ping ${randInt(12, 40)}ms · threat GUARDED`, 'dim'],
          [`links ${randInt(5, 12)} · packets ${(48000 + randInt(0, 9000)).toLocaleString()}`, 'dim'],
        ]
      case 'scan':
        return [
          ['scanning subnet 10.7.0.0/16 ...', 'dim'],
          [`hosts up :: ${randInt(4, 9)}`, 'ok'],
          [`  ${pick(NODES)} :: ports 22,443,${randInt(1000, 9999)} open`, 'dim'],
          [`  ${pick(NODES)} :: ports 80,${randInt(1000, 9999)} open`, 'dim'],
          [`  ${pick(NODES)} :: filtered`, 'warn'],
        ]
      case 'trace': {
        if (!arg) return need('trace <target>')
        const out: Out[] = [[`tracing route to ${arg} ...`, 'dim']]
        const n = randInt(4, 6)
        for (let i = 1; i <= n; i++) out.push([`  ${String(i).padStart(2, '0')}  ${pick(NODES)}  ${randInt(3, 90)}ms`, 'dim'])
        out.push([`route to ${arg} :: ${n} hops`, 'ok'])
        return out
      }
      case 'ping': {
        if (!arg) return need('ping <host>')
        const out: Out[] = []
        for (let i = 0; i < 3; i++) out.push([`64 bytes from ${arg}: seq=${i} time=${randInt(8, 60)}ms`, 'dim'])
        out.push([`${arg} :: alive`, 'ok'])
        return out
      }
      case 'connect':
        if (!arg) return need('connect <node>')
        return [
          [`handshake ${arg} ...`, 'dim'],
          [`key exchange 0x${hex(8)}`, 'dim'],
          ['cipher AES-SIM-256', 'dim'],
          ['secure channel :: ESTABLISHED', 'ok'],
        ]
      case 'decrypt':
        if (!arg) return need('decrypt <file>')
        return [
          [`decrypting ${arg} ...`, 'dim'],
          [`layer 0x${hex(4)} :: ok`, 'ok'],
          [`layer 0x${hex(4)} :: ok`, 'ok'],
          [`layer 0x${hex(4)} :: ok`, 'ok'],
          ['! signature sealed — OMEGA clearance required', 'err'],
        ]
      case 'exploit':
        if (!arg) return need('exploit <target>')
        return [
          [`staging payload → ${arg}`, 'dim'],
          [`injecting 0x${hex(8)}`, 'warn'],
          ['bypassing sentinel layer ...', 'dim'],
          ['escalating privileges ...', 'dim'],
          ['access :: GRANTED', 'ok'],
        ]
      case 'nmap': {
        const host = arg || '10.7.0.0/16'
        const out: Out[] = [[`nmap -sS -T4 ${host}`, 'dim'], ['starting scan ...', 'dim']]
        for (const port of [22, 80, 443, 8443, 9001]) {
          out.push([`  ${port}/tcp  ${pick(['open', 'open', 'filtered', 'open'])}  ${pick(['ssh', 'http', 'https', 'vault', 'ghost'])}`, 'dim'])
        }
        out.push([`${randInt(3, 9)} hosts up · scan done`, 'ok'])
        return out
      }
      case 'sudo':
        return [
          ['[sudo] password for operator:', 'dim'],
          ['operator is not in the sudoers file.', 'err'],
          [`override token 0x${hex(6)} :: accepted`, 'warn'],
          ['privileges escalated → root', 'ok'],
        ]
      case 'cat': {
        if (!arg) return need('cat <file>')
        if (/vault|obsidian|key/i.test(arg)) {
          return [
            [`cat: ${arg} :: SEALED`, 'warn'],
            ['████ ████ ████ ████ :: OMEGA-encrypted', 'dim'],
            ['! clearance required', 'err'],
          ]
        }
        return [
          [`# ${arg}`, 'dim'],
          [`0x${hex(8)} ${hex(8)} ${hex(8)}`, 'dim'],
          [`0x${hex(8)} ${hex(8)} ${hex(8)}`, 'dim'],
          ['EOF', 'dim'],
        ]
      }
      case 'sysinfo':
        return [
          ['core-terminal-7x · kernel 6.6.0-core7x', 'dim'],
          ['AMD Ghost-Core 16x @ 4.70GHz · 64GB', 'dim'],
          [`net GHOSTCHAIN · tun0 OMEGA-4 · ping ${randInt(12, 40)}ms`, 'dim'],
        ]
      case 'crack': {
        if (!arg) return need('crack <hash>')
        const key = hex(8)
        const out: Out[] = [[`bruteforce ${arg} ...`, 'dim'], ['dictionary + mask attack', 'dim']]
        for (let i = 2; i <= 8; i += 2) {
          out.push([`key :: ${key.slice(0, i)}${'·'.repeat(8 - i)}`, i < 8 ? 'warn' : 'ok'])
        }
        out.push([`KEY RECOVERED :: 0x${key}`, 'ok'])
        return out
      }
      case 'download': {
        if (!arg) return need('download <file>')
        const out: Out[] = [[`downloading ${arg} ...`, 'dim']]
        for (const pv of [12, 34, 58, 79, 96, 100]) {
          const f = Math.round(pv / 10)
          out.push([`[${'█'.repeat(f)}${'·'.repeat(10 - f)}] ${pv}%  ${randInt(40, 180)} MB/s`, pv < 100 ? 'dim' : 'ok'])
        }
        out.push([`complete :: ${arg} · ${randInt(1, 9)}.${randInt(0, 9)} GB`, 'ok'])
        return out
      }
      case 'clear':
        return [['__CLEAR__', 'dim']]
      default:
        return [[`command not found: ${cmd} — type 'help'`, 'err']]
    }
  }

  const exec = (raw: string) => {
    pushFeed(`core@7x:~$ ${raw}`, 'in')
    play('beep')
    const trimmed = raw.trim()
    if (trimmed) {
      history.current.push(trimmed)
      if (history.current.length > 40) history.current.shift()
    }
    hIdx.current = -1
    const out = respond(raw)
    if (out.length === 1 && out[0][0] === '__CLEAR__') {
      setLines([])
      return
    }
    out.forEach(([t, k], i) =>
      window.setTimeout(() => {
        pushFeed(t, k)
        if (i % 2 === 0) play('key')
      }, 100 + i * (70 + Math.random() * 90)),
    )
  }

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      exec(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.current.length) {
        hIdx.current = hIdx.current < 0 ? history.current.length - 1 : Math.max(0, hIdx.current - 1)
        setInput(history.current[hIdx.current] || '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (hIdx.current >= 0) {
        hIdx.current += 1
        if (hIdx.current >= history.current.length) {
          hIdx.current = -1
          setInput('')
        } else {
          setInput(history.current[hIdx.current])
        }
      }
    }
  }

  return (
    <div className="livefeed panel">
      <div className="lf-head">
        <span className="lf-dot" />
        LIVE CONSOLE // INTERCEPT
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
      <div className="lf-prompt" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
        <span className="lf-ps">core@7x:~$</span>
        <span className="lf-cmd">{input}</span>
        <span className="cursor" />
        <input
          ref={inputRef}
          className="lf-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          autoComplete="off"
          aria-label="terminal command input"
        />
      </div>
    </div>
  )
}
