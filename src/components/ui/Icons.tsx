/** Inline SVG icons (stroke = currentColor). Lightweight, no dependency. */
type P = { className?: string; style?: React.CSSProperties }

const base = (className?: string, style?: React.CSSProperties) => ({
  className,
  style,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

export const Logo = ({ className, style }: P) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="none">
    <path
      d="M12 2 3 7v10l9 5 9-5V7l-9-5Z"
      fill="rgba(255,255,255,0.16)"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <path d="M12 7 7 9.7v4.6L12 17l5-2.7V9.7L12 7Z" fill="currentColor" />
  </svg>
)

export const Check = ({ className, style }: P) => (
  <svg {...base(className, style)}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

export const CheckCircle = ({ className, style }: P) => (
  <svg {...base(className, style)}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m22 4-10 10.01L9 11" />
  </svg>
)

export const ArrowRight = ({ className, style }: P) => (
  <svg {...base(className, style)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const ArrowLeft = ({ className, style }: P) => (
  <svg {...base(className, style)}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
)

export const Close = ({ className, style }: P) => (
  <svg {...base(className, style)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

export const Copy = ({ className, style }: P) => (
  <svg {...base(className, style)}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

export const Shield = ({ className, style }: P) => (
  <svg {...base(className, style)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
  </svg>
)

export const Bolt = ({ className, style }: P) => (
  <svg {...base(className, style)}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
  </svg>
)

export const Devices = ({ className, style }: P) => (
  <svg {...base(className, style)}>
    <rect x="3" y="4" width="14" height="12" rx="2" />
    <path d="M17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-3M7 20h6" />
  </svg>
)

export const Sparkle = ({ className, style }: P) => (
  <svg {...base(className, style)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" />
  </svg>
)

export const Lock = ({ className, style }: P) => (
  <svg {...base(className, style)}>
    <rect x="4" y="10" width="16" height="10" rx="2" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </svg>
)

export const Cube = ({ className, style }: P) => (
  <svg {...base(className, style)}>
    <path d="M12 2 3 7v10l9 5 9-5V7l-9-5ZM3 7l9 5 9-5M12 12v10" />
  </svg>
)
