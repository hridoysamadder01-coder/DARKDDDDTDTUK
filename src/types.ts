export type Stage =
  | 'boot'
  | 'terminal'
  | 'accessChain'
  | 'priceReveal'
  | 'payment'
  | 'binance'
  | 'crypto'
  | 'verify'
  | 'final'

export type PaymentChannel = 'binance' | 'crypto'

export type EngineStatus =
  | 'AVAILABLE // PRIVATE BUILD'
  | 'RESTRICTED // VERIFIED'
  | 'LOCKED // HIGH CLEARANCE'
  | 'UNIVERSAL // READY'

export interface Engine {
  id: string
  index: number
  name: string
  platform: string
  buildClass: string
  status: EngineStatus
  summary: string
  runtimeMode: string
  securityLayer: string
  processing: string
  accessClass: string
  /** The single primary target build. */
  isTarget?: boolean
  /** Longer description lines for the target build. */
  targetLines?: string[]
  features?: string[]
}
