import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { sound } from '../audio/sound'
import { SoundContext } from '../hooks/useSoundToggle'
import type { SoundName } from '../audio/soundTypes'

/**
 * Provides sound state. Audio starts OFF and is only ever created after a
 * user gesture (the toggle click), so nothing autoplays.
 */
export default function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      sound.setEnabled(next)
      if (next) sound.play('beep')
      return next
    })
  }, [])

  const play = useCallback((name: SoundName) => {
    sound.play(name)
  }, [])

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play])

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}
