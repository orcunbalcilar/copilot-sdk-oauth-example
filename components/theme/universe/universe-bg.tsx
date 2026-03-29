"use client"

import { useCallback, useEffect, useRef } from "react"
import { useTheme } from "next-themes"

import { createDust, createNebulae, createStarLayers, spawnShootingStar } from "./generators"
import {
  drawBackground,
  drawDust,
  drawNebulae,
  drawShootingStars,
  drawStarLayers,
} from "./renderers"
import type { DustParticle, Nebula, ShootingStar, Star } from "./types"

const SHOOTING_STAR_INTERVAL = 3000

export function UniverseBackground() {
  const { resolvedTheme } = useTheme()
  const isUniverse = resolvedTheme === "universe"

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const starsRef = useRef<Star[][] | null>(null)
  const nebulaeRef = useRef<Nebula[] | null>(null)
  const dustRef = useRef<DustParticle[] | null>(null)
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const lastShootingRef = useRef(0)
  const frameRef = useRef(0)
  const sizeRef = useRef({ w: 0, h: 0 })

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: e.clientX / globalThis.innerWidth,
      y: e.clientY / globalThis.innerHeight,
    }
  }, [])

  useEffect(() => {
    if (!isUniverse) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    function resize() {
      if (!canvas || !ctx) return
      const dpr = Math.min(globalThis.devicePixelRatio || 1, 2)
      const w = globalThis.innerWidth
      const h = globalThis.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      sizeRef.current = { w, h }
      starsRef.current = createStarLayers(w, h)
      nebulaeRef.current = createNebulae(w, h)
      dustRef.current = createDust(w, h)
    }

    resize()
    globalThis.addEventListener("resize", resize)
    globalThis.addEventListener("mousemove", handleMouseMove)

    function draw() {
      if (!ctx) return
      const { w, h } = sizeRef.current
      const frame = frameRef.current
      const mouse = mouseRef.current

      drawBackground(ctx, w, h, mouse)

      if (nebulaeRef.current) {
        drawNebulae(ctx, nebulaeRef.current, frame, mouse)
      }
      if (starsRef.current) {
        drawStarLayers(ctx, starsRef.current, frame, w, h, mouse)
      }
      if (dustRef.current) {
        drawDust(ctx, dustRef.current, frame, w, h, mouse)
      }

      const now = performance.now()
      if (now - lastShootingRef.current > SHOOTING_STAR_INTERVAL) {
        shootingStarsRef.current.push(spawnShootingStar(w, h))
        lastShootingRef.current = now
      }
      shootingStarsRef.current = drawShootingStars(ctx, shootingStarsRef.current)

      frameRef.current++
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      globalThis.removeEventListener("resize", resize)
      globalThis.removeEventListener("mousemove", handleMouseMove)
    }
  }, [handleMouseMove, isUniverse])

  if (!isUniverse) return null

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
      aria-hidden
      tabIndex={-1}
    />
  )
}
