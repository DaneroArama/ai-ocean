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

import wavesImg from '@/app/assets/waves.png'
import Sharkie from '@/app/assets/Mascots GIF/Sharkie.gif'
import Octo from '@/app/assets/Mascots GIF/Octo.gif'
import Crabbi from '@/app/assets/Mascots GIF/Crabbi.gif'
import Croco from '@/app/assets/Mascots GIF/Croco.gif'
import Turtle from '@/app/assets/Mascots GIF/Turtle.gif'

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
  const sponsorshipRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const title = titleRef.current
    const cards = cardsRef.current
    const sponsorship = sponsorshipRef.current
    if (!section || !title || !cards || !sponsorship) return

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

      // Sponsorship card animation
      gsap.fromTo(
        sponsorship,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: sponsorship,
            start: 'top 85%',
            once: true,
          },
        }
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <>
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

        <div ref={cardsRef} className="flex flex-wrap justify-center gap-6 md:gap-8 mb-16">
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
      {/* Become Sponsorship Card */}
      <div className="bg-white">
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-20">
          <div ref={sponsorshipRef} className="sponsorship-card relative overflow-hidden rounded-xl bg-[#1B7A93] p-8 md:p-12 min-h-[320px] md:min-h-[380px]">
            <div className="relative z-10 my-auto max-w-lg">
              <p className="text-white text-base md:text-2xl font-syncopate font-bold mb-2">Become</p>
              <h3 className="text-white text-2xl md:text-5xl lg:text-6xl font-black uppercase tracking-wider mb-4">
                Sponsorship
              </h3>
              <p className="text-white text-sm md:text-lg mb-8 font-syne font-bold leading-relaxed">
                We value the support of our sponsors and offer various partnership levels
              </p>
              <a
                href="https://forms.gle/eJRq2tuVDW793MDQ9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#FFB800] hover:bg-[#FFA500] text-white font-syne font-bold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Apply now
                <span className="text-xl">→</span>
              </a>
            </div>

            {/* Wave and Mascots */}
            <div className="absolute right-0 bottom-0 top-0 w-full md:w-2/5 flex items-end justify-end pointer-events-none">
              <Image
                src={wavesImg}
                alt=""
                className="w-[800px] h-auto object-cover absolute -bottom-4 -right-20"
                priority
              />
              <div className="md:block hidden">
                {/* Floating Mascots */}
                <div className="absolute top-8 right-[15%] w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#FFF2CC] shadow-lg flex items-center justify-center p-1 border-2 border-white animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
                  <Image src={Sharkie} alt="Sharkie mascot" className="w-full h-full object-contain" />
                </div>
                <div className="absolute top-20 right-[35%] w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#FFF2CC] shadow-lg flex items-center justify-center p-1 border-2 border-white animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}>
                  <Image src={Octo} alt="Octopus mascot" className="w-full h-full object-contain" />
                </div>
                <div className="absolute top-12 right-[55%] w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#FFF2CC] shadow-lg flex items-center justify-center p-1 border-2 border-white animate-bounce" style={{ animationDelay: '1s', animationDuration: '2.8s' }}>
                  <Image src={Crabbi} alt="Crab mascot" className="w-full h-full object-contain" />
                </div>
                <div className="absolute top-32 right-[10%] w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#FFF2CC] shadow-lg flex items-center justify-center p-1 border-2 border-white animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.2s' }}>
                  <Image src={Croco} alt="Croco mascot" className="w-full h-full object-contain" />
                </div>
                <div className="absolute top-32 right-[50%] w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#FFF2CC] shadow-lg flex items-center justify-center p-1 border-2 border-white animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3.2s' }}>
                  <Image src={Turtle} alt="Croco mascot" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
  )
}