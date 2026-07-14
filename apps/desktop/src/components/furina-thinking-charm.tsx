import { type ComponentProps, useId } from 'react'

import { cn } from '@/lib/utils'

interface FurinaThinkingCharmProps extends ComponentProps<'svg'> {}

/** A tiny Fontaine opera stage: Hydro curtains, Furina's crown, and a water mirror. */
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

      <ellipse className="furina-charm-ripple" cx="16" cy="26.5" fill="none" rx="9.2" ry="2.1" stroke="#72e8ff" />
      <circle className="furina-charm-waterlight" cx="16" cy="17.2" fill="none" r="9.4" />
      <g className="furina-charm-stage">
        <path
          className="furina-charm-curtain-left"
          d="M7.2 8.8c2 1.5 3.2 4.5 3.1 10.8-.1 2.4.8 3.6 2.1 4.7-3.4-.8-5.3-3.1-5.2-6.8.1-4.6.1-6.6-.8-8.7.1 0 .4 0 .8 0Z"
          fill={`url(#${gradientId})`}
        />
        <path
          className="furina-charm-curtain-right"
          d="M24.8 8.8c-2 1.5-3.2 4.5-3.1 10.8.1 2.4-.8 3.6-2.1 4.7 3.4-.8 5.3-3.1 5.2-6.8-.1-4.6-.1-6.6.8-8.7-.1 0-.4 0-.8 0Z"
          fill={`url(#${gradientId})`}
        />
        <path
          d="M10.4 9.2c3.5-2.8 7.7-2.8 11.2 0"
          fill="none"
          stroke="#baf7ff"
          strokeLinecap="round"
          strokeWidth="1.1"
        />
        <path
          d="m11.7 16.1 2.2-4.2 2.1 2.6 2.1-2.6 2.2 4.2-1.1 3.4h-6.4l-1.1-3.4Z"
          fill="#102a48"
          stroke="#85ecff"
          strokeLinejoin="round"
          strokeWidth=".9"
        />
        <path d="M13.2 17.3h5.6" stroke="#6ce5ff" strokeLinecap="round" strokeWidth="1.1" />
        <path d="M14.2 20.8c1.1-.7 2.5-.7 3.6 0" fill="none" stroke="#9af4ff" strokeLinecap="round" strokeWidth="1" />
      </g>
      <path
        className="furina-charm-sparkle"
        d="m25 7 .65 1.9L27.5 9.5l-1.85.6L25 12l-.6-1.9-1.9-.6 1.9-.6L25 7Z"
        fill="#62e5ff"
      />
    </svg>
  )
}
