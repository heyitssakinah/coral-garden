import { useMemo } from 'react'

const BUBBLE_COLORS = [
  '#abbad8', '#93b5d6', '#7b9cc2', '#b8ccdf',
  '#a3c4de', '#6e9abf', '#d4ddef',
]

export default function OceanDive({ scrollY, progress }) {
  const bubbles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: 6 + Math.random() * 24,
      left: Math.random() * 100,
      duration: 6 + Math.random() * 10,
      delay: Math.random() * 8,
      opacity: 0.1 + Math.random() * 0.25,
      color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
    })),
  [])

  // Particles that drift in the Z-tunnel for depth feel
  const driftParticles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      speed: 0.5 + Math.random() * 2,
      opacity: 0.05 + Math.random() * 0.15,
    })),
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
        return (
          <div
            key={`dp-${p.id}`}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${((p.y - yOffset) % 120 + 120) % 120 - 10}%`,
              backgroundColor: '#abbad8',
              opacity: Math.min(0.25, p.opacity + progress * 0.15),
              transition: 'top 0.1s linear',
            }}
          />
        )
      })}

      {/* Vignette that intensifies with depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(10,20,40,${progress * 0.5}) 100%)`,
        }}
      />
    </div>
  )
}
