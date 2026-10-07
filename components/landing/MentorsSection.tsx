'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { mentors } from '@/data/speakersData'
import { BriefCard, DetailCard, type Profile } from './SpeakersSection'

gsap.registerPlugin(ScrollTrigger)

const INITIAL_MENTOR_COUNT = 8

const profiles: Profile[] = mentors.map(mentor => ({
  ...mentor,
  roles: ['Mentor'],
}))

export function MentorsSection() {
  const rootRef = useRef<HTMLElement>(null)
  const profilesRef = useRef<HTMLDivElement>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [showAllMentors, setShowAllMentors] = useState(false)
  const detail = detailId ? profiles.find(profile => profile.id === detailId) ?? null : null
  const visibleProfiles = showAllMentors ? profiles : profiles.slice(0, INITIAL_MENTOR_COUNT)

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

  return (
    <section
      ref={rootRef}
      id="mentors"
      aria-labelledby="mentors-heading"
      className="relative overflow-hidden bg-[#16b8ef] px-5 pb-14 pt-24 text-white scroll-mt-20 md:px-12 md:pt-28"
    >
      <div className="mx-auto max-w-6xl">
        <header className="relative mx-auto w-fit max-w-full">
          <span className="absolute -top-8 left-[20%] rounded-full border border-white/70 bg-linear-to-b from-[#a0ddb1] to-[#42ad79] px-6 py-2 text-xs font-semibold shadow-[inset_0_1px_5px_#ffffffb3,0_0_0_3px_#ffffff33]">
            Mentorship
          </span>
          <h2 id="mentors-heading" className="font-dela-gothic-one text-center text-[clamp(2rem,4.8vw,3.5rem)] leading-tight tracking-tight">
            Our Mentors
          </h2>
        </header>

        <p className="mx-auto mb-10 mt-12 max-w-2xl text-center text-sm leading-relaxed text-white/90 sm:text-base">
          Meet the experienced mentors ready to share their knowledge and guide our teams.
        </p>

        <div
          id="mentor-profiles"
          ref={profilesRef}
          role="region"
          aria-label="Mentor profiles"
        >
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {visibleProfiles.map((profile, index) => (
              <BriefCard
                key={profile.id}
                profile={profile}
                index={index}
                onSelect={selected => setDetailId(selected.id)}
                showMascot={false}
                showRoleBadges={false}
              />
            ))}
          </div>
        </div>

        {profiles.length > INITIAL_MENTOR_COUNT && (
          <div className="mt-10 flex justify-center">
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
