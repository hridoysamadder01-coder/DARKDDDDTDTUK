import { memo } from 'react'
import CodeRain from './CodeRain'
import NetworkMap from './NetworkMap'

/** Composited background layers (code rain + network map + vignette). */
function BackgroundBase({ paused = false }: { paused?: boolean }) {
  return (
    <>
      <div className="bg-layers" aria-hidden>
        <CodeRain paused={paused} />
        <NetworkMap paused={paused} />
      </div>
      <div className="vignette" aria-hidden />
    </>
  )
}

export const Background = memo(BackgroundBase)
