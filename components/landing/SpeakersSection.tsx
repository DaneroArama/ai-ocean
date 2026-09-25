'use client'

import { useCallback, useRef, useState } from 'react'
import Image, { type StaticImageData } from 'next/image'

import Title3D from '@/app/assets/Title_3D.png'
import WaveAsset from '@/app/assets/wave_asset_1.svg'
import EventLogoYellow from '@/app/assets/event_logo_yellow.png'
import EventLogo from '@/app/assets/event_logo.png'
import WavesBg from '@/app/assets/waves_3.png'
import MascotAli from '@/app/assets/Mascots/Ali.png'
import MascotCrabi from '@/app/assets/Mascots/Crabi.png'
import MascotOcto from '@/app/assets/Mascots/Octo.png'
import MascotShark from '@/app/assets/Mascots/Shark.png'
import MascotTuto from '@/app/assets/Mascots/Tuto.png'
import { speakersForDay, type Speaker, type SpeakerDay } from '@/data/speakersData'

const MASCOTS = [MascotAli, MascotCrabi, MascotOcto, MascotShark, MascotTuto]

const pickRandomMascot = () => MASCOTS[Math.floor(Math.random() * MASCOTS.length)]

const BIO_COLLAPSED_TEXT_PX = 120

function SpeakerBio({ bio }: { bio: string }) {
  const [expanded, setExpanded] = useState(false)
  const [needsExpand, setNeedsExpand] = useState(false)
  const measureRef = useRef<HTMLParagraphElement>(null)

  const setMeasureRef = useCallback((node: HTMLParagraphElement | null) => {
    measureRef.current = node
    if (node) {
      setNeedsExpand(node.scrollHeight > BIO_COLLAPSED_TEXT_PX + 4)
    }
  }, [])

  return (
    <div className="relative mt-4 md:mt-5">
      <p
        ref={setMeasureRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 w-full opacity-0 font-quicksand text-sm md:text-[15px] leading-relaxed whitespace-pre-line px-4 md:px-5"
      >
        {bio}
      </p>
      <div className="relative rounded-2xl border-2 border-dashed border-white/70 bg-transparent px-4 md:px-5 py-3 md:py-4 overflow-hidden">
        <p
          className="font-syne text-sm md:text-[15px] leading-relaxed text-white whitespace-pre-line overflow-hidden transition-[max-height] duration-300 ease-out"
          style={{ maxHeight: expanded ? 4000 : BIO_COLLAPSED_TEXT_PX }}
        >
          {bio}
        </p>
        {needsExpand && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="mt-3 inline-flex items-center gap-1.5 font-syne text-sm font-semibold text-[#FDFFFA] hover:text-white transition-colors"
          >
            {expanded ? 'Show less' : 'Show more'}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

function SpeakerPhoto({ speaker, imageRight, mascot }: { speaker: Speaker; imageRight: boolean; mascot: StaticImageData }) {
  return (
    <div className="relative w-full md:w-[42%] lg:w-[38%] shrink-0 p-4 md:p-6 lg:p-8 flex items-center justify-center">
      <div className="relative w-full max-w-[320px] aspect-square">
        <div className="absolute inset-0 rounded-2xl overflow-hidden bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
          <Image
            src={speaker.photo}
            alt={speaker.name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 280px, 320px"
          />
          {/* Mascots stacked: only opacity toggles on hover, so the visible image never swaps src (no flicker) */}
          <div
            className={`pointer-events-none absolute -bottom-30 z-20 w-16 h-full md:w-[200px] opacity-0 scale-0 translate-y-4 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              imageRight ? 'left-1 md:-left-20 rotate-30' : 'right-1 md:-right-20 -rotate-30'
            }`}
          >
            {MASCOTS.map((m) => (
              <Image
                key={m.src}
                src={m}
                alt=""
                fill
                sizes="200px"
                className={`object-contain ${m.src === mascot.src ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
          </div>
        </div>
        {/* Sketchy border: filter only touches this overlay, never the photo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-[4px] rounded-[20px] border-[5px] border-white"
          style={{ filter: 'url(#sketchy-border)' }}
        />
      </div>
    </div>
  )
}

function SpeakerContent({ speaker, imageRight }: { speaker: Speaker; imageRight: boolean }) {
  return (
    <div className="relative flex-1 min-w-0 p-5 md:p-8 lg:p-10 rounded-2xl md:rounded-none">
      <div
        className={`pointer-events-none absolute -bottom-30 w-[300px] opacity-30 h-full md:w-[500px] ${
          imageRight
            ? 'right-0 md:-left-20 md:right-auto md:scale-x-[-1] rotate-45'
            : '-right-20 -rotate-45'
        }`}
      >
        <Image src={WavesBg} alt="" fill className="object-contain object-bottom" sizes="240px" />
      </div>
      <div className="relative z-10">
        <h3 className="font-syncopate font-bold text-xl md:text-2xl lg:text-[26px] uppercase tracking-wide text-[#FDFFFA] leading-tight">
          {speaker.name}
        </h3>
        <p className="font-quicksand font-semibold text-sm md:text-base text-white/90">
          {speaker.position}
        </p>

        <div className="inline-flex items-center gap-2 mt-4 md:mt-5 rounded-full border border-white/50 shadow-[inset_0px_0px_20px_5px_rgba(255,255,255,10)] bg-ocean-primary backdrop-blur-sm px-3 py-1.5 md:px-4 md:py-2">
          <Image src={EventLogo} alt="" width={22} height={22} className="w-5 h-5 md:w-[22px] md:h-[22px] object-contain shrink-0" />
          <span className="font-quicksand text-xs md:text-sm font-semibold text-white">
            {speaker.organization}
          </span>
        </div>

        <SpeakerBio bio={speaker.bio} />
      </div>
    </div>
  )
}

function SpeakerCard({ speaker, index }: { speaker: Speaker; index: number }) {
  const imageRight = index % 2 === 1
  const [mascot, setMascot] = useState<StaticImageData>(() => pickRandomMascot())

  const handleMouseEnter = () => {
    setMascot(pickRandomMascot())
  }

  return (
    <article
      onMouseEnter={handleMouseEnter}
      className="group rounded-[1.75rem] md:rounded-[2rem] overflow-hidden bg-[#00B4F1] shadow-[6px_6px_0px_0px_#FFFFFF] transform-gpu will-change-transform transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[10px_10px_0px_0px_#FFFFFF]"
    >
        <div
          className={`flex flex-col md:flex-row md:items-stretch ${
            imageRight ? 'md:flex-row-reverse' : ''
          }`}
        >
          <SpeakerPhoto speaker={speaker} imageRight={imageRight} mascot={mascot} />
          <SpeakerContent speaker={speaker} imageRight={imageRight} />
        </div>
    </article>
  )
}

function DayToggleButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 rounded-full border-2 px-6 py-2.5 md:px-8 md:py-3 font-syncopate text-sm md:text-base font-bold tracking-wide transition-all duration-200 ${
        active
          ? 'border-white text-white shadow-[inset_0px_0px_20px_5px_rgba(255,255,255,10)]'
          : 'border-white/60 bg-transparent text-white/85 hover:border-white hover:bg-white/10'
      }`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-90" aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {label}
    </button>
  )
}

export function SpeakersSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [activeDay, setActiveDay] = useState<SpeakerDay>(1)

  const scrollSectionToTop = useCallback(() => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleDayChange = (day: SpeakerDay) => {
    setActiveDay(day)
    requestAnimationFrame(() => {
      scrollSectionToTop()
    })
  }

  const daySpeakers = speakersForDay(activeDay)

  return (
    <section
      ref={sectionRef}
      id="speakers"
      className="relative overflow-hidden bg-[#0A8CB8] py-14 md:py-20 px-4 scroll-mt-24"
    >
      {/* Sketchy border filter (used by speaker photos, applied only to the border overlay) */}
      <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
        <defs>
          <filter id="sketchy-border" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="7" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      {/* Title row — full bleed: waves repeat to both screen edges */}
      <div className="flex items-center gap-4 md:gap-6 mb-10 md:mb-12 -mx-4">
        <div
          aria-hidden
          className="hidden sm:block flex-1 h-8 md:h-11 lg:h-14"
          style={{
            backgroundImage: `url(${WaveAsset.src})`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
            backgroundPosition: 'right center',
          }}
        />
        <Image
          src={Title3D}
          alt="AI Into the Ocean"
          width={520}
          height={160}
          className="shrink-0 w-[min(70%,320px)] md:w-[min(70%,420px)] h-auto object-contain drop-shadow-lg"
          priority
        />
        <div
          aria-hidden
          className="hidden sm:block flex-1 h-8 md:h-11 lg:h-14 scale-x-[-1]"
          style={{
            backgroundImage: `url(${WaveAsset.src})`,
            backgroundRepeat: 'repeat-x',
            backgroundSize: 'auto 100%',
            backgroundPosition: 'right center',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Section heading + yellow rule */}
        <div className="flex gap-3 md:gap-5 mb-10 md:mb-14">
          <h2 className="font-syncopate font-bold text-2xl md:text-3xl lg:text-4xl text-[#FDFFFA] lowercase tracking-wide shrink-0">
            Speakers
          </h2>
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <div className="h-[3px] flex-1 rounded-full bg-gradient-to-r from-[#FFD15A] to-[#FFA726]" />
            <Image
              src={EventLogoYellow}
              alt=""
              width={36}
              height={36}
              className="w-8 h-8 md:w-9 md:h-9 object-contain shrink-0"
            />
          </div>
        </div>

        {/* Speaker cards */}
        <div className="space-y-8 md:space-y-10">
          {daySpeakers.map((speaker, index) => (
            <SpeakerCard key={speaker.id} speaker={speaker} index={index} />
          ))}
        </div>

        {/* Day toggle */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-12 md:mt-16">
          <DayToggleButton label="Day 1" active={activeDay === 1} onClick={() => handleDayChange(1)} />
          <DayToggleButton label="Day 2" active={activeDay === 2} on