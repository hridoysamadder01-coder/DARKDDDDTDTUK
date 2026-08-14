/**
 * ─────────────────────────────────────────────────────────────
 *  CENTRAL CONFIG
 * ─────────────────────────────────────────────────────────────
 *  Change the values below to re-tune the whole experience.
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
  /** Headline access price of the primary target (numeric, no symbol). */
  price: number
  /** Currency label shown after the price. */
  currency: string
  /** Access-model label shown under the price and on cards. */
  accessLabel: string
  /** Descending "calculating" ladder for the primary price reveal. */
  priceLadder: number[]

  /** Sound on by default? (Browsers still require a user gesture.) */
  soundEnabledByDefault: boolean
  /** Global animation intensity. */
  animationIntensity: AnimationIntensity

  /** Boot sequence duration hint in ms (used for pacing). */
  bootDurationMs: number
  /** Access-session countdown, in seconds. */
  countdownSeconds: number

  /** Supported platform tags. */
  supportedPlatforms: string[]

  /** Show the small Chinese metadata micro-labels? */
  bilingualLabels: boolean

  /** Neutral notice shown only inside the financial (access) screen. */
  financialNotice: string
}

export const config: AppConfig = {
  targetProductName: 'OBSIDIAN CORE X // UNIVERSAL NATIVE BUILD',
  targetCodename: 'OBSIDIAN CORE X',
  price: 430,
  currency: 'USD',
  accessLabel: 'LIFETIME ACCESS',
  priceLadder: [980, 760, 645, 520, 471, 442],

  soundEnabledByDefault: false,
  animationIntensity: 'high',

  bootDurationMs: 4800,
  countdownSeconds: 899, // 14:59

  supportedPlatforms: ['ANDROID', 'IPHONE', 'TABLET', 'UNIVERSAL'],

  bilingualLabels: true,

  financialNotice: 'NO REAL TRANSACTIONS',
}

/** Small Chinese metadata micro-labels (used sparingly for flavour). */
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
