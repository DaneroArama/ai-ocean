'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import Image, { type StaticImageData } from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import EventLogo from '@/app/assets/event_logo_grey.png'
import Starfish from '@/app/assets/Starfish.png'
import Shell from '@/app/assets/Shell_1.png'
import Ali from '@/app/assets/Mascots/Ali.png'
import Crabi from '@/app/assets/Mascots/Crabi.png'
import Octo from '@/app/assets/Mascots/Octo.png'
import Shark from '@/app/assets/Mascots/Shark.png'
import Tuto from '@/app/assets/Mascots/Tuto.png'
import { judges } from '@/data/judgesData'
import { rolesById, speakers } from '@/data/speakersData'

gsap.registerPlugin(ScrollTrigger)

export type Role = 'Speaker' | 'Panelist' | 'Moderator' | 'Judge' | 'Mentor'
type Category = 'Speakers' | 'Panelists' | 'Judges'

export type Profile = {
  id: string
  name: string
  position?: string
  organization?: string
  bio?: string
  photo: StaticImageData | string
  roles: Role[]
}

const categories: { label: Category; icon: StaticImageData }[] = [
  { label: 'Speakers', icon: EventLogo },
  { label: 'Panelists', icon: Starfish },
  { label: 'Judges', icon: Shell },
]

const roleBadgeClass: Record<Role, string> = {
  Speaker: 'bg-linear-to-b from-[#ffb28b] to-[#ff7849]',
  Panelist: 'bg-linear-to-b from-[#d59aff] to-[#ac2eeb]',
  Moderator: 'bg-linear-to-b from-[#8ec5ff] to-[#3b82f6]',
  Judge: 'bg-linear-to-b from-[#a0ddb1] to-[#42ad79]',
  Mentor: 'bg-linear-to-b from-[#a0ddb1] to-[#42ad79]',
}

const MASCOTS = [Ali, Crabi, Octo, Shark, Tuto]

/** One roster for all three lists — a person with several roles (e.g. Speaker
 *  + Panelist, Speaker + Moderator) is merged by name and shows every role
 *  badge while appearing in each of their tabs.
 */
const roster: Profile[] = (() => {
  const map = new Map<string, Profile>()
  const key = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const add = (profile: Profile) => {
    const existing = map.get(key(profile.name))
    if (existing) {
      profile.roles.forEach(role => {
        if (!existing.roles.includes(role)) existing.roles.push(role)
      })
    } else {
      map.set(key(profile.name), profile)
    }
  }
  speakers.forEach(s =>
    add({
      id: s.id,
      name: s.name,
      position: s.position,
      organization: s.organization,
      bio: s.bio,
      photo: s.photo,
      roles: rolesById[s.id] ?? ['Speaker'],
    })
  )
  judges.forEach(judge =>
    add({
      ...judge,
      roles: ['Judge'],
    })
  )
  return [...map.values()]
})()

const judgeOrder = new Map(judges.map((judge, index) => [judge.id, index]))

const profilesFor = (category: Category): Profile[] => {
  if (category === 'Panelists') {
    // moderators run the panel sessions, so they live in this tab too
    return roster.filter(
      profile => profile.roles.includes('Panelist') || profile.roles.includes('Moderator')
    )
  }
  if (category === 'Judges') {
    // judges who are also speakers sit early in the roster, so re-sort by
    // judgesData order to honor the intended sequence
    return roster
      .filter(profile => profile.roles.includes('Judge'))
      .sort((a, b) => (judgeOrder.get(a.id) ?? 0) - (judgeOrder.get(b.id) ?? 0))
  }
  return roster.filter(profile => profile.roles.includes('Speaker'))
}

