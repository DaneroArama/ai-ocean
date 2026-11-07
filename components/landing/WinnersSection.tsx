'use client'

import Image, { type StaticImageData } from 'next/image'
import { useLayoutEffect, useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import WinnerAward from '@/app/assets/winnners/Winners Awards (CoralCode).webp'
import FundedAward from '@/app/assets/winnners/Funded Award $1000 (Ocean Blue).webp'
import BestAIIntegration from '@/app/assets/winnners/Best AI Integraion (Four Hook).webp'
import BestIdea from '@/app/assets/winnners/Best Idea (Ocean Blue).webp'
import BestPitch from '@/app/assets/winnners/Best Pitch (CoralCode).webp'

gsap.registerPlugin(ScrollTrigger)

export type Award = {
  title: string
  team: string
  category: string
  src: StaticImageData
  /** Gradient used for the award's frame. */
  accent: [string, string]
}

/**
 * Award cards are pre-designed 1:1 images (title + photo + team name baked in),
 * so we only need to present them in a responsive square layout.
 */
export const AWARDS: Award[] = [
  {
    title: 'AI Ocean Award',
    team: 'CoralCode',
    category: 'Grand Winner',
    src: WinnerAward,
    accent: ['#FFF3B0', '#F5A623'],
  },
  {
    title: 'Funded Award',
    team: 'Ocean Blue',
    category: '$1,000 Investment',
    src: FundedAward,
    accent: ['#FFE173', '#F59E0B'],
  },
  {
    title: 'Best AI Integration',
    team: 'Four Hook',
    category: 'Award',
    src: BestAIIntegration,
    accent: ['#8CF0C7', '#10B981'],
  },
  {
    title: 'Best Idea',
    team: 'Ocean Blue',
    category: 'Award',
    src: BestIdea,
    accent: ['#D4C4FF', '#8B5CF6'],
  },
  {
    title: 'Best Pitch',
    team: 'CoralCode',
    category: 'Award',
    src: BestPitch,
    accent: ['#FFB3C1', '#F43F5E'],
  },
]

const GRAND_WINNER = AWARDS[0]
const SECONDARY_AWARDS = AWARDS.slice(1)

/** Alternating congratulation + winning-team sequence for the full-width marquee. */
const CONGRATS_SEQUENCE = AWARDS.flatMap(award => [
  { kind: 'label' as const, text: 'CONGRATULATIONS' },
  { kind: 'team' as const, text: award.team },
])

const CONFETTI_COLORS = ['#FFE173', '#FF8E53', '#7DD3FC', '#C4B5FD', '#6EE7B7', '#FFFFFF']

/** Deterministic confetti (stable between server and client). */
const CONFETTI = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: 16 + ((i * 53) % 72),
  size: 5 + (i % 4) * 2,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: (i % 9) * 0.28,
  duration: 2.6 + (i % 6) * 0.35,
  dx: ((i % 7) - 3) * 14,
  dy: -(70 + (i % 5) * 22),
  rot: (i % 2 === 0 ? 1 : -1) * (120 + (i % 4) * 70),
  round: i % 3 === 0,
}))

/** 4-point twinkle star — blinks via the `.cta-star` keyframes. */
function Sparkle({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} style={style}>
      <path d="M12 0 Q13 11 24 12 Q13 13 12 24 Q11 13 0 12 Q11 11 12 0 Z" fill="currentColor" />
    </svg>
  )
}

/** Animated shine that sweeps across an award image. */
function Shine() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="award-shine absolute inset-y-0 -left-1/2 w-1/2 bg-linear-to-r from-transparent via-white/75 to-transparent blur-md" />
    </span>
  )
}

