import { useMemo } from 'react'

/**
 * DECORATIVE QR — purely visual. It encodes NOTHING: no URL, no wallet,
 * no payment payload. It is a static pattern that only *looks* like a QR.
 */
export default function QrDecor() {
  const cells = useMemo(() => {
    const size = 11
    const grid: boolean[] = []
    // A fixed pseudo-pattern (seeded, not random) so it never changes and
    // can never be mistaken for a scannable code.
    const isFinder = (r: number, c: number) => {
      const inBox = (br: number, bc: number) =>
        r >= br && r < br + 3 && c >= bc && c < bc + 3
      return inBox(0, 0) || inBox(0, size - 3) || inBox(size - 3, 0)
    }
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (isFinder(r, c)) {
          // finder squares: outer ring on, centre on
          const local = (br: number, bc: number) => {
            const rr = r - br
            const cc = c - bc
            return rr === 1 && cc === 1 ? true : rr === 0 || rr === 2 || cc === 0 || cc === 2
          }
          let on = false
          if (r < 3 && c < 3) on = local(0, 0)
          else if (r < 3 && c >= size - 3) on = local(0, size - 3)
          else if (r >= size - 3 && c < 3) on = local(size - 3, 0)
          grid.push(on)
        } else {
          // deterministic checker-ish fill
          grid.push(((r * 7 + c * 3 + ((r * c) % 5)) % 3) === 0)
        }
      }
    }
    return grid
  }, [])

  return (
    <div className="qr" aria-hidden title="Decorative QR — non-payable">
      {cells.map((on, i) => (
        <i key={i} className={on ? 'on' : ''} />
      ))}
    </div>
  )
}
