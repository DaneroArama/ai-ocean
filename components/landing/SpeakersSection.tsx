'use client'

import { useState } from 'react'
import Image, { type StaticImageData } from 'next/image'
import EventLogo from '@/app/assets/event_logo_grey.png'
import Starfish from '@/app/assets/Starfish.png'
import Shell from '@/app/assets/Shell_1.png'
import { speakers } from '@/data/speakersData'
import { phaseSchedules } from '@/data/scheduleData'

type Category = 'Speakers' | 'Panelists' | 'Judges'
type Profile = {
  id: string
  name: string
  position: string
  organization: string
  photo: StaticImageData | string
}

const categories: { label: Category; role: string; icon: StaticImageData }[] = [
  { label: 'Speakers', role: 'Speaker', icon: EventLogo },
  { label: 'Panelists', role: 'Panelist', icon: Starfish },
  { label: 'Judges', role: 'Judge', icon: Shell },
]

// Reuse the existing panel roster without assigning unconfirmed judge roles.
const panelists: Profile[] = phaseSchedules[0].scheduleItems
  .flatMap(item => item.events)
  .filter(event => event.title === 'Panelists')
  .flatMap(event => event.people)
  .map(person => ({
    id: `panelist-${person.id}`,
    name: person.name,
    position: person.designation,
    organization: person.company,
    photo: person.image,
  }))

const profiles: Record<Category, Profile[]> = {
  Speakers: speakers,
  Panelists: panelists,
  Judges: [],
}

function SpeakerCard({ profile, role }: { profile: Profile; role: string }) {
  return (
    <article className="relative flex h-full flex-col rounded-[18px] bg-white p-[18px] text-[#00558c] shadow-[0_8px_14px_#007fa92b]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-[7px] rounded-[12px] border-[1.5px] border-dashed border-[#08b8f1]" />
      <div className="relative aspect-square overflow-hidden rounded-[22px] bg-[#e5f3f7]">
        <Image
          src={profile.photo}
          alt={profile.name}
          fill
          sizes="(max-width: 479px) 85vw, (max-width: 767px) 42vw, (max-width: 1279px) 21vw, 260px"
          className="object-cover object-top"
        />
        <span className="absolute bottom-3 left-3 rounded-full border border-white/80 bg-linear-to-b from-[#a7dcb4] to-[#45ae79] px-3 py-1 text-[11px] font-semibold leading-none text-white shadow-[inset_0_1px_4px_#ffffffb3,0_1px_5px_#00000040]">
          {role}
        </span>
      </div>
      <h3 className="font-dela-gothic-one mt-3 text-sm leading-[1.4]">{profile.name}</h3>
      <div className="mt-auto pt-14 text-sm font-semibold">
        <p className="leading-snug">{profile.position}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-[#ac22ff]">@ {profile.organization}</p>
      </div>
    </article>
  )
}

export function SpeakersSection() {
  const [activeCategory, setActiveCategory] = useState<Category>('Speakers')
  const category = categories.find(item => item.label === activeCategory)!

  return (
    <section id="speakers" aria-labelledby="speakers-heading" className="relative overflow-hidden bg-[#16b8ef] px-5 pb-14 pt-24 text-white scroll-mt-20 md:px-12 md:pt-28">
      <div className="mx-auto max-w-6xl">
        <header className="relative mx-auto w-fit max-w-full">
          <span className="absolute -top-8 left-[20%] rounded-full border border-white/70 bg-linear-to-b from-[#a0ddb1] to-[#42ad79] px-6 py-2 text-xs font-semibold shadow-[inset_0_1px_5px_#ffffffb3,0_0_0_3px_#ffffff33]">
            Judges
          </span>
          <h2 id="speakers-heading" className="font-dela-gothic-one text-center text-[clamp(2rem,4.8vw,3.5rem)] leading-tight tracking-tight">Our Speakers</h2>
          <span className="absolute -bottom-7 left-0 rounded-full border border-white/70 bg-linear-to-b from-[#ffb28b] to-[#ff7849] px-6 py-2 text-xs font-semibold shadow-[inset_0_1px_5px_#ffffffb3,0_0_0_3px_#ffffff33] md:-left-24 md:-bottom-1">
            Speakers
          </span>
          <span className="absolute -bottom-7 right-0 rounded-full border border-white/70 bg-linear-to-b from-[#d59aff] to-[#ac2eeb] px-6 py-2 text-xs font-semibold shadow-[inset_0_1px_5px_#ffffffb3,0_0_0_3px_#ffffff33] md:-right-24 md:-bottom-1">
            Panelists
          </span>
        </header>

        <div className="mb-12 mt-16 flex flex-wrap justify-center gap-3 md:mb-14 md:mt-10" role="group" aria-label="Filter event participants">
          {categories.map(item => (
            <button
              key={item.label}
              type="button"
              aria-pressed={activeCategory === item.label}
              aria-controls="speaker-profiles"
              onClick={() => setActiveCategory(item.label)}
              className={`font-syne inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/75 px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${activeCategory === item.label ? 'bg-white/15 shadow-[inset_0_0_12px_3px_#ffffffa6]' : 'bg-transparent hover:bg-white/15'}`}
            >
              <Image src={item.icon} alt="" className="size-5 object-contain brightness-0 invert" />
              {item.label}
            </button>
          ))}
        </div>

        <div id="speaker-profiles" role="region" aria-label={activeCategory} aria-live="polite">
          {profiles[activeCategory].length > 0 ? (
            <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 md:grid-cols-4">
              {profiles[activeCategory].map(profile => (
                <SpeakerCard key={profile.id} profile={profile} role={category.role} />
              ))}
            </div>
          ) : (
            <p className="rounded-[18px] border border-dashed border-white/70 px-6 py-16 text-center text-base font-semibold">
              Judges will be announced soon.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
