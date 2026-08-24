'use client'

import Image from 'next/image'
import Link from 'next/link'

import Tuto from '@/app/assets/Mascots/Tuto.png'
import Shark from '@/app/assets/Mascots/Shark.png'
import Crabi from '@/app/assets/Mascots/Crabi.png'
import Octo from '@/app/assets/Mascots/Octo.png'
import Ali from '@/app/assets/Mascots/Ali.png'
import Coral from '@/app/assets/Coral.png'
import Fishes from '@/app/assets/Fishes.png'
import Waves from '@/app/assets/waves.png'
import Bubble from '@/app/assets/bubble.svg'

/**
 * Personality Test Section — Discover Your AI Alter Ego
 *
 * Matches design:
 * - Full viewport blue gradient (ocean)
 * - Bubbles + fishes scattered
 * - Centered heading + CTA
 * - Bottom white bar with 5 mascots standing
 */
export function PersonalityTestSection() {
  return (
    <section className="relative h-[680px] md:h-[720px] lg:h-[720px] overflow-hidden bg-gradient-to-b from-[#0CB6FF] via-[#1ABEFF] to-[#2BD3FF] flex flex-col z-30">
      {/* Background bubbles - using app/assets/bubble.svg */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Large bubbles */}
        <div className="absolute left-[3%] top-[18%] w-7 h-7 md:w-9 md:h-9">
          <Image src={Bubble} alt="" width={36} height={36} className="w-full h-full object-contain" />
        </div>
        <div className="absolute right-[7%] top-[16%] w-7 h-7 md:w-9 md:h-9">
          <Image src={Bubble} alt="" width={36} height={36} className="w-full h-full object-contain" />
        </div>
        <div className="absolute left-[4%] top-[68%] w-6 h-6 md:w-8 md:h-8 opacity-90">
          <Image src={Bubble} alt="" width={32} height={32} className="w-full h-full object-contain" />
        </div>
        <div className="absolute right-[6%] top-[66%] w-5 h-5 md:w-7 md:h-7 opacity-90">
          <Image src={Bubble} alt="" width={28} height={28} className="w-full h-full object-contain" />
        </div>
        {/* Medium */}
        <div className="absolute left-[9%] top-[42%] w-3 h-3 md:w-4 md:h-4 opacity-90">
          <Image src={Bubble} alt="" width={16} height={16} className="w-full h-full object-contain" />
        </div>
        <div className="absolute right-[8%] top-[40%] w-3 h-3 md:w-4 md:h-4 opacity-90">
          <Image src={Bubble} alt="" width={16} height={16} className="w-full h-full object-contain" />
        </div>
        <div className="absolute left-[16%] top-[58%] w-2.5 h-2.5 md:w-3 md:h-3 opacity-80">
          <Image src={Bubble} alt="" width={12} height={12} className="w-full h-full object-contain" />
        </div>
        <div className="absolute right-[14%] top-[56%] w-2.5 h-2.5 md:w-3 md:h-3 opacity-80">
          <Image src={Bubble} alt="" width={12} height={12} className="w-full h-full object-contain" />
        </div>
        {/* Tiny */}
        <div className="absolute left-[6%] top-[52%] w-2 h-2 md:w-2.5 md:h-2.5 opacity-80">
          <Image src={Bubble} alt="" width={10} height={10} className="w-full h-full object-contain" />
        </div>
        <div className="absolute right-[18%] top-[48%] w-2 h-2 md:w-2.5 md:h-2.5 opacity-80">
          <Image src={Bubble} alt="" width={10} height={10} className="w-full h-full object-contain" />
        </div>
        <div className="absolute left-[32%] top-[64%] w-2 h-2 opacity-70">
          <Image src={Bubble} alt="" width={8} height={8} className="w-full h-full object-contain" />
        </div>
        <div className="absolute right-[9%] top-[78%] w-2 h-2 md:w-2.5 md:h-2.5 opacity-70">
          <Image src={Bubble} alt="" width={10} height={10} className="w-full h-full object-contain" />
        </div>
        <div className="absolute left-[36%] top-[54%] w-2 h-2 opacity-60">
          <Image src={Bubble} alt="" width={8} height={8} className="w-full h-full object-contain" />
        </div>
        <div className="absolute right-[36%] top-[58%] w-1.5 h-1.5 md:w-2 md:h-2 opacity-60">
          <Image src={Bubble} alt="" width={8} height={8} className="w-full h-full object-contain" />
        </div>
        {/* extra top right tiny */}
        <div className="absolute right-[3%] top-[12%] w-2 h-2 opacity-70">
          <Image src={Bubble} alt="" width={8} height={8} className="w-full h-full object-contain" />
        </div>
        <div className="absolute right-[3%] top-[38%] w-2 h-2 opacity-70">
          <Image src={Bubble} alt="" width={8} height={8} className="w-full h-full object-contain" />
        </div>
        <div className="absolute left-[52%] top-[42%] w-1.5 h-1.5 opacity-50">
          <Image src={Bubble} alt="" width={6} height={6} className="w-full h-full object-contain" />
        </div>
      </div>

      {/* Fishes - using Fishes.png scattered */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute left-[6%] top-[38%] w-14 md:w-16 opacity-90">
          <Image src={Fishes} alt="" width={64} height={32} className="object-contain" />
        </div>
        <div className="absolute right-[6%] top-[38%] w-14 md:w-16 opacity-90 scale-x-[-1]">
          <Image src={Fishes} alt="" width={64} height={32} className="object-contain" />
        </div>
        <div className="absolute left-[30%] top-[48%] w-12 md:w-14 opacity-80">
          <Image src={Fishes} alt="" width={64} height={32} className="object-contain" />
        </div>
        <div className="absolute right-[30%] top-[74%] w-10 md:w-12 opacity-40 hidden md:block">
          <Image src={Fishes} alt="" width={64} height={32} className="object-contain opacity-50" />
        </div>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pb-10 md:pb-16">
        <p className="font-quicksand text-white text-lg md:text-xl lg:text-2xl font-light tracking-wide mb-2 drop-shadow-sm">
          Discover Your
        </p>
        <h2 className="font-syncopate font-bold text-white text-3xl md:text-5xl lg:text-[52px] tracking-wide leading-none mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          AI ALTER EGO
        </h2>

        <Link
          href="#personality-test"
          className="group inline-flex items-center gap-2 bg-gradient-to-b from-[#FFD15A] to-[#FFA726] hover:from-[#FFD86B] hover:to-[#FFB02E] text-white font-quicksand font-semibold text-sm md:text-base px-7 md:px-8 py-3 rounded-full border border-white shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.6)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          Let&apos;s test
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </Link>
      </div>

      {/* Bottom white bar */}
      <div className="absolute bottom-0 left-0 w-full h-[86px] md:h-[96px] lg:h-[110px] bg-white z-[1]" />

      {/* Bottom coral decorations - sit on white bar */}
      <div className="absolute bottom-[86px] md:bottom-[96px] lg:bottom-[110px] left-[2%] md:left-[6%] w-14 md:w-16 lg:w-20 z-[2] pointer-events-none">
        <Image src={Coral} alt="" width={80} height={60} className="object-contain opacity-90" />
      </div>
      <div className="absolute bottom-[86px] md:bottom-[96px] lg:bottom-[110px] right-[6%] md:right-[10%] w-16 md:w-20 lg:w-24 z-[2] pointer-events-none">
        <Image src={Coral} alt="" width={96} height={70} className="object-contain opacity-90 scale-x-[-1]" />
      </div>
      {/* Extra tiny coral + waves near characters */}
      <div className="absolute bottom-[90px] md:bottom-[100px] left-[1%] w-8 md:w-10 z-[2] pointer-events-none hidden sm:block opacity-60">
        <Image src={Waves} alt="" width={40} height={24} className="object-contain" />
      </div>
      <div className="absolute bottom-[88px] md:bottom-[98px] right-[1%] w-12 md:w-16 z-[2] pointer-events-none hidden sm:block opacity-60">
        <Image src={Waves} alt="" width={64} height={40} className="object-contain scale-x-[-1]" />
      </div>

      {/* Characters row - standing on white bar */}
      <div className="absolute bottom-0 left-0 w-full z-[3] flex items-end justify-center gap-1 sm:gap-3 md:gap-6 lg:gap-8 xl:gap-10 px-2 sm:px-6 pointer-events-none">
        {/* Tuto - Turtle */}
        <div className="relative shrink-0 flex flex-col items-center -mb-1">
          <Image
            src={Tuto}
            alt="Tuto"
            width={160}
            height={180}
            className="w-[72px] sm:w-[92px] md:w-[122px] lg:w-[148px] h-auto object-contain drop-shadow-sm"
            priority
          />
          <div className="absolute -left-2 md:-left-3 bottom-[18px] md:bottom-[22px] w-6 md:w-8 opacity-70">
            <Image src={Waves} alt="" width={32} height={20} className="object-contain" />
          </div>
        </div>

        {/* Shark */}
        <div className="relative shrink-0 -mb-1">
          <Image
            src={Shark}
            alt="Sharkie"
            width={220}
            height={200}
            className="w-[92px] sm:w-[124px] md:w-[168px] lg:w-[200px] h-auto object-contain drop-shadow-sm"
            priority
          />
          <div className="absolute -right-1 bottom-[20px] w-6 md:w-8 opacity-70 hidden sm:block">
            <Image src={Waves} alt="" width={32} height={20} className="object-contain" />
          </div>
        </div>

        {/* Crabi */}
        <div className="relative shrink-0 -mb-1">
          <Image
            src={Crabi}
            alt="Crabi"
            width={180}
            height={180}
            className="w-[78px] sm:w-[108px] md:w-[144px] lg:w-[168px] h-auto object-contain"
            priority
          />
        </div>

        {/* Octo */}
        <div className="relative shrink-0 -mb-1">
          <Image
            src={Octo}
            alt="Octo"
            width={190}
            height={180}
            className="w-[84px] sm:w-[114px] md:w-[152px] lg:w-[176px] h-auto object-contain"
            priority
          />
        </div>

        {/* Ali */}
        <div className="relative shrink-0 -mb-1">
          <Image
            src={Ali}
            alt="Ali"
            width={210}
            height={180}
            className="w-[96px] sm:w-[132px] md:w-[176px] lg:w-[210px] h-auto object-contain"
            priority
          />
          <div className="absolute -right-2 bottom-[18px] w-10 md:w-14 opacity-80 hidden md:block">
            <Image src={Waves} alt="" width={56} height={28} className="object-contain" />
          </div>
        </div>
      </div>

      {/* subtle top vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 via-transparent to-transparent" />
    </section>
  )
}
