import type { CryptoAsset } from '../types'

/**
 * Selectable crypto assets — SIMULATION ONLY.
 * `rate` is an approximate USD price used purely to render a realistic-looking
 * crypto amount. No wallet, chain, address, or transaction is ever involved.
 * BTC & SOL are flagged as the strongest / recommended.
 */
export const coins: CryptoAsset[] = [
  { sym: 'BTC', name: 'Bitcoin', sub: 'Secure · Reserve', network: 'Bitcoin', rate: 68000, color: '#f7931a', strong: true },
  { sym: 'SOL', name: 'Solana', sub: 'Fast · Low fees', network: 'Solana', rate: 172, color: '#14f195', strong: true },
  { sym: 'ETH', name: 'Ethereum', sub: 'Smart layer', network: 'ERC-20', rate: 3400, color: '#8a92b2' },
  { sym: 'USDT', name: 'Tether', sub: 'Stable · Liquid', network: 'TRC-20', rate: 1, color: '#26a17b' },
  { sym: 'LTC', name: 'Litecoin', sub: 'Light · Fast', network: 'Litecoin', rate: 88, color: '#a6a9aa' },
  { sym: 'XRP', name: 'Ripple', sub: 'Transfer grid', network: 'XRP Ledger', rate: 0.62, color: '#23a2d9' },
]

/** Renders a realistic crypto amount for a USD value. */
export function cryptoAmount(usd: number, coin: CryptoAsset): string {
  const amt = usd / coin.rate
  if (coin.sym === 'USDT') return amt.toFixed(2)
  if (amt >= 100) return amt.toFixed(2)
  if (amt >= 1) return amt.toFixed(4)
  return amt.toFixed(6)
}
