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
  const [displayedWord, setDisplayedWord] = useState('idea')
  const hasSwappedRef = useRef(false)

  /* ================================================================
   * MAIN GSAP ENTRANCE & SCROLL ANIMATIONS
   * ================================================================ */
  useLayoutEffect(() => {
    const hero = heroRef.current
    const content = contentRef.current

    if (!hero || !content) return

    const ctx = gsap.context(() => {
      const animatedElements = gsap.utils.toArray<HTMLElement>('.hero-animate')

      // Set starting state
      gsap.set(animatedElements, {
        opacity: 0,
        y: 30,
        scale: 0.96,
        rotation: -2,
      })

      // HERO ENTRANCE — delay 4.5s to wait for intro splash
      gsap.to(animatedElements, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotation: 0,
        duration: 1.2,
        stagger: 0.18,
        delay: 4.5,
        ease: 'power2.out',
      })

      // WORD SWAP: "idea" → "AI"
      gsap.delayedCall(4.5 + 0.3 + 1.2, () => {
        if (hasSwappedRef.current) return
        hasSwappedRef.current = true
        const wordEl = document.getElementById('hero-word-swap')
        if (!wordEl) {
          setDisplayedWord('AI')
          return
        }

        gsap.to(wordEl, {
          y: -12,
          opacity: 0,
          duration: 0.25,
          ease: 'power1.in',
          onComplete: () => {
            setDisplayedWord('AI')
            gsap.fromTo(
              wordEl,
              { y: 12, opacity: 0, filter: 'blur(3px)' },
              {
                y: 0,
                opacity: 1,
                duration: 0.3,
                ease: 'power1.out',
                onComplete: () => gsap.set(wordEl, { clearProps: 'filter' }),
              },
            )
          },
        })
      })

      // MASCOT ENTRANCE
      gsap.fromTo(
        '.hero-mascot-container',
        {
          opacity: 0,
          scale: 0.7,
          rotation: -15,
          y: 25,
          filter: 'blur(4px)',
        },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          y: 0,
          duration: 1.2,
          delay: 4.5 + 0.3,
          ease: 'back.out(1.2)',
          onComplete: () => {
            gsap.set('.hero-mascot-container', { clearProps: 'filter' })
          },
        },
      )

      // HERO EXIT ON SCROLL
      gsap.to(content, {
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '+=100%',
          scrub: 1,
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
        },
        scale: 0.72,
        opacity: 0,
        y: -100,
        rotation: 6,
        transformOrigin: '50% 50%',
        ease: 'none',
      })
    }, hero)

    return () => ctx.revert()
  }, [])

  /* ================================================================
   * MASCOT ROTATION TIMER
   * ================================================================ */
  useLayoutEffect(() => {
    const mascotTimer = window.setInterval(() => {
      setCurrentMascotIndex((prev) => (prev + 1) % MASCOTS.length)
    }, 3000)

    return () => {
      window.clearInterval(mascotTimer)
    }
  }, [])

  /* ================================================================
   * ANIMATE MASCOT SWITCH
   * ================================================================ */
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
      {/* Underwater spotlight / light rays */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* White glow ellipse at top */}
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] md:w-[900px] md:h-[400px] rounded-full bg-white/50 blur-[80px] md:blur-[200px]" />

        <div className="hero-spotlight absolute top-[-20%] left-1/2 -translate-x-1/2 w-[140%] h-[130%] opacity-[0.12]"
          style={{
            background: `
              conic-gradient(from 200deg at 50% 0%,
                transparent 0deg,
                rgba(255,255,255,0.7) 8deg,
                transparent 16deg,
                transparent 30deg,
                rgba(255,255,255,0.5) 38deg,
                transparent 46deg,
                transparent 60deg,
                rgba(255,255,255,0.6) 66deg,
                transparent 74deg,
                transparent 90deg,
                rgba(255,255,255,0.4) 97deg,
                transparent 105deg,
                transparent 120deg,
                rgba(255,255,255,0.55) 127deg,
                transparent 135deg,
                transparent 150deg,
                rgba(255,255,255,0.45) 158deg,
                transparent 166deg,
                transparent 180deg,
                rgba(255,255,255,0.6) 186deg,
                transparent 194deg,
                transparent 210deg,
                rgba(255,255,255,0.35) 218deg,
                transparent 226deg,
                transparent 240deg,
                rgba(255,255,255,0.5) 248deg,
                transparent 256deg,
                transparent 270deg,
                rgba(255,255,255,0.4) 278deg,
                transparent 286deg,
                transparent 300deg,
                rgba(255,255,255,0.55) 308deg,
                transparent 316deg,
                transparent 360deg
              )
            `,
            filter: 'blur(18px)',
          }}
        />
        <div className="hero-caustics absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 60% 40% at 30% 20%, rgba(255,255,255,0.8) 0%, transparent 70%),
              radial-gradient(ellipse 50% 35% at 70% 35%, rgba(255,255,255,0.6) 0%, transparent 70%),
              radial-gradient(ellipse 40% 50% at 50% 60%, rgba(255,255,255,0.5) 0%, transparent 70%),
              radial-gradient(ellipse 55% 30% at 20% 70%, rgba(255,255,255,0.4) 0%, transparent 70%),
              radial-gradient(ellipse 45% 45% at 80% 80%, rgba(255,255,255,0.6) 0%, transparent 70%)
            `,
            filter: 'blur(30px)',
          }}
        />
      </div>
      <div
        ref={contentRef}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 min-h-screen flex items-center justify-center"
      >
        <div className="text-center space-y-8 w-full flex flex-col justify-center items-center">

          {/* =====================================================
              EVENT TITLE
          ====================================================== */}
          <div className="hero-animate opacity-0 will-change-[transform,filter] space-y-2">
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
          <div className="hero-animate opacity-0 will-change-[transform,filter] flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
            <h2 className="font-syncopate text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-wider [text-shadow:0px_0px_8.07px_rgba(0,0,0,0.25),38.93px_24.51px_8.07px_rgba(255,255,255,0.25),0px_2.88px_5.77px_rgba(77,75,75,0.25)]">
              From{' '}
              <span
                id="hero-word-swap"
                className="inline-flex justify-center min-w-[2.5ch] text-center will-change-[transform,filter]"
              >
                {displayedWord}
              </span>{' '}
              to
            </h2>

            {/* =================================================
                MASCOT
            ================================================== */}
            <div className="hero-mascot-container shrink-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-white/90 rounded-full flex items-center justify-center shadow-lg overflow-hidden will-change-[transform,filter]">
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
          <div className="hero-animate opacity-0 will-change-[transform,filter]">
            <p className="font-quicksand text-xl md:text-2xl lg:text-3xl text-white font-semibold tracking-wide">
              Transforming Lives Through Giving
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}