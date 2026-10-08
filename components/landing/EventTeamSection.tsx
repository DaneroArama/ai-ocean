'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { eventTeam } from '@/data/eventTeamData'

gsap.registerPlugin(ScrollTrigger)

const DESKTOP_VISIBLE_COUNT = 9

const membersWithPhoto = eventTeam.filter(member => member.photo)

export function EventTeamSection() {
  const rootRef = useRef<HTMLElement>(null)
  const membersRef = useRef<HTMLUListElement>(null)
  const [showAll, setShowAll] = useState(false)

  useLayoutEffect(() => {
    const root = rootRef.current
    const members = membersRef.current?.querySelectorAll('[data-member]')
    if (!root || !members?.length) return

    const context = gsap.context(() => {
      gsap.fromTo(
        members,
        { opacity: 0, y: 30, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.035,
          ease: 'power2.out',
          scrollTrigger: { trigger: membersRef.current, start: 'top 92%', once: true },
        }
      )
    }, root)

    return () => context.revert()
  }, [])

  useLayoutEffect(() => {
    if (!showAll || !membersRef.current) return
    const members = membersRef.current.querySelectorAll('[data-member]')
    const revealed = Array.from(members).slice(DESKTOP_VISIBLE_COUNT)
    if (!revealed.length) return
    const tween = gsap.fromTo(
      revealed,
      { opacity: 0, y: 24, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        stagger: 0.03,
        ease: 'power2.out',
        overwrite: 'auto',
      }
    )
    return () => {
      tween.kill()
    }
  }, [showAll])

  return (
    <section
      ref={rootRef}
      id="event-team"
      aria-labelledby="event-team-heading"
      className="relative overflow-hidden bg-[#16b8ef] px-5 pb-14 pt-24 text-white scroll-mt-20 md:px-12 md:pt-28"
    >
      <div className="mx-auto max-w-6xl">
        <header className="relative mx-auto w-fit max-w-full mb-8">
          <span className="absolute -top-8 left-[20%] rounded-full border border-white/70 bg-linear-to-b from-[#a0ddb1] to-[#42ad79] px-6 py-2 text-xs font-semibold shadow-[inset_0_1px_5px_#ffffffb3,0_0_0_3px_#ffffff33]">
            The Team
          </span>
          <h2
            id="event-team-heading"
            className="font-dela-gothic-one text-center text-[clamp(2rem,4.8vw,3.5rem)] leading-tight tracking-tight"
          >
            Event Team
          </h2>
        </header>

        <div data-lenis-prevent className="overflow-x-auto md:overflow-x-visible">
          <ul
            id="event-team-list"
            ref={membersRef}
            aria-label="Event team members"
            className="grid grid-flow-col grid-rows-3 gap-5 pb-2 auto-cols-[85%] md:grid-flow-row md:grid-cols-3 md:grid-rows-none md:pb-0"
          >
            {membersWithPhoto.map((member, index) => (
              <li
                key={`${member.name}-${index}`}
                data-member
                className={`relative flex min-h-24 items-center gap-4 rounded-[18px] bg-white p-3 text-[#00558c] shadow-[0_8px_14px_#007fa92b] ${
                  !showAll && index >= DESKTOP_VISIBLE_COUNT ? 'md:hidden' : ''
                }`}
              >
                <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-[14px] bg-[#e5f3f7] md:w-24">
                  <Image
                    src={member.photo!}
                    alt={member.name}
                    fill
                    sizes="(max-width: 767px) 80px, 96px"
                    className="object-cover object-top"
                  />
                </div>
                <span className="font-dela-gothic-one min-w-0 text-sm leading-snug md:text-base">
                  {member.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p aria-hidden="true" className="mt-4 flex justify-center md:hidden">
          <span className="rounded-full border border-white/60 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90">
            Swipe for more →
          </span>
        </p>

        {membersWithPhoto.length > DESKTOP_VISIBLE_COUNT && (
          <div className="mt-10 hidden justify-center md:flex">
            <button
              type="button"
              aria-expanded={showAll}
              aria-controls="event-team-list"
              onClick={() => setShowAll(current => !current)}
              className="rounded-full border border-white/80 bg-white/15 px-6 py-3 text-sm font-semibold text-white shadow-[inset_0_0_12px_3px_#ffffff40] transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {showAll ? 'Show fewer members' : 'Show all members'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
