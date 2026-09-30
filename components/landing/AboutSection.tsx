'use client'

import Image from 'next/image'

import Waves from '@/app/assets/waves_2.png'
import N1 from '@/app/assets/num_icons_1.png'
import N2 from '@/app/assets/num_icons_2.png'
import N3 from '@/app/assets/num_icons_3.png'
import N4 from '@/app/assets/num_icons_4.png'

export function AboutSection() {
  return (
    <section className="relative bg-white overflow-hidden pt-6 md:pt-10 pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ABOUT UXMM */}
        <div className="bg-[#F2F9FF] border border-[#D6EEFF] rounded-2xl px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.85fr] center gap-6 md:gap-8 items-center">
            <div>
              <h2 className="font-syncopate font-bold text-[#0B4A8A] text-xl md:text-2xl lg:text-3xl tracking-wide mb-3">
                About UXMM
              </h2>
              <p className="font-quicksand font-medium text-[#2A6A9E] text-sm md:text-[15px] lg:text-base leading-relaxed max-w-xl">
                Since 2020, UXMM has been a pioneering force, fostering a culture of innovation and collaboration to
                advance the design field across the digital landscape of Myanmar.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:gap-x-12">
              {[
                { icon: N1, value: '50+', label: 'Events Hosted' },
                { icon: N2, value: '2500+', label: 'Total Participants' },
                { icon: N3, value: '320+', label: 'Trained Mentees' },
                { icon: N4, value: '65+', label: 'Volunteers Engaged' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <Image src={s.icon} alt="" width={1920} height={1820} className="w-4 h-4 md:w-10 md:h-10 object-contain" />
                  <div className="leading-tight">
                    <div className="font-quicksand font-bold text-[#0B4A8A] text-base md:text-lg lg:text-xl leading-none">{s.value}</div>
                    <div className="font-quicksand text-[#2A6A9E] text-xs md:text-sm leading-tight">{s.label}</div>
                  </div>
                </div>
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
