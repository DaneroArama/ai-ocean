'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import Waves from '@/app/assets/waves_2.png'
import EventLogoGrey from '@/app/assets/event_logo_grey.png'

type TeamMember = { name: string; role?: string }
type Team = { name: string; badge?: string; members: TeamMember[] }

// Hardcoded for now — some positions are not assigned yet (omit `role`)
const TEAM_DATA: Team[] = [
  {
    name: 'OnErrorResumeNext',
    badge: 'Recent',
    members: [
      { name: 'Thuriya Ye Naing', role: 'Full Stack Developer' },
      { name: 'Wint Khant Lin', role: 'Product Designer' },
      { name: 'Shoon Lae Moe Oo', role: 'Product Owner' },
      { name: 'Moe Thura Aung' },
    ],
  },
  {
    name: 'Aquaholics',
    members: [
      { name: 'Kaung Set Thar', role: 'Full Stack Developer' },
      { name: 'Pan Myo Phyu', role: 'Business Analyst, Product Designer' },
      { name: 'Aye Nandar Win', role: 'Business Analyst, UI Designer, UX Designer' },
      { name: 'Ye Htet Naing', role: 'Frontend Developer, Product Manager' },
      { name: 'Aung Khant Min', role: 'Backend Developer' },
      { name: 'Thaw Thaw Tun', role: 'UI Designer, UX Designer' },
    ],
  },
  {
    name: 'Zero_Lag',
    members: [
      { name: 'Zaw Lwin Htoo', role: 'Full Stack Developer' },
      { name: 'Min Kyi Sin Thant' },
      { name: 'Yan Lin Naing' },
      { name: 'Kyaw Bhone Htet' },
      { name: 'Bhone Myat Htut' },
      { name: 'Zin Min Htet' },
      { name: 'Min Thant Tun' },
    ],
  },
]

const ALL_TEAMS = [...TEAM_DATA]

const ROLE_ABBREV: Record<string, string> = {
  'Full Stack Developer': 'FSD',
  'Frontend Developer': 'FE',
  'Front End Developer': 'FE',
  'Backend Developer': 'BE',
  'Back End Developer': 'BE',
  'UI Designer': 'UI',
  'UX Designer': 'UX',
  'Product Manager': 'PM',
  'Project Manager': 'PM',
  'Product Designer': 'PD',
  'Product Owner': 'PO',
  'Business Analyst': 'BA',
}

function abbreviateRoles(role: string): string {
  return role
    .split(',')
    .map(part => ROLE_ABBREV[part.trim()] ?? part.trim())
    .join(', ')
}

/** 4-point twinkle star — blinks via the `.cta-star` keyframes. */
function Sparkle({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} style={style}>
      <path d="M12 0 Q13 11 24 12 Q13 13 12 24 Q11 13 0 12 Q11 11 12 0 Z" fill="currentColor" />
    </svg>
  )
}

