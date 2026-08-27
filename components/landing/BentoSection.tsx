'use client'

import { useI18n } from '@/lib/i18n/provider'
import Image from 'next/image'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import eventLogo from '@/app/assets/event_logo.webp'
import waves from '@/app/assets/waves.webp'
import starfish from '@/app/assets/Starfish.webp'
import thinWaves from '@/app/assets/thin_waves.svg'
import { FloatingBubbles } from '@/components/landing/FloatingBubbles'

gsap.registerPlugin(ScrollTrigger)

/*
 * ================================================================
 * CARD ENTRANCE DIRECTIONS
 * ================================================================
 */

const CARD_DIRECTIONS = [
  { x: 0, y: -220, rotation: -14 },
  { x: 260, y: -180, rotation: 16 },
  { x: 280, y: 160, rotation: -18 },
  { x: -260, y: -180, rotation: 18 },
  { x: 0, y: 240, rotation: -12 },
]



export function BentoSection() {
  const { t } = useI18n()

  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const grid = gridRef.current
    if (!section || !grid) return

    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {}, section)

    // ----------------------------------------------------------------
    // DESKTOP (md+): pin + scrubbed dive-away (original intent but with pinSpacing:true)
    // ----------------------------------------------------------------
    mm.add('(min-width: 768px)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('.bento-card')

      cards.forEach((card, index) => {
        const d = CARD_DIRECTIONS[index % CARD_DIRECTIONS.length]
        gsap.set(card, {
          opacity: 0,
          x: d.x,
          y: d.y,
          rotation: d.rotation,
          scale: 0.75,
          filter: 'blur(12px)',
        })
      })

      gsap.to(cards, {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        filter: 'blur(0px)',
        stagger: 0.08,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 18%',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      gsap.to(grid, {
        scale: 0.68,
        opacity: 0,
        y: -50,
        rotation: 5,
        filter: 'blur(10px)',
        transformOrigin: '50% 50%',
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=85%',
          pin: true,
          pinSpacing: true, // <-- was false → caused overlap / missing scroll space
          scrub: 1,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      })
    })

    // ----------------------------------------------------------------
    // MOBILE (< md): NO PIN — fully scrollable, longer scrub range
    // ----------------------------------------------------------------
    mm.add('(max-width: 767px)', () => {
      const cards = gsap.utils.toArray<HTMLElement>('.bento-card')

      // softer offsets on mobile so cards don't fly off-screen
      cards.forEach((card, index) => {
        const d = CARD_DIRECTIONS[index % CARD_DIRECTIONS.length]
        gsap.set(card, {
          opacity: 0,
          x: d.x * 0.35,
          y: d.y * 0.55,
          rotation: d.rotation * 0.6,
          scale: 0.82,
          filter: 'blur(10px)',
        })
      })

      // entrance mapped to scroll but with generous range so user can actually scroll through it
      gsap.to(cards, {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        filter: 'blur(0px)',
        stagger: 0.06,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 88%',
          end: 'top -5%',
          scrub: 0.9,
          invalidateOnRefresh: true,
        },
      })

      // on mobile, grid fades/slides away WITHOUT pinning — won't lock scroll
      gsap.to(grid, {
        opacity: 0.0,
        scale: 0.94,
        y: -32,
        filter: 'blur(6px)',
        ease: 'none',
        scrollTrigger: {
          trigger: grid,
          start: 'bottom 82%',
          end: 'bottom 18%',
          scrub: 0.9,
          invalidateOnRefresh: true,
        },
      })
    })

    return () => {
      mm.revert()
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative z-20 bg-transparent overflow-x-clip overflow-y-visible flex flex-col justify-center
                 py-16 sm:py-20 md:py-24 lg:py-28
                 pb-28 sm:pb-36 md:pb-48
                 min-h-[auto] md:min-h-screen"
    >
      {/* ======================================================
          BUBBLES — floating to top + pop, top/middle only via FloatingBubbles
      ======================================================= */}
      <FloatingBubbles
        count={24}
        className="inset-x-0 top-0 h-[60%] z-0"
        sizeRange={[9, 38]}
        durationRange={[5.5, 11]}
        opacityRange={[0.28, 0.6]}
        pop
      />

      {/* ======================================================
          BENTO CONTENT
      ======================================================= */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div
          ref={gridRef}
          className="grid auto-rows-auto content-center grid-cols-1 gap-4 md:grid-cols-4 md:gap-6 md:auto-rows-fr md:h-[520px] lg:h-[560px] md:min-h-0"
        >
          {/* CARD 1 */}
          <div className="bento-card md:col-span-2 md:row-span-1 bg-[#18CBBC33] backdrop-blur-sm rounded-4xl p-8 border border-white/20 transition-colors duration-300">
            <div className="flex flex-col items-center justify-center text-center space-y-4 h-full">
              <div className="w-20 h-20">
                <Image src={starfish} alt="Event icon" width={80} height={80} className="object-contain drop-shadow-lg" />
              </div>
              <h3 className="font-syne text-2xl md:text-4xl font-bold text-white leading-tight">
                In-Person Sprint +<br />
                Virtual Ecosystem
              </h3>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="bento-card md:col-span-1 md:row-span-1 bg-[#B8EBFF33] backdrop-blur-md rounded-4xl border border-white/20 transition-colors duration-300 p-8 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center space-y-3 h-full">
              <h3 className="font-syne text-5xl md:text-7xl font-bold text-white">10+</h3>
              <p className="font-syncopate text-xl md:text-4xl font-semibold text-white/90 tracking-wide">Mentors</p>
              <div className="flex -space-x-2 mt-2">
                <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white" />
                <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white" />
                <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white" />
              </div>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="bento-card md:col-span-1 md:row-span-2 bg-[#18CBBC33] backdrop-blur-md rounded-4xl p-8 border border-white/20 transition-colors duration-300">
            <div className="flex flex-col h-full space-y-8">
              <p className="font-quicksand text-base md:text-lg text-white/90 leading-relaxed">
                Rorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.
              </p>
              <div className="flex -space-x-2">
                <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white" />
                <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white" />
                <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white" />
              </div>
              <p className="font-syncopate text-2xl md:text-3xl font-bold text-white uppercase tracking-wide">
                Speakers<br />
                <span className="text-5xl">4+</span>
              </p>
            </div>
          </div>

          {/* CARD 4 */}
          <div className="bento-card md:col-span-1 md:row-span-1 bg-white/10 backdrop-blur-md rounded-4xl p-8 border border-white/20 transition-colors duration-300 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32">
              <Image src={eventLogo} alt="Event Logo" width={128} height={128} className="object-contain drop-shadow-xl" />
            </div>
          </div>

          {/* CARD 5 */}
          <div className="bento-card md:col-span-2 md:row-span-1 bg-white/10 backdrop-blur-md rounded-4xl p-8 border border-white/20 transition-colors duration-300 relative overflow-hidden">
            <div className="relative flex flex-col justify-between h-full z-10 space-y-4">
              <h3 className="font-syncopate text-4xl font-bold text-white uppercase tracking-wide">
                October 2026<br />
                2-Day Event
              </h3>
              <div className="inline-flex items-center w-fit gap-2 bg-white rounded-full px-4 py-2 border border-white/30">
                <span className="font-quicksand text-base font-bold text-[#0B5D7D]">Yangon, Myanmar</span>
                <div className="p-2 flex items-center justify-center bg-ocean-light rounded-full">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-48 h-24 opacity-30">
              <Image src={waves} alt="" width={192} height={96} className="object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          THIN WAVES — bottom divider, sits just below bento
      ======================================================= */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-full z-[5] translate-y-[1px] select-none"
        aria-hidden="true"
      >
        <Image
          src={thinWaves}
          alt=""
          width={1280}
          height={112}
          className="h-auto w-full object-cover opacity-90"
          priority={false}
          draggable={false}
        />
      </div>
    </section>
  )
}
