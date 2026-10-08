'use client'

import Image from 'next/image'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import waves from '@/app/assets/waves.png'
import starfish from '@/app/assets/Starfish.png'
import colouredLogo from '@/app/assets/event_logo_light_coloured.png'
import thinWaves from '@/app/assets/thin_waves.svg'

import ali from '@/app/assets/Mascots/Ali.png'
import shark from '@/app/assets/Mascots/Shark.png'
import crabi from '@/app/assets/Mascots/Crabi.png'
import octo from '@/app/assets/Mascots/Octo.png'
import tuto from '@/app/assets/Mascots/Tuto.png'

const MASCOTS = [
  { src: tuto, alt: 'Tuto mascot' },
  { src: shark, alt: 'Shark mascot' },
  { src: crabi, alt: 'Crabi mascot' },
  { src: octo, alt: 'Octo mascot' },
  { src: ali, alt: 'Ali mascot' },
]

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
  { x: 200, y: 200, rotation: 10 },
]



export function BentoSection() {
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
        })
      })

      gsap.to(cards, {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
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
        transformOrigin: '50% 50%',
        ease: 'power1.inOut',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=100%',
          pin: true,
          pinSpacing: true,
          scrub: 1.2,
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
        })
      })

      // entrance mapped to scroll but with generous range so user can actually scroll through it
      gsap.to(cards, {
        opacity: 1,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
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
          BENTO CONTENT
      ======================================================= */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1256px] flex-1 flex-col justify-center px-4 pt-0 pb-6 md:pt-0 md:pb-10">
        <div
          ref={gridRef}
          className="grid auto-rows-auto content-center grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[0.92fr_0.94fr_1.14fr_1fr] md:gap-6 lg:h-[594px] lg:grid-rows-[244fr_65fr_237fr] md:min-h-0"
        >
          {/* CARD 1 — Buildathon Teams */}
          <div className="bento-card lg:col-start-1 lg:row-start-1 lg:col-span-2 bg-[#18CBBC33] backdrop-blur-sm rounded-[40px] p-6 md:p-[30px] lg:pt-9 lg:pb-[30px] transition-colors duration-300 glass-corners">
            <div className="flex h-full flex-col justify-between gap-5">
              <div className="space-y-2">
                <h3 className="font-dela-gothic-one text-2xl lg:text-[clamp(24px,2.5vw,32px)] text-white leading-tight">
                  Buildathon Teams
                </h3>
                <p className="font-quicksand text-base lg:text-lg text-white">
                  Participating teams will be announced soon.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center -space-x-3">
                  {MASCOTS.map((m) => (
                    <div
                      key={m.alt}
                      className="relative w-12 h-12 lg:w-[60px] lg:h-[60px] rounded-full bg-white p-1 shrink-0 overflow-hidden border-4 border-[#39BDD9]"
                    >
                      <Image src={m.src} alt={m.alt} width={48} height={48} className="w-full h-full object-contain scale-[1.65] origin-[50%_35%]" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-white/15 border border-white/15 rounded-full pl-[18px] pr-2 py-2">
                  <span className="font-quicksand text-base font-semibold text-white whitespace-nowrap">Coming Soon</span>
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white">
                    <svg className="w-3 h-3 text-ocean-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2 — Panelists */}
          <div className="bento-card lg:col-start-3 lg:row-start-1 bg-[#B8EBFF33] backdrop-blur-md rounded-[40px] p-6 md:p-[30px] transition-colors duration-300 glass-corners">
            <div className="flex flex-col h-full justify-between gap-3">
              <p className="font-quicksand text-base lg:text-lg text-white leading-relaxed">
                Different perspectives.
                <br />
                One shared conversation.
              </p>
              <div>
                <h3 className="font-dela-gothic-one text-2xl lg:text-[clamp(24px,2.5vw,32px)] text-white">Panelists</h3>
                <p className="font-dela-gothic-one text-5xl lg:text-[56px] text-white leading-none mt-5">20</p>
              </div>
            </div>
          </div>

          {/* CARD 3 — Speakers */}
          <div className="bento-card lg:col-start-4 lg:row-start-1 lg:row-span-2 bg-[#18CBBC33] backdrop-blur-md rounded-[40px] p-6 md:p-[30px] transition-colors duration-300 glass-corners">
            <div className="flex flex-col h-full justify-between gap-4">
              <p className="font-quicksand text-base lg:text-lg text-white leading-relaxed">
                Industry experts and practitioners sharing real-world insights the future of human-AI collaboration
              </p>
              <div>
                <h3 className="font-dela-gothic-one text-2xl lg:text-[clamp(24px,2.5vw,32px)] text-white">Speakers</h3>
                <p className="font-dela-gothic-one text-5xl lg:text-[56px] text-white leading-none mt-5">9</p>
              </div>
            </div>
          </div>

          {/* CARD 4 — Judges */}
          <div className="bento-card lg:col-start-1 lg:row-start-2 lg:row-span-2 bg-[#B8EBFF33] backdrop-blur-md rounded-[40px] p-6 md:p-[30px] transition-colors duration-300 flex flex-col glass-corners">
            <div className="flex flex-col h-full justify-between gap-4">
              <Image src={colouredLogo} alt="" width={140} height={140} className="object-contain w-[140px] h-[140px] -ml-2 -mt-2" />
              <div>
                <h3 className="font-dela-gothic-one text-2xl lg:text-[clamp(24px,2.5vw,32px)] text-white">Judges</h3>
                <p className="font-dela-gothic-one text-5xl lg:text-[56px] text-white leading-none mt-5">7</p>
              </div>
            </div>
          </div>

          {/* CARD 5 — 2026 Multi-Phase Buildathon */}
          <div className="bento-card relative lg:col-start-2 lg:row-start-2 lg:col-span-2 lg:row-span-2 bg-[#2FA0E855] backdrop-blur-md rounded-[40px] transition-colors duration-300 overflow-hidden glass-corners">
            <div className="absolute bottom-0 right-0 z-0">
              <Image src={waves} alt="" width={500} height={500} className="object-contain w-[300px] lg:w-[470px] h-auto" />
            </div>
            <div className="relative z-10 flex flex-col justify-start h-full gap-2 p-6 md:p-[30px] lg:pt-11">
              <h3 className="font-dela-gothic-one text-2xl lg:text-[clamp(24px,2.5vw,32px)] text-white leading-[1.45] mb-5">
                2026
                <br />
                Multi-Phase Buildathon
              </h3>
              <div className="inline-flex items-center w-fit gap-2 bg-white rounded-full px-4 py-2 border border-white/30">
                <span className="font-quicksand text-sm md:text-base font-semibold text-[#0B5D7D]">In Person at CTZPay Office</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-[42px] h-[42px] rounded-full border border-white/15 bg-white/15 text-white text-xl font-semibold leading-none">
                  +
                </span>
                <div className="inline-flex items-center gap-2 bg-white/15 border border-white/15 rounded-full pl-[18px] pr-2 py-2">
                  <span className="font-quicksand text-sm md:text-base font-semibold text-white">Online</span>
                  <div className="w-6 h-6 flex items-center justify-center bg-white rounded-full">
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M5.44523 4.82149C5.44522 4.63319 5.59786 4.48056 5.78615 4.48056L9.64334 4.48054C9.8316 4.48057 9.98423 4.6332 9.98426 4.82146L9.98426 8.67867C9.98423 8.86693 9.8316 9.01957 9.64334 9.0196C9.45503 9.01958 9.30238 8.86694 9.30237 8.67863L9.30239 5.64456L5.06293 9.88401C4.92979 10.0172 4.71393 10.0172 4.58079 9.88401C4.44765 9.75087 4.44765 9.53501 4.58079 9.40187L8.82024 5.16241L5.78615 5.16241C5.59786 5.16242 5.44522 5.00978 5.44523 4.82149Z" fill="#02A4E3"/>
                    </svg>
                </div>
              </div>
            </div>
          </div>
          </div>

          {/* CARD 6 — Mentors */}
          <div className="bento-card relative lg:col-start-4 lg:row-start-3 bg-[#B8EBFF33] backdrop-blur-md rounded-[40px] transition-colors duration-300 p-6 md:p-[30px] glass-corners">
            <div className="flex flex-col h-full justify-center gap-5">
              <h3 className="font-dela-gothic-one text-2xl lg:text-[clamp(24px,2.5vw,32px)] text-white">Mentors</h3>
              <p className="font-dela-gothic-one text-5xl lg:text-[56px] text-white leading-none">20+</p>
            </div>
            <Image
              src={starfish}
              alt=""
              width={120}
              height={120}
              className="pointer-events-none absolute -bottom-8 -right-10 w-28 h-28 lg:w-[140px] lg:h-[140px] object-contain"
            />
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
