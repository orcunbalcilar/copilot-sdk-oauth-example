export interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  twinkleSpeed: number
  twinkleOffset: number
  hue: number
}

export interface Nebula {
  x: number
  y: number
  radiusX: number
  radiusY: number
  hue: number
  opacity: number
  rotation: number
  driftSpeed: number
}

export interface ShootingStar {
  x: number
  y: number
  length: number
  speed: number
  angle: number
  opacity: number
  life: number
  maxLife: number
  hue: number
}

export interface DustParticle {
  x: number
  y: number
  radius: number
  opacity: number
  driftX: number
  driftY: number
  hue: number
}
