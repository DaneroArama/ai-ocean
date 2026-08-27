'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'

import Title from '@/app/assets/Title.webp'
import Wave from '@/app/assets/waves_2.webp'
import Ali from '@/app/assets/Mascots/Ali.webp'
import Crabi from '@/app/assets/Mascots/Crabi.webp'
import Octo from '@/app/assets/Mascots/Octo.webp'
import Shark from '@/app/assets/Mascots/Shark.webp'
import Tuto from '@/app/assets/Mascots/Tuto.webp'

const FLOATERS = [
  { name: 'Ali', src: Ali, className: 'left-[3%] top-[55%] w-14 md:w-24' },
  { name: 'Crabi', src: Crabi, className: 'right-[4%] top-[58%] w-12 md:w-20' },
  { name: 'Octo', src: Octo, className: 'left-[8%] top-[16%] w-12 md:w-20' },
  { name: 'Shark', src: Shark, className: 'right-[7%] top-[20%] w-14 md:w-24' },
  { name: 'Tuto', src: Tuto, className: 'left-[46%] bottom-[2%] w-12 md:w-18' },
]

const BUBBLES = [
  { left: '12%', size: 14 },
  { left: '26%', size: 10 },
  { left: '41%', size: 18 },
  { left: '58%', size: 12 },
  { left: '71%', size: 9 },
  { left: '86%', size: 16 },
]

export function IntroSplash() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [finished, setFinished] = useState(false)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const isMobile = window.innerWidth < 768

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.style.overflow = ''
          setFinished(true)
        },
      })

      // 1. Initial hidden states
      if (!isMobile) {
        tl.set('.intro-sea', { yPercent: 120 })
        tl.set('.intro-wave-img', { xPercent: -20, opacity: 1 })
      }
      tl.set('.intro-sweep', { willChange: 'transform' })
      tl.set(root, {
        scale: 1,
        rotation: 0,
        opacity: 1,
        autoAlpha: 1,
        filter: 'blur(0px)',
        willChange: 'transform, opacity, filter',
      })

        // 2. Entrance: Title & Mascots reveal
        tl.fromTo(
          '.intro-title',
          { autoAlpha: 0, scale: 0.5, y: 50, rotation: -6 },
          { autoAlpha: 1, scale: 1, y: 0, rotation: 0, duration: 0.9, ease: 'back.out(1.6)' },
        ).fromTo(
          '.intro-floater',
          { autoAlpha: 0, scale: 0, y: 30 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.13, ease: 'back.out(2)' },
          '-=0.5',
        )

        // Continuous bobbing & bubble floating
        gsap.to('.intro-bob', {
          y: -12,
          rotation: 2.5,
          duration: () => gsap.utils.random(1.6, 2.4),
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: () => gsap.utils.random(0, 0.6),
        })

        gsap.utils.toArray<HTMLElement>('.intro-bubble').forEach((bubble) => {
          gsap.fromTo(
            bubble,
            { y: 60 },
            {
              y: -window.innerHeight,
              duration: () => gsap.utils.random(3.5, 6),
              repeat: -1,
              delay: () => gsap.utils.random(0, 3),
              ease: 'none',
            },
          )
        })

        // 3. Desktop Only: Wave Flood & Sweep Sequence
        if (!isMobile) {
          tl.addLabel('flood', '+=0.3')
          tl.to('.intro-sea', { yPercent: 20, duration: 1.1, ease: 'power3.out' }, 'flood')
          tl.to('.intro-wave-img', { xPercent: 5, duration: 1.1, ease: 'sine.inOut' }, 'flood')

          tl.addLabel('wash', '+=0.1')
          tl.to(
            '.intro-sweep',
            {
              x: () => window.innerWidth * 1.3,
              y: () => -gsap.utils.random(120, 240),
              rotation: () => gsap.utils.random(-35, 35),
              duration: 1.1,
              ease: 'power2.in',
              stagger: 0.08,
            },
            'wash',
          )
          tl.to(
            '.intro-wave-img',
            { xPercent: 130, duration: 1.25, ease: 'power2.in' },
            'wash',
          )
        } else {
          // Mobile: Brief pause then fade out mascots directly before dive
          tl.to('.intro-sweep', { autoAlpha: 0, scale: 0.8, duration: 0.5, stagger: 0.04 }, '+=0.6')
        }

        tl.to('.intro-bubble', { autoAlpha: 0, duration: 0.4 }, isMobile ? '<' : 'wash')

        // 4. Underwater Swirl, Blur & Opacity Exit Effect
        tl.addLabel('dive', isMobile ? '<+=0.1' : '-=0.4')

        tl.to(
          root,
          {
            scale: 1.6,
            rotation: -12,
            yPercent: -20,
            opacity: 0,
            autoAlpha: 0,
            filter: 'blur(24px)',
            duration: 1.2,
            ease: 'power2.inOut',
          },
          'dive',
        )
      }, root)

    return () => {
      ctx.revert()
      document.documentElement.style.overflow = ''
    }
  }, [])

  if (finished) return null

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 z-[9999] overflow-hidden bg-gradient-to-b from-ocean-deep via-ocean-primary to-ocean-light origin-center transition-all"
    >
      {BUBBLES.map((bubble, index) => (
        <span
          key={index}
          className="intro-bubble absolute bottom-[-40px] rounded-full border-2 border-white/60 bg-white/20 opacity-40"
          style={{ left: bubble.left, width: bubble.size, height: bubble.size }}
        />
      ))}

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-[min(70vh,420px)] w-[min(92vw,720px)] items-center justify-center">
          <div className="intro-sweep intro-title opacity-0">
            <div className="intro-bob">
              <Image
                src={Title}
                alt="Into the AiOcean"
                preload
                width={728}
                height={182}
                className="h-auto w-[min(78vw,480px)] drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
              />
            </div>
          </div>

          {FLOATERS.map((floater) => (
            <div key={floater.name} className={`intro-floater absolute opacity-0 ${floater.className}`}>
              <div className="intro-sweep">
                <div className="intro-bob">
                  <Image src={floater.src} alt={`${floater.name} character`} preload width={96} height={96} className="h-auto w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden on mobile via Tailwind 'hidden md:block' and skipped in GSAP */}
      <div className="intro-sea pointer-events-none absolute inset-x-[-5%] bottom-0 h-[100%] hidden md:block">
        <div className="absolute inset-x-0 bottom-0 top-[15%] bg-gradient-to-b from-transparent via-ocean-primary to-ocean-deep" />
        <Image
          src={Wave}
          alt=""
          aria-hidden
          preload
          width={1000}
          height={364}
          className="intro-wave-img absolute left-0 top-[0%] w-[120%] max-w-none opacity-0"
        />
      </div>
    </div>
  )
}