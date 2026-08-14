import { config } from '../../config'
import { Logo, ArrowLeft, Lock } from '../ui/Icons'
import SoundToggle from '../ui/SoundToggle'

interface Props {
  onBack?: () => void
  showLinks?: boolean
  secure?: boolean
}

export default function TopBar({ onBack, showLinks = false, secure = false }: Props) {
  return (
    <div className="nav">
      <div className="container nav-inner">
        <div className="row" style={{ gap: 10 }}>
          {onBack && (
            <button className="btn ghost sm" onClick={onBack} aria-label="Back">
              <ArrowLeft style={{ width: 16, height: 16 }} />
              Back
            </button>
          )}
          <div className="brand">
            <span className="logo">
              <Logo style={{ color: '#fff' }} />
            </span>
            <span className="name">
              {config.brandName}
              <small>{config.brandTagline}</small>
            </span>
          </div>
        </div>

        {showLinks && (
          <nav className="nav-links" aria-label="Primary">
            <a href="#catalog" onClick={(e) => e.preventDefault()}>Catalog</a>
            <a href="#docs" onClick={(e) => e.preventDefault()}>Docs</a>
            <a href="#status" onClick={(e) => e.preventDefault()}>Status</a>
          </nav>
        )}

        <div className="nav-right">
          {secure && (
            <span className="badge success" title="Simulated secure session">
              <Lock style={{ width: 12, height: 12 }} />
              Secure
            </span>
          )}
          <SoundToggle />
          <span className="avatar" aria-hidden>CE</span>
        </div>
      </div>
    </div>
  )
}
