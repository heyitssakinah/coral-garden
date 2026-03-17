import { useState, useEffect, useCallback } from 'react'
import Bubbles from './components/Bubbles'
import DrawingStudio from './components/DrawingStudio'
import CoralReef from './components/CoralReef'

export default function App() {
  const [corals, setCorals] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchCorals = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/corals?page=${pageNum}&limit=20`)
      const data = await res.json()
      setCorals(prev => append ? [...prev, ...data.corals] : data.corals)
      setTotal(data.total)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch {
      // silently fail, user can retry
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCorals() }, [fetchCorals])

  const handleSubmit = async (imageData, authorName) => {
    const res = await fetch('/api/corals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_data: imageData, author_name: authorName }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to submit')
    }
    const newCoral = await res.json()
    setCorals(prev => [newCoral, ...prev])
    setTotal(prev => prev + 1)
    return newCoral
  }

  const loadMore = () => {
    if (page < totalPages) fetchCorals(page + 1, true)
  }

  return (
    <div className="relative min-h-screen text-white">
      <Bubbles />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2">
            <span className="text-coral-400">Coral</span>{' '}
            <span className="text-teal-400">Garden</span>
          </h1>
          <p className="text-lg font-medium" style={{ color: '#8ab4d6' }}>
            Draw a coral. Plant it in the reef.
          </p>
        </header>

        <DrawingStudio onSubmit={handleSubmit} />

        <CoralReef
          corals={corals}
          total={total}
          loading={loading}
          hasMore={page < totalPages}
          onLoadMore={loadMore}
        />
      </div>

      <footer className="relative z-10 text-center py-6 text-sm" style={{ color: '#5a7a96' }}>
        Coral Garden &mdash; a collaborative reef, one drawing at a time.
      </footer>
    </div>
  )
}
