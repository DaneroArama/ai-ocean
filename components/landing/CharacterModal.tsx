'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

import XIcon from '@/app/assets/X.svg'
import CaretLeftIcon from '@/app/assets/CaretLeft.svg'
import CaretRightIcon from '@/app/assets/CaretRight.svg'

// Import mascot images (animated GIFs)
import Shark from '@/app/assets/Mascots GIF/Sharkie.gif'
import Ali from '@/app/assets/Mascots GIF/Croco.gif'
import Crabi from '@/app/assets/Mascots GIF/Crabbi.gif'
import Octo from '@/app/assets/Mascots GIF/Octo.gif'
import Tuto from '@/app/assets/Mascots GIF/Turtle.gif'
import eventTitle from '@/app/assets/Title.png'
import eventLogo from '@/app/assets/event_logo.png'

import BoldIcon from '@/app/assets/Icons/Bold.svg'
import CreativeIcon from '@/app/assets/Icons/Creative.svg'
import CuriousIcon from '@/app/assets/Icons/Curious.svg'
import DecisiveIcon from '@/app/assets/Icons/Decisive.svg'
import DeepIcon from '@/app/assets/Icons/Deep.svg'
import DiscerningIcon from '@/app/assets/Icons/Discerning.svg'
import DrivenIcon from '@/app/assets/Icons/Driven.svg'
import EmpatheticIcon from '@/app/assets/Icons/Empathetic.svg'
import PerceptiveIcon from '@/app/assets/Icons/Perceptive.svg'
import ProtectiveIcon from '@/app/assets/Icons/Protective.svg'
import SteadyIcon from '@/app/assets/Icons/Steady.svg'
import SystematicIcon from '@/app/assets/Icons/Systematic.svg'
import ThoroughIcon from '@/app/assets/Icons/Thorough.svg'
import VersatileIcon from '@/app/assets/Icons/Versatile.svg'
import VigilantIcon from '@/app/assets/Icons/Vigilant.svg'

const TRAIT_ICONS: Record<string, typeof BoldIcon> = {
  Bold: BoldIcon,
  Creative: CreativeIcon,
  Curious: CuriousIcon,
  Decisive: DecisiveIcon,
  Deep: DeepIcon,
  Discerning: DiscerningIcon,
  Driven: DrivenIcon,
  Empathetic: EmpatheticIcon,
  Perceptive: PerceptiveIcon,
  Protective: ProtectiveIcon,
  Steady: SteadyIcon,
  Systematic: SystematicIcon,
  Thorough: ThoroughIcon,
  Versatile: VersatileIcon,
  Vigilant: VigilantIcon,
}

