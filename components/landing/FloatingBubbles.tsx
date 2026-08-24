'use client'

import Image from 'next/image'
import { useLayoutEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'

import bubble from '@/app/assets/bubble.svg'

type BubbleConfig = {
  left: string // e.g. "12%"
  size: number // px
  opacity: number
  duration: number // rise duration (s)
  delay: number
  drift: number // horizontal drift px
  wobbleDuration: number
}

export type FloatingBubblesProps = {
  /** How many bubbles to render (ignored if `bubbles` supplied) */
  count?: number
  /** Override auto-generated configs */
  bubbles?: BubbleConfig[]
  /** Extra classes for the absolute container */
  className?: string
  /** Rise duration range — each bubble gets random in range */
  durationRange?: [number, number]
  /** Size range in px */
  sizeRange?: [number, number]
  /** Enable pop burst at top (scale + fade) */
  pop?: boolean
  /** Minimum opacity */
  opacityRange?: [number, number]
  /** Accessible label — defaults to hidden decorative */
  ariaHidden?: boolean
}

/**
 * FloatingBubbles — reusable bubble field with rise + wobble + pop.
 *
 * Bubbles spawn just below the container (`bottom: -48px`), rise to
 * above the top edge, wobble horizontally, then pop (scale 1.35
 * + fade). Each bubble loops forever with staggered delay.
 *
 * Drop into any `relative` section:
 * ```tsx
 * <FloatingBubbles count={14} className="inset-0" />                    // full
 * <FloatingBubbles count={10} className="inset-x-0 top-0 h-[58%]" />   // top/middle only
 * ```
 *
 * Uses `bubble.svg` (39×40) via next/image.
 */
export function FloatingBubbles({
  count = 48,
  bubbles,
  className = 'inset-0',
  durationRange = [6, 12],
  sizeRange = [10, 36],
  pop = true,
  opacityRange = [0.28, 0.6],
  ariaHidden = true,
}: FloatingBubblesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // deterministic configs — no Math.random at render time (SSR-safe)
  const configs: BubbleConfig[] = useMemo(() => {
    if (bubbles) return bubbles
    const [minD, maxD] = durationRange
    const [minS, maxS] = sizeRange
    const [minO, maxO] = opacityRange
    return Array.from({ length: count }, (_, i) => {
      const seed = ((i * 37 + 13) % 100) / 100 // 0..0.99 deterministic
      const leftBase = 6 + ((i * 23 + (i % 5) * 7) % 80)
      const jitter = seed > 0.5 ? 2 : -2
      const left = `${leftBase + jitter}%`
      const size = Math.round(minS + seed * (maxS - minS))
      const opacity = minO + ((i * 17) % 100) / 100 * (maxO - minO)
      const duration = minD + ((i * 29) % 100) / 100 * (maxD - minD)
      const delay = ((i * 1.13) % 4.2)
      const drift = 10 + ((i * 9) % 13)
      const wobbleDuration = 1.6 + ((i * 7) % 16) / 10
      return { left, size, opacity, duration, delay, drift, wobbleDuration }
    })
  }, [bubbles, count, durationRange, sizeRange, opacityRange])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const els = gsap.utils.toArray<HTMLElement>('.fb-bubble', container)
    const ctx = gsap.context(() => {}, container)
    const tweens: gsap.core.Tween[] = []
    const timelines: gsap.core.Timeline[] = []

    els.forEach((el, idx) => {
      const cfg = configs[idx % configs.length]
      const riseDistance = (container.offsetHeight || 700) + 120
      const endlessWobble = gsap.to(el, {
        x: `+=${gsap.utils.random(-10, 10)}`,
        duration: cfg.wobbleDuration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: cfg.delay * 0.5,
      })
      tweens.push(endlessWobble)

      const tl = gsap.timeline({
        repeat: -1,
        delay: cfg.delay,
        repeatDelay: gsap.utils.random(0.4, 1.6),
      })

      // spawn — scale 0 → 1 just above bottom edge
      tl.set(el, {
        y: 36,
        opacity: 0,
        scale: 0.45,
        rotation: gsap.utils.random(-18, 18),
      })
      tl.to(el, {
        y: 0,
        opacity: cfg.opacity,
        scale: 1,
        rotation: gsap.utils.random(-10, 10),
        duration: 0.75,
        ease: 'back.out(1.5)',
      })
      // rise to top
      tl.to(
        el,
        {
          y: -riseDistance,
          x: `+=${(Math.random() > 0.5 ? 1 : -1) * cfg.drift}`,
          rotation: gsap.utils.random(-14, 14),
          duration: cfg.duration,
          ease: 'none',
        },
        '+=0.15',
      )
      // pop — quick burst at top
      if (pop) {
        tl.to(
          el,
          {
            scale: 1.45,
            opacity: 0,
            duration: 0.28,
            ease: 'power2.out',
          },
          '-=0.12',
        )
        // tiny hold invisible before respawn
        tl.set(el, { opacity: 0, scale: 0.45 }, '+=0.35')
      } else {
        tl.to(el, { opacity: 0, duration: 0.35, ease: 'power1.out' }, '-=0.2')
      }

      timelines.push(tl)
    })

    // refresh on resize — recompute riseDistance
    const onResize = () => {
      // GSAP will handle via next loop; no immediate action needed
      // but we invalidate to keep ScrollTrigger happy if parent uses it
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      timelines.forEach((t) => t.kill())
      tweens.forEach((tw) => tw.kill())
      ctx.revert()
    }
  }, [configs, pop])

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none absolute overflow-hidden select-none ${className}`}
      aria-hidden={ariaHidden}
    >
      {configs.map((b, i) => (
        <div
          key={i}
          className="fb-bubble absolute will-change-transform"
          style={{
            left: b.left,
            bottom: -48, // spawn just below container
            opacity: 0, // gsap controls
          }}
        >
          <Image
            src={bubble}
            alt=""
            width={b.size}
            height={b.size}
            className="object-contain drop-shadow-[0_2px_10px_rgba(255,255,255,0.28)]"
            style={{ width: b.size, height: b.size }}
            draggable={false}
            priority={false}
          />
        </div>
      ))}
    </div>
  )
}
