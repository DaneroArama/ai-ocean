'use client'

import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'

type BubbleClickTrailProps = {
  /** Bubbles spawned per click burst */
  bubblesPerClick?: number
  /** Bubble size range in px */
  sizeRange?: [number, number]
  /** How far bubbles spread from the click point */
  spread?: number
  /** Rise distance in px */
  riseDistance?: number
  /** Rise duration range in seconds */
  riseDuration?: [number, number]
  /** Max concurrent bubbles before oldest get killed */
  maxBubbles?: number
  /** Min ms between trail spawns */
  trailInterval?: number
  /** How many bubbles per trail step */
  trailCount?: number
}

let activeBubbleCount = 0

function createBubbleEl(size: number): HTMLDivElement {
  const wrapper = document.createElement('div')
  wrapper.style.cssText = `
    position: absolute;
    pointer-events: none;
    will-change: transform, opacity;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.6), rgba(255,255,255,0.15) 50%, rgba(200,230,255,0.08) 100%);
    border: 1.5px solid rgba(255,255,255,0.45);
    box-shadow: inset 0 -${size * 0.15}px ${size * 0.3}px rgba(255,255,255,0.15), 0 0 ${size * 0.4}px rgba(255,255,255,0.12);
  `

  const highlight = document.createElement('div')
  highlight.style.cssText = `
    position: absolute;
    top: ${size * 0.18}px;
    left: ${size * 0.22}px;
    width: ${size * 0.32}px;
    height: ${size * 0.22}px;
    border-radius: 50%;
    background: rgba(255,255,255,0.7);
    filter: blur(${size * 0.04}px);
  `
  wrapper.appendChild(highlight)
  return wrapper
}

export function BubbleClickTrail({
  bubblesPerClick = 6,
  sizeRange = [8, 22],
  spread = 55,
  riseDistance = 220,
  riseDuration = [0.8, 1.5],
  maxBubbles = 150,
  trailInterval = 40,
  trailCount = 2,
}: BubbleClickTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const poolRef = useRef<HTMLDivElement[]>([])
  const lastTrailTimeRef = useRef(0)
  const mouseRef = useRef({ x: 0, y: 0 })

  const spawnTrail = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const [minSize, maxSize] = sizeRange
      const [minDur, maxDur] = riseDuration

      for (let i = 0; i < trailCount; i++) {
        if (activeBubbleCount >= maxBubbles) {
          const oldest = poolRef.current.shift()
          if (oldest) {
            gsap.killTweensOf(oldest)
            oldest.remove()
            activeBubbleCount--
          }
        }

        const size = minSize * 0.55 + Math.random() * (minSize * 0.7)
        const el = createBubbleEl(size)
        const offsetX = (Math.random() - 0.5) * 24
        const offsetY = (Math.random() - 0.5) * 16
        el.style.left = `${clientX - rect.left + offsetX}px`
        el.style.top = `${clientY - rect.top + offsetY}px`
        container.appendChild(el)
        poolRef.current.push(el)
        activeBubbleCount++

        const driftX = (Math.random() - 0.5) * 40
        const rise = riseDistance * (0.35 + Math.random() * 0.4)
        const dur = minDur * 0.6 + Math.random() * (maxDur * 0.4)
        const maxOpacity = 0.3 + Math.random() * 0.3

        const tl = gsap.timeline({
          onComplete: () => {
            el.remove()
            activeBubbleCount--
            const idx = poolRef.current.indexOf(el)
            if (idx !== -1) poolRef.current.splice(idx, 1)
          },
        })

        tl.set(el, { scale: 0, opacity: 0 })

        tl.to(el, {
          y: -rise * 0.15,
          scale: 0.8,
          opacity: maxOpacity,
          duration: dur * 0.15,
          ease: 'sine.out',
        })

        tl.to(
          el,
          {
            y: `-=${rise * 0.6}`,
            x: `+=${driftX * 0.4}`,
            scale: 1,
            duration: dur * 0.45,
            ease: 'none',
          },
          '-=0.05',
        )

        tl.to(
          el,
          {
            y: `-=${rise * 0.35}`,
            x: `+=${driftX * 0.6}`,
            scale: 1.1,
            opacity: 0,
            duration: dur * 0.4,
            ease: 'sine.in',
          },
          '-=0.1',
        )
      }
    },
    [sizeRange, riseDistance, riseDuration, maxBubbles, trailCount],
  )

  const spawnBurst = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      const [minSize, maxSize] = sizeRange
      const [minDur, maxDur] = riseDuration

      for (let i = 0; i < bubblesPerClick; i++) {
        if (activeBubbleCount >= maxBubbles) {
          const oldest = poolRef.current.shift()
          if (oldest) {
            gsap.killTweensOf(oldest)
            oldest.remove()
            activeBubbleCount--
          }
        }

        const size = minSize + Math.random() * (maxSize - minSize)
        const el = createBubbleEl(size)
        el.style.left = `${x}px`
        el.style.top = `${y}px`
        container.appendChild(el)
        poolRef.current.push(el)
        activeBubbleCount++

        const angle = (Math.PI * 2 * i) / bubblesPerClick + (Math.random() - 0.5) * 0.6
        const dist = spread * (0.4 + Math.random() * 0.6)
        const dx = Math.cos(angle) * dist
        const rise = riseDistance * (0.5 + Math.random() * 0.5)
        const dy = Math.sin(angle) * dist * 0.3 - rise
        const duration = minDur + Math.random() * (maxDur - minDur)

        const tl = gsap.timeline({
          onComplete: () => {
            el.remove()
            activeBubbleCount--
            const idx = poolRef.current.indexOf(el)
            if (idx !== -1) poolRef.current.splice(idx, 1)
          },
        })

        tl.set(el, { scale: 0.2, opacity: 0, rotation: Math.random() * 360 })

        tl.to(el, {
          x: dx,
          y: dy,
          scale: 1,
          opacity: 0.4 + Math.random() * 0.3,
          rotation: `+=${Math.random() * 60 - 30}`,
          duration: duration * 0.3,
          ease: 'back.out(2)',
        })

        tl.to(el, {
          x: dx + (Math.random() - 0.5) * 30,
          y: dy - rise * 0.3,
          rotation: `+=${Math.random() * 40 - 20}`,
          duration: duration * 0.5,
          ease: 'sine.inOut',
        })

        tl.to(el, {
          scale: 1.3,
          opacity: 0,
          duration: duration * 0.2,
          ease: 'power2.out',
        })
      }
    },
    [bubblesPerClick, sizeRange, spread, riseDistance, riseDuration, maxBubbles],
  )

  useEffect(() => {
    const handleClick = (e: MouseEvent) => spawnBurst(e.clientX, e.clientY)

    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      const now = performance.now()
      if (now - lastTrailTimeRef.current < trailInterval) return
      lastTrailTimeRef.current = now
      spawnTrail(e.clientX, e.clientY)
    }

    const handleTouch = (e: TouchEvent) => {
      for (const touch of Array.from(e.changedTouches)) {
        spawnBurst(touch.clientX, touch.clientY)
      }
    }

    document.addEventListener('click', handleClick)
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('touchend', handleTouch)

    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('touchend', handleTouch)
      poolRef.current.forEach((el) => {
        gsap.killTweensOf(el)
        el.remove()
      })
      poolRef.current = []
      activeBubbleCount = 0
    }
  }, [spawnBurst, spawnTrail, bubblesPerClick, trailInterval])

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 overflow-hidden select-none"
      style={{ zIndex: 99999 }}
      aria-hidden="true"
    />
  )
}
