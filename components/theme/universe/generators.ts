import type { DustParticle, Nebula, ShootingStar, Star } from "./types"

const STARS_PER_LAYER = [180, 120, 60]
const NEBULA_COUNT = 5
const DUST_COUNT = 40

export function createStarLayers(w: number, h: number): Star[][] {
  return STARS_PER_LAYER.map((count, layer) => {
    const stars: Star[] = []
    const depth = layer / STARS_PER_LAYER.length
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: (1 - depth * 0.5) * (Math.random() * 1.8 + 0.4),
        opacity: (1 - depth * 0.4) * (Math.random() * 0.6 + 0.4),
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.7 ? 220 + Math.random() * 40 : 40 + Math.random() * 20,
      })
    }
    return stars
  })
}

export function createNebulae(w: number, h: number): Nebula[] {
  const hues = [260, 300, 200, 340, 180]
  return Array.from({ length: NEBULA_COUNT }, (_, i) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    radiusX: Math.random() * 300 + 200,
    radiusY: Math.random() * 200 + 120,
    hue: hues[i % hues.length],
    opacity: Math.random() * 0.04 + 0.02,
    rotation: Math.random() * Math.PI * 2,
    driftSpeed: (Math.random() - 0.5) * 0.0003,
  }))
}

export function createDust(w: number, h: number): DustParticle[] {
  return Array.from({ length: DUST_COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    radius: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.15 + 0.05,
    driftX: (Math.random() - 0.5) * 0.15,
    driftY: (Math.random() - 0.5) * 0.1,
    hue: Math.random() > 0.5 ? 240 : 280,
  }))
}

export function spawnShootingStar(w: number, h: number): ShootingStar {
  return {
    x: Math.random() * w * 0.8,
    y: Math.random() * h * 0.4,
    length: Math.random() * 80 + 60,
    speed: Math.random() * 6 + 4,
    angle: Math.random() * 0.4 + 0.3,
    opacity: 1,
    life: 0,
    maxLife: Math.random() * 40 + 30,
    hue: Math.random() > 0.5 ? 220 : 50,
  }
}
