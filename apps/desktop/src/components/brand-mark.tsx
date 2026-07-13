import { cn } from '@/lib/utils'

export function BrandMark({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'relative inline-flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-primary/55 bg-[#080a10] shadow-[0_0_1.25rem_color-mix(in_srgb,var(--dt-primary)_18%,transparent)]',
        className
      )}
      {...props}
    >
      <span aria-hidden="true" className="font-mono text-[0.48em] font-semibold text-primary">
        V
      </span>
      <span aria-hidden="true" className="absolute right-[16%] bottom-[16%] h-px w-[28%] bg-destructive/80" />
    </span>
  )
}
