import { memo } from 'react'

/** Subtle premium ambient background: drifting gradient blobs + faint grid. */
function AmbientBase() {
  return (
    <div className="ambient" aria-hidden>
      <div className="grid" />
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
      <div className="noise" />
    </div>
  )
}

export const Ambient = memo(AmbientBase)
