'use client'

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { eventTeam } from '@/data/eventTeamData'

gsap.registerPlugin(ScrollTrigger)

export function EventTeamSection() {
  const rootRef = useRef<HTMLElement>(null)
  const membersRef = useRef<HTMLUListElement>(null)

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

  return (
    <section
      ref={rootRef}
      id="event-team"
      aria-labelledby="event-team-heading"
      className="relative overflow-hidden bg-[#16b8ef] px-5 pb-14 pt-24 text-white scroll-mt-20 md:px-12 md:pt-28"
    >
      <div className="mx-auto max-w-6xl">
        <header className="relative mx-auto w-fit max-w-full">
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

        <p className="mx-auto mb-10 mt-12 max-w-2xl text-center text-sm leading-relaxed text-white/90 sm:text-base">
          Meet the people who make this event possible.
        </p>

        <ul
          ref={membersRef}
          aria-label="Event team members"
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {eventTeam.map((name, index) => (
            <li
              key={`${name}-${index}`}
              data-member
              className="relative flex min-h-20 items-center justify-center rounded-[18px] bg-white p-4 text-center font-semibold text-[#00558c] shadow-[0_8px_14px_#007fa92b]"
            >
              <span aria-hidden="true" className="pointer-events-none absolute inset-[7px] rounded-[12px] border-[1.5px] border-dashed border-[#08b8f1]" />
              <span className="relative">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
