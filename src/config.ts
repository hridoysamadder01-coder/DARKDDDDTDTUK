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

  /** Robotic "voice hail" shown once on entering the terminal. */
  welcome: {
    lines: string[]
    /** The name spoken/shown once more at the very end. */
    outro: string
    /** Speech tuning — lower pitch = deeper, lower rate = slower. */
    voice: { rate: number; pitch: number }
    /** Spoken briefing of the primary target build. */
    briefing: {
      heading: string
      title: string
      lines: string[]
    }
  }

  /** Opening narration for the final code-writing screen. */
  codeStream: {
    prepTitle: string
    prepSub: string
    voice: { rate: number; pitch: number }
    /** First line is the "please wait" intro; the rest is the slow brief. */
    narration: string[]
  }

  /** Copy + robot lines for the payment-confirmation camera gate. */
  payVerify: {
    kicker: string
    title: string
    subtitleEn: string
    subtitleZh: string
    verifiedTitle: string
    verifiedSubEn: string
    verifiedSubZh: string
    speak: string[]
  }
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

  welcome: {
    lines: [
      'WELCOME MISTER H S JACK-SPARROW',
      'LONG TIME TO SEE YOU',
      'HERE IS THE MOST POWERFUL AND UPDATED ENGINE FOR YOU',
    ],
    outro: 'JACK-SPARROW',
    // Deep and slow — a calm, heavy machine voice.
    voice: { rate: 0.62, pitch: 0.28 },
    briefing: {
      heading: 'PRIMARY TARGET BUILD',
      title: 'OBSIDIAN CORE X',
      lines: [
        'BEHOLD OBSIDIAN CORE X — THE UNIVERSAL NATIVE BUILD',
        'A CROSS-MODEL VISION CORE, COMPILED FOR DIRECT ON-DEVICE EXECUTION',
        'IT RUNS NATIVELY ON ANDROID AND IPHONE — NO CLOUD, NO LIMITS',
        'LOW-LATENCY PROCESSING, SEALED UNDER OMEGA CLEARANCE, LIFETIME ACCESS',
        'THE MOST POWERFUL ENGINE IN THE INDEX — RESERVED FOR YOU',
      ],
    },
  },

  codeStream: {
    prepTitle: 'PREPARING YOUR ENGINE CODE',
    prepSub: 'PLEASE WAIT',
    // Very slow and deep — a measured, deliberate delivery.
    voice: { rate: 0.5, pitch: 0.26 },
    narration: [
      'YOUR ENGINE CODE IS BEING PREPARED. PLEASE WAIT.',
      'THIS CODE IS COMPATIBLE WITH ANY GOOGLE MODEL, INCLUDING GEMINI.',
      'THEIR API COST WILL BE ONLY A LITTLE ABOVE ZERO.',
      'EVERYTHING ELSE RUNS ON YOUR OWN LOCAL MODELS.',
      'LIFETIME PREMIUM ACCESS.',
      'THIS ENGINE WILL WORK WHEREVER YOU DEPLOY IT.',
      'AND NOT MERELY WORK — IT IS THE MOST ADVANCED ENGINE WE CURRENTLY HOLD.',
    ],
  },

  payVerify: {
    kicker: 'SETTLEMENT GATE // 支付验证',
    title: 'PAYMENT VERIFICATION',
    subtitleEn: 'PRESENT SETTLEMENT CREDENTIAL TO THE OPTICAL SENSOR',
    subtitleZh: '出示支付凭证以确认',
    verifiedTitle: 'PAYMENT CONFIRMED',
    verifiedSubEn: 'SETTLEMENT SEALED',
    verifiedSubZh: '支付已确认',
    speak: [
      'PAYMENT SIGNATURE CONFIRMED',
      'SETTLEMENT SEALED ON THE LEDGER',
      'OBSIDIAN CORE X IS NOW YOURS MISTER JACK-SPARROW',
    ],
  },
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
