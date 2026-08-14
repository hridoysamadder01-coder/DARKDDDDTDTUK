/**
 * Builds a dramatic descending "calculating" ladder for any price so the
 * price-reveal always lands on the real value from a few teasing numbers.
 */
export function makeLadder(price: number): number[] {
  const mults = [2.28, 1.77, 1.5, 1.21, 1.1, 1.028]
  return mults.map((m) => Math.round((price * m) / 5) * 5)
}
