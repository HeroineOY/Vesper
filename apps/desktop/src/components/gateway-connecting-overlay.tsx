import { useStore } from '@nanostores/react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { $desktopBoot } from '@/store/boot'
import { $gatewayState } from '@/store/session'

// Static, always-legible prefix; only TAIL ever scrambles. Splitting them at
// the render level means no timer logic (even a stale HMR one) can ever
// scramble "CONN".
const PREFIX = 'CONN'
const TAIL = 'ECTING'
// Even-weight mono ascii so cycling glyphs don't jump width (matches the
// nousnet-web download-button decode effect).
const SCRAMBLE_CHARS = '/\\|-_=+<>~:*'
const TICK_MS = 45

// Exit choreography (ms): text fades down + out, hold, then the overlay fades.
const TEXT_OUT_MS = 360
const POST_TEXT_HOLD_MS = 300
const OVERLAY_OUT_MS = 520
// Preview-only: how long to "connect" for, and the pause before replaying.
const PREVIEW_CONNECT_MS = 2600
const PREVIEW_REPLAY_MS = 1100

type Phase = 'live' | 'text-out' | 'overlay-out' | 'gone'

function VesperBlackHoleLoader() {
  return (
    <svg
      aria-label="Vesper black hole connecting"
      className="size-[7.5rem] overflow-visible"
      role="img"
      viewBox="0 0 160 160"
    >
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="vesper-black-hole-flow" x1="19" x2="141" y1="116" y2="39">
          <stop stopColor="#7767ff" />
          <stop offset=".27" stopColor="#54dcff" />
          <stop offset=".5" stopColor="#ffffff" />
          <stop offset=".72" stopColor="#a05fff" />
          <stop offset="1" stopColor="#eb5b9b" />
        </linearGradient>
        <filter id="vesper-black-hole-glow">
          <feGaussianBlur result="blur" stdDeviation="1.5" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform="rotate(-28 80 80)">
        <ellipse
          className="vbh-glow"
          cx="80"
          cy="80"
          fill="none"
          rx="57"
          ry="19"
          stroke="url(#vesper-black-hole-flow)"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <ellipse
          className="vbh-breathe"
          cx="80"
          cy="80"
          fill="none"
          filter="url(#vesper-black-hole-glow)"
          rx="57"
          ry="19"
          stroke="url(#vesper-black-hole-flow)"
          strokeLinecap="round"
          strokeWidth="5.5"
        />
        <ellipse
          className="vbh-disk-flow"
          cx="80"
          cy="80"
          fill="none"
          rx="57"
          ry="19"
          stroke="#f8feff"
          strokeLinecap="round"
          strokeWidth="3.4"
        />
      </g>

      <circle cx="80" cy="80" fill="#000104" filter="drop-shadow(0 0 9px #000)" r="25" stroke="rgba(229,249,255,.12)" />

      <circle
        className="vbh-glow"
        cx="80"
        cy="80"
        fill="none"
        r="30"
        stroke="url(#vesper-black-hole-flow)"
        strokeLinecap="round"
        strokeWidth="7"
      />
      <circle
        cx="80"
        cy="80"
        fill="none"
        filter="url(#vesper-black-hole-glow)"
        r="30"
        stroke="url(#vesper-black-hole-flow)"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <circle
        className="vbh-horizon-flow"
        cx="80"
        cy="80"
        fill="none"
        r="30"
        stroke="#f8feff"
        strokeLinecap="round"
        strokeWidth="3"
      />

      <g transform="rotate(-28 80 80)">
        <path
          className="vbh-glow"
          d="M23 80 C43 103 117 103 137 80"
          fill="none"
          stroke="url(#vesper-black-hole-flow)"
          strokeLinecap="round"
          strokeWidth="8"
        />
        <path
          className="vbh-breathe"
          d="M23 80 C43 103 117 103 137 80"
          fill="none"
          filter="url(#vesper-black-hole-glow)"
          stroke="url(#vesper-black-hole-flow)"
          strokeLinecap="round"
          strokeWidth="5.5"
        />
        <path
          d="M24 80 C44 102 116 102 136 80"
          fill="none"
          opacity=".27"
          stroke="#f8feff"
          strokeLinecap="round"
          strokeWidth="1"
        />
      </g>
    </svg>
  )
}

// Dev affordance: a warm Cmd+R reconnects almost instantly, so the overlay
// only flashes. Load with `?connecting=1` to force a looping preview.
function forcedPreview(): boolean {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return false
  }

  try {
    return new URLSearchParams(window.location.search).get('connecting') === '1'
  } catch {
    return false
  }
}

function scrambledTail(resolvedCount: number): string {
  return Array.from(TAIL, (ch, i) =>
    i < resolvedCount ? ch : SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0]
  ).join('')
}

