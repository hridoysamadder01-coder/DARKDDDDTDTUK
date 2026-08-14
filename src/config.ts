/**
 * ─────────────────────────────────────────────────────────────
 *  CENTRAL CONFIG
 * ─────────────────────────────────────────────────────────────
 *  Change the values below to re-skin the whole prank experience.
 *  Everything here is cosmetic. There is NO real payment, wallet,
 *  network, or verification logic anywhere in this project.
 * ─────────────────────────────────────────────────────────────
 */

export type AnimationIntensity = 'low' | 'medium' | 'high'

export interface AppConfig {
  /** Product/platform brand shown in the nav + splash. */
  brandName: string
  brandTagline: string

  /** Primary target product name shown on the hero card. */
  targetProductName: string
  targetCodename: string

  /** Headline access price of the primary target (numeric, no symbol). */
  price: number
  currency: string
  /** Access-model label shown under the price and on cards. */
  accessLabel: string

  /** Final reveal copy. */
  finalPrankMessage: string
  finalPrankSubtitle: string
  finalPrankNote: string

  soundEnabledByDefault: boolean
  animationIntensity: AnimationIntensity

  /** Splash duration hint in ms (used for pacing). */
  bootDurationMs: number
  /** Fake payment countdown, in seconds. */
  countdownSeconds: number

  supportedPlatforms: string[]

  /** Show the small Chinese atmosphere labels? (off for the clean product look) */
  bilingualLabels: boolean

  /** The persistent, always-visible safety label. */
  simulationLabel: string
}

export const config: AppConfig = {
  brandName: 'Core Engine',
  brandTagline: 'Private Build Distribution',

  targetProductName: 'Obsidian Core X — Universal Native Build',
  targetCodename: 'Obsidian Core X',

  price: 430,
  currency: 'USD',
  accessLabel: 'Lifetime access',

  finalPrankMessage: 'It was a simulation.',
  finalPrankSubtitle: 'You just got pranked — nothing here was real.',
  finalPrankNote:
    'No payment was taken, no wallet was touched, and no software was delivered. Every price, address, and confirmation you saw was a front-end mock built purely for the prank.',

  soundEnabledByDefault: false,
  animationIntensity: 'high',

  bootDurationMs: 3200,
  countdownSeconds: 899, // 14:59

  supportedPlatforms: ['Android', 'iPhone', 'Tablet', 'Universal'],

  bilingualLabels: false,

  simulationLabel: 'SIMULATION // PRANK ENVIRONMENT',
}

/** Small Chinese atmosphere labels (optional flavour). */
export const zh = {
  coreEngine: '核心引擎',
  encrypted: '已加密',
  restricted: '权限受限',
  verifying: '正在验证',
  authorized: '访问授权',
  mobileNative: '移动端原生',
  connected: '已连接',
} as const

export const intensityProfile: Record<
  AnimationIntensity,
  { rainDensity: number; nodes: number; glitchRate: number; flicker: number }
> = {
  low: { rainDensity: 0.6, nodes: 10, glitchRate: 0.4, flicker: 0.3 },
  medium: { rainDensity: 0.85, nodes: 16, glitchRate: 0.7, flicker: 0.6 },
  high: { rainDensity: 1, nodes: 22, glitchRate: 1, flicker: 1 },
}
