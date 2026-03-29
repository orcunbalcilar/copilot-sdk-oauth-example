"use client";

import { useEffect, useRef } from "react";


interface GlobeAnimationProps {
  readonly inputText?: string;
  readonly className?: string;
}

const STAR_COUNT = 120;
const GLOBE_POINTS = 200;
const BASE_SPEED = 0.003;

function hashText(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = Math.trunc(h * 31 + (text.codePointAt(i) ?? 0));
  }
  return Math.abs(h);
}

function generateGlobePoints() {
  const pts: { lat: number; lng: number }[] = [];
  for (let i = 0; i < GLOBE_POINTS; i++) {
    pts.push({
      lat: Math.acos(2 * Math.random() - 1) - Math.PI / 2,
      lng: Math.random() * 2 * Math.PI,
    });
  }
  return pts;
}

function generateStars() {
  const s: { x: number; y: number; r: number; speed: number }[] = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    s.push({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.0005 + 0.0001,
    });
  }
  return s;
}

export function GlobeAnimation({ inputText = "", className }: GlobeAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const textHashRef = useRef(0);
  const intensityRef = useRef(0);
  const globePointsRef = useRef<ReturnType<typeof generateGlobePoints> | null>(null);
  const starsRef = useRef<ReturnType<typeof generateStars> | null>(null);

  useEffect(() => {
    const newHash = hashText(inputText);
    if (newHash !== textHashRef.current) {
      textHashRef.current = newHash;
      intensityRef.current = Math.min(intensityRef.current + 0.4, 1);
    }
  }, [inputText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!globePointsRef.current) globePointsRef.current = generateGlobePoints();
    if (!starsRef.current) starsRef.current = generateStars();
    const globePoints = globePointsRef.current;
    const stars = starsRef.current;

    let animId: number;

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const t = frameRef.current;
      const intensity = intensityRef.current;

      ctx.clearRect(0, 0, w, h);

      // Universe background stars
      for (const star of stars) {
        const flicker = 0.5 + 0.5 * Math.sin(t * star.speed * 100 + star.x * 50);
        const alpha = 0.3 + 0.7 * flicker * (0.5 + intensity * 0.5);
        ctx.beginPath();
        ctx.arc(star.x * w, star.y * h, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 200, 255, ${alpha})`;
        ctx.fill();
      }

      // Globe parameters
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.32;
      const speed = BASE_SPEED + intensity * 0.012;
      const rotation = t * speed;

      // Globe outline glow
      const glowAlpha = 0.08 + intensity * 0.12;
      const gradient = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.3);
      gradient.addColorStop(0, `rgba(100, 140, 255, ${glowAlpha})`);
      gradient.addColorStop(1, "rgba(100, 140, 255, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Globe circle border
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(100, 160, 255, ${0.15 + intensity * 0.2})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        const latRad = (lat * Math.PI) / 180;
        const r = radius * Math.cos(latRad);
        const yOff = radius * Math.sin(latRad) * 0.4;
        ctx.beginPath();
        ctx.ellipse(cx, cy + yOff, r, r * 0.15, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 160, 255, ${0.06 + intensity * 0.06})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Globe dot points
      for (const pt of globePoints) {
        const lng = pt.lng + rotation;
        const x3d = Math.cos(pt.lat) * Math.sin(lng);
        const y3d = Math.sin(pt.lat);
        const z3d = Math.cos(pt.lat) * Math.cos(lng);

        if (z3d < -0.1) continue; // behind globe

        const scale = 0.7 + 0.3 * z3d;
        const px = cx + x3d * radius;
        const py = cy - y3d * radius * 0.9;
        const pr = (1.2 + intensity * 1.5) * scale;
        const alpha = (0.3 + 0.7 * z3d) * (0.5 + intensity * 0.5);

        const hue = 220 + intensity * 60;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 80%, 70%, ${alpha})`;
        ctx.fill();
      }

      // Orbiting rings
      for (let i = 0; i < 3; i++) {
        const ringRot = rotation * (1.5 + i * 0.5) + (i * Math.PI * 2) / 3;
        const tilt = 0.2 + i * 0.15;
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius * (1.1 + i * 0.08), radius * tilt, ringRot, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(130, 170, 255, ${0.06 + intensity * 0.08})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Decay intensity
      intensityRef.current = Math.max(0, intensityRef.current - 0.003);
      frameRef.current++;
      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className ?? ""}`}
    />
  );
}
