'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { mentors } from '@/data/speakersData'
import { DetailCard, type Profile } from './SpeakersSection'

gsap.registerPlugin(ScrollTrigger)

const DESKTOP_VISIBLE_COUNT = 9

const profiles: Profile[] = mentors.map(mentor => ({
  ...mentor,
  roles: ['Mentor'],
}))

function MentorCard({
  profile,
  className = '',
  onSelect,
}: {
  profile: Profile
  className?: string
  onSelect: (profile: Profile) => void
}) {
  return (
    <article
      data-card
      role="button"
      tabIndex={0}
      aria-label={`View details for ${profile.name}`}
      onClick={() => onSelect(profile)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(profile)
        }
      }}
      className={`relative flex h-full cursor-pointer touch-manipulation items-center gap-4 rounded-[18px] bg-white p-4 text-[#00558c] shadow-[0_8px_14px_#007fa92b] outline-none focus-visible:ring-2 focus-visible:ring-[#08b8f1] focus-visible:ring-offset-2 ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-2 rounded-[12px] border-[1.5px] border-dashed border-[#08b8f1]"
      />
      <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-[14px] bg-[#e5f3f7] md:w-28">
        <Image
          src={profile.photo}
          alt={profile.name}
          fill
          sizes="(max-width: 767px) 96px, 112px"
          className="object-cover object-top"
        />
      </div>
      <div className="min-w-0">
        <h3 className="font-dela-gothic-one text-sm leading-snug md:text-base">{profile.name}</h3>
        {profile.position && (
          <p className="mt-1.5 text-xs font-semibold leading-snug text-[#1668a8] md:text-sm">
            {profile.position}
          </p>
        )}
      </div>
    </article>
  )
}

export function MentorsSection() {
  const rootRef = useRef<HTMLElement>(null)
  const profilesRef = useRef<HTMLDivElement>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [showAllMentors, setShowAllMentors] = useState(false)
  const detail = detailId ? profiles.find(profile => profile.id === detailId) ?? null : null

  useLayoutEffect(() => {
    const root = rootRef.current
    const cards = profilesRef.current?.querySelectorAll('[data-card]')
    if (!root || !cards?.length) return

    const context = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 50, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.07,
          ease: 'back.out(1.5)',
          scrollTrigger: { trigger: profilesRef.current, start: 'top 92%', once: true },
        }
      )
    }, root)

    return () => context.revert()
  }, [])

  useLayoutEffect(() => {
    if (!showAllMentors || !profilesRef.current) return
    const cards = profilesRef.current.querySelectorAll('[data-card]')
    const revealed = Array.from(cards).slice(DESKTOP_VISIBLE_COUNT)
    if (!revealed.length) return
    const tween = gsap.fromTo(
      revealed,
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        stagger: 0.05,
        ease: 'power2.out',
        overwrite: 'auto',
      }
    )
    return () => {
      tween.kill()
    }
  }, [showAllMentors])

  return (
    <section
      ref={rootRef}
      id="mentors"
      aria-labelledby="mentors-heading"
      className="relative overflow-hidden bg-[#16b8ef] px-5 pb-14 pt-24 text-white scroll-mt-20 md:px-12 md:pt-28"
    >
      <div className="mx-auto max-w-6xl">
        <header className="relative mx-auto w-fit max-w-full mb-8">
          <span className="absolute -top-8 left-[20%] rounded-full border border-white/70 bg-linear-to-b from-[#a0ddb1] to-[#42ad79] px-6 py-2 text-xs font-semibold shadow-[inset_0_1px_5px_#ffffffb3,0_0_0_3px_#ffffff33]">
            Mentorship
          </span>
          <h2 id="mentors-heading" className="font-dela-gothic-one text-center text-[clamp(2rem,4.8vw,3.5rem)] leading-tight tracking-tight">
            Our Mentors
          </h2>
        </header>

        <div
          id="mentor-profiles"
          ref={profilesRef}
          role="region"
          aria-label="Mentor profiles"
          data-lenis-prevent
          className="overflow-x-auto md:overflow-x-visible"
        >
          <div className="grid grid-flow-col grid-rows-3 gap-5 pb-2 auto-cols-[100%] md:grid-flow-row md:grid-cols-3 md:grid-rows-none md:pb-0">
            {profiles.map((profile, index) => (
              <MentorCard
                key={profile.id}
                profile={profile}
                className={!showAllMentors && index >= DESKTOP_VISIBLE_COUNT ? 'md:hidden' : ''}
                onSelect={selected => setDetailId(selected.id)}
              />
            ))}
          </div>
        </div>

        {profiles.length > DESKTOP_VISIBLE_COUNT && (
          <div className="mt-10 hidden justify-center md:flex">
            <button
              type="button"
              aria-expanded={showAllMentors}
              aria-controls="mentor-profiles"
              onClick={() => setShowAllMentors(current => !current)}
              className="rounded-full border border-white/80 bg-white/15 px-6 py-3 text-sm font-semibold text-white shadow-[inset_0_0_12px_3px_#ffffff40] transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {showAllMentors ? 'Show fewer mentors' : 'Meet all Mentors'}
            </button>
          </div>
        )}
      </div>

      {detail && <DetailCard profile={detail} onClose={() => setDetailId(null)} showRoleBadges={false} />}
    </section>
  )
}
