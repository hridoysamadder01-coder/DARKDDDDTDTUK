import { useEffect, useState } from 'react'

interface Hit {
  id: number
  x: number
  y: number
}

/**
 * Global click feedback: every pointer press drops a brief "targeting lock"
 * — expanding rings + a crosshair — at the tap point. Purely cosmetic and
 * pointer-transparent, so it never blocks the UI underneath.
 */
export default function ClickFX() {
  const [hits, setHits] = useState<Hit[]>([])

  useEffect(() => {
    let id = 0
    const onDown = (e: PointerEvent) => {
      const hit = { id: id++, x: e.clientX, y: e.clientY }
      setHits((prev) => [...prev.slice(-6), hit])
      window.setTimeout(
        () => setHits((prev) => prev.filter((h) => h.id !== hit.id)),
        680,
      )
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

  return (
    <div className="clickfx" aria-hidden>
      {hits.map((h) => (
        <span key={h.id} className="cf-hit" style={{ left: h.x, top: h.y }}>
          <span className="cf-ring" />
          <span className="cf-ring cf-ring2" />
          <span className="cf-dot" />
          <span className="cf-cross" />
        </span>
      ))}
    </div>
  )
}
