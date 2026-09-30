'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'

import Title from '@/app/assets/Title_coloured.png'

import A1 from '@/app/assets/about_icon_1.png'
import A2 from '@/app/assets/about_icon_2.png'
import A3 from '@/app/assets/about_icon_3.png'
import A4 from '@/app/assets/about_icon_4.png'
import A5 from '@/app/assets/about_icon_5.png'

export function EventCTASection() {
  const sectionRef = useRef<HTMLElement>(null)

  return (
    <>
    <section
      ref={sectionRef}
      className="relative bg-white overflow-hidden py-12 md:py-16 lg:py-20 w-full"
    >
      {/* Center CTA */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex justify-center mb-6 md:mb-8 w-full">
          <Image
            src={Title}
            alt="Ai Into The Ocean"
            width={420}
            height={120}
            className="w-[280px] sm:w-[340px] md:w-[420px] h-auto object-contain max-w-full"
            priority
          />
        </div>

        <p className="font-quicksand text-[#1A5F8A] text-sm md:text-[15px] font-semibold leading-relaxed w-full mx-auto mb-7 md:mb-8 text-center text-balance">
          This event emphasizes hands-on building across the complete AI product lifecycle from raw
          ideation and cross-sector development to a secure, localized launch
        </p>

        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSfv4INFwIXb3IaT4tFcbpBHgXZMxHlvlQDrMXN7Eqf_iDx1pw/viewform?usp=dialog"
          target="_blank"
          rel="noopener noreferrer"
          className="relative mt-2 inline-flex items-center gap-2 bg-[#FFA726] hover:bg-[#FF9800] text-white font-syne font-semibold text-sm md:text-[14px] px-6 md:px-7 py-2.5 rounded-full shadow-sm transition-colors duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Register Now
          <span aria-hidden>→</span>
        </a>
      </div>

      {/* Marquee rows - w-full overflow-hidden to not affect CTA width */}
      <div className="relative max-w-7xl mx-auto mt-12 md:mt-16 lg:mt-20 w-full overflow-hidden">
        {/* ABOUT THE Event */}
        <div className="text-center mt-8 md:mt-10">
          <h2 className="font-dela-gothic-one text-[#0B4A8A] text-xl md:text-4xl lg:text-5xl tracking-wide">
            About the Event
          </h2>
          <p className="font-quicksand font-semibold text-[#2A6A9E] text-sm md:text-[15px] lg:text-base leading-relaxed max-w-3xl mx-auto mt-6">
            During the AI Ocean event, you’ll work alongside people from all backgrounds, experiment with user-friendly tools, and experience the thrill of building your own products
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 mt-6 md:mt-8">
          {[
            {
              icon: A1,
              title: 'Access to Mentors & Experts',
              desc: 'Create opportunities for mentorship and industry engagement',
            },
            {
              icon: A2,
              title: 'Promoting Inclusive Collaboration',
              desc: 'Promote collaboration among every sector',
            },
            {
              icon: A3,
              title: 'Sparking Innovation with AI',
              desc: 'Encourage innovation and experimentation using AI tools',
            },
            {
              icon: A4,
              title: 'Real-World Impact',
              desc: 'Inspire participants to build real-world AI-powered solutions',
            },
          ].map((c) => (
            <div
              key={c.title}
              className="bg-[#F2F9FF] border-3 border-dashed border-ocean-surface rounded-3xl p-4 md:p-5 flex gap-3 md:gap-4 items-start"
            >
              <Image src={c.icon} alt="about_icon" className="w-5 h-5 md:w-12 md:h-12 object-contain" />
              <div>
                <div className="font-dela-gothic-one text-[#0B4A8A] text-base md:text-[16px] lg:text-xl leading-tight">
                  {c.title}
                </div>
                <p className="font-quicksand font-semibold text-[#2A6A9E] text-sm md:text-[13px] lg:text-[14px] leading-relaxed mt-1">
                  {c.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Full width last card */}
          <div className="md:col-span-2 bg-[#F2F9FF] border-3 border-dashed border-ocean-surface rounded-3xl p-4 md:p-5 flex gap-3 md:gap-4 items-start">
            <Image src={A5} alt="about_icon" className="w-5 h-5 md:w-12 md:h-12 object-contain" />
            <div>
              <div className="font-dela-gothic-one text-[#0B4A8A] text-base md:text-[16px] lg:text-xl leading-tight">
                Building Products with AI
              </div>
              <p className="font-quicksand font-semibold text-[#2A6A9E] text-sm md:text-[13px] lg:text-[14px] leading-relaxed mt-1">
                Introduce participants for how we can create from idea to product using AI technologies and frameworks
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}
