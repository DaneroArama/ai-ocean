'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

import Title from '@/app/assets/Title_coloured.webp'
import Tuto from '@/app/assets/Mascots/Tuto.webp'
import Shark from '@/app/assets/Mascots/Shark.webp'
import Crabi from '@/app/assets/Mascots/Crabi.webp'
import Octo from '@/app/assets/Mascots/Octo.webp'
import Ali from '@/app/assets/Mascots/Ali.webp'

const mascots = [Tuto, Shark, Crabi, Octo, Ali]

// Build row sequences like design — shuffled patterns
const row1 = [Shark, Tuto, Crabi, Octo, Ali, Crabi, Octo, Crabi, Ali, Shark, Octo, Tuto, Crabi, Ali]
const row2 = [Octo, Tuto, Crabi, Ali, Crabi, Tuto, Octo, Crabi, Shark, Crabi, Octo, Ali, Crabi, Ali]
const row3 = [Shark, Octo, Ali, Crabi, Tuto, Crabi, Octo, Crabi, Ali, Shark, Ali, Crabi, Octo]

function Row({
  items,
  reverse = false,
  innerRef,
}: {
  items: typeof mascots
  reverse?: boolean
  innerRef: React.RefObject<HTMLDivElement | null>
}) {
  const doubled = [...items, ...items]
  return (
    <div className="w-full overflow-hidden">
      <div
        ref={innerRef}
        className="flex gap-2 md:gap-3 w-max will-change-transform"
        style={{ transform: reverse ? 'translateX(-50%)' : 'translateX(0%)' }}
      >
        {doubled.map((src, i) => (
          <div
            key={i}
            className="shrink-0 w-[62px] h-[62px] md:w-[72px] md:h-[72px] rounded-xl bg-white border border-[#E6EEF5] shadow-sm flex items-center justify-center p-2"
          >
            <Image
              src={src}
              alt=""
              width={64}
              height={64}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function EventCTASection() {
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)
  const row3Ref = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const rows = [row1Ref.current, row2Ref.current, row3Ref.current]
    if (rows.some((r) => !r)) return

    const baseDurations = [28, 34, 26] // seconds per full loop
    const tweens: gsap.core.Tween[] = []

    rows.forEach((el, i) => {
      if (!el) return
      const isReverse = i === 1 // middle row opposite
      const start = isReverse ? -50 : 0
      const end = isReverse ? 0 : -50
      gsap.set(el, { xPercent: start })
      const tween = gsap.to(el, {
        xPercent: end,
        duration: baseDurations[i],
        ease: 'none',
        repeat: -1,
      })
      tweens.push(tween)
    })

    let lastY = window.scrollY
    let ticking = false

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const curY = window.scrollY
        const delta = Math.abs(curY - lastY)
        lastY = curY
        // boost 0 .. 3x based on scroll speed, cap
        const boost = Math.min(delta * 0.035, 3.5)
        const targetScale = 1 + boost

        tweens.forEach((t) => {
          gsap.to(t, { timeScale: targetScale, duration: 0.25, ease: 'power2.out', overwrite: true })
        })

        // ease back to 1 when scrolling stops
        gsap.delayedCall(0.35, () => {
          tweens.forEach((t) => {
            gsap.to(t, { timeScale: 1, duration: 0.8, ease: 'power2.out', overwrite: true })
          })
        })

        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      tweens.forEach((t) => t.kill())
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-white overflow-hidden py-12 md:py-16 lg:py-20 w-full"
    >
      {/* Center CTA */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex justify-center mb-6 md:mb-8 w-full">
          <Image
            src={Title}
            alt="Ai Into The Ocean"
            width={420}
            height={120}
            className="w-[280px] sm:w-[340px] md:w-[420px] h-auto object-contain max-w-full"
            priority
          />
        </div>

        <p className="font-quicksand text-[#1A5F8A] text-sm md:text-[15px] font-semibold leading-relaxed w-full mx-auto mb-7 md:mb-8 text-center text-balance">
          This event emphasizes hands-on building across the complete AI product lifecycle from raw
          ideation and cross-sector development to a secure, localized launch
        </p>

        <Link
          href="#register"
          className="inline-flex items-center gap-2 bg-[#FFA726] hover:bg-[#FF9800] text-white font-syne font-semibold text-sm md:text-[14px] px-6 md:px-7 py-2.5 rounded-full shadow-sm transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Register Now
          <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Marquee rows - w-full overflow-hidden to not affect CTA width */}
      <div className="relative mt-12 md:mt-16 lg:mt-20 w-full overflow-hidden">
        {/* Edge fade - white blur gradient */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-20 md:w-28 lg:w-40 bg-gradient-to-r from-white via-white/90 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-20 md:w-28 lg:w-40 bg-gradient-to-l from-white via-white/90 to-transparent z-10" />
        {/* optional subtle blur */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 md:w-12 bg-white/60 backdrop-blur-[2px] z-10 hidden md:block" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 md:w-12 bg-white/60 backdrop-blur-[2px] z-10 hidden md:block" />

        <div className="space-y-3 md:space-y-4 w-full overflow-hidden">
          <Row items={row1} innerRef={row1Ref} />
          <Row items={row2} reverse innerRef={row2Ref} />
          <Row items={row3} innerRef={row3Ref} />
        </div>
      </div>
    </section>
  )
}