export function BriefCard({ profile, index, onSelect, showMascot = true, showRoleBadges = true }: { profile: Profile; index: number; onSelect: (profile: Profile) => void; showMascot?: boolean; showRoleBadges?: boolean }) {
  const mascot = MASCOTS[index % MASCOTS.length]
  const mascotLeft = index % 2 === 1

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
      className="relative flex h-full cursor-pointer touch-manipulation flex-col rounded-[18px] bg-white p-[18px] text-[#00558c] shadow-[0_8px_14px_#007fa92b] outline-none focus-visible:ring-2 focus-visible:ring-[#08b8f1] focus-visible:ring-offset-2"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-[7px] rounded-[12px] border-[1.5px] border-dashed border-[#08b8f1]" />
      <div className="relative aspect-square overflow-hidden rounded-[22px] bg-[#e5f3f7]">
        <Image
          src={profile.photo}
          alt={profile.name}
          fill
          sizes="(max-width: 479px) 85vw, (max-width: 767px) 42vw, (max-width: 1279px) 21vw, 260px"
          className="object-cover object-top"
        />
        {showRoleBadges && (
          <span className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {profile.roles.map(role => (
              <span
                key={role}
                className={`rounded-full border border-white/80 px-2.5 py-1 text-[10px] font-semibold leading-none text-white shadow-[inset_0_1px_4px_#ffffffb3,0_1px_5px_#00000040] ${roleBadgeClass[role]}`}
              >
                {role}
              </span>
            ))}
          </span>
        )}
      </div>
      <h3 className="font-dela-gothic-one mt-3 text-sm leading-[1.4]">{profile.name}</h3>
      {(profile.position || profile.organization) && (
        <div className="mt-auto pt-6 text-sm font-semibold">
          {profile.position && <p className="leading-snug">{profile.position}</p>}
          {profile.organization && (
            <p className="mt-1.5 text-xs leading-relaxed text-[#ac22ff]">@ {profile.organization}</p>
          )}
        </div>
      )}

      {/* Mascot peeking from a corner on hover (GSAP owns its transforms) */}
      {showMascot && (
        <span
          data-mascot
          aria-hidden="true"
          className={`pointer-events-none absolute z-20 h-14 w-14 opacity-0 md:h-16 md:w-16 ${mascotLeft ? '-bottom-3 -left-3 md:-bottom-4 md:-left-4' : '-bottom-3 -right-3 md:-bottom-4 md:-right-4'}`}
        >
          <Image
            src={mascot}
            alt=""
            width={72}
            height={72}
            className="h-full w-full object-contain drop-shadow-[0_5px_7px_rgba(0,45,75,0.35)]"
          />
        </span>
      )}
    </article>
  )
}

