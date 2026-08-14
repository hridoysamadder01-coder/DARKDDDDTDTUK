import type { CryptoAsset } from '../types'

/**
 * Selectable crypto assets — SIMULATION ONLY.
 * These are display labels for a prank. No wallet, chain, address, or
 * transaction is ever involved. BTC & SOL are flagged as the strongest.
 */
export const coins: CryptoAsset[] = [
  { sym: 'BTC', name: 'Bitcoin', sub: 'PRIMARY // SECURE // RESERVE', strong: true },
  { sym: 'SOL', name: 'Solana', sub: 'FAST // LOW LATENCY // ACTIVE', strong: true },
  { sym: 'ETH', name: 'Ethereum', sub: 'SMART LAYER // VERIFIED' },
  { sym: 'USDT', name: 'Tether', sub: 'STABLE // DIRECT // LIQUID' },
  { sym: 'LTC', name: 'Litecoin', sub: 'LIGHT CHANNEL // FAST' },
  { sym: 'XRP', name: 'Ripple', sub: 'TRANSFER GRID // ACTIVE' },
]
