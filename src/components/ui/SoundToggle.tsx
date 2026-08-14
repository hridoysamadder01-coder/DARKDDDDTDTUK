import { useSound } from '../../hooks/useSoundToggle'

/** SOUND ON / OFF toggle. Muted by default; only activates on user click. */
export default function SoundToggle() {
  const { enabled, toggle } = useSound()
  return (
    <button
      className="sound-toggle"
      data-on={enabled ? 'true' : 'false'}
      onClick={toggle}
      aria-pressed={enabled}
      title="Toggle sound"
    >
      <span className="bars" aria-hidden>
        <i />
        <i />
        <i />
        <i />
      </span>
      SOUND {enabled ? 'ON' : 'OFF'}
    </button>
  )
}
