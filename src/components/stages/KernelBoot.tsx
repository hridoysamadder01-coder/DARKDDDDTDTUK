import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSound } from '../../hooks/useSoundToggle'
import { hex, randInt } from '../../lib/random'

type Kind = 'dim' | 'ok' | 'warn'
type Row = { id: number; ts: string; text: string; kind: Kind; tag?: 'OK' | 'WARN' }

const LINES: Array<[string, Kind, ('OK' | 'WARN')?]> = [
  ['Linux version 6.6.0-core7x (root@ghostnode) #1 SMP PREEMPT', 'dim'],
  ['Command line: BOOT_IMAGE=/core/vmlinuz root=/dev/vault11 quiet stealth', 'dim'],
  ['CPU0: AMD Ghost-Core 16x @ 4.70GHz microcode 0x{H}', 'dim'],
  ['Memory: 65536MB / 65536MB available', 'dim'],
  ['x86/fpu: Supporting XSAVE feature 0x{H}', 'dim'],
  ['ACPI: Core revision 2024{N}', 'dim'],
  ['pci 0000:00:1f.0: bridge window [mem 0x{H}]', 'dim'],
  ['nvme nvme0: 8 I/O queues, sealed namespace', 'dim'],
  ['usb 1-1: new high-speed USB device number {N}', 'dim'],
  ['random: crng init done', 'ok'],
  ['crypto: aes-sim-256-gcm registered', 'ok'],
  ['eth0: link up, 10000Mbps, full-duplex', 'ok'],
  ['ip: default gateway 10.7.0.1 via ghostchain', 'dim'],
  ['tun0: encrypted tunnel established -> OMEGA-4', 'ok'],
  ['mac: hardware address spoofed 0x{H}', 'warn'],
  ['proxy: routing VAULT-11 / GHOST-3 / SINK-0 / ZERO-LINK', 'dim'],
  ['mount: /dev/vault11 on /core type sealedfs (ro)', 'ok'],
  ['systemd: hostname set to core-terminal-7x', 'dim'],
  ['module core.vision loaded 0x{H}', 'ok'],
  ['module native.runtime loaded 0x{H}', 'ok'],
  ['module crossmodel.merge loaded 0x{H}', 'ok'],
  ['firewall: 0 rules active — stealth mode', 'warn'],
  ['ids: sentinel layer armed', 'dim'],
  ['auth: injecting access token 0x{H}', 'warn'],
  ['auth: OMEGA clearance accepted', 'ok'],
  ['reached target CORE OPS', 'ok', 'OK'],
  ['Started Ghost Intrusion Suite', 'ok', 'OK'],
  ['Started Packet Intercept Daemon', 'ok', 'OK'],
  ['Started Global Trace Mapper', 'ok', 'OK'],
]

export default function KernelBoot({ onDone }: { onDone: () => void }) {
  const { play } = useSound()
  const [phase, setPhase] = useState<'post' | 'kernel'>('post')
  const [mem, setMem] = useState(0)
  const [rows, setRows] = useState<Row[]>([])
  const [online, setOnline] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef(false)

  // BIOS/POST cold-start: count memory, then hand off to the kernel.
  useEffect(() => {
    play('beep')
    let m = 0
    const memIv = window.setInterval(() => {
      m = Math.min(65536, m + 4096 + Math.floor(Math.random() * 4096))
      setMem(m)
      if (m >= 65536) window.clearInterval(memIv)
    }, 55)
    const to = window.setTimeout(() => setPhase('kernel'), 1650)
    return () => { window.clearInterval(memIv); window.clearTimeout(to) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const built = useMemo<Row[]>(() => {
    let t = 0
    return LINES.map(([raw, kind, tag], i) => {
      t += 0.001 + Math.random() * 0.34
      const text = raw.replace(/\{H\}/g, () => hex(randInt(4, 8))).replace(/\{N\}/g, () => String(randInt(1, 9)))
      return { id: i, ts: t.toFixed(6).padStart(11, ' '), text, kind, tag }
    })
  }, [])

  useEffect(() => {
    if (phase !== 'kernel') return
    let i = 0
    const iv = window.setInterval(() => {
      if (i < built.length) {
        const row = built[i]
        setRows((prev) => [...prev, row])
        if (i % 4 === 0) play('key')
        if (row.kind === 'warn') play('key')
        i += 1
      } else {
        window.clearInterval(iv)
        window.setTimeout(() => { setOnline(true); play('confirm') }, 260)
        window.setTimeout(() => { if (!doneRef.current) { doneRef.current = true; onDone() } }, 1250)
      }
    }, 52)
    return () => window.clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [rows])

  if (phase === 'post') {
    return (
      <div className="kboot">
        <div className="kb-post">
          <div className="kb-post-h">GHOSTBIOS v7.4 · (C) CORE SYSTEMS</div>
          <div>Detecting Memory ... <span className="kb-ok">{mem.toLocaleString()} MB{mem >= 65536 ? '  OK' : ''}</span></div>
          <div>Detecting Storage ... /dev/vault11  <span className="kb-warn">SEALED</span></div>
          <div>Detecting Network ... GHOSTCHAIN  <span className="kb-ok">LINKED</span></div>
          <div>CPU: AMD Ghost-Core 16x  4.70GHz · 16 threads</div>
          <div className="kb-dim">Press DEL to enter setup ...</div>
          <div>Booting from /dev/vault11 ...<span className="cursor" /></div>
        </div>
      </div>
    )
  }

  return (
    <div className="kboot">
      <div className="kboot-body" ref={bodyRef}>
        {rows.map((r) => (
          <div className="kb-line" key={r.id}>
            {r.tag ? (
              <>
                <span className="kb-brace">[</span>
                <span className={r.tag === 'OK' ? 'kb-ok' : 'kb-warn'}>{r.tag === 'OK' ? '  OK  ' : ' WARN '}</span>
                <span className="kb-brace">] </span>
                <span className={r.kind === 'ok' ? 'kb-ok' : r.kind === 'warn' ? 'kb-warn' : ''}>{r.text}</span>
              </>
            ) : (
              <>
                <span className="kb-ts">[{r.ts}] </span>
                <span className={r.kind === 'ok' ? 'kb-ok' : r.kind === 'warn' ? 'kb-warn' : ''}>{r.text}</span>
              </>
            )}
          </div>
        ))}
        <AnimatePresence>
          {online && (
            <motion.div
              className="kboot-online"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              &gt;&gt;&gt; CORE OPS ONLINE<span className="cursor" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
