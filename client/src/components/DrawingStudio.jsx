import { useRef, useState, useEffect, useCallback } from 'react'
import { Eraser, Undo2, Trash2, Send, Pencil, X } from 'lucide-react'

const PALETTE = [
  '#325483', '#ac245b', '#ed7149', '#ffce34',
  '#edc9be', '#abbad8', '#ffffff', '#1a1a2e',
]

export default function DrawingStudio({ onSubmit }) {
  const canvasRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState(PALETTE[1])
  const [brushSize, setBrushSize] = useState(6)
  const [isErasing, setIsErasing] = useState(false)
  const [history, setHistory] = useState([])
  const [authorName, setAuthorName] = useState('')
  const [status, setStatus] = useState({ type: '', msg: '' })
  const [submitting, setSubmitting] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Init canvas when panel first opens
  useEffect(() => {
    if (open && !initialized && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      saveHistory()
      setInitialized(true)
    }
  }, [open, initialized])

  const saveHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
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
    const ctx = canvasRef.current.getContext('2d')
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
      setStatus({ type: 'success', msg: 'Coral planted!' })
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
    <>
      {/* Floating trigger button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-8 right-10 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-coral text-white font-semibold shadow-lg hover:opacity-90 transition-opacity"
        >
          <Pencil size={18} />
          Draw a coral
        </button>
      )}

      {/* Floating panel */}
      {open && (
        <div className="fixed bottom-8 right-10 z-50 w-96 bg-white rounded-2xl border-2 border-mist/40 shadow-xl">
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="text-base font-semibold text-deep">Draw your coral</h2>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg hover:bg-light transition-colors text-mist"
            >
              <X size={16} />
            </button>
          </div>

          <div className="px-5 pb-5">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="flex items-center gap-2">
                <label htmlFor="brush-size" className="text-xs text-mist">Size</label>
                <input
                  id="brush-size"
                  type="range"
                  min="2"
                  max="24"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-16 accent-deep"
                />
              </div>

              <div className="flex gap-1.5">
                {PALETTE.map(c => (
                  <button
                    key={c}
                    onClick={() => { setColor(c); setIsErasing(false) }}
                    className={`rounded-full border-2 transition-all hover:scale-110 ${
                      color === c && !isErasing
                        ? 'border-deep scale-110'
                        : 'border-light'
                    }`}
                    style={{ backgroundColor: c, width: 26, height: 26 }}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>

              <div className="flex gap-1 ml-auto">
                <button
                  onClick={() => setIsErasing(!isErasing)}
                  className={`p-1.5 rounded-lg text-sm transition-colors ${
                    isErasing ? 'bg-coral text-white' : 'bg-light text-deep hover:bg-mist/30'
                  }`}
                  title="Eraser"
                >
                  <Eraser size={14} />
                </button>
                <button
                  onClick={undo}
                  className="p-1.5 rounded-lg bg-light text-deep hover:bg-mist/30 transition-colors"
                  title="Undo"
                >
                  <Undo2 size={14} />
                </button>
                <button
                  onClick={clearCanvas}
                  className="p-1.5 rounded-lg bg-light text-deep hover:bg-mist/30 transition-colors"
                  title="Clear"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div className="rounded-xl overflow-hidden border-2 border-mist/30 bg-white mb-4">
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className={`block w-full aspect-square ${cursorClass}`}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-2.5">
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Your name"
                maxLength={30}
                autoComplete="off"
                className="flex-1 px-3.5 py-2.5 rounded-lg border-2 border-mist/30 bg-white text-deep text-sm placeholder-mist focus:outline-none focus:border-deep/40 transition-colors"
              />
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-deep text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                <Send size={14} />
                {submitting ? '...' : 'Plant'}
              </button>
            </div>

            {status.msg && (
              <p className={`mt-2 text-xs text-center font-medium ${
                status.type === 'error' ? 'text-ember' : 'text-deep'
              }`} role="alert">
                {status.msg}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
