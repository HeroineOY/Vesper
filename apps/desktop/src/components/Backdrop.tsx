import { Leva, useControls } from 'leva'
import { type CSSProperties, useEffect, useState } from 'react'

const BLEND_MODES = [
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity'
] as const

type BlendMode = (typeof BLEND_MODES)[number]
const assetPath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

export function Backdrop() {
  const [controlsOpen, setControlsOpen] = useState(false)

  useEffect(() => {
    if (!import.meta.env.DEV) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null

      const editing =
        target?.isContentEditable ||
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement

      if (editing || event.repeat || event.altKey || event.ctrlKey || event.metaKey) {
        return
      }

      if (event.shiftKey && event.code === 'KeyY') {
        setControlsOpen(open => !open)
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const shape = useControls(
    'UI / Shape',
    { radiusScalar: { value: 0.2, min: 0, max: 2, step: 0.1, label: 'radius scalar' } },
    { collapsed: true }
  )

  useEffect(() => {
    document.documentElement.style.setProperty('--radius-scalar', String(shape.radiusScalar))
  }, [shape.radiusScalar])

  const scene = useControls(
    'Backdrop / Furina',
    {
      enabled: { value: true, label: 'on' },
      opacity: { value: 0.58, min: 0, max: 1, step: 0.01 },
      blendMode: { value: 'normal' as BlendMode, options: BLEND_MODES, label: 'blend' },
      invert: { value: false, label: 'invert color' },
      saturate: { value: 0.82, min: 0, max: 3, step: 0.05, label: 'saturate' },
      brightness: { value: 0.7, min: 0, max: 2, step: 0.05, label: 'brightness' },
      scrim: { value: 0.46, min: 0, max: 0.9, step: 0.01, label: 'reading scrim' },
      objectPosition: {
        value: 'center',
        options: ['top left', 'top right', 'bottom left', 'bottom right', 'center', 'top', 'bottom', 'left', 'right'],
        label: 'position'
      },
      zoom: { value: 100, min: 100, max: 180, step: 5, label: 'zoom (%)' }
    },
    { collapsed: true }
  )

  return (
    <>
      <Leva collapsed hidden={!import.meta.env.DEV || !controlsOpen} titleBar={{ title: 'backdrop', drag: true }} />

      {scene.enabled && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <img
            alt=""
            className="absolute inset-0 size-full object-cover"
            fetchPriority="low"
            src={assetPath('ds-assets/furina-bg.webp')}
            style={{
              filter: `invert(calc(${scene.invert ? 1 : 0} * var(--backdrop-invert-mul, 1))) saturate(${scene.saturate}) brightness(${scene.brightness})`,
              mixBlendMode: scene.blendMode as CSSProperties['mixBlendMode'],
              objectPosition: scene.objectPosition,
              opacity: scene.opacity,
              transform: `scale(${scene.zoom / 100})`
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(90deg, rgba(5, 7, 12, ${scene.scrim * 0.86}) 0%, rgba(5, 7, 12, ${scene.scrim * 0.58}) 28%, rgba(5, 7, 12, ${scene.scrim * 0.36}) 65%, rgba(5, 7, 12, ${scene.scrim * 0.7}) 100%),
                linear-gradient(180deg, rgba(5, 7, 12, ${scene.scrim * 0.68}) 0%, transparent 30%, rgba(5, 7, 12, ${scene.scrim * 0.74}) 100%),
                radial-gradient(ellipse 72% 58% at 54% 46%, transparent 22%, rgba(5, 7, 12, ${scene.scrim * 0.26}) 100%)
              `
            }}
          />
        </div>
      )}
    </>
  )
}
