'use client'

import Image from 'next/image'
import { useState, useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// Import mascot images
import Shark from '@/app/assets/Mascots/Shark.png'
import Ali from '@/app/assets/Mascots/Ali.png'
import Crabi from '@/app/assets/Mascots/Crabi.png'
import Octo from '@/app/assets/Mascots/Octo.png'
import Tuto from '@/app/assets/Mascots/Tuto.png'
import eventTitle from '@/app/assets/Title.png'
import eventLogo from '@/app/assets/event_logo.png'

// Character data with unique background colors
const characters = [
  {
    id: 'shark',
    name: 'Sharkie the Catalyst',
    image: Shark,
    quote: 'Progress comes from action.',
    bio: 'Sharkie wants to see things move.\n\nSharkie learns by doing, trying things out, and adjusting along the way. By the time a discussion reaches a conclusion, Sharkie is usually a step past it.\n\nNot every path is clear from the beginning, but Sharkie knows that waiting forever means missing the moment.\n\nWhen a team feels stuck, Sharkie gets things moving, makes decisions, and helps everyone ride the wave forward.',
    traits: ['Bold', 'Driven', 'Decisive'],
    bgLeft: 'from-[#31C7FF] to-[#18AAE6]',
    bgRight: 'bg-[#2389B3]'
  },
  {
    id: 'ali',
    name: 'Ali the Architect',
    image: Ali,
    quote: 'Structure enables creativity.',
    bio: 'Ali believes in building strong foundations.\n\nAli designs systems that scale, plans ahead, and thinks about long-term impact. Every decision is measured, every structure is intentional.\n\nWhen complexity grows, Ali brings clarity through careful architecture and thoughtful design.\n\nAli helps teams build things that last, with systems that can evolve and adapt over time.',
    traits: ['Strategic', 'Thoughtful', 'Systematic'],
    bgLeft: 'from-[#46D227] to-[#2D9A16]',
    bgRight: 'bg-[#21750F]'
  },
  {
    id: 'crabi',
    name: 'Crabi the Guardian',
    image: Crabi,
    quote: 'Protection is my priority.',
    bio: 'Crabi keeps everything safe and secure.\n\nCrabi thinks about edge cases, potential risks, and what could go wrong. When others move fast, Crabi asks the hard questions.\n\nSecurity, reliability, and stability are not just features—they are foundations.\n\nWhen the team needs protection from mistakes or vulnerabilities, Crabi is there with strong defenses and careful testing.',
    traits: ['Protective', 'Cautious', 'Reliable'],
    bgLeft: 'from-[#F98156] to-[#D6420D]',
    bgRight: 'bg-[#7D280A]'
  },
  {
    id: 'octo',
    name: 'Octo the Orchestrator',
    image: Octo,
    quote: 'Everything works better together.',
    bio: 'Octo connects all the pieces.\n\nOcto sees how things fit together, manages multiple streams at once, and ensures nothing falls through the cracks.\n\nWith eight arms, Octo can handle complexity, coordinate teams, and keep everything synchronized.\n\nWhen projects get complicated, Octo brings order, coordination, and makes sure everyone is moving in harmony.',
    traits: ['Organized', 'Coordinated', 'Efficient'],
    bgLeft: 'from-[#9928EA] to-[#7117B2]',
    bgRight: 'bg-[#43096B]'
  },
  {
    id: 'tuto',
    name: 'Tuto the Mentor',
    image: Tuto,
    quote: 'Knowledge grows when shared.',
    bio: 'Tuto loves teaching and helping others learn.\n\nTuto breaks down complex concepts, shares wisdom, and guides newcomers through their journey.\n\nExperience is valuable, but passing it on is even more powerful.\n\nWhen someone is stuck, Tuto provides guidance with patience, clarity, and encouragement. Learning never stops, and neither does Tuto.',
    traits: ['Wise', 'Patient', 'Supportive'],
    bgLeft: 'from-[#94AD0F] to-[#67780E]',
    bgRight: 'bg-[#4B5808]'
  }
]

// Helper to map Tailwind gradient classes to hex colors
const colorMap: Record<string, [string, string]> = {
  'from-[#31C7FF] to-[#18AAE6]': ['#31C7FF', '#18AAE6'],
  'from-[#46D227] to-[#2D9A16]': ['#46D227', '#2D9A16'],
  'from-[#F98156] to-[#D6420D]': ['#F98156', '#D6420D'],
  'from-[#9928EA] to-[#7117B2]': ['#9928EA', '#7117B2'],
  'from-[#94AD0F] to-[#67780E]': ['#94AD0F', '#67780E']
}

function extractHexColor(bgRight: string) {
  const match = bgRight.match(/\[([^\]]+)\]/)
  return match ? match[1] : '#2389B3'
}

