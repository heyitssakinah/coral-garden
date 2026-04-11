import { useRef, useState, useEffect, useCallback } from 'react'
import { Eraser, Undo2, Trash2, Send, Pencil, X, PaintBucket } from 'lucide-react'

const PALETTE = [
  '#325483', '#ac245b', '#ed7149', '#ffce34',
  '#edc9be', '#abbad8', '#ffffff', '#1a1a2e',
]

// --- Coral template paths (drawn as dotted guides) ---
const CORAL_TEMPLATES = {
  plating: {
    label: 'Plating',
    // Wide, flat ruffled coral with wavy layered edges — wider than tall
    draw(ctx, w, h) {
      // Outer ruffled edge — organic wavy blob shape
      ctx.beginPath()
      ctx.moveTo(w * 0.5, h * 0.72)
      ctx.bezierCurveTo(w * 0.38, h * 0.74, w * 0.22, h * 0.72, w * 0.15, h * 0.65)
      ctx.bezierCurveTo(w * 0.08, h * 0.58, w * 0.1, h * 0.5, w * 0.14, h * 0.44)
      ctx.bezierCurveTo(w * 0.18, h * 0.38, w * 0.25, h * 0.34, w * 0.32, h * 0.32)
      ctx.bezierCurveTo(w * 0.4, h * 0.3, w * 0.48, h * 0.3, w * 0.55, h * 0.31)
      ctx.bezierCurveTo(w * 0.65, h * 0.3, w * 0.75, h * 0.33, w * 0.82, h * 0.38)
      ctx.bezierCurveTo(w * 0.88, h * 0.43, w * 0.9, h * 0.52, w * 0.87, h * 0.58)
      ctx.bezierCurveTo(w * 0.84, h * 0.65, w * 0.75, h * 0.7, w * 0.65, h * 0.72)
      ctx.bezierCurveTo(w * 0.58, h * 0.73, w * 0.5, h * 0.72, w * 0.5, h * 0.72)
      ctx.stroke()
      // Inner layered ridges
      ctx.beginPath()
      ctx.moveTo(w * 0.3, h * 0.55)
      ctx.bezierCurveTo(w * 0.38, h * 0.5, w * 0.52, h * 0.48, w * 0.65, h * 0.5)
      ctx.bezierCurveTo(w * 0.72, h * 0.51, w * 0.78, h * 0.54, w * 0.75, h * 0.58)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(w * 0.25, h * 0.48)
      ctx.bezierCurveTo(w * 0.35, h * 0.43, w * 0.5, h * 0.41, w * 0.62, h * 0.42)
      ctx.bezierCurveTo(w * 0.7, h * 0.43, w * 0.76, h * 0.46, w * 0.72, h * 0.5)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(w * 0.35, h * 0.42)
      ctx.bezierCurveTo(w * 0.42, h * 0.38, w * 0.52, h * 0.37, w * 0.6, h * 0.38)
      ctx.stroke()
    },
  },
  branching: {
    label: 'Branching',
    // Tree-like coral with thick trunk splitting into upward branches
    draw(ctx, w, h) {
      // Trunk base with root flare
      ctx.beginPath()
      ctx.moveTo(w * 0.42, h * 0.88)
      ctx.bezierCurveTo(w * 0.38, h * 0.88, w * 0.35, h * 0.85, w * 0.38, h * 0.82)
      ctx.lineTo(w * 0.43, h * 0.68)
      ctx.moveTo(w * 0.58, h * 0.88)
      ctx.bezierCurveTo(w * 0.62, h * 0.88, w * 0.65, h * 0.85, w * 0.62, h * 0.82)
      ctx.lineTo(w * 0.57, h * 0.68)
      ctx.stroke()
      // Main trunk outline
      ctx.beginPath()
      ctx.moveTo(w * 0.43, h * 0.68)
      ctx.lineTo(w * 0.45, h * 0.55)
      ctx.moveTo(w * 0.57, h * 0.68)
      ctx.lineTo(w * 0.55, h * 0.55)
      ctx.stroke()
      // Left branch cluster
      ctx.beginPath()
      ctx.moveTo(w * 0.45, h * 0.58)
      ctx.bezierCurveTo(w * 0.4, h * 0.52, w * 0.3, h * 0.45, w * 0.22, h * 0.38)
      ctx.moveTo(w * 0.22, h * 0.38)
      ctx.lineTo(w * 0.18, h * 0.28)
      ctx.moveTo(w * 0.22, h * 0.38)
      ctx.bezierCurveTo(w * 0.26, h * 0.35, w * 0.28, h * 0.28, w * 0.3, h * 0.22)
      ctx.stroke()
      // Far left branch
      ctx.beginPath()
      ctx.moveTo(w * 0.3, h * 0.48)
      ctx.bezierCurveTo(w * 0.24, h * 0.46, w * 0.18, h * 0.48, w * 0.14, h * 0.42)
      ctx.stroke()
      // Center branches
      ctx.beginPath()
      ctx.moveTo(w * 0.48, h * 0.55)
      ctx.lineTo(w * 0.45, h * 0.35)
      ctx.lineTo(w * 0.42, h * 0.22)
      ctx.moveTo(w * 0.45, h * 0.35)
      ctx.lineTo(w * 0.5, h * 0.2)
      ctx.moveTo(w * 0.52, h * 0.55)
      ctx.lineTo(w * 0.55, h * 0.38)
      ctx.lineTo(w * 0.53, h * 0.25)
      ctx.stroke()
      // Right branch cluster
      ctx.beginPath()
      ctx.moveTo(w * 0.55, h * 0.55)
      ctx.bezierCurveTo(w * 0.6, h * 0.48, w * 0.68, h * 0.42, w * 0.72, h * 0.35)
      ctx.lineTo(w * 0.7, h * 0.22)
      ctx.moveTo(w * 0.72, h * 0.35)
      ctx.lineTo(w * 0.78, h * 0.25)
      ctx.moveTo(w * 0.68, h * 0.42)
      ctx.bezierCurveTo(w * 0.74, h * 0.4, w * 0.8, h * 0.38, w * 0.82, h * 0.32)
      ctx.stroke()
    },
  },
  massive: {
    label: 'Massive',
    // Large rounded dome/brain coral — nearly circular with bumpy edge
    draw(ctx, w, h) {
      // Outer dome shape — slightly irregular circle
      ctx.beginPath()
      ctx.moveTo(w * 0.5, h * 0.78)
      ctx.bezierCurveTo(w * 0.35, h * 0.79, w * 0.2, h * 0.74, w * 0.14, h * 0.62)
      ctx.bezierCurveTo(w * 0.08, h * 0.5, w * 0.1, h * 0.38, w * 0.18, h * 0.3)
      ctx.bezierCurveTo(w * 0.26, h * 0.22, w * 0.38, h * 0.2, w * 0.5, h * 0.2)
      ctx.bezierCurveTo(w * 0.62, h * 0.2, w * 0.74, h * 0.22, w * 0.82, h * 0.3)
      ctx.bezierCurveTo(w * 0.9, h * 0.38, w * 0.92, h * 0.5, w * 0.86, h * 0.62)
      ctx.bezierCurveTo(w * 0.8, h * 0.74, w * 0.65, h * 0.79, w * 0.5, h * 0.78)
      ctx.stroke()
      // Brain-like maze texture lines
      ctx.beginPath()
      ctx.moveTo(w * 0.3, h * 0.45)
      ctx.bezierCurveTo(w * 0.35, h * 0.42, w * 0.38, h * 0.45, w * 0.42, h * 0.42)
      ctx.bezierCurveTo(w * 0.46, h * 0.39, w * 0.5, h * 0.42, w * 0.54, h * 0.4)
      ctx.moveTo(w * 0.58, h * 0.38)
      ctx.bezierCurveTo(w * 0.62, h * 0.4, w * 0.66, h * 0.37, w * 0.7, h * 0.4)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(w * 0.25, h * 0.55)
      ctx.bezierCurveTo(w * 0.3, h * 0.52, w * 0.34, h * 0.55, w * 0.38, h * 0.52)
      ctx.bezierCurveTo(w * 0.42, h * 0.49, w * 0.48, h * 0.52, w * 0.52, h * 0.5)
      ctx.moveTo(w * 0.56, h * 0.52)
      ctx.bezierCurveTo(w * 0.6, h * 0.49, w * 0.65, h * 0.52, w * 0.68, h * 0.5)
      ctx.bezierCurveTo(w * 0.72, h * 0.48, w * 0.75, h * 0.5, w * 0.76, h * 0.52)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(w * 0.28, h * 0.38)
      ctx.bezierCurveTo(w * 0.32, h * 0.35, w * 0.36, h * 0.38, w * 0.4, h * 0.35)
      ctx.moveTo(w * 0.35, h * 0.62)
      ctx.bezierCurveTo(w * 0.4, h * 0.59, w * 0.45, h * 0.62, w * 0.5, h * 0.6)
      ctx.bezierCurveTo(w * 0.55, h * 0.58, w * 0.6, h * 0.6, w * 0.65, h * 0.58)
      ctx.stroke()
    },
  },
}

