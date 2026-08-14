import { memo } from 'react'
import CodeRain from './CodeRain'

/** Dark-web ambient: green matrix rain + drifting glow + grid + scanlines. */
function AmbientBase() {
  return (
    <>
      <div className="ambient" aria-hidden>
        <CodeRain />
        <div className="grid" />
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
      </div>
      <div className="grain" aria-hidden />
      <div className="scanlines" aria-hidden />
    </>
  )
}

export const Ambient = memo(AmbientBase)
