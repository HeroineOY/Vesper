import { type ComponentProps, useId } from 'react'

import { cn } from '@/lib/utils'

interface FurinaThinkingCharmProps extends ComponentProps<'svg'> {}

/** A tiny Hydro stage familiar: a top hat, a water drop, and a theatrical sparkle. */
export function FurinaThinkingCharm({ className, ...props }: FurinaThinkingCharmProps) {
  const gradientId = `furina-charm-water-${useId().replaceAll(':', '')}`

  return (
    <svg
      aria-hidden="true"
      className={cn('furina-thinking-charm shrink-0 overflow-visible', className)}
      focusable="false"
      viewBox="0 0 32 32"
      {...props}
    >
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id={gradientId} x1="9" x2="23" y1="10" y2="25">
          <stop stopColor="#d9fbff" />
          <stop offset=".48" stopColor="#69dcff" />
          <stop offset="1" stopColor="#8c78ff" />
        </linearGradient>
      </defs>

      <ellipse className="furina-charm-ripple" cx="15.5" cy="27" fill="none" rx="8" ry="1.8" stroke="#72e8ff" />
      <circle className="furina-charm-waterlight" cx="16" cy="18" fill="none" r="9.1" />
      <g className="furina-charm-familiar">
        <path
          d="M16 9.5c-1.1 2.2-5.3 5.9-5.3 9.7a5.3 5.3 0 0 0 10.6 0c0-3.8-4.2-7.5-5.3-9.7Z"
          fill={`url(#${gradientId})`}
        />
        <path d="M10.1 10.1h11.8l-1-1.9H11.1l-1 1.9Z" fill="#0c1525" stroke="#96edff" strokeWidth=".8" />
        <path d="M12 8.2h8v2H12z" fill="#15233a" stroke="#b8f4ff" strokeWidth=".8" />
        <path d="M12.1 9.25h7.8" stroke="#a870ff" strokeWidth=".9" />
        <path
          d="M13.1 15.5c.5-1.5 1.3-2.5 2.8-3.6"
          fill="none"
          stroke="#a6f4ff"
          strokeLinecap="round"
          strokeWidth="1.3"
        />
        <circle cx="14" cy="20" fill="#16304d" r=".85" />
        <circle cx="18" cy="20" fill="#16304d" r=".85" />
      </g>
      <path
        className="furina-charm-sparkle"
        d="m25 7 .65 1.9L27.5 9.5l-1.85.6L25 12l-.6-1.9-1.9-.6 1.9-.6L25 7Z"
        fill="#62e5ff"
      />
    </svg>
  )
}
