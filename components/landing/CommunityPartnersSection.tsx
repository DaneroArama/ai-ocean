'use client'

import Image from 'next/image'
import { useRef, useLayoutEffect, type CSSProperties } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import BridgeX from '@/app/assets/Partners/BridgeX.png'
import CCI from '@/app/assets/Partners/CCI.png'
import Ezypro from '@/app/assets/Partners/Ezypro.png'
import LetsTech from '@/app/assets/Partners/Lets Tech.png'
import PMPPO from '@/app/assets/Partners/PM PO.png'
import Riseup from '@/app/assets/Partners/Riseup.png'
import TPS from '@/app/assets/Partners/TPS.png'
import WAI from '@/app/assets/Partners/WAI.png'
import WeGrow from '@/app/assets/Partners/We Grow.png'

import CTZPay from '@/app/assets/Partners/CTZPay.png'
import MCB from '@/app/assets/Partners/MCB.png'
import Beyond360 from '@/app/assets/Partners/B360.png'
import MyJobs from '@/app/assets/Partners/Myjobs.png'
import UD from '@/app/assets/Partners/Untitled.png'
import Genplex from '@/app/assets/Partners/Genplex.png'
import Technortal from '@/app/assets/Partners/Technortal.png'
import Sandp1t from '@/app/assets/Partners/Sandp1t.png'
import H3VEA from '@/app/assets/Partners/H3VEA.png'
import Mobbin from '@/app/assets/Partners/Mobbin.png'
import Oway from '@/app/assets/Partners/Oway.png'
import TheBuilderPros from '@/app/assets/Partners/TheBuilderPros.png'
import MealPartners from '@/app/assets/Partners/Meal Partners.png'

gsap.registerPlugin(ScrollTrigger)

type Sponsor = {
  name: string
  type: string
  src: typeof CTZPay
  color: string
  /** main sponsors get a bigger card with the type pill around it */
  main?: boolean
  pill?: 'top-left' | 'bottom-right'
  /** override the default blue pill gradient (main sponsors in the design use brand colors) */
  pillStyle?: CSSProperties
  /** wide strip card (multiple logos in one long container) */
  wide?: boolean
}

const SPONSORS: Sponsor[] = [
  { name: 'CTZPay', type: 'Venue Sponsor', src: CTZPay, color: '#FF0E88', main: true, pill: 'top-left' },
  { name: "Let's Tech Club", type: 'Tech Partner', src: LetsTech, color: '#5B0AFF', main: true, pill: 'bottom-right', pillStyle: { backgroundImage: 'linear-gradient(to bottom, #FFA07A, #FF6B45)' } },
  { name: 'SANDP1T', type: 'People Development Partner', src: Sandp1t, color: '#6B7A2E', main: true, pill: 'top-left', pillStyle: { backgroundImage: 'linear-gradient(to bottom, #A97BEA, #8B52D4)' } },
  { name: 'H3VEA', type: 'Logistics Track Partner', src: H3VEA, color: '#0F8A45', main: true, pill: 'bottom-right', pillStyle: { backgroundImage: 'linear-gradient(to bottom, #FFA07A, #FF6B45)' } },
  { name: 'Myanmar Citizens Bank', type: 'Event Support Partner', src: MCB, color: '#0A7CFF' },
  { name: 'BEYOND 360', type: 'Media Partner', src: Beyond360, color: '#FFE100' },
  { name: 'MyJobs Myanmar', type: 'Talent Development Partner', src: MyJobs, color: '#FF7A18' },
  { name: 'Untitled Space & Dessert Studio', type: 'Refreshment Partner', src: UD, color: '#556730' },
  { name: 'Genplex.Ai', type: 'Knowledge Partner', src: Genplex, color: '#2E5BE8' },
  { name: 'Technortal', type: 'Knowledge Partner', src: Technortal, color: '#A8DD22' },
  { name: 'Mobbin', type: 'Global Knowledge Partner', src: Mobbin, color: '#171717' },
  { name: 'Oway Travel', type: 'Credit Partner', src: Oway, color: '#1D63D8' },
  { name: 'TheBuilderPros', type: 'Knowledge Partner', src: TheBuilderPros, color: '#F97316' },
  { name: 'Meal Partners', type: 'Meal Partner', src: MealPartners, color: '#16437E', wide: true },
]

