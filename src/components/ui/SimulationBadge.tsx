import { config } from '../../config'

/**
 * The persistent, always-visible safety label required by the brief.
 * Rendered above every stage; never permanently hidden.
 */
export default function SimulationBadge() {
  return (
    <div className="sim-badge" role="status" aria-label={config.simulationLabel}>
      <span className="dot" />
      {config.simulationLabel}
    </div>
  )
}
