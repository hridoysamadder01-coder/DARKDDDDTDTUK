import { useEffect, useState } from 'react'

interface Props {
  text: string
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'div'
  className?: string
  always?: boolean
  intensity?: number
  style?: React.CSSProperties
}

/** RGB-split glitch text — fired randomly, or held on for key moments. */
export default function GlitchText({
  text,
  as = 'span',
  className = '',
  always = false,
  intensity = 0.1,
  style,
}: Props) {
  const [on, setOn] = useState(always)
  const Tag = as
  const reduce =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (always || reduce) {
      setOn(always && !reduce)
      return
    }
    let timer: number
    const loop = () => {
      if (Math.random() < intensity) {
        setOn(true)
        window.setTimeout(() => setOn(false), 120 + Math.random() * 200)
      }
      timer = window.setTimeout(loop, 1400 + Math.random() * 3200)
    }
    timer = window.setTimeout(loop, 1400)
    return () => window.clearTimeout(timer)
  }, [always, intensity, reduce])

  return (
    <Tag className={`glitch ${className}`} data-text={text} data-on={on ? 'true' : 'false'} style={style}>
      {text}
    </Tag>
  )
}
