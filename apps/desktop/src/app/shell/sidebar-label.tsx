import type * as React from 'react'

import { VesperOrbitIndicator } from '@/components/vesper-orbit-indicator'
import { cn } from '@/lib/utils'

interface SidebarPanelLabelProps extends React.ComponentProps<'span'> {
  marker?: 'orbit' | 'rail'
}

export function SidebarPanelLabel({ children, className, marker = 'rail', ...props }: SidebarPanelLabelProps) {
  return (
    <span
      className={cn(
        'flex min-w-0 items-center gap-2 pl-2 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-(--theme-primary)',
        className
      )}
      {...props}
    >
      {marker === 'orbit' ? (
        <VesperOrbitIndicator className="size-3.5 shrink-0" />
      ) : (
        <span
          aria-hidden="true"
          className="h-3 w-px shrink-0 rounded-full bg-linear-to-b from-(--ui-cyan) via-(--theme-primary) to-(--ui-purple) opacity-90 shadow-[0_0_0.375rem_color-mix(in_srgb,var(--ui-cyan)_35%,transparent)]"
        />
      )}
      <span className="min-w-0 truncate leading-none">{children}</span>
    </span>
  )
}
