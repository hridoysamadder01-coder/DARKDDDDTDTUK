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
  /** Primary target product name shown on the hero card. */
  targetProductName: string
  /** Short target codename used in headings. */
  targetCodename: string
  /** One-time access price (numeric, no currency symbol). */
  price: number
  /** Currency label shown after the price. */
  currency: string
  /** Price "count-down" animation frames before landing on `price`. */
  priceLadder: number[]

  /** Final prank punchline. */
  finalPrankMessage: string
  finalPrankSubtitle: string
  finalPrankNote: string

  /** Sound on by default? (Browsers still require a user gesture.) */
  soundEnabledByDefault: boolean
  /** Global animation intensity. */
  animationIntensity: AnimationIntensity

  /** Boot sequence duration hint in ms (used for pacing). */
  bootDurationMs: number
  /** Fake payment countdown, in seconds. */
  countdownSeconds: number

  /** Supported platform tags. */
  supportedPlatforms: string[]

  /** Show the small Chinese atmosphere labels? */
  bilingualLabels: boolean

  /** The persistent, always-visible safety label. */
  simulationLabel: string
}

export const config: AppConfig = {
  targetProductName: 'OBSIDIAN CORE X // UNIVERSAL NATIVE BUILD',
  targetCodename: 'OBSIDIAN CORE X',
  price: 430,
  currency: 'USD',
  priceLadder: [980, 760, 645, 520, 471, 442],

  finalPrankMessage: 'PRANK SUCCESS 😈',
  finalPrankSubtitle: 'YOU JUST ENTERED A SIMULATION.',
  finalPrankNote: 'No real payment. No real access. Just a cinematic prank environment.',

  soundEnabledByDefault: false,
  animationIntensity: 'high',

  bootDurationMs: 6000,
  countdownSeconds: 899, // 14:59

  supportedPlatforms: ['ANDROID', 'IPHONE', 'TABLET', 'UNIVERSAL'],

  bilingualLabels: true,

  simulationLabel: 'SIMULATION // PRANK ENVIRONMENT',
}

/** Small Chinese atmosphere labels (used sparingly for flavour). */
export const zh = {
  coreEngine: '核心引擎',
  encrypted: '已加密',
  restricted: '权限受限',
  verifying: '正在验证',
  authorized: '访问授权',
  mobileNative: '移动端原生',
  connected: '已连接',
} as const

/** Intensity → tuning multipliers used across canvases & timings. */
export const intensityProfile: Record<
  AnimationIntensity,
  { rainDensity: number; nodes: number; glitchRate: number; flicker: number }
> = {
  low: { rainDensity: 0.6, nodes: 10, glitchRate: 0.4, flicker: 0.3 },
  medium: { rainDensity: 0.85, nodes: 16, glitchRate: 0.7, flicker: 0.6 },
  high: { rainDensity: 1, nodes: 22, glitchRate: 1, flicker: 1 },
}
