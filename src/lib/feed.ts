import { hex, pick, randInt } from './random'

export type FeedKind = 'ok' | 'warn' | 'err' | 'dim' | 'in'
export interface FeedLine {
  id: number
  text: string
  kind: FeedKind
}

let counter = 0
const subs = new Set<(l: FeedLine) => void>()

/** Broadcast a line to the live feed. */
export function pushFeed(text: string, kind: FeedKind = 'dim'): void {
  const line: FeedLine = { id: counter++, text, kind }
  subs.forEach((f) => f(line))
}

export function subscribeFeed(fn: (l: FeedLine) => void): () => void {
  subs.add(fn)
  return () => {
    subs.delete(fn)
  }
}

const NODES = [
  'NODE-7X', 'BLACKNODE-21', 'OMEGA-4', 'EU-GATE-9', 'VAULT-11',
  'GHOST-3', 'RELAY-88', 'SINK-0', 'CORE-04', 'ZERO-LINK',
]
const nd = () => pick(NODES)

/** One line of ambient "intrusion" traffic. Returns [text, kind]. */
export function ambientLine(): [string, FeedKind] {
  const r = Math.random()
  if (r < 0.08) return [`! intrusion attempt blocked @ ${nd()}`, 'warn']
  if (r < 0.14) return [`! anomaly 0x${hex(4)} :: quarantined`, 'err']
  const gen: Array<[string, FeedKind]> = [
    [`intercept pkt 0x${hex(4)} :: ${nd()}`, 'dim'],
    [`handshake ${nd()} :: ok`, 'ok'],
    [`route ${nd()} -> ${nd()}`, 'dim'],
    [`trace hop ${randInt(1, 14)} :: ${nd()}`, 'dim'],
    [`spoof mac 0x${hex(6)}`, 'dim'],
    [`inject token 0x${hex(6)} :: ok`, 'ok'],
    [`bypass gate ${nd()} :: cleared`, 'ok'],
    [`probe ${nd()} :: ${randInt(4, 90)}ms`, 'dim'],
    [`decrypt layer::${hex(2)} ok`, 'ok'],
    [`sync ghostchain :: ${randInt(2, 99)}%`, 'dim'],
    [`seal vault-11 :: 0x${hex(6)}`, 'dim'],
    [`stream ${nd()} open :: 0x${hex(4)}`, 'dim'],
    [`attest sig 0x${hex(8)}`, 'ok'],
  ]
  return pick(gen)
}

/** Rotating fake command line typed at the console prompt. */
export const FEED_COMMANDS = [
  'trace --node OMEGA-4 --deep',
  'route --through VAULT-11 --silent',
  'scan --gate EU-GATE-9 --ports',
  'inject --token 0x7X --core',
  'decrypt --layer 9 --seal omega',
  'probe --mesh --map --live',
  'bypass --node BLACKNODE-21',
  'pull --manifest core.vision --raw',
]
