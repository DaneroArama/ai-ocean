'use client'

import {useI18n} from '@/lib/i18n/provider'
import Image from 'next/image'
import {useLayoutEffect, useRef} from 'react'
import gsap from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'

import eventLogo from '@/app/assets/event_logo.png'
import waves from '@/app/assets/waves.png'
import starfish from '@/app/assets/Starfish.png'

gsap.registerPlugin(ScrollTrigger)

/*
 * ================================================================
 * CARD ENTRANCE DIRECTIONS
 * ================================================================
 *
 * Each card enters from a different direction.
 */

const CARD_DIRECTIONS = [
  {
    x: 0,
    y: -220,
    rotation: -14,
  },
  {
    x: 260,
    y: -180,
    rotation: 16,
  },
  {
    x: 280,
    y: 160,
    rotation: -18,
  },
  {
    x: -260,
    y: -180,
    rotation: 18,
  },
  {
    x: 0,
    y: 240,
    rotation: -12,
  },
]

export function BentoSection() {
  const {t} = useI18n()

  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const grid = gridRef.current

    if (!section || !grid) return

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.bento-card')

      /*
       * ============================================================
       * INITIAL CARD STATE
       * ============================================================
       */

      cards.forEach((card, index) => {
        const direction = CARD_DIRECTIONS[index % CARD_DIRECTIONS.length]

        gsap.set(card, {
          opacity: 0,
          x: direction.x,
          y: direction.y,
          rotation: direction.rotation,
          scale: 0.75,
          filter: 'blur(12px)',
        })
      })

      /*
       * ============================================================
       * BENTO ENTRANCE (SCROLL-DRIVEN)
       * ============================================================
       *
       * Cards fly in mapped directly to the user's scroll position.
       */

      gsap.to(cards, {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        filter: 'blur(0px)',
        stagger: 0.1,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: sectionRef.current, // Trigger from section top
          start: 'top 80%',             // Starts right as Bento enters after Hero unpins
          end: 'top 20%',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      /*
       * ============================================================
       * BENTO → NEXT SECTION (SCROLL-DRIVEN)
       * ============================================================
       *
       * The entire Bento grid dives away.
       */

      gsap.to(grid, {
        scale: 0.68,
        opacity: 0,
        y: -100,
        rotation: 7,
        filter: 'blur(10px)',

        transformOrigin: '50% 50%',
        ease: 'none',

        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          pin: true,
          pinSpacing: false,
          scrub: 1,
          invalidateOnRefresh: true,
          markers: false,
        },
      })
    }, section)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative z-20 bg-transparent overflow-x-clip min-h-screen md:min-h-screen md:h-screen flex flex-col justify-center py-10 sm:py-12 xl:py-20"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center md:h-full md:min-h-0 py-4 md:py-0">

        {/* ======================================================
            BENTO GRID
        ======================================================= */}

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-auto md:auto-rows-fr md:h-[520px] lg:h-[560px] md:min-h-0 content-center"
        >
          {/* ====================================================
              CARD 1
          ===================================================== */}

          <div className="bento-card md:col-span-2 md:row-span-1 bg-[#18CBBC33] backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-colors duration-300">
            <div className="flex flex-col items-center justify-center text-center space-y-4 h-full">
              <div className="w-20 h-20">
                <Image
                  src={starfish}
                  alt="Event icon"
                  width={80}
                  height={80}
                  className="object-contain drop-shadow-lg"
                />
              </div>

              <h3 className="font-syne text-2xl md:text-4xl font-bold text-white leading-tight">
                In-Person Sprint +
                <br />
                Virtual Ecosystem
              </h3>
            </div>
          </div>

          {/* ====================================================
              CARD 2
          ===================================================== */}

          <div className="bento-card md:col-span-1 md:row-span-1 bg-[#B8EBFF33] backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/15 transition-colors duration-300">
            <div className="flex flex-col items-center justify-center text-center space-y-3 h-full">
              <h3 className="font-syne text-5xl md:text-7xl font-bold text-white">
                10+
              </h3>

              <p className="font-syncopate text-xl md:text-4xl font-semibold text-white/90 tracking-wide">
                Mentors
              </p>

              <div className="flex -space-x-2 mt-2">
                <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white" />
                <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white" />
                <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white" />
              </div>
            </div>
          </div>

          {/* ====================================================
              CARD 3
          ===================================================== */}

          <div className="bento-card md:col-span-1 md:row-span-2 bg-[#18CBBC33] backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-colors duration-300">
            <div className="flex flex-col h-full space-y-8">
              <p className="font-quicksand text-base md:text-lg text-white/90 leading-relaxed">
                Rorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc
                vulputate libero et velit interdum, ac aliquet odio mattis.
              </p>

              <div className="flex -space-x-2">
                <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white" />
                <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white" />
                <div className="w-12 h-12 rounded-full bg-white/30 border-2 border-white" />
              </div>

              <p className="font-syncopate text-2xl md:text-3xl font-bold text-white uppercase tracking-wide">
                Speakers
                <br />
                <span className="text-5xl">4+</span>
              </p>
            </div>
          </div>

          {/* ====================================================
              CARD 4
          ===================================================== */}

          <div className="bento-card md:col-span-1 md:row-span-1 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-colors duration-300 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32">
              <Image
                src={eventLogo}
                alt="Event Logo"
                width={128}
                height={128}
                className="object-contain drop-shadow-xl"
              />
            </div>
          </div>

          {/* ====================================================
              CARD 5
          ===================================================== */}

          <div className="bento-card md:col-span-2 md:row-span-1 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-colors duration-300 relative overflow-hidden">
            <div className="relative flex flex-col justify-between h-full z-10 space-y-4">
              <h3 className="font-syncopate text-4xl font-bold text-white uppercase tracking-wide">
                October 2026
                <br />
                2-Day Event
              </h3>

              <div className="inline-flex items-center w-fit gap-2 bg-white rounded-full px-4 py-2 border border-white/30">
                <span className="font-quicksand text-base font-bold text-[#0B5D7D]">
                  Yangon, Myanmar
                </span>

                <div className="p-2 flex items-center justify-center bg-ocean-light rounded-full">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Decorative Wave */}
            <div className="absolute bottom-0 right-0 w-48 h-24 opacity-30">
              <Image
                src={waves}
                alt=""
                width={192}
                height={96}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}