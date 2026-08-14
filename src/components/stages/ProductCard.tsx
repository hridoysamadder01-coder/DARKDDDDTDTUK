import { motion } from 'framer-motion'
import type { Engine, EngineStatus } from '../../types'
import { config } from '../../config'
import { ArrowRight } from '../ui/Icons'

export function statusBadge(s: EngineStatus): { label: string; cls: string } {
  const head = s.split('//')[0].trim()
  const map: Record<string, { label: string; cls: string }> = {
    AVAILABLE: { label: 'Available', cls: 'success' },
    VERIFIED: { label: 'Verified', cls: 'accent' },
    UNIVERSAL: { label: 'Universal', cls: 'success' },
    PRIVATE: { label: 'Private', cls: 'accent' },
    RESTRICTED: { label: 'Restricted', cls: 'warning' },
  }
  return map[head] ?? { label: head, cls: '' }
}

export function monogram(name: string): string {
  const title = name.split('//')[0].trim()
  const words = title.split(/\s+/)
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? words[0]?.[1] ?? '')).toUpperCase()
}

interface Props {
  engine: Engine
  onOpen: (e: Engine) => void
}

export default function ProductCard({ engine, onOpen }: Props) {
  const title = engine.name.split('//')[0].trim()
  const variant = engine.name.split('//')[1]?.trim() ?? engine.buildClass
  const st = statusBadge(engine.status)
  const featured = !!engine.isTarget

  return (
    <motion.button
      className={`product ${featured ? 'featured' : ''}`}
      onClick={() => onOpen(engine)}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
      aria-label={`${engine.name} — $${engine.price} — view details`}
    >
      <div className="p-top">
        <span className={`p-icon ${featured ? 'accent' : ''}`}>{monogram(engine.name)}</span>
        <div>
          <div className="p-name">{title}</div>
          <div className="p-plat">{variant}</div>
        </div>
      </div>

      <div className="p-tags">
        <span className="badge">{engine.platform}</span>
        <span className={`badge ${st.cls}`}>{st.label}</span>
      </div>

      <div className="p-desc">{engine.summary}</div>

      <div className="p-foot">
        <span className="p-price">
          ${engine.price}
          <em>{config.currency}</em>
        </span>
        <span className="p-view">
          View <ArrowRight style={{ width: 14, height: 14 }} />
        </span>
      </div>
    </motion.button>
  )
}
