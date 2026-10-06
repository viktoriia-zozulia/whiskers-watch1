// Brand mark: a paw print on a rounded tile. Inherits colour via `currentColor`.
export function LogoMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={`shrink-0 ${className}`} aria-hidden>
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <g fill="#fff">
        <ellipse cx="9.4" cy="13.2" rx="2.3" ry="2.9" transform="rotate(-18 9.4 13.2)" />
        <ellipse cx="13.6" cy="8.9" rx="2.3" ry="3" transform="rotate(-6 13.6 8.9)" />
        <ellipse cx="18.4" cy="8.9" rx="2.3" ry="3" transform="rotate(6 18.4 8.9)" />
        <ellipse cx="22.6" cy="13.2" rx="2.3" ry="2.9" transform="rotate(18 22.6 13.2)" />
        <path d="M16 14.6c-3.5 0-6.8 4.4-6.8 7.2 0 2 1.5 3 3.5 3 1.4 0 2.2-.6 3.3-.6s1.9.6 3.3.6c2 0 3.5-1 3.5-3 0-2.8-3.3-7.2-6.8-7.2z" />
      </g>
    </svg>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 font-semibold tracking-tight ${className}`}>
      <LogoMark className="text-teal-600" />
      WhiskersWatch
    </span>
  )
}
