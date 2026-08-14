import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface Props {
  text: string
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'div' | 'p'
  className?: string
  /** keep glitching continuously */
  always?: boolean
  /** random flicker probability per interval when not `always` */
  intensity?: number
  style?: React.CSSProperties
}

/** Text with a chromatic RGB-split glitch, fired randomly or continuously. */
export default function GlitchText({
  text,
  as = 'span',
  className = '',
  always = false,
  intensity = 0.12,
  style,
}: Props) {
  const [glitching, setGlitching] = useState(always)
  const reduced = useReducedMotion()
  const Tag = as

  useEffect(() => {
    if (always || reduced) {
      setGlitching(always && !reduced)
      return
    }
    let timer: number
    const loop = () => {
      if (Math.random() < intensity) {
        setGlitching(true)
        window.setTimeout(() => setGlitching(false), 120 + Math.random() * 220)
      }
      timer = window.setTimeout(loop, 900 + Math.random() * 2600)
    }
    timer = window.setTimeout(loop, 1200)
    return () => window.clearTimeout(timer)
  }, [always, intensity, reduced])

  return (
    <Tag
      className={`glitch ${className}`}
      data-text={text}
      data-glitching={glitching ? 'true' : 'false'}
      style={style}
    >
      {text}
    </Tag>
  )
}
