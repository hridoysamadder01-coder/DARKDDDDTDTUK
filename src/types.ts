export type Stage =
  | 'kernelBoot'
  | 'opsBoot'
  | 'boot'
  | 'cameraVerify'
  | 'terminal'
  | 'accessChain'
  | 'priceReveal'
  | 'cryptoSession'
  | 'payVerify'
  | 'final'
  | 'codestream'

export type EngineStatus =
  | 'AVAILABLE // LIFETIME ACCESS'
  | 'VERIFIED // NATIVE BUILD'
  | 'UNIVERSAL // READY'
  | 'PRIVATE // CROSS-MODEL'
  | 'RESTRICTED // NATIVE BUILD'
  | 'RESTRICTED // HIGH CLEARANCE'

export interface Engine {
  id: string
  index: number
  name: string
  platform: string
  buildClass: string
  status: EngineStatus
  summary: string
  price: number
  runtimeMode: string
  securityLayer: string
  processing: string
  accessClass: string

  /** Optional premium detail-panel fields (fall back to sensible defaults). */
  deviceClass?: string
  mergeCapability?: string
  compatibility?: string
  accessModel?: string
  features?: string[]

  /** The single primary target build. */
  isTarget?: boolean
  /** Longer description lines for the hero card / detail. */
  targetLines?: string[]
  /** Extra marketing one-liners shown on the target. */
  marketing?: string[]
}

/** A selectable crypto asset (simulation only — no real assets involved). */
export interface CryptoAsset {
  sym: string
  name: string
  sub: string
  /** BTC & SOL render as the strongest options. */
  strong?: boolean
}
