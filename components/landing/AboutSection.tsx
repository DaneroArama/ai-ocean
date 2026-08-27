'use client'

import Image from 'next/image'

import Waves from '@/app/assets/waves_2.webp'
import N1 from '@/app/assets/num_icon_1.webp'
import N2 from '@/app/assets/num_icon_2.webp'
import N3 from '@/app/assets/num_icon_3.webp'
import N4 from '@/app/assets/num_icon_4.webp'
import Starfish from '@/app/assets/Starfish.webp'

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
                  <Image src={s.icon} alt="" width={20} height={20} className="w-4 h-4 md:w-10 md:h-10 object-contain" />
                  <div className="leading-tight">
                    <div className="font-quicksand font-bold text-[#0B4A8A] text-base md:text-lg lg:text-xl leading-none">{s.value}</div>
                    <div className="font-quicksand text-[#2A6A9E] text-xs md:text-sm leading-tight">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ABOUT THE EVENT */}
        <div className="text-center mt-8 md:mt-10">
          <h2 className="font-syncopate font-extrabold text-[#0B4A8A] text-xl md:text-2xl lg:text-3xl tracking-wide">
            About the Event
          </h2>
          <p className="font-quicksand font-medium text-[#2A6A9E] text-sm md:text-[15px] lg:text-base leading-relaxed max-w-3xl mx-auto mt-3">
            During the AI Ocean event, you&apos;ll work alongside people from all backgrounds, experiment with
            user-friendly tools, and experience the thrill of building your own products
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-6 md:mt-8">
          {[
            {
              icon: Starfish,
              title: 'Access to Mentors & Experts',
              desc: 'Create opportunities for mentorship and industry engagement',
            },
            {
              icon: N2,
              title: 'Promoting Inclusive Collaboration',
              desc: 'Promote collaboration among every sector',
            },
            {
              icon: N3,
              title: 'Sparking Innovation with AI',
              desc: 'Encourage innovation and experimentation using AI tools',
            },
            {
              icon: N4,
              title: 'Real-World Impact',
              desc: 'Inspire participants to build real-world AI-powered solutions',
            },
          ].map((c) => (
            <div
              key={c.title}
              className="bg-[#F2F9FF] border border-[#D6EEFF] rounded-xl p-4 md:p-5 flex gap-3 md:gap-4 items-start"
            >
              <Image src={c.icon} alt="" width={24} height={24} className="w-5 h-5 md:w-12 md:h-12 object-contain" />
              <div>
                <h3 className="font-quicksand font-bold text-[#0B4A8A] text-base md:text-[16px] lg:text-[17px] leading-tight">
                  {c.title}
                </h3>
                <p className="font-quicksand text-[#2A6A9E] text-sm md:text-[13px] lg:text-[14px] leading-relaxed mt-1">
                  {c.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Full width last card */}
          <div className="md:col-span-2 bg-[#F2F9FF] border border-[#D6EEFF] rounded-xl p-4 md:p-5 flex gap-3 md:gap-4 items-start">
            <Image src={N1} alt="" width={24} height={24} className="w-5 h-5 md:w-12 md:h-12 object-contain" />
            <div>
              <div className="font-quicksand font-bold text-[#0B4A8A] text-base md:text-[16px] lg:text-[17px] leading-tight">
                Building Products with AI
              </div>
              <p className="font-quicksand text-[#2A6A9E] text-sm md:text-[13px] lg:text-[14px] leading-relaxed mt-1">
                Introduce participants for how we can create from idea to product using AI technologies and frameworks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom waves - scaled down to avoid overwhelming layout */}
      <div className="relative w-full h-[70px] sm:h-[90px] md:h-[120px] lg:h-[160px] overflow-hidden leading-none">
        <Image
          src={Waves}
          alt=""
          className="absolute bottom-0 left-0 w-full h-full object-cover object-top"
          priority
        />
      </div>
    </section>
  )
}