/**
 * Single character slide - full viewport section
 */
function CharacterSlide({ character }: { character: typeof characters[number] }) {
  const sectionRef = useRef<HTMLElement>(null)
  const characterImageRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const bioRef = useRef<HTMLDivElement>(null)
  const bioContentRef = useRef<HTMLParagraphElement>(null)
  const traitsRef = useRef<HTMLDivElement>(null)
  const trapeziumRef = useRef<SVGSVGElement>(null)
  const leftBgRef = useRef<HTMLDivElement>(null)
  const scrollbarThumbRef = useRef<HTMLDivElement>(null)
  const scrollbarTrackRef = useRef<HTMLDivElement>(null)
  const isDraggingScrollbarRef = useRef(false)
  const hasAnimatedRef = useRef(false)

  const [scrollTop, setScrollTop] = useState(0)
  const [isScrollbarDragging, setIsScrollbarDragging] = useState(false)

  const bgRightColor = extractHexColor(character.bgRight)
  const [startColor, endColor] = colorMap[character.bgLeft] || ['#02A4E3', '#0045A1']

  // Animate in when scrolled into view
  const animateIn = useCallback(() => {
    if (hasAnimatedRef.current) return
    hasAnimatedRef.current = true

    if (characterImageRef.current) {
      gsap.fromTo(
        characterImageRef.current,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.55, ease: 'power3.out', overwrite: 'auto' }
      )
    }

    if (quoteRef.current) {
      gsap.fromTo(
        quoteRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, delay: 0.25, ease: 'back.out(1.7)', overwrite: 'auto' }
      )
    }

    if (nameRef.current) {
      gsap.fromTo(
        nameRef.current,
        { y: -24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.15, overwrite: 'auto' }
      )
    }

    if (bioContentRef.current) {
      gsap.fromTo(
        bioContentRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.22, overwrite: 'auto' }
      )
    }

    if (traitsRef.current) {
      gsap.fromTo(
        traitsRef.current,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.28, overwrite: 'auto' }
      )
      const items = traitsRef.current.querySelectorAll('.trait-item')
      if (items.length) {
        gsap.fromTo(
          items,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, stagger: 0.07, delay: 0.35, ease: 'back.out(1.4)', overwrite: 'auto' }
        )
      }
    }

    if (trapeziumRef.current) {
      const mainPoly = trapeziumRef.current.querySelector('polygon[data-main]') as SVGPolygonElement | null
      if (mainPoly) {
        gsap.fromTo(mainPoly, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.inOut', overwrite: 'auto' })
      }
      const gradient = trapeziumRef.current.querySelector('linearGradient')
      if (gradient) {
        gsap.fromTo(gradient, { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'power2.inOut', overwrite: 'auto' })
      }
    }

    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0.85 },
        { opacity: 1, duration: 0.6, ease: 'power2.inOut', overwrite: 'auto' }
      )
    }
  }, [])

  // ScrollTrigger to animate on scroll into view
  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const trigger = ScrollTrigger.create({
      trigger: node,
      start: 'top 80%',
      once: true,
      onEnter: () => animateIn(),
    })

    return () => {
      trigger.kill()
    }
  }, [animateIn])

  // Bio scrollbar handlers
  const handleBioScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isDraggingScrollbarRef.current) return
    const target = e.currentTarget
    const maxScroll = target.scrollHeight - target.clientHeight
    const scrollPercentage = maxScroll > 0 ? target.scrollTop / maxScroll : 0
    setScrollTop(scrollPercentage)
  }

  const updateBioScrollFromPosition = (clientY: number) => {
    const track = scrollbarTrackRef.current
    const bio = bioRef.current
    if (!track || !bio) return
    const rect = track.getBoundingClientRect()
    const y = clientY - rect.top
    const percentage = Math.max(0, Math.min(1, y / rect.height))
    const maxScroll = bio.scrollHeight - bio.clientHeight
    if (maxScroll <= 0) return
    bio.scrollTop = percentage * maxScroll
    setScrollTop(percentage)
  }

  const handleScrollbarThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDraggingScrollbarRef.current = true
    setIsScrollbarDragging(true)
  }

  const handleScrollbarThumbTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    isDraggingScrollbarRef.current = true
    setIsScrollbarDragging(true)
  }

  const handleScrollbarTrackMouseDown = (e: React.MouseEvent) => {
    if (e.target === scrollbarThumbRef.current || scrollbarThumbRef.current?.contains(e.target as Node)) return
    updateBioScrollFromPosition(e.clientY)
    isDraggingScrollbarRef.current = true
    setIsScrollbarDragging(true)
  }

  const handleScrollbarTrackTouchStart = (e: React.TouchEvent) => {
    updateBioScrollFromPosition(e.touches[0].clientY)
    isDraggingScrollbarRef.current = true
    setIsScrollbarDragging(true)
  }

  useEffect(() => {
    if (!isScrollbarDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingScrollbarRef.current) return
      e.preventDefault()
      updateBioScrollFromPosition(e.clientY)
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingScrollbarRef.current) return
      updateBioScrollFromPosition(e.touches[0].clientY)
    }
    const handleEnd = () => {
      isDraggingScrollbarRef.current = false
      setIsScrollbarDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: false })
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleEnd)

    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleEnd)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isScrollbarDragging])

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-[100svh] md:h-screen md:min-h-screen bg-gradient-to-b ${character.bgLeft} overflow-hidden transition-colors duration-700 flex flex-col justify-center py-6 md:py-0`}
    >
      <div className="relative w-full h-auto md:h-full flex-1 md:flex-none flex items-center py-0 md:py-0 md:min-h-0">
        <div className="w-full h-auto md:h-full flex flex-col md:flex-row relative md:min-h-0">

          {/* LEFT SIDE - Character & Quote */}
          <div
            ref={leftBgRef}
            className={`flex-none md:flex-1 md:h-full md:min-h-0 relative flex flex-col items-center justify-center p-4 md:p-8 transition-all duration-700 ease-in-out z-20 min-h-[320px] md:min-h-0 py-20 md:py-0`}
          >
            {/* Event Title */}
            <div className="absolute top-4 left-8">
              <Image
                src={eventTitle}
                alt="AI Ocean Into The"
                width={200}
                height={100}
                className="h-auto w-32 md:w-48"
              />
            </div>

            {/* Quote Bubble */}
            <div
              ref={quoteRef}
              className="relative w-full max-w-[260px] md:max-w-[380px] flex items-center justify-center"
            >
              <svg
                viewBox="0 0 349 149"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto drop-shadow-2xl"
                aria-hidden="true"
              >
                <path
                  d="M324.159 16.2022C294.049 2.66519 68.666 -2.74082 27.6116 16.2022C-2.49852 30.0962 -1.58671 105.621 27.6116 118.09C47.1668 126.441 151.858 129.358 231.485 127.462C244.527 134.06 257.571 140.657 270.613 147.255C269.535 140.216 268.905 133.167 268.721 126.116C290.975 124.979 308.602 123.341 317.776 121.223C359.75 111.531 354.269 29.7402 324.159 16.2022Z"
                  fill={bgRightColor}
                  stroke={bgRightColor}
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-700"
                />
                <path
                  d="M319.789 13.2632C289.679 -0.273779 64.2963 -5.67978 23.242 13.2632C-6.86815 27.1572 -5.95634 102.682 23.242 115.151C42.7972 123.502 147.488 126.419 227.115 124.523C240.157 131.121 253.202 137.719 266.244 144.316C265.165 137.277 264.535 130.228 264.351 123.177C286.603 122.04 304.232 120.402 313.407 118.284C355.383 108.593 349.902 26.8012 319.789 13.2632Z"
                  fill="#FDFFFA"
                  stroke={bgRightColor}
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-700"
                />
                <path
                  d="M19.4683 32.3252C20.9307 29.2332 22.5034 26.1282 25.4309 23.1982C28.3584 20.2682 32.733 17.4972 38.9953 15.5202C45.7698 13.3812 54.2758 12.3002 62.5742 11.2622"
                  stroke={bgRightColor}
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-700"
                />
                <path
                  d="M88.2798 9.02412C97.6104 8.53312 107.054 8.37511 116.456 8.55211"
                  stroke={bgRightColor}
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-700"
                />
                <path
                  d="M286.814 115.548C298.496 114.375 307.796 110.715 313.095 106.484C318.395 102.253 320.152 97.4832 320.879 92.7822"
                  stroke={bgRightColor}
                  strokeWidth="2"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-700"
                />
              </svg>
              <p className="absolute inset-0 flex items-center justify-center px-8 md:px-10 pb-6 font-quicksand text-base md:text-lg text-gray-800 text-center font-medium leading-snug">
                &#34;{character.quote}&#34;
              </p>
            </div>

            {/* Character Image */}
            <div ref={characterImageRef} className="relative z-10">
              <Image
                src={character.image}
                alt={character.name}
                width={400}
                height={400}
                className="w-44 h-44 md:w-96 md:h-96 object-contain drop-shadow-2xl"
                draggable={false}
              />
            </div>
          </div>

          {/* FLOATING TRAPEZIUM SHAPE */}
          <svg
            ref={trapeziumRef}
            className="hidden md:block absolute top-0 right-0 h-full w-3/5 z-10 transition-all duration-700 ease-in-out"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`gradient-${character.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={startColor} />
                <stop offset="100%" stopColor={endColor} />
              </linearGradient>
            </defs>
            <polygon
              data-main
              points="15,0 100,0 100,100 8,100"
              fill={bgRightColor}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id={`line-gradient-${character.id}`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor={startColor} />
                <stop offset="100%" stopColor={endColor} />
              </linearGradient>
            </defs>
            <polygon
              points="13,0 16,0 8,100 7,100"
              fill={`url(#line-gradient-${character.id})`}
              className="transition-all duration-700"
            />
          </svg>

          {/* RIGHT SIDE CONTENT */}
          <div className="flex-none w-full md:w-[52%] lg:w-5/9 h-auto md:h-full md:min-h-0 md:self-stretch relative flex flex-col justify-center p-6 md:p-10 md:pl-14 lg:pl-20 z-20 shrink-0 rounded-4xl md:rounded-none -mt-6 md:mt-0">
            {/* Character As Background */}
            <div className="absolute z-0 right-[-20%]">
              <Image
                src={character.image}
                alt={character.name}
                width={400}
                height={400}
                className="w-64 h-64 md:w-full md:h-200 object-contain opacity-20 pointer-events-none"
                draggable={false}
              />
            </div>

            {/* Mobile solid bg */}
            <div className="absolute inset-0 md:hidden rounded-t-[2rem] -z-10 transition-colors duration-700" style={{ backgroundColor: bgRightColor }} aria-hidden="true" />

            {/* Character Name */}
            <h2
              ref={nameRef}
              className="font-syne text-3xl md:text-5xl lg:text-6xl font-bold text-white uppercase mb-6 md:mb-8 min-h-[48px] md:min-h-[72px] lg:min-h-[80px] flex items-center leading-tight"
            >
              {character.name}
            </h2>

            {/* Bio */}
            <div className="flex-none h-[190px] md:h-[220px] lg:h-[260px] relative mb-6 md:mb-8 flex" data-lenis-prevent>
              <div
                ref={bioRef}
                onScroll={handleBioScroll}
                className="flex-1 h-full overflow-y-auto pr-12 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <p
                  ref={bioContentRef}
                  className="font-quicksand text-sm md:text-base lg:text-lg text-white/90 leading-relaxed whitespace-pre-line"
                >
                  {character.bio}
                </p>
              </div>

              {/* Single-line Scrollbar */}
              <div className="absolute top-0 right-0 w-8 h-full flex flex-col items-center py-1 select-none">
                <div
                  ref={scrollbarTrackRef}
                  onMouseDown={handleScrollbarTrackMouseDown}
                  onTouchStart={handleScrollbarTrackTouchStart}
                  className="flex-1 w-[20px] flex justify-center relative cursor-pointer touch-none"
                >
                  <div className="w-[2px] h-full bg-white/30 rounded-full" />
                  <div
                    ref={scrollbarThumbRef}
                    onMouseDown={handleScrollbarThumbMouseDown}
                    onTouchStart={handleScrollbarThumbTouchStart}
                    className={`absolute left-1/2 w-7 h-7 -ml-[14px] transition-none will-change-transform cursor-grab active:cursor-grabbing touch-none ${isScrollbarDragging ? 'scale-110' : 'hover:scale-105'} select-none`}
                    style={{
                      top: `${scrollTop * 100}%`,
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <Image
                      src={eventLogo}
                      alt="Scroll indicator"
                      width={28}
                      height={28}
                      className="object-contain w-7 h-7 drop-shadow-md pointer-events-none"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Traits */}
            <div ref={traitsRef} className="relative flex-none h-[170px] md:h-[180px]">
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-t-2xl px-6 py-2 border-t border-l border-r border-white/30">
                <h3 className="font-syne text-lg md:text-xl font-bold text-white uppercase">
                  Traits
                </h3>
              </div>

              <div className="bg-black/30 backdrop-blur-sm rounded-r-2xl rounded-bl-2xl p-6 border border-white/20 -mt-px">
                <div className="flex flex-wrap gap-4">
                  {character.traits.map((trait, index) => (
                    <div
                      key={index}
                      className="trait-item flex flex-col items-center gap-2"
                    >
                      <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50">
                        {index === 0 && (
                          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                        {index === 1 && (
                          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                          </svg>
                        )}
                        {index === 2 && (
                          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="font-syne text-base font-semibold text-white">
                        {trait}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
    </section>
  )
}

/**
 * Character Introduction Section
 *
 * Features:
 * - Vertically scrollable full-viewport sections per character
 * - Each section: left character + quote, right name + bio + traits
 * - Scroll-triggered GSAP entrance animations
 * - Floating trapezium shape on desktop
 * - Custom scrollbar with draggable event logo indicator
 */
export function CharacterSection() {
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [])

  return (
    <>
      {characters.map((character) => (
        <CharacterSlide key={character.id} character={character} />
      ))}
    </>
  )
}