// Character data with unique background colors
export const characters = [
  {
    id: 'shark',
    name: 'Sharkie (The Catalyst)',
    image: Shark,
    quote: 'Progress comes from action.',
    bio: 'Sharkie wants to see things move.\n\nSharkie learns by doing, trying things out, and adjusting along the way. By the time a discussion reaches a conclusion, Sharkie is usually a step past it.\n\nNot every path is clear from the beginning, but Sharkie knows that waiting forever means missing the moment.\n\nWhen a team feels stuck, Sharkie gets things moving, makes decisions, and helps everyone ride the wave forward.',
    traits: ['Bold', 'Driven', 'Decisive'],
    bgLeft: 'from-[#31C7FF] to-[#18AAE6]',
    bgRight: 'bg-[#2389B3]'
  },
  {
    id: 'octo',
    name: 'Otto (The Orchestrator)',
    image: Octo,
    quote: 'Nothing moves without people.',
    bio: 'Otto is happiest around people.\n\nOtto reads the room more than the task. Who has gone quiet, who is holding back, who hasn\'t really agreed yet. Otto would rather keep several things going at once than disappear into one, because staying close to everything is how nothing gets lost.\n\nNot everyone says what they\'re thinking, but Otto usually knows anyway.\n\nWhen a team starts to drift apart, Otto brings people back together, makes sure everyone is heard, and helps everyone ride the wave together.',
    traits: ['Empathetic', 'Perceptive', 'Versatile'],
    bgLeft: 'from-[#9928EA] to-[#7117B2]',
    bgRight: 'bg-[#43096B]'
  },
  {
    id: 'ali',
    name: 'Croco (The Evaluator)',
    image: Ali,
    quote: 'Certainty is worth the time.',
    bio: 'Croco sees what could go wrong.\n\nEvery plan has a version where it fails, and that is the one Croco is looking at. The step that gets skipped, the case nobody thought of, the small mistake that survived the last check. Croco goes back over things more times than most people would.\n\nIt takes longer. Croco does it anyway.\n\nWhen a team is about to miss something, Croco spots it, speaks up, and helps everyone ride the wave safely.',
    traits: ['Vigilant', 'Protective', 'Thorough'],
    bgLeft: 'from-[#46D227] to-[#2D9A16]',
    bgRight: 'bg-[#21750F]'
  },
  {
    id: 'crabi',
    name: 'Crabbi (The Artisan)',
    image: Crabi,
    quote: 'Always curious. Always creating.',
    bio: 'Crabbi shapes things until they feel right.\n\nCrabbi looks for a fresh approach instead of taking the usual one, then keeps making small changes most people would never notice, guided by a sense that something is slightly off long before there are words for why.\n\nNobody asked for those last few changes. Crabbi makes them anyway.\n\nWhen a team wants something that feels right, Crabbi shapes it, adjusts it, and helps everyone ride the wave gracefully.',
    traits: ['Creative', 'Curious', 'Discerning'],
    bgLeft: 'from-[#F98156] to-[#D6420D]',
    bgRight: 'bg-[#7D280A]'
  },
  {
    id: 'tuto',
    name: 'Turty (The Navigator)',
    image: Tuto,
    quote: 'Steady is its own kind of fast.',
    bio: 'Turty wants to know how things work.\n\nBefore starting, Turty wants to see how the parts fit together, because building on something you do not understand tends to cost more later. Turty keeps a steady pace rather than working in bursts, and once deep in a problem, coming back from an interruption takes a long time.\n\nIt looks slower from the outside. It usually is not.\n\nWhen a team needs something that will hold, Turty works it out from the ground up and helps everyone ride the wave steadily.',
    traits: ['Steady', 'Systematic', 'Deep'],
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
 * Single character panel — reused inside the full-width modal.
 * Left: character & quote, right: name + bio + traits
 */
function CharacterSlide({ character }: { character: typeof characters[number] }) {
  const bioRef = useRef<HTMLDivElement>(null)
  const scrollbarThumbRef = useRef<HTMLDivElement>(null)
  const scrollbarTrackRef = useRef<HTMLDivElement>(null)
  const isDraggingScrollbarRef = useRef(false)

  const [scrollTop, setScrollTop] = useState(0)
  const [isScrollbarDragging, setIsScrollbarDragging] = useState(false)

  const bgRightColor = extractHexColor(character.bgRight)
  const [startColor, endColor] = colorMap[character.bgLeft] || ['#02A4E3', '#0045A1']

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
    <div
      className={`relative w-full min-h-full md:h-full bg-gradient-to-b ${character.bgLeft} overflow-hidden transition-colors duration-700 flex flex-col justify-center py-6 md:py-0`}
    >
      <div className="relative w-full h-auto md:h-full flex-1 md:flex-none flex items-center py-0 md:py-0 md:min-h-0">
        <div className="w-full h-auto md:h-full flex flex-col md:flex-row relative md:min-h-0">

          {/* LEFT SIDE - Character & Quote */}
          <div
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
            <div className="relative z-10">
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
          <div className="flex-none w-full md:w-[52%] lg:w-5/9 h-auto md:h-full md:min-h-0 md:self-stretch relative flex flex-col justify-center p-6 md:p-10 md:pr-20 lg:pr-24 md:pl-14 lg:pl-20 z-20 shrink-0 rounded-4xl md:rounded-none -mt-6 md:mt-0">
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
            <div className="absolute inset-0 md:hidden rounded-[2rem] -z-10 transition-colors duration-700" style={{ backgroundColor: bgRightColor }} aria-hidden="true" />

            {/* Character Name */}
            <h2
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6 md:mb-8 min-h-[48px] md:min-h-[72px] lg:min-h-[80px] flex items-center leading-tight"
            >
              <span className="font-syncopate">{character.name.split(' (')[0]}</span>
              <span className="font-quicksand font-medium ml-4 text-xl md:text-2xl lg:text-3xl">
                ({character.name.match(/\((.+)\)/)?.[1]})
              </span>
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
                  className="font-quicksand font-semibold text-sm md:text-base lg:text-lg text-white/90 leading-relaxed whitespace-pre-line"
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
            <div className="relative flex-none h-[170px] md:h-[180px]">
              <div className="inline-block bg-white/20 backdrop-blur-sm rounded-t-2xl px-6 py-2 border-t border-l border-r border-white/30">
                <h3 className="font-syne text-lg md:text-xl font-bold text-white uppercase">
                  Traits
                </h3>
              </div>

              <div className="bg-black/30 backdrop-blur-sm rounded-r-2xl rounded-bl-2xl p-6 border border-white/20 -mt-px">
                <div className="grid grid-cols-3 gap-4">
                  {character.traits.map((trait, index) => {
                    const Icon = TRAIT_ICONS[trait]
                    return (
                      <div
                        key={index}
                        className="trait-item flex flex-col items-center gap-2"
                      >
                        <div className="flex items-center justify-center">
                          {Icon ? (
                            <Image src={Icon} alt={trait} width={32} height={32} className="h-10 w-10 object-contain" />
                          ) : (
                            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="font-quicksand text-base font-semibold text-white">
                          {trait}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
    </div>
  )
}

interface CharacterModalProps {
  index: number
  onClose: () => void
}

/**
 * Full-width character modal
 *
 * - Covers the whole viewport (edge to edge)
 * - Left / right arrows (and arrow keys) cycle through all characters
 * - Escape / close button dismisses it
 * - Lenis page scrolling is paused while it is open
 */
export function CharacterModal({ index, onClose }: CharacterModalProps) {
  const [current, setCurrent] = useState(index)
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const isOpeningRef = useRef(true)
  const directionRef = useRef(1)

  const character = characters[current]

  const navigate = useCallback((direction: number) => {
    if (isOpeningRef.current) return
    directionRef.current = direction
    setCurrent((prev) => (prev + direction + characters.length) % characters.length)
  }, [])

  // Entrance animation
  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, scale: 0.94, y: 24 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.45,
          ease: 'back.out(1.3)',
          delay: 0.05,
          onComplete: () => { isOpeningRef.current = false },
        }
      )
    })
    return () => ctx.revert()
  }, [])

  // Slide transition between characters
  useEffect(() => {
    if (!contentRef.current) return
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, x: directionRef.current * 80 },
      { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' }
    )
  }, [current])

  const handleClose = useCallback(() => {
    if (isOpeningRef.current || !overlayRef.current || !panelRef.current) return
    isOpeningRef.current = true
    const ctx = gsap.context(() => {
      gsap.to(panelRef.current, { opacity: 0, scale: 0.95, y: 16, duration: 0.22, ease: 'power2.in' })
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.28, ease: 'power2.in', onComplete: onClose })
    })
    return () => ctx.revert()
  }, [onClose])

  // Escape / arrow keys + lock background scroll (incl. Lenis)
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
      if (e.key === 'ArrowLeft') navigate(-1)
      if (e.key === 'ArrowRight') navigate(1)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [handleClose, navigate])

  return (
    <div
      ref={overlayRef}
      data-lenis-prevent
      data-lenis-prevent-touch
      role="dialog"
      aria-modal="true"
      aria-label={character.name}
      className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-sm flex items-center justify-center"
      onClick={handleClose}
    >
      <div
        ref={panelRef}
        className="relative w-full h-full overflow-hidden bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Character content */}
        <div ref={contentRef} className="h-full w-full overflow-y-auto">
          <CharacterSlide key={character.id} character={character} />
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2 md:p-2.5 bg-white/20 hover:bg-white/40 border border-white/40 backdrop-blur-md rounded-full text-white hover:rotate-90 hover:scale-110 active:scale-95 transition-all duration-500 ease-out shadow-lg"
        >
          <Image src={XIcon} alt="" width={18} height={18} />
        </button>

        {/* Previous character */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Previous character"
          className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 md:w-14 md:h-14 bg-black/25 hover:bg-black/45 border border-white/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:scale-110 hover:-translate-x-1 active:scale-95 transition-all duration-300 ease-out shadow-lg"
        >
          <Image src={CaretLeftIcon} alt="" width={22} height={22} />
        </button>

        {/* Next character */}
        <button
          type="button"
          onClick={() => navigate(1)}
          aria-label="Next character"
          className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 w-10 h-10 md:w-14 md:h-14 bg-black/25 hover:bg-black/45 border border-white/40 backdrop-blur-md rounded-full text-white flex items-center justify-center hover:scale-110 hover:translate-x-1 active:scale-95 transition-all duration-300 ease-out shadow-lg"
        >
          <Image src={CaretRightIcon} alt="" width={22} height={22} />
        </button>

        {/* Position indicator */}
        <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-50 items-center gap-2 bg-black/30 backdrop-blur-md border border-white/30 rounded-full px-3 py-1.5">
          {characters.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                directionRef.current = i > current ? 1 : -1
                setCurrent(i)
              }}
              aria-label={`Go to ${c.name}`}
              className={`rounded-full transition-all duration-300 ${
                i === current ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
