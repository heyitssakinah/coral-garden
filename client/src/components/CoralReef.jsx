import { useMemo } from 'react'
import { Waves, ChevronDown, Loader2 } from 'lucide-react'

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function CoralReef({ corals, total, loading, hasMore, onLoadMore }) {
  // Generate stable random positions based on coral id
  const positions = useMemo(() => {
    return corals.map(coral => {
      const rand = seededRandom(coral.id * 7919)
      return {
        id: coral.id,
        left: 2 + rand() * 82,           // 2-84% from left (keep away from edges)
        bottom: 4 + rand() * 20,          // 4-24% from bottom (clustered on the floor)
        scale: 0.6 + rand() * 0.5,        // 0.6 - 1.1 scale
        zIndex: Math.floor(rand() * 30),
        rotate: -8 + rand() * 16,         // slight tilt -8 to +8 degrees
      }
    })
  }, [corals])

  // Height scales with number of corals
  const floorHeight = Math.max(500, 300 + corals.length * 12)

  return (
    <section>
      <div className="flex items-center justify-center gap-3 mb-6">
        <Waves size={24} className="text-teal-400" />
        <h2 className="text-3xl font-bold text-sand-100">The Reef</h2>
        <Waves size={24} className="text-teal-400" />
      </div>

      {total > 0 && (
        <p className="text-center text-sm mb-6" style={{ color: '#6a9ab8' }}>
          {total} coral{total !== 1 ? 's' : ''} planted
        </p>
      )}

      {corals.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-lg" style={{ color: '#5a7a96' }}>
            No corals yet. Be the first to plant one!
          </p>
        </div>
      )}

      {/* Ocean Floor Scene */}
      {corals.length > 0 && (
        <div
          className="relative w-full rounded-2xl overflow-hidden border border-white/10"
          style={{
            height: floorHeight,
            background: 'linear-gradient(180deg, #0a1628 0%, #0d1f3c 30%, #112a4a 60%, #1a3a5c 85%, #1e4d7a 100%)',
          }}
        >
          {/* Sandy floor */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: '12%',
              background: 'linear-gradient(180deg, #2d4a3e 0%, #3b5c4a 40%, #4a6b55 100%)',
              borderTop: '2px solid rgba(168, 230, 207, 0.15)',
            }}
          />

          {/* Scattered corals */}
          {positions.map((pos, i) => {
            const coral = corals[i]
            if (!coral) return null
            return (
              <div
                key={coral.id}
                className="absolute animate-fade-in-up group"
                style={{
                  left: `${pos.left}%`,
                  bottom: `${pos.bottom}%`,
                  zIndex: pos.zIndex,
                  transform: `scale(${pos.scale}) rotate(${pos.rotate}deg)`,
                  animationDelay: `${(i % 20) * 60}ms`,
                  width: 100,
                }}
              >
                <img
                  src={coral.image_data}
                  alt={`Coral by ${coral.author_name}`}
                  className="w-full h-auto drop-shadow-lg transition-transform duration-200 group-hover:scale-110"
                  loading="lazy"
                  draggable={false}
                />
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-ocean-900/90 backdrop-blur-sm text-xs text-sand-100 px-2 py-1 rounded-lg whitespace-nowrap border border-white/10">
                    {coral.author_name}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 size={28} className="animate-spin text-teal-400" />
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sand-200 font-medium transition-colors"
          >
            <ChevronDown size={18} />
            Load More
          </button>
        </div>
      )}
    </section>
  )
}
