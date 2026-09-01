'use client'

import Image from 'next/image'
import Link from 'next/link'

import Tuto from '@/app/assets/Mascots/Tuto.png'
import Shark from '@/app/assets/Mascots/Shark.png'
import Crabi from '@/app/assets/Mascots/Crabi.png'
import Octo from '@/app/assets/Mascots/Octo.png'
import Ali from '@/app/assets/Mascots/Ali.png'
import Coral from '@/app/assets/Coral.png'
import Fishes from '@/app/assets/FIshes.png'
import Waves from '@/app/assets/waves.png'
import { FloatingBubbles } from '@/components/landing/FloatingBubbles'

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
      {/* Floating bubbles — rise + pop (reusable) — dense! */}
      <FloatingBubbles
        count={32}
        className="inset-0"
        sizeRange={[7, 36]}
        durationRange={[5.5, 11]}
        opacityRange={[0.25, 0.58]}
        pop
      />
      {/* Extra tiny ambient layer for depth */}
      <FloatingBubbles
        count={14}
        className="inset-0"
        sizeRange={[4, 12]}
        durationRange={[7, 13]}
        opacityRange={[0.18, 0.38]}
        pop
      />

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
          href="/archetype"
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
      <div className="absolute bottom-12 left-0 w-full z-[3] flex items-end justify-center gap-1 sm:gap-3 md:gap-6 lg:gap-8 xl:gap-10 px-2 sm:px-6 pointer-events-none">
        {/* Tuto - Turtle */}
        <div className="relative shrink-0 flex flex-col items-center -mb-1">
          <Image
            src={Tuto}
            alt="Tuto"
            width={160}
            height={180}
            className="w-[92px] sm:w-[124px] md:w-[168px] lg:w-[200px] h-auto object-contain drop-shadow-sm"
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
            className="w-[92px] sm:w-[124px] md:w-[168px] lg:w-[200px] h-auto object-contain"
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
            className="w-[92px] sm:w-[124px] md:w-[168px] lg:w-[200px] h-auto object-contain"
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
            className="w-[92px] sm:w-[124px] md:w-[168px] lg:w-[200px] h-auto object-contain"
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
