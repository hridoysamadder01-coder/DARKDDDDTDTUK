/** Small deterministic-ish helpers for controlled randomness. */

export const rand = (min: number, max: number): number =>
  min + Math.random() * (max - min)

export const randInt = (min: number, max: number): number =>
  Math.floor(rand(min, max + 1))

export const pick = <T>(arr: readonly T[]): T =>
  arr[Math.floor(Math.random() * arr.length)]

export const chance = (p: number): boolean => Math.random() < p

const HEX = '0123456789ABCDEF'
export const hex = (len: number): string => {
  let out = ''
  for (let i = 0; i < len; i++) out += HEX[Math.floor(Math.random() * 16)]
  return out
}

const GLYPHS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&$@!?><*/\\|=+-珠核码密访问节点权限'
export const glyph = (): string => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

/** Fake command / log fragments used across the terminal atmosphere. */
export const logFragments: string[] = [
  'exec /sys/core/loader --sealed',
  'mount vault-11 :: ro',
  'handshake node-7x :: 0x%',
  'route EU-GATE-9 -> OMEGA-4',
  'sig verify 0x%%%%%%',
  'alloc 0x%%%% :: heap',
  'stream blacknode-21 open',
  'decrypt layer::%% ok',
  'ping vault-net :: %ms',
  'flush cache :: sector %%',
  'sync ghostchain :: %%%',
  'trace pkt 0x%%%% -> sink',
  'load module core.vision',
  'attest sim-token 0x%%%%',
  'negotiate tls-sim :: ok',
]

export const renderFragment = (f: string): string =>
  f.replace(/%/g, () => HEX[Math.floor(Math.random() * 16)])