export function TeamModal({ variant = 'modal' }: { variant?: 'modal' | 'page' }) {
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const closingRef = useRef(false)
  const [activeRole, setActiveRole] = useState<string | null>(null)

  useEffect(() => {
    const modal = modalRef.current
    const content = contentRef.current
    if (!modal || !content) return

    // Initial animation
    gsap.set(modal, { opacity: 0 })
    gsap.set(content, { y: 50, opacity: 0 })

    const tl = gsap.timeline()
    tl.to(modal, { opacity: 1, duration: 0.3 })
      .to(content, { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.2')

    // Animate team cards
    const cards = gsap.utils.toArray<HTMLElement>('[data-team-card]')
    gsap.fromTo(
      cards,
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'back.out(1.5)',
        delay: 0.3,
      }
    )

    return () => {
      tl.kill()
    }
  }, [])

  const handleClose = () => {
    if (closingRef.current) return
    closingRef.current = true

    const navigateAway = () => {
      // Intercepted modal: go back to the page underneath.
      // Standalone /team page: land on the homepage (no in-app history).
      if (variant === 'page') {
        router.replace('/')
      } else {
        router.back()
      }
    }

    const modal = modalRef.current
    const content = contentRef.current
    if (!modal || !content) {
      navigateAway()
      return
    }

    const tl = gsap.timeline({ onComplete: navigateAway })
    tl.to(content, { y: 30, opacity: 0, duration: 0.25, ease: 'power2.in' })
      .to(modal, { opacity: 0, duration: 0.2 }, '-=0.1')
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      data-lenis-prevent
      onWheel={e => {
        // Wheel over the backdrop (ultrawide side strips) must not scroll the page behind
        if (e.target === e.currentTarget) e.preventDefault()
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overscroll-contain bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-modal-title"
    >
      <div
        ref={contentRef}
        className="relative flex h-full w-full flex-col overflow-hidden bg-white"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#00558c] shadow-lg transition-all hover:bg-white hover:scale-110 active:scale-95"
          aria-label="Close team modal"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Back button */}
        <button
          onClick={handleClose}
          className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-ocean-deep/5 hover:border-ocean-deep bg-white px-4 py-2 text-ocean-deep hover:shadow-lg transition-all active:scale-95"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-semibold font-syne">Back to Event Page</span>
        </button>

        {/* Scrollable content */}
        <div
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {/* Header */}
          <div className="px-6 pt-20 pb-8 text-center">
            <div className="relative inline-block w-fit">
              <span className="absolute left-3 top-3 md:-left-12 md:-top-8 rounded-full bg-linear-to-b from-[#ffb99b] to-[#ff8659] px-4 py-1.5 text-xs font-semibold text-white shadow-[inset_0_0_5px_2px_#ffffff80,0_2px_10px_#00000020] md:-left-16">
                Ideas
              </span>
              <h1 id="team-modal-title" className="font-dela-gothic-one text-4xl md:text-5xl text-[#00558c]">
                Buildathon Teams
              </h1>
              <span className="absolute right-5 bottom-0 md:-right-12 md:-bottom-2 rounded-full bg-linear-to-b from-[#c084fc] to-[#9333ea] px-4 py-1.5 text-xs font-semibold text-white shadow-[inset_0_0_5px_2px_#ffffff80,0_2px_10px_#00000020] md:-right-16">
                Products
              </span>
            </div>
            <p className="font-quicksand mt-4 text-base text-[#00558c]/80">
              Meet the teams bringing their ideas to life.
            </p>
          </div>

          {/* Detail container (ScheduleSection style) */}
          <div className="mx-auto max-w-[1200px] px-4 pb-8">
            <div className="rounded-[22px] bg-linear-to-b from-[#36c8f3] via-[#e8faff] via-60% to-white px-3 pb-8 shadow-[inset_0_2px_8px_#ffffffa0,0_4px_16px_#00558c04]">
              <div className="flex min-h-10 items-center justify-end px-2 py-2">
                <div aria-hidden="true" className="flex shrink-0 gap-2">
                  {[0, 90, 180].map(rotation => (
                    <Image
                      key={rotation}
                      src={EventLogoGrey}
                      alt=""
                      className="size-5 brightness-0 invert"
                      style={{ transform: `rotate(${rotation}deg)` }}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white bg-[radial-gradient(#e9edf0_1px,transparent_1px)] bg-size-[22px_22px] px-4 py-8 md:px-5">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {ALL_TEAMS.map((team, index) => (
                    <div
                      key={`team-${index}`}
                      data-team-card
                      className="group relative rounded-2xl border-2 border-dashed border-ocean-deep bg-white p-5 shadow-[0_0_8px_#00000008] transition-shadow hover:shadow-[0_0_14px_#00000018]"
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-2 rounded-2xl border border-[#ddd]"
                      />

                      {/* Team header */}
                      <div className="relative mb-4 flex items-start justify-between gap-3">
                        <h3 className="font-dela-gothic-one text-lg text-[#00558c] leading-tight">
                          {team.name}
                        </h3>
                        {team.badge && (
                          <span className="shrink-0 rounded-full bg-linear-to-b from-[#c084fc] to-[#9333ea] px-3 py-1 text-xs font-semibold text-white shadow-[inset_0_0_5px_2px_#ffffff80,0_2px_10px_#00000020]">
                            {team.badge}
                          </span>
                        )}
                      </div>

                      {/* Members list */}
                      <ul className="relative">
                        {team.members.map((member, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2.5 border-b border-[#e9edf0] py-2.5 text-sm text-[#00558c]/90 last:border-b-0"
                          >
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ocean-deep" />
                            <span className="font-quicksand font-medium">{member.name}</span>
                            {member.role && (
                              <div className="group/role relative ml-auto shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveRole(prev => (prev === `${index}-${idx}` ? null : `${index}-${idx}`))
                                  }
                                  className="rounded-full bg-[#a4ecff] px-2.5 py-0.5 text-[11px] font-bold text-[#00558c] transition-colors hover:bg-[#8ee4ff]"
                                  aria-label={`${member.name}: ${member.role}`}
                                >
                                  {abbreviateRoles(member.role)}
                                </button>
                                <span
                                  role="tooltip"
                                  className={`pointer-events-none absolute bottom-full right-0 mb-1.5 whitespace-nowrap rounded-lg bg-ocean-deep px-2.5 py-1 text-[11px] font-semibold text-white shadow-lg transition-opacity duration-150 group-hover/role:opacity-100 ${
                                    activeRole === `${index}-${idx}` ? 'opacity-100' : 'opacity-0'
                                  }`}
                                >
                                  {member.role}
                                  <span className="absolute -bottom-1 right-3 h-2 w-2 rotate-45 bg-ocean-deep" />
                                </span>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>

                      {/* Hover decoration */}
                      <div className="pointer-events-none absolute -right-2 -top-2 h-12 w-12 rounded-full bg-[#00b5ed]/10 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                    </div>
                  ))}
                </div>

                {/* Bottom CTA */}
              <div className="relative mt-8 overflow-hidden rounded-[28px] bg-[#1CBEFE] p-6 text-left text-white shadow-lg md:p-8">
                {/* Blinking sparkle stars */}
                <Sparkle className="cta-star absolute left-[8%] top-[8%] w-4 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] md:w-6" style={{ animationDuration: '2.6s' }} />
                <Sparkle className="cta-star absolute left-[50%] top-[10%] w-4 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] md:w-5" style={{ animationDuration: '3.2s', animationDelay: '0.6s' }} />
                <Sparkle className="cta-star absolute bottom-[10%] left-[38%] w-3 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] md:w-4" style={{ animationDuration: '2.2s', animationDelay: '1.1s' }} />
                <Sparkle className="cta-star absolute bottom-[8%] right-[12%] w-4 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.7)] md:w-6" style={{ animationDuration: '3s', animationDelay: '0.3s' }} />
                {/* Big yellow star on the right */}
                <Sparkle className="cta-star absolute -right-3 top-[15%] w-16 text-[#FFC93C] drop-shadow-[0_0_10px_rgba(255,201,60,0.6)] md:-right-4 md:w-24" style={{ animationDuration: '3.6s', animationDelay: '0.5s' }} />
                <h4 className="font-dela-gothic-one relative z-10 text-2xl md:text-3xl">Don&apos;t See Your Team? No Worries</h4>
                <p className="font-quicksand relative z-10 mt-2 text-sm opacity-95">
                  More participating teams will appear here as registration and team formation continue.
                </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom waves - scaled down to avoid overwhelming layout */}
          <div className="relative w-full h-[200px] md:h-[500px] overflow-hidden">
            <Image
              src={Waves}
              alt=""
              className="absolute -bottom-5 left-[-25%] w-full h-[200px] md:h-[400px] md:left-[-15%] object-contain"
              priority
            />
            <Image
              src={Waves}
              alt=""
              className="absolute -bottom-5 right-[-32%] w-full h-[200px] object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