// --- Flood fill algorithm ---
function hexToRGBA(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b, 255]
}

function colorsMatch(data, idx, target, tolerance) {
  return Math.abs(data[idx] - target[0]) <= tolerance
    && Math.abs(data[idx + 1] - target[1]) <= tolerance
    && Math.abs(data[idx + 2] - target[2]) <= tolerance
    && Math.abs(data[idx + 3] - target[3]) <= tolerance
}

function floodFill(canvas, startX, startY, fillHex) {
  const ctx = canvas.getContext('2d')
  const w = canvas.width
  const h = canvas.height
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data

  startX = Math.max(0, Math.min(w - 1, Math.round(startX)))
  startY = Math.max(0, Math.min(h - 1, Math.round(startY)))

  const startIdx = (startY * w + startX) * 4
  const targetColor = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]]
  const fillColor = hexToRGBA(fillHex)

  // Early exit if target matches fill
  if (colorsMatch(data, startIdx, fillColor, 0)) return

  const visited = new Uint8Array(w * h)
  const stack = [startX + startY * w]
  visited[stack[0]] = 1

  while (stack.length > 0) {
    const pos = stack.pop()
    const px = pos % w
    const py = (pos / w) | 0
    const idx = pos * 4

    data[idx] = fillColor[0]
    data[idx + 1] = fillColor[1]
    data[idx + 2] = fillColor[2]
    data[idx + 3] = fillColor[3]

    const neighbors = [
      px > 0 ? pos - 1 : -1,
      px < w - 1 ? pos + 1 : -1,
      py > 0 ? pos - w : -1,
      py < h - 1 ? pos + w : -1,
    ]

    for (const npos of neighbors) {
      if (npos < 0 || visited[npos]) continue
      visited[npos] = 1
      if (colorsMatch(data, npos * 4, targetColor, 30)) {
        stack.push(npos)
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

// --- Component ---
export default function DrawingStudio({ onSubmit }) {
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState(PALETTE[1])
  const [brushSize, setBrushSize] = useState(6)
  const [activeTool, setActiveTool] = useState('brush') // 'brush' | 'eraser'
  const [history, setHistory] = useState([])
  const [authorName, setAuthorName] = useState('')
  const [status, setStatus] = useState({ type: '', msg: '' })
  const [submitting, setSubmitting] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [activeTemplate, setActiveTemplate] = useState(null)
  const [dragOverCanvas, setDragOverCanvas] = useState(false)

  // Init canvas when panel first opens
    const saveHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    setHistory(prev => [...prev.slice(-20), canvas.toDataURL()])
  }, [])
  
  useEffect(() => {
    if (open && !initialized && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      saveHistory()
      setInitialized(true)
    }
  }, [open, initialized, saveHistory])

  // Draw template on overlay canvas when template changes
  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return
    const ctx = overlay.getContext('2d')
    ctx.clearRect(0, 0, overlay.width, overlay.height)

    if (!activeTemplate || !CORAL_TEMPLATES[activeTemplate]) return

    ctx.setLineDash([6, 4])
    ctx.strokeStyle = 'rgba(171, 186, 216, 0.6)'
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'
    CORAL_TEMPLATES[activeTemplate].draw(ctx, overlay.width, overlay.height)
  }, [activeTemplate, open])

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
    if (activeTool === 'eraser') {
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
      setActiveTemplate(null)
    } catch (err) {
      setStatus({ type: 'error', msg: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  // --- Drag-and-drop fill handlers ---
  const handleDragStart = (e, dragColor) => {
    e.dataTransfer.setData('text/plain', dragColor)
    e.dataTransfer.effectAllowed = 'copy'
    // Create a small colored circle as drag image
    const dragEl = document.createElement('div')
    dragEl.style.cssText = `width:24px;height:24px;border-radius:50%;background:${dragColor};position:absolute;top:-999px;`
    document.body.appendChild(dragEl)
    e.dataTransfer.setDragImage(dragEl, 12, 12)
    setTimeout(() => document.body.removeChild(dragEl), 0)
  }

  const handleCanvasDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    if (!dragOverCanvas) setDragOverCanvas(true)
  }

  const handleCanvasDragLeave = () => {
    setDragOverCanvas(false)
  }

  const handleCanvasDrop = (e) => {
    e.preventDefault()
    setDragOverCanvas(false)
    const droppedColor = e.dataTransfer.getData('text/plain')
    if (!droppedColor || !droppedColor.startsWith('#')) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    floodFill(canvas, x, y, droppedColor)
    saveHistory()
  }

  const cursorClass = activeTool === 'eraser' ? 'canvas-erase' : 'canvas-draw'

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
        <div className="fixed bottom-8 right-10 z-50 w-[480px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl border-2 border-mist/40 shadow-xl" data-drawing-studio>
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
                    draggable
                    onDragStart={(e) => handleDragStart(e, c)}
                    onClick={() => { setColor(c); setActiveTool('brush') }}
                    className={`rounded-full border-2 transition-all hover:scale-110 ${
                      color === c && activeTool === 'brush'
                        ? 'border-deep scale-110'
                        : 'border-light'
                    }`}
                    style={{ backgroundColor: c, width: 26, height: 26, cursor: 'grab' }}
                    aria-label={`Color ${c}`}
                    title="Click to draw, drag onto canvas to fill"
                  />
                ))}
              </div>

              <div className="flex gap-1 ml-auto">
                <button
                  onClick={() => setActiveTool('brush')}
                  className={`p-1.5 rounded-lg text-sm transition-colors ${
                    activeTool === 'brush' ? 'bg-coral text-white' : 'bg-light text-deep hover:bg-mist/30'
                  }`}
                  title="Brush"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setActiveTool('eraser')}
                  className={`p-1.5 rounded-lg text-sm transition-colors ${
                    activeTool === 'eraser' ? 'bg-coral text-white' : 'bg-light text-deep hover:bg-mist/30'
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

            {/* Template selector */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-mist">Template:</span>
              {[null, 'plating', 'branching', 'massive'].map(key => (
                <button
                  key={key ?? 'none'}
                  onClick={() => setActiveTemplate(key)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${
                    activeTemplate === key
                      ? 'bg-deep text-white'
                      : 'bg-light text-deep hover:bg-mist/30'
                  }`}
                >
                  {key ? CORAL_TEMPLATES[key].label : 'None'}
                </button>
              ))}
              <span className="ml-auto flex items-center gap-1 text-[10px] text-mist">
                <PaintBucket size={10} />
                Drag colors to fill
              </span>
            </div>

            {/* Canvas with template overlay */}
            <div className={`relative rounded-xl overflow-hidden border-2 bg-white mb-4 transition-colors ${
              dragOverCanvas ? 'border-coral/60' : 'border-mist/30'
            }`}>
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className={`block w-full aspect-square ${cursorClass}`}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
                onDragOver={handleCanvasDragOver}
                onDragLeave={handleCanvasDragLeave}
                onDrop={handleCanvasDrop}
              />
              <canvas
                ref={overlayRef}
                width={500}
                height={500}
                className="absolute inset-0 w-full h-full pointer-events-none"
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
