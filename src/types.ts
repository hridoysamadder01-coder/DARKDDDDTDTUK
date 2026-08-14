export type Stage = 'splash' | 'catalog' | 'checkout' | 'invoice' | 'complete'

export type EngineStatus =
  | 'AVAILABLE // LIFETIME ACCESS'
  | 'VERIFIED // GOOGLE-SUPPORTED'
  | 'UNIVERSAL // READY'
  | 'PRIVATE // CROSS-MODEL'
  | 'RESTRICTED // NATIVE BUILD'

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

  /** Optional premium detail fields (fall back to sensible defaults). */
  deviceClass?: string
  mergeCapability?: string
  compatibility?: string
  accessModel?: string
  features?: string[]

  /** The single primary target build. */
  isTarget?: boolean
  targetLines?: string[]
  marketing?: string[]
}

/** A selectable crypto asset (simulation only — no real assets involved). */
export interface CryptoAsset {
  sym: string
  name: string
  sub: string
  network: string
  /** Approximate USD price, used only to render a realistic crypto amount. */
  rate: number
  /** Brand colour for the coin badge. */
  color: string
  /** BTC & SOL render as the recommended options. */
  strong?: boolean
}
