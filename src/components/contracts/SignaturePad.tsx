import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'

type SignaturePadProps = {
  label: string
  description?: string
  required?: boolean
  value: string
  onChange: (signature: string) => void
}

export default function SignaturePad({
  label,
  description,
  required = false,
  value,
  onChange,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef({
    x: 0,
    y: 0,
  })

  const [hasSignature, setHasSignature] = useState(
    Boolean(value),
  )

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    function resizeCanvas() {
      const canvasElement = canvasRef.current

      if (!canvasElement) {
        return
      }

      const rectangle =
        canvasElement.getBoundingClientRect()

      const ratio = window.devicePixelRatio || 1

      canvasElement.width = Math.max(
        1,
        Math.floor(rectangle.width * ratio),
      )

      canvasElement.height = Math.max(
        1,
        Math.floor(rectangle.height * ratio),
      )

      const context = canvasElement.getContext('2d')

      if (!context) {
        return
      }

      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.lineWidth = 2
      context.strokeStyle = '#333333'

      if (value) {
        const image = new Image()

        image.onload = () => {
          context.clearRect(
            0,
            0,
            rectangle.width,
            rectangle.height,
          )

          context.drawImage(
            image,
            0,
            0,
            rectangle.width,
            rectangle.height,
          )
        }

        image.src = value
      }
    }

    resizeCanvas()

    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [value])

  function getCanvasPoint(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) {
    const canvas = canvasRef.current

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      }
    }

    const rectangle = canvas.getBoundingClientRect()

    return {
      x: event.clientX - rectangle.left,
      y: event.clientY - rectangle.top,
    }
  }

  function beginDrawing(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    event.preventDefault()

    canvas.setPointerCapture(event.pointerId)

    drawingRef.current = true
    lastPointRef.current = getCanvasPoint(event)
  }

  function draw(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) {
    if (!drawingRef.current) {
      return
    }

    event.preventDefault()

    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    const point = getCanvasPoint(event)

    context.beginPath()
    context.moveTo(
      lastPointRef.current.x,
      lastPointRef.current.y,
    )
    context.lineTo(point.x, point.y)
    context.stroke()

    lastPointRef.current = point
    setHasSignature(true)
  }

  function finishDrawing(
    event: ReactPointerEvent<HTMLCanvasElement>,
  ) {
    if (!drawingRef.current) {
      return
    }

    const canvas = canvasRef.current

    drawingRef.current = false

    if (!canvas) {
      return
    }

    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId)
    }

    const signatureImage = canvas.toDataURL('image/png')

    onChange(signatureImage)
    setHasSignature(true)
  }

  function clearSignature() {
    const canvas = canvasRef.current

    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')

    if (!context) {
      return
    }

    const rectangle = canvas.getBoundingClientRect()

    context.clearRect(
      0,
      0,
      rectangle.width,
      rectangle.height,
    )

    drawingRef.current = false
    setHasSignature(false)
    onChange('')
  }

  return (
    <section className="rounded-[24px] border border-[#E8E5DE] bg-white p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-lg font-medium text-[#555555]">
            {label}

            {required && (
              <span className="ml-1 text-[#B59A68]">
                *
              </span>
            )}
          </p>

          {description && (
            <p className="mt-2 text-sm leading-6 text-[#999999]">
              {description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={clearSignature}
          disabled={!hasSignature}
          className="text-sm font-medium text-[#9A8258] transition hover:text-[#6F5C3C] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear signature
        </button>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-2xl border border-[#DDD8CE] bg-[#FCFBF9]">
        <canvas
          ref={canvasRef}
          onPointerDown={beginDrawing}
          onPointerMove={draw}
          onPointerUp={finishDrawing}
          onPointerCancel={finishDrawing}
          onPointerLeave={(event) => {
            if (drawingRef.current) {
              finishDrawing(event)
            }
          }}
          className="block h-[190px] w-full touch-none cursor-crosshair"
        />

        {!hasSignature && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-[#C0BAB0]">
              Sign here with your finger, pencil or mouse
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-8 left-8 right-8 border-b border-[#BDB7AC]" />

        <p className="pointer-events-none absolute bottom-3 left-8 text-[10px] uppercase tracking-[0.14em] text-[#AAA39A]">
          Signature
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            hasSignature
              ? 'bg-[#87906A]'
              : 'bg-[#D8D3C9]'
          }`}
        />

        <p className="text-xs text-[#999999]">
          {hasSignature
            ? 'Signature captured'
            : required
              ? 'Signature required'
              : 'Optional signature'}
        </p>
      </div>
    </section>
  )
}