function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-[-14%] overflow-visible">
      {CONFETTI.map((piece, index) => (
        <span
          key={index}
          className="award-confetti absolute"
          style={
            {
              left: `${piece.left}%`,
              top: `${piece.top}%`,
              width: piece.size,
              height: piece.round ? piece.size : piece.size * 0.5,
              backgroundColor: piece.color,
              borderRadius: piece.round ? '9999px' : '2px',
              '--dx': `${piece.dx}px`,
              '--dy': `${piece.dy}px`,
              '--rot': `${piece.rot}deg`,
              '--dur': `${piece.duration}s`,
              '--delay': `${piece.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

function Marquee({ variant }: { variant: 'section' | 'embedded' }) {
  const isSection = variant === 'section'
  return (
    <div
      className={`relative mt-12 overflow-hidden border-y py-3 md:mt-16 ${
        isSection ? '-mx-5 border-white/25 bg-white/10 md:-mx-12' : 'border-[#a4ecff] bg-[#eefaff]'
      }`}
    >
      <div className="award-marquee flex w-max items-center">
        {[0, 1].map(copy => (
          <div
            key={copy}
            aria-hidden={copy === 1}
            className="flex shrink-0 items-center font-dela-gothic-one text-sm tracking-[0.18em] md:text-base"
          >
            {CONGRATS_SEQUENCE.map((item, index) => (
              <span key={`${copy}-${index}`} className="flex items-center">
                <span
                  className={
                    item.kind === 'team'
                      ? isSection
                        ? 'text-[#FFE173]'
                        : 'text-[#e08a00]'
                      : isSection
                        ? 'text-white/90'
                        : 'text-[#00558c]'
                  }
                >
                  {item.text}
                </span>
                <span
                  aria-hidden="true"
                  className={`mx-4 text-lg md:mx-7 md:text-xl ${
                    isSection ? 'text-[#FFE173]' : 'text-[#f5a623]'
                  }`}
                >
                  ✪
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

type WinnersSectionProps = {
  /**
   * `section` — full-width ocean section used on the home page.
   * `embedded` — lighter, compact version for the team page modal.
   */
  variant?: 'section' | 'embedded'
}

export function WinnersSection({ variant = 'section' }: WinnersSectionProps) {
  const isSection = variant === 'section'
  const rootRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const featured = root?.querySelector('[data-winner-featured]')
    const cards = gridRef.current?.querySelectorAll('[data-award-card]')
    if (!root || (!featured && !cards?.length)) return

    const ctx = gsap.context(() => {
      const delay = isSection ? 0 : 0.35

      if (featured) {
        gsap.fromTo(
          featured,
          { opacity: 0, y: 60, scale: 0.75, rotation: -6 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 0.9,
            delay,
            ease: 'back.out(1.6)',
            ...(isSection
              ? { scrollTrigger: { trigger: featured, start: 'top 92%', once: true } }
              : {}),
          }
        )
      }

      if (cards?.length) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40, scale: 0.9, rotation: -4 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 0.6,
            stagger: 0.09,
            delay: isSection ? 0.15 : delay + 0.2,
            ease: 'back.out(1.6)',
            ...(isSection
              ? { scrollTrigger: { trigger: gridRef.current, start: 'top 90%', once: true } }
              : {}),
          }
        )
      }
    }, root)

    return () => ctx.revert()
  }, [isSection])

  const featuredWidth = isSection
    ? 'w-[270px] sm:w-[330px] md:w-[380px] lg:w-[420px]'
    : 'w-[230px] sm:w-[270px] md:w-[310px]'

  return (
    <section
      ref={rootRef}
      id={isSection ? 'winners' : undefined}
      aria-labelledby={isSection ? 'winners-heading' : undefined}
      className={
        isSection
          ? 'relative z-20 overflow-hidden bg-transparent px-5 pb-16 pt-24 text-white scroll-mt-20 md:px-12 md:pb-20 md:pt-28'
          : 'relative'
      }
    >
      {isSection && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Twinkling stars */}
          <Sparkle className="cta-star absolute left-[8%] top-[18%] w-6 text-white/80" style={{ animationDuration: '2.8s' }} />
          <Sparkle className="cta-star absolute right-[12%] top-[24%] w-5 text-white/70" style={{ animationDuration: '3.4s', animationDelay: '0.6s' }} />
          <Sparkle className="cta-star absolute bottom-[36%] left-[6%] w-4 text-white/60" style={{ animationDuration: '2.4s', animationDelay: '1.1s' }} />
          <Sparkle className="cta-star absolute bottom-[30%] right-[7%] w-7 text-[#FFC93C]/90" style={{ animationDuration: '3.6s', animationDelay: '0.4s' }} />
        </div>
      )}

      <div className={isSection ? 'relative mx-auto max-w-6xl' : 'relative mx-auto max-w-[1200px] px-4'}>
        <header className="relative mx-auto mb-8 w-fit max-w-full md:mb-10">
          <span className="absolute -top-5 left-[-18%] rounded-full border border-white/70 bg-linear-to-b from-[#ffe173] to-[#f5a623] px-5 py-2 text-[11px] font-semibold text-[#7a4a00] shadow-[inset_0_1px_5px_#ffffffb3,0_0_0_3px_#ffffff33] md:text-xs">
            Celebrate
          </span>
          <h2
            id={isSection ? 'winners-heading' : undefined}
            className={`font-dela-gothic-one text-center text-[clamp(1.9rem,4.8vw,3.5rem)] leading-tight tracking-tight ${
              isSection
                ? 'text-white [text-shadow:0_4px_0_rgba(0,69,161,0.35),0_10px_24px_rgba(0,69,161,0.35)]'
                : 'text-[#00558c]'
            }`}
          >
            Winners &amp; Awards
          </h2>
          <span className="absolute -bottom-10 right-0 rounded-full border border-white/70 bg-linear-to-b from-[#d59aff] to-[#ac2eeb] px-5 py-2 text-[11px] font-semibold text-white shadow-[inset_0_1px_5px_#ffffffb3,0_0_0_3px_#ffffff33] md:-bottom-3 md:-right-24 md:text-xs">
            2025
          </span>
        </header>

        <p
          className={`mx-auto mb-14 max-w-2xl text-center font-quicksand text-base md:mb-16 md:text-lg ${
            isSection ? 'text-white/90' : 'text-[#00558c]/80'
          }`}
        >
          A huge congratulations to every team who turned an idea into a product — and to{' '}
          <span className="font-bold text-[#FFE173]">{GRAND_WINNER.team}</span> for taking home the AI Ocean Award.
        </p>

        {/* ================= GRAND WINNER ================= */}
        <div
          data-winner-featured
          className={`relative mx-auto mb-16 md:mb-20 ${featuredWidth}`}
        >
          {isSection && <Confetti />}

          {/* Rotating radiance behind the champion */}
          <div
            aria-hidden="true"
            className="award-rays pointer-events-none absolute inset-[-55%] -z-10 rounded-full opacity-40"
            style={{
              background:
                'repeating-conic-gradient(from 0deg, rgba(255,241,180,0.7) 0deg 5deg, transparent 5deg 18deg)',
              maskImage: 'radial-gradient(circle, black 0%, transparent 64%)',
              WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 64%)',
            }}
          />

          {/* Golden halo */}
          <div
            aria-hidden="true"
            className="award-glow pointer-events-none absolute inset-[-12%] -z-10 rounded-[40%] bg-[radial-gradient(circle,rgba(255,211,78,0.6),transparent_66%)] blur-2xl"
          />

          <div className="group relative -rotate-2 transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]">
            <div
              className="relative rounded-[32px] p-[6px] shadow-[0_0_46px_rgba(255,211,78,0.55),0_30px_60px_rgba(0,69,161,0.5)]"
              style={{ backgroundImage: 'linear-gradient(135deg, #FFF8C9, #FFD34E 45%, #F5A623)' }}
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-[27px] bg-[#8fe0ff] ring-2 ring-white/70">
                <Image
                  src={GRAND_WINNER.src}
                  alt={`${GRAND_WINNER.title} award — ${GRAND_WINNER.team}`}
                  fill
                  sizes={
                    isSection
                      ? '(max-width: 640px) 80vw, (max-width: 1024px) 380px, 420px'
                      : '(max-width: 640px) 60vw, 310px'
                  }
                  className="object-cover"
                />
                <Shine />
              </div>
            </div>

            <span className="absolute -bottom-5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-white/80 bg-linear-to-b from-[#FFE173] to-[#F5A623] px-5 py-2 font-dela-gothic-one text-[11px] tracking-[0.14em] text-[#7a4a00] shadow-[0_8px_18px_rgba(0,69,161,0.35),inset_0_1px_4px_#ffffffb3] md:text-xs">
              GRAND WINNER
            </span>
          </div>

          <p className="sr-only">
            {GRAND_WINNER.category}: {GRAND_WINNER.title} — {GRAND_WINNER.team}
          </p>
        </div>

        {/* ================= OTHER AWARDS ================= */}
        <div
          ref={gridRef}
          className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4 md:gap-5"
        >
          {SECONDARY_AWARDS.map((award, index) => (
            <div
              key={`${award.title}-${award.team}`}
              data-award-card
              className={`group relative opacity-0 transition-transform duration-300 hover:-translate-y-2 hover:rotate-0 ${
                index % 2 === 0 ? '-rotate-2' : 'rotate-2'
              }`}
            >
              <div
                className="relative rounded-[26px] p-[4px] shadow-[0_14px_28px_rgba(0,69,161,0.3)] transition-shadow duration-300 group-hover:shadow-[0_22px_40px_rgba(0,69,161,0.45)]"
                style={{ backgroundImage: `linear-gradient(135deg, ${award.accent[0]}, ${award.accent[1]})` }}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-[22px] bg-[#8fe0ff] ring-1 ring-white/50">
                  <Image
                    src={award.src}
                    alt={`${award.title} award — ${award.team}`}
                    fill
                    sizes={
                      isSection
                        ? '(max-width: 640px) 45vw, (max-width: 1024px) 220px, 250px'
                        : '(max-width: 640px) 45vw, 230px'
                    }
                    className="object-cover"
                  />
                  <Shine />
                </div>
              </div>
              <span className="sr-only">
                {award.category}: {award.title} — {award.team}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Marquee variant={variant} />
    </section>
  )
}
