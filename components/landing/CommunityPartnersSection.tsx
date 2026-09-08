'use client'

import Image from 'next/image'
import { useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import bgAsset from '@/app/assets/bg_asset.svg'
import BridgeX from '@/app/assets/Partners/BridgeX.png'
import CCI from '@/app/assets/Partners/CCI.png'
import Ezypro from '@/app/assets/Partners/Ezypro.png'
import LetsTech from '@/app/assets/Partners/Lets Tech.png'
import PMPPO from '@/app/assets/Partners/PM PO.png'
import Riseup from '@/app/assets/Partners/Riseup.png'
import TPS from '@/app/assets/Partners/TPS.png'
import WAI from '@/app/assets/Partners/WAI.png'
import WeGrow from '@/app/assets/Partners/We Grow.png'

gsap.registerPlugin(ScrollTrigger)

const PARTNERS = [
  { name: 'WeGrow', src: WeGrow },
  { name: 'CCI', src: CCI },
  { name: 'PMPPO Learning', src: PMPPO },
  { name: 'BridgeX', src: BridgeX },
  { name: 'EzyPro', src: Ezypro },
  { name: 'RiseUp', src: Riseup },
  { name: 'WAI', src: WAI },
  { name: "Let's Tech", src: LetsTech },
  { name: 'TPS', src: TPS },
]

export function CommunityPartnersSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const title = titleRef.current
    const cards = cardsRef.current
    if (!section || !title || !cards) return

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        title,
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            once: true,
          },
        }
      )

      // Card stagger animation
      const cardElements = cards.querySelectorAll('.partner-card')
      gsap.fromTo(
        cardElements,
        { opacity: 0, y: 60, scale: 0.7, rotation: -5 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: cards,
            start: 'top 85%',
            once: true,
          },
        }
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-20 bg-linear-to-b from-[#77D2FF] to-[#00B6FD] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={bgAsset}
          alt=""
          fill
          className="object-cover"
        />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          ref={titleRef}
          className="font-syncopate text-2xl md:text-3xl lg:text-4xl font-bold text-white text-center tracking-wider mb-16 [text-shadow:0px_0px_8.07px_rgba(0,0,0,0.25)] opacity-0"
        >
          Community Partners
        </h2>

        <div ref={cardsRef} className="flex flex-wrap justify-center gap-6 md:gap-8">
          {PARTNERS.map((partner) => (
            <div
              key={partner.name}
              className="partner-card group relative w-[140px] h-[140px] md:w-[180px] md:h-[180px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg flex items-center justify-center p-4 opacity-0 cursor-pointer hover:scale-110 hover:bg-white/25 hover:shadow-2xl hover:border-white/40 hover:-translate-y-2 transition-all duration-300 ease-out"
            >
              <div className="w-full h-full bg-white rounded-xl flex items-center justify-center p-3 shadow-inner group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
                <Image
                  src={partner.src}
                  alt={`${partner.name} logo`}
                  width={120}
                  height={120}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/10 transition-all duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}