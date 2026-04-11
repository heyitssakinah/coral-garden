import { useMemo } from 'react'
import { ArrowLeft } from 'lucide-react'

const BUBBLE_COLORS = [
  '#abbad8', '#93b5d6', '#7b9cc2', '#b8ccdf',
  '#a3c4de', '#6e9abf', '#d4ddef',
]

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

export default function CoralGallery({ corals, onBack }) {
  const bubbles = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => {
      const rand = seededRandom((i + 1) * 3571)
      return {
        id: i,
        size: 6 + rand() * 24,
        left: rand() * 100,
        duration: 6 + rand() * 10,
        delay: rand() * 8,
        opacity: 0.1 + rand() * 0.2,
        color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
      }
    }),
  [])

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: '#e8eef6' }}
    >
      {/* Bubbles background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
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
              '--bubble-opacity': b.opacity,
              opacity: b.opacity,
              animationDuration: `${b.duration}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-sm" style={{ backgroundColor: 'rgba(232, 238, 246, 0.85)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ color: '#325483', backgroundColor: 'rgba(50, 84, 131, 0.1)' }}
          >
            <ArrowLeft size={16} />
            Back to Reef
          </button>
          <h1 className="text-xl font-bold" style={{ color: '#325483' }}>
            All Corals
          </h1>
          <span className="text-sm" style={{ color: '#7b9cc2' }}>
            {corals.length} coral{corals.length !== 1 ? 's' : ''}
          </span>
        </div>
      </header>

      {/* Coral grid */}
      <main className="relative z-[1] max-w-6xl mx-auto px-6 py-8">
        {corals.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg" style={{ color: '#7b9cc2' }}>
              No corals in the reef yet. Be the first to draw one!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {corals.map(coral => (
              <div
                key={coral.id}
                className="coral-gallery-card flex flex-col items-center p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
              >
                <img
                  src={coral.image_data}
                  alt={`Coral by ${coral.author_name}`}
                  className="w-full h-auto"
                  draggable={false}
                />
                <p
                  className="mt-2 text-sm font-medium text-center"
                  style={{ color: '#ac245b' }}
                >
                  {coral.author_name}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