export function DetailCard({ profile, onClose, showRoleBadges = true }: { profile: Profile; onClose: () => void; showRoleBadges?: boolean }) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const bioRef = useRef<HTMLParagraphElement>(null)
  const closingRef = useRef(false)
  const [overflowing, setOverflowing] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const close = () => {
    if (closingRef.current || !cardRef.current || !backdropRef.current) return
    closingRef.current = true
    gsap
      .timeline({ onComplete: onClose })
      .to(cardRef.current, { opacity: 0, scale: 0.93, y: 40, duration: 0.25, ease: 'power2.in' })
      .to(backdropRef.current, { opacity: 0, duration: 0.22 }, '<')
  }

  useLayoutEffect(() => {
    const el = bioRef.current
    if (el && el.scrollHeight > el.clientHeight + 4) setOverflowing(true)
    const ctx = gsap.context(() => {
      gsap
        .timeline()
        .fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
        .fromTo(
          cardRef.current,
          { opacity: 0, scale: 0.88, y: 60 },
          { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(1.5)' },
          '-=0.15'
        )
        .fromTo(
          '[data-detail-photo]',
          { opacity: 0, scale: 0.85, rotation: -4 },
          { opacity: 1, scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(1.8)' },
          '-=0.3'
        )
        .fromTo(
          '[data-detail-text] > *',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, stagger: 0.07, duration: 0.35, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo(
          '[data-detail-tags] > *',
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, stagger: 0.07, duration: 0.4, ease: 'back.out(2.5)' },
          '-=0.25'
        )
    }, cardRef)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const expandBio = () => {
    const el = bioRef.current
    if (!el) return
    gsap.to(el, {
      maxHeight: el.scrollHeight,
      duration: 0.45,
      ease: 'power2.out',
      onComplete: () => {
        setExpanded(true)
        setOverflowing(false)
      },
    })
  }

  return (
    <div
      ref={backdropRef}
      onClick={close}
      data-lenis-prevent
      className="fixed inset-0 z-[70] flex touch-manipulation items-center justify-center bg-[#062c49]/70 p-4 backdrop-blur-sm"
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${profile.name} details`}
        onClick={event => event.stopPropagation()}
        data-lenis-prevent
        className="relative flex max-h-[80dvh] w-full max-w-3xl flex-col rounded-[26px] bg-linear-to-b from-[#16b8ef] to-white shadow-[inset_0px_0px_20px_5px_rgba(255,255,255,10)] px-4 pt-8 pb-4"
      >
        <button
          type="button"
          onClick={close}
          aria-label="Close details"
          className="absolute right-4 top-1 z-20 flex h-9 w-9 items-center justify-center text-white transition-transform hover:scale-110"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="grid gap-5 rounded-[18px] bg-white p-4 sm:grid-cols-[minmax(0,230px)_minmax(0,1fr)] sm:p-6">
          <div className="flex flex-col items-center gap-4 sm:items-start">
            <div
              data-detail-photo
              className="relative aspect-square w-40 overflow-hidden rounded-[20px] border-[1.5px] border-dashed border-[#08b8f1] bg-[#e5f3f7] sm:w-full"
            >
              <Image
                src={profile.photo}
                alt={profile.name}
                fill
                sizes="(max-width: 639px) 160px, 230px"
                className="object-cover object-top"
              />
            </div>
            {showRoleBadges && (
              <div data-detail-tags className="flex flex-wrap justify-center gap-2 sm:justify-start">
                {profile.roles.map(role => (
                  <span
                    key={role}
                    className={`rounded-full border border-white/80 px-4 py-1.5 text-xs font-semibold text-white shadow-[inset_0_1px_4px_#ffffffb3,0_1px_5px_#00000040] ${roleBadgeClass[role]}`}
                  >
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div data-detail-text className="min-w-0">
            <h3 className="font-dela-gothic-one text-xl leading-tight text-[#0b4a8a] sm:text-2xl md:text-3xl">
              {profile.name}
            </h3>
            {profile.position && (
              <p className="mt-2 text-sm font-semibold leading-snug text-[#1668a8] sm:text-base">{profile.position}</p>
            )}
            {profile.organization && (
              <p className="mt-1.5 text-sm font-semibold text-[#ac22ff] sm:text-base">@ {profile.organization}</p>
            )}
            {profile.bio && (
              <div className="mt-4 border-t border-dashed border-[#cfe8f6] pt-4">
                <p
                  ref={bioRef}
                  style={{
                    maxHeight: expanded ? 'none' : 160,
                    maskImage: overflowing ? 'linear-gradient(to bottom, black calc(100% - 32px), transparent)' : 'none',
                    WebkitMaskImage: overflowing
                      ? 'linear-gradient(to bottom, black calc(100% - 32px), transparent)'
                      : 'none',
                  }}
                  className="overflow-hidden whitespace-pre-line text-sm leading-relaxed text-[#3c6b8e]"
                >
                  {profile.bio}
                </p>
                {overflowing && (
                  <button
                    type="button"
                    onClick={expandBio}
                    className="mt-2 text-sm font-bold text-[#ff9c2b] transition-colors hover:text-[#ff7b00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff9c2b]"
                  >
                    Show more ↓
                  </button>
                )}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SpeakersSection() {
  const rootRef = useRef<HTMLElement>(null)
  const profilesRef = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('Judges')
  const [detailId, setDetailId] = useState<string | null>(null)

  const profiles = profilesFor(activeCategory)
  const detail = detailId ? roster.find(profile => profile.id === detailId) ?? null : null

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const cleanups: Array<() => void> = []
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)
      const cards = q('[data-card]')

      // Mascots start hidden in their corner; GSAP owns every transform here.
      gsap.set(q('[data-mascot]'), { opacity: 0, scale: 0.4, y: 26 })

      if (cards.length) {
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
      }

      cards.forEach((item, index) => {
        const card = item as HTMLElement
        const mascot = card.querySelector('[data-mascot]')
        const mascotLeft = index % 2 === 1

        const onEnter = (event: PointerEvent) => {
          if (event.pointerType !== 'mouse') return
          card.style.zIndex = '30'
          gsap.to(card, {
            y: -8,
            scale: 1.03,
            boxShadow: '0 18px 30px rgba(0, 64, 102, 0.35)',
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto',
          })
          if (mascot) {
            gsap.to(mascot, {
              opacity: 1,
              scale: 1,
              y: 0,
              rotate: mascotLeft ? -14 : 14,
              duration: 0.5,
              ease: 'back.out(2.4)',
              overwrite: 'auto',
            })
          }
        }
        const onLeave = () => {
          card.style.removeProperty('z-index')
          gsap.to(card, {
            y: 0,
            scale: 1,
            boxShadow: '0 8px 14px rgba(0, 127, 169, 0.17)',
            duration: 0.35,
            ease: 'power2.out',
            overwrite: 'auto',
          })
          if (mascot) {
            gsap.to(mascot, {
              opacity: 0,
              scale: 0.4,
              y: 26,
              rotate: 0,
              duration: 0.3,
              ease: 'power2.in',
              overwrite: 'auto',
            })
          }
        }

        card.addEventListener('pointerenter', onEnter)
        card.addEventListener('pointerleave', onLeave)
        cleanups.push(() => {
          card.removeEventListener('pointerenter', onEnter)
          card.removeEventListener('pointerleave', onLeave)
        })
      })
    }, root)

    return () => {
      cleanups.forEach(fn => fn())
      ctx.revert()
    }
  }, [activeCategory])

  return (
    <section
      ref={rootRef}
      id="speakers"
      aria-labelledby="speakers-heading"
      className="relative overflow-hidden bg-[#16b8ef] px-5 pb-14 pt-24 text-white scroll-mt-20 md:px-12 md:pt-28"
    >
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

        <div id="speaker-profiles" ref={profilesRef} role="region" aria-label={activeCategory} aria-live="polite">
          {profiles.length > 0 ? (
            <div className="grid gap-5 grid-cols-2 md:grid-cols-4">
              {profiles.map((profile, index) => (
                <BriefCard key={profile.id} profile={profile} index={index} onSelect={p => setDetailId(p.id)} />
              ))}
            </div>
          ) : (
            <p className="rounded-[18px] border border-dashed border-white/70 px-6 py-16 text-center text-base font-semibold">
              {activeCategory} will be announced soon.
            </p>
          )}
        </div>
      </div>

      {detail && <DetailCard profile={detail} onClose={() => setDetailId(null)} />}
    </section>
  )
}
