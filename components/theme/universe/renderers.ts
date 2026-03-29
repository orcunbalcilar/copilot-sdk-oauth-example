import type { DustParticle, Nebula, ShootingStar, Star } from "./types"

interface MousePos {
  x: number
  y: number
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  mouse: MousePos
) {
  const mx = mouse.x - 0.5
  const my = mouse.y - 0.5
  const bgGrad = ctx.createRadialGradient(
    w * 0.5 + mx * 40, h * 0.4 + my * 40, 0,
    w * 0.5, h * 0.5, w * 0.8
  )
  bgGrad.addColorStop(0, "hsl(240, 20%, 6%)")
  bgGrad.addColorStop(0.4, "hsl(250, 25%, 4%)")
  bgGrad.addColorStop(1, "hsl(220, 30%, 2%)")
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, w, h)
}

export function drawNebulae(
  ctx: CanvasRenderingContext2D,
  nebulae: Nebula[],
  frame: number,
  mouse: MousePos
) {
  const mx = mouse.x - 0.5
  const my = mouse.y - 0.5
  for (const n of nebulae) {
    n.rotation += n.driftSpeed
    ctx.save()
    ctx.translate(n.x + mx * 15, n.y + my * 15)
    ctx.rotate(n.rotation)
    const hueShift = Math.sin(frame * 0.003 + n.hue) * 15
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, n.radiusX)
    grad.addColorStop(0, `hsla(${n.hue + hueShift}, 70%, 40%, ${n.opacity * 1.5})`)
    grad.addColorStop(0.4, `hsla(${n.hue + hueShift + 20}, 60%, 30%, ${n.opacity})`)
    grad.addColorStop(1, `hsla(${n.hue + hueShift}, 50%, 20%, 0)`)
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.ellipse(0, 0, n.radiusX, n.radiusY, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

function drawSingleStar(
  ctx: CanvasRenderingContext2D,
  star: Star,
  sx: number,
  sy: number,
  alpha: number
) {
  if (star.radius > 1.2) {
    const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.radius * 3)
    glow.addColorStop(0, `hsla(${star.hue}, 80%, 85%, ${alpha})`)
    glow.addColorStop(0.5, `hsla(${star.hue}, 60%, 70%, ${alpha * 0.3})`)
    glow.addColorStop(1, `hsla(${star.hue}, 50%, 50%, 0)`)
    ctx.fillStyle = glow
    ctx.beginPath()
    ctx.arc(sx, sy, star.radius * 3, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.beginPath()
  ctx.arc(sx, sy, star.radius, 0, Math.PI * 2)
  ctx.fillStyle = `hsla(${star.hue}, 70%, 90%, ${alpha})`
  ctx.fill()
}

export function drawStarLayers(
  ctx: CanvasRenderingContext2D,
  layers: Star[][],
  frame: number,
  w: number,
  h: number,
  mouse: MousePos
) {
  const mx = mouse.x - 0.5
  const my = mouse.y - 0.5
  for (let l = 0; l < layers.length; l++) {
    const parallax = (l + 1) * 8
    const offsetX = mx * parallax
    const offsetY = my * parallax
    for (const star of layers[l]) {
      const twinkle = 0.5 + 0.5 * Math.sin(frame * star.twinkleSpeed + star.twinkleOffset)
      const sx = star.x + offsetX
      const sy = star.y + offsetY
      if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue
      drawSingleStar(ctx, star, sx, sy, star.opacity * twinkle)
    }
  }
}

export function drawDust(
  ctx: CanvasRenderingContext2D,
  dust: DustParticle[],
  frame: number,
  w: number,
  h: number,
  mouse: MousePos
) {
  const mx = mouse.x - 0.5
  const my = mouse.y - 0.5
  for (const d of dust) {
    d.x += d.driftX
    d.y += d.driftY
    if (d.x < 0) d.x = w
    if (d.x > w) d.x = 0
    if (d.y < 0) d.y = h
    if (d.y > h) d.y = 0
    const pulse = 0.6 + 0.4 * Math.sin(frame * 0.01 + d.x * 0.01)
    ctx.beginPath()
    ctx.arc(d.x + mx * 5, d.y + my * 5, d.radius, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${d.hue}, 50%, 70%, ${d.opacity * pulse})`
    ctx.fill()
  }
}

export function drawShootingStars(
  ctx: CanvasRenderingContext2D,
  shootingStars: ShootingStar[]
): ShootingStar[] {
  const active: ShootingStar[] = []
  for (const s of shootingStars) {
    s.life++
    s.x += Math.cos(s.angle) * s.speed
    s.y += Math.sin(s.angle) * s.speed
    s.opacity = 1 - s.life / s.maxLife
    if (s.opacity <= 0) continue
    const tailX = s.x - Math.cos(s.angle) * s.length
    const tailY = s.y - Math.sin(s.angle) * s.length
    const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y)
    grad.addColorStop(0, `hsla(${s.hue}, 60%, 80%, 0)`)
    grad.addColorStop(0.7, `hsla(${s.hue}, 70%, 90%, ${s.opacity * 0.6})`)
    grad.addColorStop(1, `hsla(${s.hue}, 80%, 95%, ${s.opacity})`)
    ctx.beginPath()
    ctx.moveTo(tailX, tailY)
    ctx.lineTo(s.x, s.y)
    ctx.strokeStyle = grad
    ctx.lineWidth = 1.5
    ctx.stroke()
    const headGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 4)
    headGlow.addColorStop(0, `hsla(${s.hue}, 80%, 95%, ${s.opacity})`)
    headGlow.addColorStop(1, `hsla(${s.hue}, 60%, 80%, 0)`)
    ctx.fillStyle = headGlow
    ctx.beginPath()
    ctx.arc(s.x, s.y, 4, 0, Math.PI * 2)
    ctx.fill()
    active.push(s)
  }
  return active
}
