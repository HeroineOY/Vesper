import { useId } from 'react'

import { cn } from '@/lib/utils'

interface VesperOrbitIndicatorProps extends React.ComponentProps<'svg'> {
  animated?: boolean
}

/** Small, reusable version of the Vesper horizon mark used at loading time. */
export function VesperOrbitIndicator({ animated = false, className, ...props }: VesperOrbitIndicatorProps) {
  const gradientId = `vesper-orbit-gradient-${useId().replaceAll(':', '')}`
  const glowId = `vesper-orbit-glow-${useId().replaceAll(':', '')}`

  return (
    <svg
      aria-hidden="true"
      className={cn('vesper-orbit-indicator overflow-visible', className)}
      focusable="false"
      viewBox="0 0 160 160"
      {...props}
    >
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id={gradientId} x1="19" x2="141" y1="116" y2="39">
          <stop stopColor="#7767ff" />
          <stop offset=".27" stopColor="#54dcff" />
          <stop offset=".5" stopColor="#f8feff" />
          <stop offset=".72" stopColor="#a05fff" />
          <stop offset="1" stopColor="#eb5b9b" />
        </linearGradient>
        <filter id={glowId}>
          <feGaussianBlur result="blur" stdDeviation="1.5" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform="rotate(-28 80 80)">
        <ellipse
          cx="80"
          cy="80"
          fill="none"
          rx="57"
          ry="19"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeWidth="6"
        />
        <ellipse
          className={animated ? 'vesper-orbit-breathe' : undefined}
          cx="80"
          cy="80"
          fill="none"
          filter={`url(#${glowId})`}
          rx="57"
          ry="19"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeWidth="3.6"
        />
        {animated && (
          <ellipse
            className="vesper-orbit-disk-flow"
            cx="80"
            cy="80"
            fill="none"
            rx="57"
            ry="19"
            strokeLinecap="round"
            strokeWidth="2.5"
          />
        )}
      </g>
      <circle cx="80" cy="80" fill="#05070b" r="25" stroke="rgba(229,249,255,.12)" />
      <circle cx="80" cy="80" fill="none" r="30" stroke={`url(#${gradientId})`} strokeWidth="4" />
      {animated && (
        <circle
          className="vesper-orbit-horizon-flow"
          cx="80"
          cy="80"
          fill="none"
          r="30"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      )}
      <g transform="rotate(-28 80 80)">
        <path
          d="M23 80 C43 103 117 103 137 80"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeWidth="3.6"
        />
      </g>
    </svg>
  )
}
