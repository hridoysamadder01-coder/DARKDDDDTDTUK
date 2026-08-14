import type { CryptoAsset } from '../types'

/**
 * Selectable digital assets shown in the access session.
 * Display labels only — no wallet, chain, address, or transaction is ever
 * involved. BTC & SOL are flagged as the strongest (highest priority).
 */
export const coins: CryptoAsset[] = [
  { sym: 'BTC', name: 'Bitcoin', sub: 'PRIMARY // SECURE // RESERVE', strong: true },
  { sym: 'SOL', name: 'Solana', sub: 'FAST // LOW LATENCY // ACTIVE', strong: true },
  { sym: 'ETH', name: 'Ethereum', sub: 'SMART LAYER // VERIFIED' },
  { sym: 'USDT', name: 'Tether', sub: 'STABLE // DIRECT // LIQUID' },
  { sym: 'LTC', name: 'Litecoin', sub: 'LIGHT CHANNEL // FAST' },
  { sym: 'XRP', name: 'Ripple', sub: 'TRANSFER GRID // ACTIVE' },
]
