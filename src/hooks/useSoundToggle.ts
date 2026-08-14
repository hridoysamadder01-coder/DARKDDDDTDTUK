import { createContext, useContext } from 'react'
import type { SoundName } from '../audio/soundTypes'

export interface SoundContextValue {
  enabled: boolean
  toggle: () => void
  play: (name: SoundName) => void
}

export const SoundContext = createContext<SoundContextValue>({
  enabled: false,
  toggle: () => {},
  play: () => {},
})

export const useSound = (): SoundContextValue => useContext(SoundContext)
