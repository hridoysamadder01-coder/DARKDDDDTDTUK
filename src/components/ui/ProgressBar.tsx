interface Props {
  value: number // 0..100
  danger?: boolean
  className?: string
}

export default function ProgressBar({ value, danger = false, className = '' }: Props) {
  const v = Math.max(0, Math.min(100, value))
  return (
    <div
      className={`progress ${danger ? 'danger' : ''} ${className}`}
      role="progressbar"
      aria-valuenow={Math.round(v)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="fill" style={{ width: `${v}%` }} />
    </div>
  )
}
