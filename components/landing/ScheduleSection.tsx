'use client'

import { useState } from 'react'
import Image from 'next/image'
import EventLogoGrey from '@/app/assets/event_logo_grey.png'
import EventLogoYellow from '@/app/assets/event_logo_yellow.png'
import Waves from '@/app/assets/waves_2.png'
import { AnimatedTooltip } from '@/components/AnimatedToolTip'
import { phases, phaseSchedules } from '@/data/scheduleData'

export function ScheduleSection() {
  const [activePhase, setActivePhase] = useState(0)
  const schedule = phaseSchedules[activePhase]

  return (
    <section aria-labelledby="schedule-heading" className="relative isolate overflow-hidden bg-white pt-24 text-[#00558c] md:pt-28">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <header className="relative mx-auto mb-8 w-fit max-w-full md:mb-2">
          <span className="absolute -left-3 -top-6 rounded-full bg-linear-to-b from-[#ffb99b] to-[#ff8659] px-5 py-1.5 text-xs font-semibold text-white shadow-[inset_0_0_5px_2px_#ffffff80,0_2px_10px_#00000020] md:-left-16">
            6 Phases
          </span>
          <h2 id="schedule-heading" className="font-dela-gothic-one relative text-center text-[clamp(1.6rem,4.7vw,3.75rem)] leading-tight tracking-tight">
            Timeline &amp; Agenda
          </h2>
          <span className="absolute -bottom-6 right-0 rounded-full bg-linear-to-b from-[#a4ecff] to-[#21c6f3] px-6 py-1.5 text-xs font-semibold text-white shadow-[inset_0_0_5px_2px_#ffffff80,0_2px_10px_#00000020] md:-right-16 md:-bottom-1">
            Event
          </span>
        </header>

        <div className="-mx-5 overflow-x-auto px-5 pb-4 pt-8 md:-mx-8 md:px-8" data-lenis-prevent-horizontal>
          <div className="grid min-w-[790px] grid-cols-7 gap-2.5" aria-label="Event phases">
            {phases.map((phase, index) => {
              const selected = activePhase === index
              return (
                <button
                  key={`${phase.phase}-${index}`}
                  type="button"
                  aria-pressed={selected}
                  aria-controls="schedule-detail"
                  onClick={() => setActivePhase(index)}
                  className={`group relative flex min-h-[144px] cursor-pointer flex-col justify-between rounded-2xl p-3 text-left shadow-[0_0_5px_#0000000d] transition-colors md:min-h-[130px] lg:min-h-[180px] lg:p-4 ${selected ? 'bg-[#00b5ed] text-white' : 'bg-white text-[#00558c] hover:bg-[#f2fbff]'}`}
                >
                  {selected && (
                    <>
                      <span aria-hidden="true" className="pointer-events-none absolute inset-[3px] rounded-[13px] border-[1.5px] border-dashed border-white" />
                      <span aria-hidden="true" className="pointer-events-none absolute -top-7 left-4 h-7 w-20 bg-[repeating-conic-gradient(from_-65deg_at_50%_100%,#fff4a8_0deg_14deg,transparent_14deg_28deg)] mask-[linear-gradient(to_top,black,transparent)]" />
                    </>
                  )}
                  <span>
                    <span className={`mb-1 block text-[10px] font-semibold ${selected ? 'text-white' : 'text-[#ff9f00]'}`}>
                      {phase.phase}{index === 0 ? ' Complete' : ''}
                    </span>
                    <span className="font-syne block text-xs font-bold leading-[1.2] lg:text-base">{phase.title}</span>
                  </span>
                  {phase.date ? (
                    <span className="font-syne mt-4 flex flex-col font-bold leading-none">
                      <span className="text-[28px]">{phase.date}</span>
                      <span className="mt-1 text-base">{phase.month}</span>
                    </span>
                  ) : (
                    <Image src={EventLogoGrey} alt="" className={`mt-4 size-10 object-contain ${selected ? 'brightness-0 invert' : 'opacity-60'}`} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div id="schedule-detail" role="region" aria-labelledby="agenda-title" className="relative mx-auto mt-8 max-w-[1200px] rounded-[22px] bg-linear-to-b from-[#36c8f3] via-[#e8faff] via-60% to-white px-3 pb-8 shadow-[inset_0_2px_8px_#ffffffa0,0_4px_16px_#00558c04] md:mx-4 md:pb-10">
          <div className="flex min-h-10 items-center justify-between gap-3 px-2 py-2">
            <h3 id="agenda-title" className="font-dela-gothic-one text-sm text-white md:text-base">{schedule.title}</h3>
            <div aria-hidden="true" className="flex shrink-0 gap-2">
              {[0, 90, 180].map(rotation => (
                <Image key={rotation} src={EventLogoGrey} alt="" className="size-5 brightness-0 invert" style={{ transform: `rotate(${rotation}deg)` }} />
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-white bg-[radial-gradient(#e9edf0_1px,transparent_1px)] bg-size-[22px_22px] px-4 py-8 md:px-5">
            {schedule.type === 'upcoming' ? (
              <div className="rounded-2xl border-2 border-dashed border-[#ddd] bg-white p-5 md:p-7">
                <p className="font-syne text-lg font-bold">{schedule.description}</p>
                <ul className="mt-5 space-y-3">
                  {schedule.upcomingItems?.map(item => (
                    <li key={item} className="flex items-center gap-3 text-sm font-semibold">
                      <Image src={EventLogoYellow} alt="" className="size-6 shrink-0 object-contain" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                {schedule.scheduleItems.map((item, index) => (
                  <div key={index} className="grid gap-5 rounded-2xl border-2 border-dashed border-[#ddd] bg-white p-4 ring-4 ring-white shadow-[0_0_8px_#00000008] md:grid-cols-[minmax(120px,17%)_1fr]">
                    <p className="text-base font-bold">{item.time}</p>
                    <div className="space-y-4">
                      {item.events.map(event => (
                        <div key={event.title} className="flex flex-col items-start justify-between gap-4 md:flex-row">
                          <div className="min-w-0 flex-1">
                            <h4 className={`font-quicksand text-base font-bold ${event.highlight ? 'text-amber-600' : ''}`}>{event.title}</h4>
                            {event.description && <p className="mt-1.5 text-xs font-medium leading-[1.4] text-[#444]">{event.description}</p>}
                          </div>
                          {event.people.length > 0 && (
                            <div className="relative shrink-0">
                              <AnimatedTooltip items={event.people} variant="agenda" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {schedule.registrationLink && (
              <div className="mt-6 text-center text-sm font-semibold">
                <p>{schedule.registrationLink.text}</p>
                <button type="button" className="mt-3 rounded-full bg-amber-400 px-6 py-3 text-white">{schedule.registrationLink.buttonText}</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="pointer-events-none relative mt-24 h-[160px] sm:h-[260px] overflow-hidden md:h-[36vw] md:max-h-[520px]">
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-[#12b9ee]" />
        <Image src={Waves} alt="" sizes="75vw" className="absolute -left-[22%] bottom-0 h-full w-[88%] object-fill" />
        <Image src={Waves} alt="" sizes="55vw" className="absolute -right-[8%] bottom-0 h-[66%] w-[56%] object-fill" />
      </div>
    </section>
  )
}