const PARTNERS = [
  { name: 'WeGrow Myanmar', src: WeGrow },
  { name: 'The Productive Schedule', src: TPS },
  { name: 'PM x PO Learning & Development Hub', src: PMPPO },
  { name: "Let's Tech Club", src: LetsTech },
  { name: 'EzyPro, EzyPet', src: Ezypro },
  { name: 'RiseUp Organization', src: Riseup },
  { name: 'Women in AI (WAI) Myanmar', src: WAI },
  { name: 'BridgeX', src: BridgeX },
  { name: 'CCI France Myanmar', src: CCI },
]

const PILL =
  'inline-block whitespace-nowrap rounded-full bg-gradient-to-b from-[#5FC0F3] to-[#37A6EA] px-4 py-1.5 font-bold text-white shadow-[0_4px_10px_rgba(11,74,138,0.25)]'

/**
 * Stacked sponsor card: coloured card behind + white dashed card in front.
 * - main: bigger card, type pill sits around the card corner
 * - normal: type pill below the card
 */
function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const isMain = !!sponsor.main
  const isWide = !!sponsor.wide
  const pillRot = isMain ? (sponsor.pill === 'top-left' ? -6 : 6) : 0

  /* Wide strip: one long white container holding a row of logos */
  if (isWide) {
    return (
      <div className="sponsor-card sponsor-card--wide opacity-0 flex w-full max-w-[720px] flex-col items-center">
        <div className="relative h-[130px] w-full md:h-[170px]">
          <div
            aria-hidden="true"
            data-base
            style={{ backgroundColor: sponsor.color }}
            className="absolute inset-0 rounded-2xl shadow-[0_6px_16px_rgba(11,74,138,0.18)]"
          />
          <div
            data-white
            className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white p-5 shadow-[0_6px_18px_rgba(11,74,138,0.12)] md:p-7"
          >
            <div
              data-frame
              className="pointer-events-none absolute inset-3 rounded-xl border-2 border-dashed bg-transparent"
              style={{ borderColor: `${sponsor.color}80` }}
            />
            <Image
              data-logo
              src={sponsor.src}
              alt={`${sponsor.name} logo`}
              width={640}
              height={140}
              className="h-full w-full object-contain"
            />
          </div>
          <div
            data-tip
            className="absolute -top-4 left-[60%] z-50 whitespace-nowrap rounded-2xl bg-[#FFAE14] px-4 py-2 text-sm font-bold text-white opacity-0 shadow-lg pointer-events-none"
          >
            {sponsor.name}
            <div className="absolute -bottom-2 left-[10%] h-4 w-4 -translate-x-1/2 rounded-full bg-[#FFAE14]" />
          </div>
        </div>
        <span data-pill data-rot={pillRot} className={`${PILL} mt-4 text-[11px] md:text-xs`}>
          {sponsor.type}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`sponsor-card opacity-0 ${
        isMain
          ? 'relative w-[200px] h-[200px] md:w-[220px] md:h-[220px]'
          : 'flex w-[160px] md:w-[200px] flex-col items-center'
      }`}
    >
      <div
        className={
          isMain
            ? 'relative h-full w-full'
            : 'relative h-[140px] w-[140px] md:h-[180px] md:w-[180px]'
        }
      >
        {/* Coloured base card â€” offset + micro-rotates on hover (GSAP owns x/y) */}
        <div
          aria-hidden="true"
          data-base
          style={{ backgroundColor: sponsor.color }}
          className="absolute inset-0 rounded-2xl shadow-[0_6px_16px_rgba(11,74,138,0.18)]"
        />

        {/* White card with logo + inner frame */}
        <div
          data-white
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(11,74,138,0.12)]"
        >
          {/* Inner square frame (inset-2, transparent bg) */}
          <div
            data-frame
            className="pointer-events-none absolute inset-2 rounded-xl border-2 border-dashed bg-transparent"
            style={{ borderColor: `${sponsor.color}80` }}
          />
          <Image
            data-logo
            src={sponsor.src}
            alt={`${sponsor.name} logo`}
            width={160}
            height={160}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Name chat bubble */}
        <div
          data-tip
          className="absolute -top-4 left-[60%] z-50 whitespace-nowrap rounded-2xl bg-[#FFAE14] px-4 py-2 text-sm font-bold text-white opacity-0 shadow-lg pointer-events-none"
        >
          {sponsor.name}
          <div className="absolute -bottom-2 left-[10%] h-4 w-4 -translate-x-1/2 rounded-full bg-[#FFAE14]" />
        </div>

        {/* Type pill around the card (main sponsors only) */}
        {isMain && (
          <span
            data-pill
            data-rot={pillRot}
            style={sponsor.pillStyle}
            className={`${PILL} absolute z-40 text-xs md:text-sm ${
              sponsor.pill === 'top-left' ? '-left-5 -top-4' : '-bottom-4 -right-5'
            }`}
          >
            {sponsor.type}
          </span>
        )}
      </div>

      {/* Type pill below the card */}
      {!isMain && (
        <span data-pill data-rot={pillRot} className={`${PILL} mt-4 text-[11px] md:text-xs`}>
          {sponsor.type}
        </span>
      )}
    </div>
  )
}

