'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import Waves from '@/app/assets/waves_3.png'

const TEAM_DATA = [
  {
    name: 'Team A',
    badge: 'Winner',
    members: [
      'Sitt Ye Yint Tun',
      'Nwe Oo Lwin',
      'Shwe Htoo Si Thu',
      'Min Naing',
      'Su Nandar',
      'Pingu Thin Thu',
      'Aung Phone',
    ],
  },
  {
    name: 'This team name is so long',
    members: [
      'Lorem Throw',
      'Sitt Ye Yint Tun',
      'Nwe Oo Lwin',
      'Shwe Htoo Si Thu',
      'Min Naing',
      'Su Nandar',
      'Pingu Thin Thu',
      'Aung Phone',
    ],
  },
  {
    name: 'Team A',
    members: [
      'Sitt Ye Yint Tun',
      'Nwe Oo Lwin',
      'Shwe Htoo Si Thu',
      'Min Naing',
      'Su Nandar',
      'Pingu Thin Thu',
      'Aung Phone',
    ],
  },
]

// Duplicate data to fill grid
const ALL_TEAMS = [...TEAM_DATA, ...TEAM_DATA]

export function TeamModal() {
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

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
    const modal = modalRef.current
    const content = contentRef.current
    if (!modal || !content) return

    const tl = gsap.timeline({
      onComplete: () => router.back(),
    })
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-modal-title"
    >
      <div
        ref={contentRef}
        className="relative w-full max-w-[1400px] max-h-[90vh] overflow-hidden rounded-[32px] bg-gradient-to-b from-[#36c8f3] via-[#e8faff] via-60% to-white shadow-2xl"
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
          className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full bg-[#ff8659] px-4 py-2 text-white shadow-lg transition-all hover:bg-[#ff7545] active:scale-95"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-semibold">Back to Event Page</span>
        </button>

        {/* Scrollable content */}
        <div className="max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="relative px-6 pt-20 pb-8 text-center">
            <div className="relative inline-block">
              <span className="absolute -right-16 -top-8 rounded-full bg-[#ff8659] px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                Intro
              </span>
              <h1 id="team-modal-title" className="font-dela-gothic-one text-4xl md:text-5xl text-[#00558c]">
                Buildathon Teams
              </h1>
              <span className="absolute -left-16 -bottom-2 rounded-full bg-[#21c6f3] px-4 py-1.5 text-xs font-semibold text-white shadow-lg">
                Finalists
              </span>
            </div>
            <p className="font-quicksand mt-4 text-base text-[#00558c]/80">
              Meet the teams bringing their ideas to life.
            </p>
          </div>

          {/* Teams grid */}
          <div className="px-6 pb-8">
            <div className="rounded-3xl bg-white bg-[radial-gradient(#e9edf0_1px,transparent_1px)] bg-[length:22px_22px] p-6 md:p-8">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {ALL_TEAMS.map((team, index) => (
                  <div
                    key={`team-${index}`}
                    data-team-card
                    className="group relative rounded-2xl border-2 border-dashed border-[#ddd] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:border-[#00b5ed] hover:shadow-[0_8px_20px_rgba(0,181,237,0.15)] hover:-translate-y-1"
                  >
                    {/* Team header */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <h3 className="font-dela-gothic-one text-lg text-[#00558c] leading-tight">
                        {team.name}
                      </h3>
                      {team.badge && (
                        <span className="shrink-0 rounded-full bg-[#a4ecff] px-3 py-1 text-xs font-bold text-[#00558c]">
                          {team.badge}
                        </span>
                      )}
                    </div>

                    {/* Members list */}
                    <ul className="space-y-2.5">
                      {team.members.map((member, idx) => (
                        <li key={idx} className="flex items-center gap-2.5 text-sm text-[#00558c]/90">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00b5ed]" />
                          <span className="font-quicksand font-medium">{member}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Hover decoration */}
                    <div className="pointer-events-none absolute -right-2 -top-2 h-12 w-12 rounded-full bg-[#00b5ed]/10 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#00b5ed] to-[#21c6f3] p-6 text-center text-white shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-lg font-bold">+</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h4 className="font-dela-gothic-one text-2xl mb-2">Don't See Your Team? No Worries</h4>
                <p className="font-quicksand text-sm opacity-95">
                  More participating teams will appear here as registration and team formation continue.
                </p>
              </div>
            </div>
          </div>

          {/* Waves footer */}
          <div className="pointer-events-none relative h-32 sm:h-40 overflow-hidden">
            <Image
              src={Waves}
              alt=""
              fill
              className="object-cover object-top"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
