'use client'

import Image from 'next/image'

import Waves from '@/app/assets/waves_2.png'
import N1 from '@/app/assets/num_icons_1.png'
import N2 from '@/app/assets/num_icons_2.png'
import N3 from '@/app/assets/num_icons_3.png'
import N4 from '@/app/assets/num_icons_4.png'
import N5 from '@/app/assets/num_icons_5.png'
import N6 from '@/app/assets/num_icons_6.png'
import N7 from '@/app/assets/num_icons_7.png'

const LEFT_STATS = [
  { icon: N1, value: '50+', label: 'Events Hosted' },
  { icon: N2, value: '2500+', label: 'Total Participants' },
  { icon: N3, value: '320+', label: 'Trained Mentees' },
  { icon: N4, value: '65+', label: 'Volunteers Engaged' },
]

const RIGHT_STATS = [
  { icon: N5, value: '30+', label: 'Learners Trained' },
  { icon: N6, value: '7', label: 'Classes Completed' },
  { icon: N7, value: '4', label: 'Total Courses' },
]

/** Icon (with its own light-blue circle) + big number over its label. */
function AboutStat({ icon, value, label }: { icon: typeof N1; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      <Image src={icon} alt="" width={512} height={512} className="h-11 w-11 shrink-0 object-contain md:h-14 md:w-14" />
      <div className="min-w-0 leading-tight">
        <div className="font-quicksand font-bold leading-none text-[#0B4A8A] text-xl md:text-2xl lg:text-3xl">{value}</div>
        <div className="mt-1 font-quicksand text-xs leading-tight text-[#2A6A9E] md:text-sm lg:text-[15px]">{label}</div>
      </div>
    </div>
  )
}

export function AboutSection() {
  return (
    <section id="about" className="relative scroll-mt-16 bg-white overflow-hidden pt-6 md:pt-10 pb-0">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch gap-10 rounded-3xl border-2 border-dashed border-[#7CC4EF] bg-[#F8FBFF] px-6 py-8 md:px-10 md:py-10 lg:gap-12">
          {/* ===== About UXMM ===== */}
          <div>
            <h2 className="font-syncopate font-bold text-xl tracking-wide text-[#0B4A8A] md:text-2xl lg:text-3xl">
              About UXMM
            </h2>
            <p className="mt-4 max-w-xl font-quicksand font-medium text-sm leading-relaxed text-[#2A6A9E] md:text-[15px] lg:text-base">
              Since 2020, UXMM has been building Myanmar&apos;s design and digital product ecosystem through community,
              education, collaboration, and industry initiatives.
            </p>
            <div className="mt-8 grid grid-cols-2 justify-items-start gap-x-6 gap-y-7 md:gap-x-12 md:gap-y-9">
              {LEFT_STATS.map((s) => (
                <AboutStat key={s.label} {...s} />
              ))}
            </div>
          </div>

          {/* ===== UXMM HUB ===== */}
          <div className="border-t-2 border-dashed border-[#7CC4EF] pt-8 lg:border-l-2 lg:border-t-0 lg:pl-12 lg:pt-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h2 className="font-syncopate font-bold text-xl tracking-wide text-[#0B4A8A] md:text-2xl lg:text-3xl">
                UXMM HUB
              </h2>
              <span className="rounded-full border border-white/70 bg-linear-to-b from-[#d59aff] to-[#ac2eeb] px-6 py-2 text-sm text-white font-semibold shadow-[inset_0_1px_5px_#ffffffb3,0_0_0_3px_#ffffff33]">
                Teaching Sector of UXMM
              </span>
            </div>
            <p className="mt-4 max-w-xl font-quicksand font-medium text-sm leading-relaxed text-[#2A6A9E] md:text-[15px] lg:text-base">
              UXMM Hub helps learners build practical skills through expert-led courses, hands-on learning, mentorship,
              and a supportive professional community.
            </p>
            <div className="mt-8 grid grid-cols-2 justify-items-start gap-x-6 gap-y-7 md:gap-x-12 md:gap-y-9">
              {RIGHT_STATS.map((s) => (
                <AboutStat key={s.label} {...s} />
              ))}
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
