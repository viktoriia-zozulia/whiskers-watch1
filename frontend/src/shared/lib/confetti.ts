// Tiny dependency-free confetti burst on a throwaway <canvas>.

const COLORS = ['#14b8a6', '#2dd4bf', '#f59e0b', '#f97316', '#8b5cf6', '#ec4899', '#3b82f6']

export function fireConfetti(origin?: { x: number; y: number }) {
  if (typeof window === 'undefined') return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  const dpr = window.devicePixelRatio || 1
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:200'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) { canvas.remove(); return }
  ctx.scale(dpr, dpr)

  const ox = origin?.x ?? innerWidth / 2
  const oy = origin?.y ?? innerHeight / 3
  const parts = Array.from({ length: 140 }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = 4 + Math.random() * 9
    return {
      x: ox, y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 6,
      w: 6 + Math.random() * 6,
      h: 3 + Math.random() * 4,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    }
  })

  const start = performance.now()
  const DURATION = 2600
  function frame(now: number) {
    const t = now - start
    ctx!.clearRect(0, 0, innerWidth, innerHeight)
    ctx!.globalAlpha = Math.max(0, 1 - t / DURATION)
    for (const p of parts) {
      p.vy += 0.25
      p.vx *= 0.985
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      ctx!.save()
      ctx!.translate(p.x, p.y)
      ctx!.rotate(p.rot)
      ctx!.fillStyle = p.color
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx!.restore()
    }
    if (t < DURATION) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
