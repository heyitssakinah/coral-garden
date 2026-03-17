import { useMemo } from 'react'

export default function Bubbles() {
  const bubbles = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: 8 + Math.random() * 30,
      left: Math.random() * 100,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
    })),
  [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {bubbles.map(b => (
        <div
          key={b.id}
          className="bubble"
          style={{
            width: b.size,
            height: b.size,
            left: `${b.left}%`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
