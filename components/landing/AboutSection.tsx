'use client'

import Image from 'next/image'

import Waves from '@/app/assets/waves_2.png'
import N1 from '@/app/assets/num_icons_1.png'
import N2 from '@/app/assets/num_icons_2.png'
import N3 from '@/app/assets/num_icons_3.png'
import N4 from '@/app/assets/num_icons_4.png'

export function AboutSection() {
  return (
    <section id="about" className="relative scroll-mt-16 bg-white overflow-hidden pt-6 md:pt-10 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_0.8fr] gap-6 md:gap-8 lg:gap-5 items-stretch rounded-2xl border border-[#D6EEFF] bg-[#F2F9FF] px-6 py-8">
            <div className="grid grid-cols-1 gap-6 text-center">
            <div>
              <h2 className="font-syncopate font-bold text-[#0B4A8A] text-xl md:text-2xl lg:text-3xl tracking-wide mb-3">
                About UXMM
              </h2>
              <p className="mx-auto max-w-xl font-quicksand font-medium text-[#2A6A9E] text-sm md:text-[15px] lg:text-base leading-relaxed">
                Since 2020, UXMM has been a pioneering force, fostering a culture of innovation and collaboration to
                advance the design field across the digital landscape of Myanmar.
              </p>
            </div>

            <div className="grid grid-cols-2 justify-items-center gap-x-6 gap-y-8 md:gap-x-12">
              {[
                { icon: N1, value: '50+', label: 'Events Hosted' },
                { icon: N2, value: '2500+', label: 'Total Participants' },
                { icon: N3, value: '320+', label: 'Trained Mentees' },
                { icon: N4, value: '65+', label: 'Volunteers Engaged' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-center gap-3 text-left">
                  <Image src={s.icon} alt="" width={1920} height={1820} className="w-4 h-4 md:w-10 md:h-10 object-contain" />
                  <div className="leading-tight">
                    <div className="font-quicksand font-bold text-[#0B4A8A] text-base md:text-lg lg:text-xl leading-none">{s.value}</div>
                    <div className="font-quicksand text-[#2A6A9E] text-xs md:text-sm leading-tight">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-w-0 flex-col items-center justify-center border-t border-dashed border-[#D6EEFF] pt-6 text-center lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            <div className="flex min-w-0 flex-nowrap items-center justify-center gap-2">
              <h2 className="shrink-0 font-syncopate font-bold text-[#0B4A8A] text-base sm:text-xl md:text-2xl lg:text-lg tracking-wide">
                UXMM HUB
              </h2>
              <span className="shrink-0 whitespace-nowrap rounded-full bg-[#B430D1] px-2 py-1 font-quicksand font-semibold text-white text-[10px] sm:text-xs md:text-sm lg:text-[10px]">
                Teaching Sector of UXMM
              </span>
            </div>
            <p className="mt-3 max-w-sm font-quicksand font-medium text-[#2A6A9E] text-sm md:text-[15px] leading-relaxed">
             UXMM Hub helps learners build practical skills through expert-led courses, hand-on learning, mentorship, and a supportive professional community.
            </p>
            <div className="mt-6 grid w-full grid-cols-2 items-center gap-4">
              <div className="grid justify-items-center gap-4">
                {[
                  { icon: N1, value: '30+', label: 'Learners Trained' },
                  { icon: N2, value: '7', label: 'Classes Completed' },
                ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-center gap-3 text-left">
                  <Image src={stat.icon} alt="" width={1920} height={1820} className="h-8 w-8 shrink-0 object-contain" />
                  <div className="leading-tight">
                    <div className="font-quicksand font-bold text-[#0B4A8A] text-lg leading-none">
                      {stat.value}
                    </div>
                    <div className="font-quicksand text-[#2A6A9E] text-sm leading-tight">
                      {stat.label}
                    </div>
                  </div>
                </div>
                ))}
              </div>
              <div className="flex flex-col items-start text-left">
                <Image src={N3} alt="" width={1920} height={1820} className="h-10 w-10 object-contain" />
                <div className="mt-2 font-quicksand font-bold text-[#0B4A8A] text-lg leading-none">
                  4
                </div>
                <div className="mt-1 font-quicksand text-[#2A6A9E] text-sm leading-tight">
                  Total Courses
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom waves - scaled down to avoid overwhelming layout */}
      <div className="relative w-full h-[200px] md:h-[500px]">
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
    </section>
  )
}
