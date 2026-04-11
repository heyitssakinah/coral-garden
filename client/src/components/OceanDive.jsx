import { useMemo } from 'react'

const BUBBLE_COLORS = [
  '#abbad8', '#93b5d6', '#7b9cc2', '#b8ccdf',
  '#a3c4de', '#6e9abf', '#d4ddef',
]

// Deterministic pseudo-random from seed (same as App.jsx)
function seededRandom(seed) {
  let s = Math.abs(seed) | 0
  s = ((s >> 16) ^ s) * 45989 | 0
  s = ((s >> 16) ^ s) * 45989 | 0
  s = ((s >> 16) ^ s) | 0
  s = (Math.abs(s) % 2147483646) + 1
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function OceanDive({ scrollY, progress, lookAngle = 0 }) {
  const bubbles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => {
      const rand = seededRandom((i + 1) * 3571)
      return {
        id: i,
        size: 6 + rand() * 24,
        left: rand() * 100,
        duration: 6 + rand() * 10,
        delay: rand() * 8,
        opacity: 0.1 + rand() * 0.25,
        color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
      }
    }),
  [])

  // Particles that drift in the Z-tunnel for depth feel
  const driftParticles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => {
      const rand = seededRandom((i + 1) * 7919)
      return {
        id: i,
        x: rand() * 100,
        y: rand() * 100,
        size: 2 + rand() * 4,
        speed: 0.5 + rand() * 2,
        opacity: 0.05 + rand() * 0.15,
      }
    }),
  [])

  // Light rays fade as you go deeper
  const rayOpacity = Math.max(0, 0.08 - progress * 0.08)

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-5" aria-hidden="true">
      {/* Light rays from the surface */}
      <div
        className="absolute inset-0"
        style={{
          opacity: rayOpacity,
          background: `
            repeating-conic-gradient(
              from 200deg at 50% -20%,
              rgba(255,255,255,0.03) 0deg,
              transparent 8deg,
              transparent 20deg
            )
          `,
        }}
      />

      {/* Floating bubbles */}
      {bubbles.map(b => (
        <div
          key={b.id}
          className="ocean-bubble absolute rounded-full"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            bottom: -30,
            backgroundColor: b.color,
            '--bubble-opacity': Math.min(0.4, b.opacity + progress * 0.15),
            opacity: Math.min(0.4, b.opacity + progress * 0.15),
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      {/* Drifting depth particles — move with scroll to enhance Z-motion feel */}
      {driftParticles.map(p => {
        // Particles drift upward relative to scroll, creating a parallax "passing through" effect
        const yOffset = (scrollY * p.speed * 0.05) % 120
        // Horizontal parallax: particles shift opposite to look direction
        const xShift = -(lookAngle / 45) * p.speed * 3
        return (
          <div
            key={`dp-${p.id}`}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x + xShift}%`,
              top: `${((p.y - yOffset) % 120 + 120) % 120 - 10}%`,
              backgroundColor: '#abbad8',
              opacity: Math.min(0.25, p.opacity + progress * 0.15),
              transition: 'top 0.1s linear, left 0.15s ease-out',
            }}
          />
        )
      })}

      {/* Vignette that intensifies with depth — shifts with look direction */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at ${50 + (lookAngle / 45) * 8}% 50%, transparent 40%, rgba(10,20,40,${progress * 0.5}) 100%)`,
          transition: 'background 0.15s ease-out',
        }}
      />
    </div>
  )
}
