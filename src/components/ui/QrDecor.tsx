import { useMemo } from 'react'

/**
 * DECORATIVE QR — purely visual. It encodes NOTHING: no URL, no wallet,
 * no payment payload. A static seeded pattern that only *looks* like a QR.
 */
export default function QrDecor() {
  const cells = useMemo(() => {
    const size = 21
    const grid: boolean[] = []
    const inBox = (r: number, c: number, br: number, bc: number, n = 7) =>
      r >= br && r < br + n && c >= bc && c < bc + n
    const finder = (r: number, c: number, br: number, bc: number) => {
      const rr = r - br
      const cc = c - bc
      if (rr === 0 || rr === 6 || cc === 0 || cc === 6) return true // outer ring
      if (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) return true // inner block
      return false
    }
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        let on = false
        if (inBox(r, c, 0, 0)) on = finder(r, c, 0, 0)
        else if (inBox(r, c, 0, size - 7)) on = finder(r, c, 0, size - 7)
        else if (inBox(r, c, size - 7, 0)) on = finder(r, c, size - 7, 0)
        else if (inBox(r, c, 0, 7, 1) || inBox(r, c, 7, 0, 1)) on = (r + c) % 2 === 0 // separators
        else on = ((r * 5 + c * 3 + ((r * c) % 7) + ((r ^ c) % 3)) % 3) === 0 // seeded fill
        grid.push(on)
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
