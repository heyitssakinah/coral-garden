import { useRef, useState, useEffect, useCallback } from 'react'
import { Eraser, Undo2, Trash2, Send } from 'lucide-react'

const CORAL_COLORS = [
  '#FF6B6B', '#FF8E8E', '#FFB3B3',
  '#FF7F50', '#FFA07A', '#E8735A',
  '#C75B9B', '#D4A5D8', '#9B59B6',
  '#4FD1C5', '#48BB78', '#A8E6CF',
  '#F6E05E', '#FBBF24', '#FFFFFF',
]

export default function DrawingStudio({ onSubmit }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState(CORAL_COLORS[0])
  const [brushSize, setBrushSize] = useState(6)
  const [isErasing, setIsErasing] = useState(false)
  const [history, setHistory] = useState([])
  const [authorName, setAuthorName] = useState('')
  const [status, setStatus] = useState({ type: '', msg: '' })
  const [submitting, setSubmitting] = useState(false)

  // Initialize canvas with transparent background
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    saveHistory()
  }, [])

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current
    setHistory(prev => [...prev.slice(-20), canvas.toDataURL()])
  }, [])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDraw = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = brushSize
    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.strokeStyle = 'rgba(0,0,0,1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
    }
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const stopDraw = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveHistory()
    }
  }

  const undo = () => {
    if (history.length < 2) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const prev = history[history.length - 2]
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
      ctx.drawImage(img, 0, 0)
    }
    img.src = prev
    setHistory(h => h.slice(0, -1))
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    saveHistory()
  }

  const isCanvasEmpty = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    return !data.some((val, i) => i % 4 === 3 && val > 0)
  }

  const handleSubmit = async () => {
    if (isCanvasEmpty()) {
      setStatus({ type: 'error', msg: 'Draw something first!' })
      return
    }
    setSubmitting(true)
    setStatus({ type: '', msg: '' })
    try {
      const imageData = canvasRef.current.toDataURL('image/png')
      await onSubmit(imageData, authorName)
      setStatus({ type: 'success', msg: 'Coral planted in the reef!' })
      clearCanvas()
      setAuthorName('')
    } catch (err) {
      setStatus({ type: 'error', msg: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const cursorClass = isErasing ? 'canvas-erase' : 'canvas-draw'

  return (
    <section className="bg-ocean-800/60 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-12 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-4 text-sand-100">Draw Your Coral</h2>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* Brush size */}
        <div className="flex items-center gap-2">
          <label htmlFor="brush-size" className="text-sm text-sand-200">Brush</label>
          <input
            id="brush-size"
            type="range"
            min="2"
            max="24"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="w-20 accent-coral-400"
          />
        </div>

        {/* Color palette */}
        <div className="flex flex-wrap gap-1.5">
          {CORAL_COLORS.map(c => (
            <button
              key={c}
              onClick={() => { setColor(c); setIsErasing(false) }}
              className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                color === c && !isErasing ? 'border-white scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
              title={c}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>

        {/* Tool buttons */}
        <div className="flex gap-1.5 ml-auto">
          <button
            onClick={() => setIsErasing(!isErasing)}
            className={`p-2 rounded-lg transition-colors ${
              isErasing ? 'bg-coral-500 text-white' : 'bg-white/10 text-sand-200 hover:bg-white/20'
            }`}
            title="Eraser"
          >
            <Eraser size={18} />
          </button>
          <button
            onClick={undo}
            className="p-2 rounded-lg bg-white/10 text-sand-200 hover:bg-white/20 transition-colors"
            title="Undo"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg bg-white/10 text-sand-200 hover:bg-white/20 transition-colors"
            title="Clear"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-white/10 mb-4">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #0a1628 0%, #112a4a 60%, #1a3a5c 100%)',
          }}
        />
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className={`relative block w-full aspect-square ${cursorClass}`}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>

      {/* Submit row */}
      <div className="flex gap-3">
        <input
          type="text"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          placeholder="Your name (optional)"
          maxLength={30}
          autoComplete="off"
          className="flex-1 px-4 py-2.5 rounded-xl bg-ocean-900/80 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-teal-400/50 transition-colors"
        />
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-coral-500 hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
        >
          <Send size={16} />
          {submitting ? 'Planting...' : 'Plant Coral'}
        </button>
      </div>

      {/* Status message */}
      {status.msg && (
        <p className={`mt-3 text-sm text-center font-medium ${
          status.type === 'error' ? 'text-red-400' : 'text-seafoam'
        }`} role="alert">
          {status.msg}
        </p>
      )}
    </section>
  )
}
