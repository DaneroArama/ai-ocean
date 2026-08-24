'use client'

import { useI18n } from '@/lib/i18n/provider'
import Image from 'next/image'
import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import eventTitle from '@/app/assets/Title.png'
import Shark from '@/app/assets/Mascots/Shark.png'
import Ali from '@/app/assets/Mascots/Ali.png'
import Crabi from '@/app/assets/Mascots/Crabi.png'
import Octo from '@/app/assets/Mascots/Octo.png'
import Tuto from '@/app/assets/Mascots/Tuto.png'

gsap.registerPlugin(ScrollTrigger)

const MASCOTS = [
  { name: 'Ali', src: Ali },
  { name: 'Crabi', src: Crabi },
  { name: 'Octo', src: Octo },
  { name: 'Shark', src: Shark },
  { name: 'Tuto', src: Tuto },
]

export function HeroSection() {
  const { t } = useI18n()

  const heroRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const [currentMascotIndex, setCurrentMascotIndex] = useState(0)

  useLayoutEffect(() => {
    const hero = heroRef.current
    const content = contentRef.current

    if (!hero || !content) return

    const ctx = gsap.context(() => {
      const animatedElements = gsap.utils.toArray<HTMLElement>('.hero-animate')

      /*
       * ============================================================
       * HERO INITIAL STATE
       * ============================================================
       *
       * Everything starts below the final position.
       * Rotation + scale + blur gives it that underwater/swirl feeling.
       */

      gsap.set(animatedElements, {
        opacity: 0,
        y: 90,
        scale: 0.88,
        rotation: -5,
        filter: 'blur(10px)',
      })

      /*
       * ============================================================
       * HERO ENTRANCE
       * ============================================================
       */

      gsap.to(animatedElements, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: 0,
        filter: 'blur(0px)',
        duration: 1.25,
        stagger: 0.22,
        ease: 'power3.out',
      })

      /*
       * ============================================================
       * MASCOT ENTRANCE
       * ============================================================
       */

      gsap.fromTo(
        '.hero-mascot',
        {
          opacity: 0,
          scale: 0.65,
          rotation: -25,
          y: 40,
          filter: 'blur(8px)',
        },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.4,
          delay: 0.45,
          ease: 'back.out(1.4)',
        },
      )

      /*
       * ============================================================
       * HERO → NEXT SECTION (PINNED & SCROLL-DRIVEN)
       * ============================================================
       *
       * As the user scrolls away:
       * - smaller
       * - fades
       * - rotates
       * - moves upward
       *
       * The 'pin: true' property holds the section in place for
       * the equivalent of 1 screen height (end: '+=100%').
       */

      /*
       * ============================================================
       * HERO → NEXT SECTION (PINNED & SCROLL-DRIVEN)
       * ============================================================
       */

      gsap.to(content, {
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=100%', // Determines how long the animation takes
          scrub: 1,
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
        },
        scale: 0.72,
        opacity: 0,
        y: -100,
        rotation: 6,
        filter: 'blur(8px)',
        transformOrigin: '50% 50%',
        ease: 'none',
      })
    }, hero)

    return () => {
      ctx.revert()
    }
  }, [])

  /*
   * ================================================================
   * MASCOT ROTATION
   * ================================================================
   */

  useLayoutEffect(() => {
    const mascotTimer = window.setInterval(() => {
      setCurrentMascotIndex((prev) => (prev + 1) % MASCOTS.length)
    }, 3000)

    return () => {
      window.clearInterval(mascotTimer)
    }
  }, [])

  /*
   * Animate mascot whenever the image changes.
   */

  useLayoutEffect(() => {
    const element = document.querySelector('.hero-mascot-image')

    if (!element) return

    gsap.fromTo(
      element,
      {
        opacity: 0,
        scale: 1.35,
        rotation: -8,
        x: -10,
      },
      {
        opacity: 1,
        scale: 1.5,
        rotation: 0,
        x: 0,
        duration: 0.65,
        ease: 'power3.out',
      },
    )
  }, [currentMascotIndex])

  return (
    <section ref={heroRef} className="relative z-10 min-h-screen bg-ocean-primary overflow-hidden">
      <div ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 min-h-screen flex items-center justify-center">

        <div className="text-center space-y-8 w-full flex flex-col justify-center items-center">

          {/* =====================================================
              EVENT TITLE
          ====================================================== */}

          <div className="hero-animate space-y-2">
            <Image
              src={eventTitle}
              alt="Event title"
              width={365}
              height={183}
              priority
              className="h-auto w-[280px] sm:w-[320px] md:w-[365px]"
            />
          </div>

          {/* =====================================================
              MAIN TITLE
          ====================================================== */}

          <div className="hero-animate flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            <h2 className="font-syncopate text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-wider [text-shadow:0px_0px_8.07px_rgba(0,0,0,0.25),38.93px_24.51px_8.07px_rgba(255,255,255,0.25),0px_2.88px_5.77px_rgba(77,75,75,0.25)]">
              From idea to
            </h2>

            {/* =================================================
                MASCOT
            ================================================== */}

            <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-white/90 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
              <div className="relative w-full h-full border-[5px] border-white rounded-full bg-[#FFF2CC] overflow-hidden">
                <Image
                  key={MASCOTS[currentMascotIndex].name}
                  src={MASCOTS[currentMascotIndex].src}
                  alt={`${MASCOTS[currentMascotIndex].name} character`}
                  width={96}
                  height={96}
                  className="hero-mascot-image w-full h-full object-cover object-[left_20%]"
                />
              </div>
            </div>

            <h2 className="font-syncopate text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-wider [text-shadow:0px_0px_8.07px_rgba(0,0,0,0.25),38.93px_24.51px_8.07px_rgba(255,255,255,0.25),0px_2.88px_5.77px_rgba(77,75,75,0.25)]">
              Product
            </h2>
          </div>

          {/* =====================================================
              TAGLINE
          ====================================================== */}

          <div className="hero-animate">
            <p className="font-quicksand text-xl md:text-2xl lg:text-3xl text-white font-semibold tracking-wide">
              Transforming Lives Through Giving
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}