export function GatewayConnectingOverlay() {
  const gatewayState = useStore($gatewayState)
  const boot = useStore($desktopBoot)
  const [previewing] = useState(forcedPreview)
  const [tail, setTail] = useState(TAIL)
  const [phase, setPhase] = useState<Phase>('live')

  // The full-screen connecting overlay is for initial boot only. After a
  // healthy boot, flaky networks / sleep-wake can drop the socket and flip the
  // gateway state back to closed/error while the app reconnects. Do not cover
  // the chat then — users should still be able to type drafts, open settings,
  // and recover instead of staring at a modal CONNECTING screen.
  const initialBootActive = boot.visible || boot.running || boot.progress < 100
  const connecting = gatewayState !== 'open' && !boot.error && initialBootActive
  // Latches once we've actually shown the overlay, so the brief frame where
  // gatewayState flips to "open" (connecting -> false) before the exit phase
  // kicks in doesn't unmount us and cause a flash.
  const shownRef = useRef(false)

  if (previewing || connecting) {
    shownRef.current = true
  }

  // Decode loop — only while live (freeze the resolved word during the exit).
  useEffect(() => {
    if (phase !== 'live' || (!previewing && !connecting)) {
      return
    }

    let resolved = 0
    let hold = 0

    const id = window.setInterval(() => {
      if (resolved >= TAIL.length) {
        hold += 1

        if (hold > 16) {
          resolved = 0
          hold = 0
        }

        setTail(TAIL)

        return
      }

      resolved += 0.5
      setTail(scrambledTail(Math.floor(resolved)))
    }, TICK_MS)

    return () => window.clearInterval(id)
  }, [phase, previewing, connecting])

  // Kick off the exit when connected: real connect, or a faked timer in preview.
  useEffect(() => {
    if (phase !== 'live') {
      return
    }

    if (previewing) {
      const id = window.setTimeout(() => {
        setTail(TAIL)
        setPhase('text-out')
      }, PREVIEW_CONNECT_MS)

      return () => window.clearTimeout(id)
    }

    if (gatewayState === 'open' && shownRef.current) {
      setTail(TAIL)
      setPhase('text-out')
    }
  }, [phase, previewing, gatewayState])

  // Advance the exit choreography: text-out -> overlay-out -> gone.
  useEffect(() => {
    if (phase === 'text-out') {
      const id = window.setTimeout(() => setPhase('overlay-out'), TEXT_OUT_MS + POST_TEXT_HOLD_MS)

      return () => window.clearTimeout(id)
    }

    if (phase === 'overlay-out') {
      const id = window.setTimeout(() => setPhase('gone'), OVERLAY_OUT_MS)

      return () => window.clearTimeout(id)
    }

    // Preview replays so we can keep watching the transition.
    if (phase === 'gone' && previewing) {
      const id = window.setTimeout(() => {
        setTail(TAIL)
        setPhase('live')
      }, PREVIEW_REPLAY_MS)

      return () => window.clearTimeout(id)
    }
  }, [phase, previewing])

  // Boot failed — BootFailureOverlay owns the screen; don't linger behind it.
  if (boot.error && !previewing) {
    return null
  }

  // Real connect: once the fade finishes, get out of the way for good.
  if (phase === 'gone' && !previewing) {
    return null
  }

  // Never showed (e.g. gateway already up on a warm reload) — stay out.
  if (!previewing && !connecting && !shownRef.current) {
    return null
  }

  const leaving = phase !== 'live'
  const overlayHidden = phase === 'overlay-out' || phase === 'gone'

  return (
    <div
      className={cn(
        'fixed inset-0 grid place-items-center bg-(--ui-chat-surface-background) transition-opacity duration-500 ease-out',
        previewing ? 'z-[1500]' : 'z-[1200]',
        overlayHidden ? 'pointer-events-none opacity-0' : 'opacity-100'
      )}
    >
      <style>{`
        @keyframes gco-cursor { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
        @keyframes vbh-horizon-flow { to { stroke-dashoffset: 191; } }
        @keyframes vbh-disk-flow { to { stroke-dashoffset: -260; } }
        @keyframes vbh-breathe { to { opacity: .78; filter: saturate(1.28) brightness(1.18); } }
        .vbh-glow { opacity: .34; filter: blur(4px); }
        .vbh-horizon-flow {
          stroke-dasharray: 21 170;
          filter: drop-shadow(0 0 5px #62ddff);
          animation: vbh-horizon-flow 2.25s linear infinite;
        }
        .vbh-disk-flow {
          stroke-dasharray: 30 230;
          filter: drop-shadow(0 0 5px #62ddff);
          animation: vbh-disk-flow 2.7s linear infinite;
        }
        .vbh-breathe { animation: vbh-breathe 1.8s ease-in-out infinite alternate; }
        @media (prefers-reduced-motion: reduce) {
          .vbh-horizon-flow, .vbh-disk-flow, .vbh-breathe { animation: none !important; }
        }
      `}</style>
      <div
        className={cn(
          'grid justify-items-center gap-7 transition duration-300 ease-out',
          leaving ? 'translate-y-2 opacity-0 saturate-0' : 'translate-y-0 opacity-100 saturate-100'
        )}
      >
        <VesperBlackHoleLoader />
        <span className="inline-flex items-center pl-[0.4em] font-mono text-[0.64rem] font-semibold uppercase tracking-[0.4em] tabular-nums text-(--theme-primary)">
          {PREFIX}
          {tail}
          <span
            aria-hidden="true"
            className="dither ml-0.5 inline-block size-2 shrink-0 -translate-y-px rounded-[1px]"
            style={{ animation: 'gco-cursor 1s step-end infinite' }}
          />
        </span>
      </div>
    </div>
  )
}