/** 4-point twinkle star â€” blinks via the `.cta-star` keyframes. */
function Sparkle({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} style={style}>
      <path d="M12 0 Q13 11 24 12 Q13 13 12 24 Q11 13 0 12 Q11 11 12 0 Z" fill="currentColor" />
    </svg>
  )
}

export function CommunityPartnersSection() {
  const rootRef = useRef<HTMLDivElement>(null)
  const sponsorsSectionRef = useRef<HTMLElement>(null)
  const sponsorsTitleRef = useRef<HTMLHeadingElement>(null)
  const sponsorCardsRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const sponsorshipRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const cleanups: Array<() => void> = []

    const ctx = gsap.context(() => {
      const rootQ = gsap.utils.selector(root)

      // GSAP owns the transforms on these elements (Tailwind translate
      // utilities would be clobbered by GSAP's inline `translate: none`)
      // Wide cards rotate less — a few degrees already swings their long edges far.
      rootQ('[data-base]').forEach((base) => {
        const isWideBase = !!base.closest('.sponsor-card--wide')
        gsap.set(base, {
          x: isWideBase ? -8 : -10,
          y: isWideBase ? 8 : 10,
          rotate: isWideBase ? -1 : -3,
        })
      })
      gsap.set(rootQ('[data-tip]'), { xPercent: -50, yPercent: -100, scale: 0.9, opacity: 0 })

      // ---------- Intro: sponsors title ----------
      gsap.fromTo(
        sponsorsTitleRef.current,
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.4)',
          scrollTrigger: { trigger: sponsorsSectionRef.current, start: 'top 80%', once: true },
        }
      )

      // ---------- Intro: sponsor cards + inner frames + pills ----------
      const sponsorCards = rootQ('.sponsor-card')
      if (sponsorCards.length && sponsorCardsRef.current) {
        const sq = gsap.utils.selector(sponsorCardsRef.current)
        gsap
          .timeline({
            scrollTrigger: {
              trigger: sponsorCardsRef.current,
              start: 'top 85%',
              once: true,
            },
          })
          .fromTo(
            sponsorCards,
            {
              opacity: 0,
              y: 60,
              scale: 0.7,
              rotation: (_i, t: Element) =>
                t.classList.contains('sponsor-card--wide') ? -1 : -5,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotation: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: 'back.out(1.7)',
            }
          )
          .fromTo(
            sq('[data-frame]'),
            {
              opacity: 0,
              scale: 0.5,
              rotation: (_i, t: Element) =>
                (t as HTMLElement).closest('.sponsor-card--wide') ? -10 : -35,
            },
            {
              opacity: 1,
              scale: (_i, t: Element) =>
                t.classList.contains('sponsor-card--wide') ? 0.5 : 1,
              rotation: 0,
              duration: 0.55,
              stagger: 0.05,
              ease: 'back.out(2)',
            },
            '-=0.45'
          )
          .fromTo(
            sq('[data-pill]'),
            {
              opacity: 0,
              scale: 0,
              rotation: (_i, t: Element) => Number((t as HTMLElement).dataset.rot || 0) + 25,
            },
            {
              opacity: 1,
              scale: 1,
              rotation: (_i, t: Element) => Number((t as HTMLElement).dataset.rot || 0),
              duration: 0.5,
              stagger: 0.05,
              ease: 'back.out(2.5)',
            },
            '-=0.35'
          )
      }

      // ---------- Intro: sponsorship card ----------
      gsap.fromTo(
        sponsorshipRef.current,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: sponsorshipRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      )

      // ---------- Intro: community title ----------
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 40, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      )

      // ---------- Intro: community cards + inner frames + logos ----------
      const cardElements = rootQ('.partner-card')
      if (cardElements.length && cardsRef.current) {
        const cq = gsap.utils.selector(cardsRef.current)
        gsap
          .timeline({
            scrollTrigger: { trigger: cardsRef.current, start: 'top 85%', once: true },
          })
          .fromTo(
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
            }
          )
          .fromTo(
            cq('[data-frame]'),
            { opacity: 0, scale: 0.5, rotation: 35 },
            {
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration: 0.5,
              stagger: 0.08,
              ease: 'back.out(2)',
            },
            '-=0.45'
          )
          .fromTo(
            cq('[data-logo]'),
            { opacity: 0, scale: 0.6, rotation: 12 },
            {
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration: 0.5,
              stagger: 0.06,
              ease: 'back.out(2)',
            },
            '-=0.35'
          )
      }

      // ---------- Micro-interactions (hover) ----------
      const micro = (card: Element, active: boolean) => {
        const q = gsap.utils.selector(card)
        const isPartner = card.classList.contains('partner-card')
        const isWide = card.classList.contains('sponsor-card--wide')
        const d = 0.4
        const e = 'power2.out'
        const over = { overwrite: 'auto' as const }

        gsap.to(q('[data-base]'), {
          x: active ? (isWide ? -14 : -16) : isWide ? -8 : -10,
          y: active ? (isWide ? -14 : -20) : isWide ? 8 : 10,
          rotate: active ? (isWide ? -2.5 : -10) : isWide ? -1 : -3,
          scale: active ? 1.05 : 1,
          duration: d,
          ease: e,
          ...over,
        })
        gsap.to(q('[data-frame]'), {
          scale: active ? 1.04 : 1,
          duration: d,
          ease: e,
          ...over,
        })
        gsap.to(q('[data-logo]'), {
          scale: active ? 1.12 : 1,
          duration: d,
          ease: e,
          ...over,
        })
        gsap.to(q('[data-white]'), {
          y: active ? -6 : 0,
          boxShadow: active
            ? '0 16px 30px rgba(11, 74, 138, 0.25)'
            : '0 6px 18px rgba(11, 74, 138, 0.12)',
          duration: d,
          ease: e,
          ...over,
        })
        gsap.to(q('[data-tip]'), {
          opacity: active ? 1 : 0,
          scale: active ? 1 : 0.9,
          duration: active ? 0.3 : 0.2,
          ease: 'back.out(2)',
          ...over,
        })
        gsap.to(q('[data-pill]'), {
          y: active ? -4 : 0,
          rotation: (_i, t: Element) => {
            const base = Number((t as HTMLElement).dataset.rot || 0)
            return active ? base - 2 : base
          },
          duration: d,
          ease: 'back.out(2)',
          ...over,
        })
        if (isPartner) {
          gsap.to(card, {
            y: active ? -8 : 0,
            scale: active ? 1.06 : 1,
            boxShadow: active
              ? '0 16px 32px rgba(11, 74, 138, 0.28)'
              : '0 6px 18px rgba(11, 74, 138, 0.12)',
            duration: d,
            ease: e,
            ...over,
          })
        }
      }

      // Touch/tap activation state â€” bubbles must survive the tap but
      // never follow the user through a scroll gesture.
      const activeCards = new Set<Element>()
      const touchCards = new Set<Element>()
      const touchTimers = new Map<Element, number>()

      const activate = (card: Element, viaTouch: boolean) => {
        const timer = touchTimers.get(card)
        if (timer !== undefined) {
          window.clearTimeout(timer)
          touchTimers.delete(card)
        }
        if (viaTouch) {
          // only one bubble at a time â€” a new tap (or mouse hover) closes the old one
          Array.from(touchCards).forEach((other) => {
            if (other !== card) deactivate(other)
          })
          touchCards.add(card)
        } else {
          // mouse owns it now â€” clear stale touch bubbles, scroll must not hide it
          touchCards.delete(card)
          Array.from(touchCards).forEach((other) => deactivate(other))
        }
        if (!activeCards.has(card)) {
          activeCards.add(card)
          micro(card, true)
        }
      }

      const deactivate = (card: Element) => {
        const timer = touchTimers.get(card)
        if (timer !== undefined) {
          window.clearTimeout(timer)
          touchTimers.delete(card)
        }
        touchCards.delete(card)
        if (activeCards.has(card)) {
          activeCards.delete(card)
          micro(card, false)
        }
      }

      const scheduleTouchDeactivate = (card: Element) => {
        const prev = touchTimers.get(card)
        if (prev !== undefined) window.clearTimeout(prev)
        touchTimers.set(card, window.setTimeout(() => deactivate(card), 1600))
      }

      rootQ('.sponsor-card, .partner-card').forEach((item) => {
        const card = item as HTMLElement
        const onEnter = (e: PointerEvent) => activate(card, e.pointerType === 'touch')
        const onLeave = (e: PointerEvent) => {
          if (e.pointerType === 'touch') scheduleTouchDeactivate(card)
          else deactivate(card)
        }
        const onDown = (e: PointerEvent) => {
          if (e.pointerType === 'touch') activate(card, true)
        }
        const onUp = (e: PointerEvent) => {
          if (e.pointerType === 'touch') scheduleTouchDeactivate(card)
        }
        const onCancel = () => deactivate(card)

        card.addEventListener('pointerenter', onEnter)
        card.addEventListener('pointerleave', onLeave)
        card.addEventListener('pointerdown', onDown)
        card.addEventListener('pointerup', onUp)
        card.addEventListener('pointercancel', onCancel)
        cleanups.push(() => {
          card.removeEventListener('pointerenter', onEnter)
          card.removeEventListener('pointerleave', onLeave)
          card.removeEventListener('pointerdown', onDown)
          card.removeEventListener('pointerup', onUp)
          card.removeEventListener('pointercancel', onCancel)
        })
      })

      const onScroll = () => {
        Array.from(touchCards).forEach((card) => deactivate(card))
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      cleanups.push(() => {
        window.removeEventListener('scroll', onScroll)
        touchTimers.forEach((timer) => window.clearTimeout(timer))
        touchTimers.clear()
      })
    }, root)

    return () => {
      cleanups.forEach((fn) => fn())
      ctx.revert()
    }
  }, [])

  return (
    <div ref={rootRef} className="dotted-bg">
      {/* ============ Sponsors & Partners ============ */}
      <section id="sponsors" ref={sponsorsSectionRef} className="relative scroll-mt-16 py-20 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            ref={sponsorsTitleRef}
            className="font-dela-gothic-one text-2xl md:text-3xl lg:text-4xl font-bold text-[#0B4A8A] text-center tracking-wider mb-14 md:mb-16 opacity-0"
          >
            Sponsors &amp; Partners
          </h2>

          <div ref={sponsorCardsRef} className="flex flex-col items-center gap-y-12 md:gap-y-16">
            {/* Main sponsors â€” type pill around the card */}
            <div className="flex flex-wrap items-start justify-center gap-x-14 gap-y-16 md:gap-x-24">
              {SPONSORS.filter((sponsor) => sponsor.main).map((sponsor) => (
                <SponsorCard key={sponsor.name} sponsor={sponsor} />
              ))}
            </div>

            {/* The rest â€” type pill below the card */}
            <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-12">
              {SPONSORS.filter((sponsor) => !sponsor.main && !sponsor.wide).map((sponsor) => (
                <SponsorCard key={sponsor.name} sponsor={sponsor} />
              ))}

              {SPONSORS.filter((sponsor) => sponsor.wide).map((sponsor) => (
                <SponsorCard key={sponsor.name} sponsor={sponsor} />
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ============ Become Sponsorship Card ============ */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-16">
        <div
          ref={sponsorshipRef}
          className="sponsorship-card relative flex min-h-[320px] items-center overflow-hidden rounded-[28px] bg-gradient-to-br from-[#3BC3FC] to-[#22AAF3] p-6 shadow-[0_24px_60px_rgba(34,170,243,0.35)] md:min-h-[380px] md:rounded-[36px] md:p-12"
        >
          {/* Spotlight beams shining down from the top edge */}
          <div
            aria-hidden="true"
            className="cta-beam pointer-events-none absolute right-[4%] -top-5 h-[78%] w-[52%] max-w-[420px] bg-linear-to-b from-white/60 via-white/40 to-transparent sm:-top-4 sm:right-[6%] sm:h-[130%] sm:w-[44%] z-10 shadow-[inset_0px_0px_20px_5px_rgba(255,255,255,10)] blur-sm"
            style={{ clipPath: 'polygon(40% 0, 62% 0, 100% 100%, 0 100%)', transform: 'rotate(6deg)' }}
          />

          {/* Blinking sparkle stars */}
          <Sparkle className="cta-star absolute left-[5%] top-[3%] w-5 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] md:w-7" style={{ animationDuration: '2.6s' }} />
          <Sparkle className="cta-star absolute bottom-[9%] left-[31%] w-4 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] md:w-6" style={{ animationDuration: '3.2s', animationDelay: '0.6s' }} />
          <Sparkle className="cta-star absolute left-[55%] top-[57%] w-4 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] md:w-5" style={{ animationDuration: '2.2s', animationDelay: '1.1s' }} />
          <Sparkle className="cta-star absolute left-[63%] top-[11%] w-5 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] md:w-7" style={{ animationDuration: '3s', animationDelay: '0.3s' }} />
          <Sparkle className="cta-star absolute right-[2%] top-[30%] w-7 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] md:w-10" style={{ animationDuration: '2.4s', animationDelay: '0.9s' }} />
          <Sparkle className="cta-star absolute bottom-[6%] left-[73%] w-4 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] md:w-6" style={{ animationDuration: '3.4s', animationDelay: '1.4s' }} />
          <Sparkle className="cta-star absolute bottom-[7%] right-[3%] w-14 text-[#FFC93C] drop-shadow-[0_0_10px_rgba(255,201,60,0.6)] md:w-24" style={{ animationDuration: '3.6s', animationDelay: '0.5s' }} />

          {/* Floating white square card under the spotlight */}
          <div aria-hidden="true" className="pointer-events-none absolute right-[9%] bottom-[35%] md:bottom-[0%] z-0 md:right-[12%] sm:top-1/2 sm:-translate-y-1/2">
            <div className="cta-square relative flex h-28 w-28 items-center justify-center rounded-[18px] bg-gradient-to-b from-white to-[#EDF8FE] shadow-[0_18px_40px_rgba(9,86,146,0.3)] sm:h-48 sm:w-48 sm:rounded-[26px] md:h-60 md:w-60 lg:h-64 lg:w-64 -rotate-12">
              <span className="absolute inset-2 rounded-[12px] border-2 border-dashed border-[#63C6F1] sm:inset-3 sm:rounded-[18px] sm:border-[3px]" />
              <svg viewBox="0 0 100 100" className="relative h-7 w-7 sm:h-14 sm:w-14 md:h-16 md:w-16">
                <path d="M50 24v52M24 50h52" stroke="#5FC8F5" strokeWidth="16" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Copy + button */}
          <div className="relative z-10 w-full max-w-lg sm:max-w-[52%] lg:max-w-lg">
            <h3 className="max-w-[64%] font-dela-gothic-one text-[26px] leading-tight text-white sm:max-w-none sm:text-4xl md:text-5xl lg:text-[3.4rem]">
              Be part of the Journey
            </h3>
            <p className="mt-3 max-w-[64%] text-sm leading-snug text-white/95 sm:max-w-none sm:text-base md:mt-4 md:text-lg font-syne font-bold">
              We value the support of our sponsors and offer various partnership levels.
            </p>
            <a
              href="https://forms.gle/eJRq2tuVDW793MDQ9"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#FFA928] px-7 py-3 font-syne font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-[#FF9C12] hover:shadow-lg md:mt-8 md:px-8"
            >
              Apply for Sponsorship
              <span className="text-xl">→</span>
            </a>
          </div>
        </div>
      </div>

      {/* ============ Community Partners ============ */}
      <section ref={sectionRef} className="relative py-20 overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            ref={titleRef}
            className="font-dela-gothic-one text-2xl md:text-3xl lg:text-4xl font-bold text-[#0B4A8A] text-center tracking-wider mb-16 opacity-0"
          >
            Community Partners
          </h2>

          <div ref={cardsRef} className="flex flex-wrap justify-center gap-6 md:gap-8">
            {PARTNERS.map((partner) => (
              <div
                key={partner.name}
                className="partner-card relative w-[140px] h-[140px] md:w-[180px] md:h-[180px] rounded-2xl bg-white shadow-[0_6px_18px_rgba(11,74,138,0.12)] flex items-center justify-center p-4 opacity-0 cursor-pointer"
              >
                {/* Tooltip bubble */}
                <div
                  data-tip
                  className="absolute -top-4 left-[60%] bg-[#FFAE14] text-white text-sm font-bold px-4 py-2 rounded-2xl shadow-lg opacity-0 pointer-events-none whitespace-nowrap z-50"
                >
                  {partner.name}
                  <div className="absolute -bottom-2 left-[10%] -translate-x-1/2 w-4 h-4 bg-[#FFAE14] rounded-full"></div>
                </div>
                {/* Inner square frame (inset-2, transparent bg) */}
                <div
                  data-frame
                  className="pointer-events-none absolute inset-2 rounded-xl border-2 border-dashed border-[#0B4A8A]/25 bg-transparent"
                />
                <div data-logo className="w-full h-full rounded-xl flex items-center justify-center p-3">
                  <Image
                    src={partner.src}
                    alt={`${partner.name} logo`}
                    width={120}
                    height={120}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
