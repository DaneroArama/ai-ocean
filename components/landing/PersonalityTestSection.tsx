'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import Tuto from '@/app/assets/Mascots/Tuto.png'
import Shark from '@/app/assets/Mascots/Shark.png'
import Crabi from '@/app/assets/Mascots/Crabi.png'
import Octo from '@/app/assets/Mascots/Octo.png'
import Ali from '@/app/assets/Mascots/Ali.png'
import Coral from '@/app/assets/Coral.png'
import Fishes from '@/app/assets/FIshes.png'
import Waves from '@/app/assets/waves.png'

import { CharacterModal, characters } from './CharacterModal'

/**
 * Static presentation of each mascot on the white bar
 * (the animated versions live inside CharacterModal)
 */
const SECTION_LAYOUT: Record<string, {
  image: typeof Tuto
  width: number
  height: number
  dropShadow: boolean
  wave?: string
}> = {
  tuto: {
    image: Tuto,
    width: 160,
    height: 180,
    dropShadow: true,
    wave: 'absolute -left-2 md:-left-3 bottom-[18px] md:bottom-[22px] w-6 md:w-8 opacity-70',
  },
  shark: {
    image: Shark,
    width: 220,
    height: 200,
    dropShadow: true,
    wave: 'absolute -right-1 bottom-[20px] w-6 md:w-8 opacity-70 hidden sm:block',
  },
  crabi: { image: Crabi, width: 180, height: 180, dropShadow: false },
  octo: { image: Octo, width: 190, height: 180, dropShadow: false },
  ali: {
    image: Ali,
    width: 210,
    height: 180,
    dropShadow: false,
    wave: 'absolute -right-2 bottom-[18px] w-10 md:w-14 opacity-80 hidden md:block',
  },
}

/** Display order on the white bar */
const SECTION_ORDER = ['tuto', 'shark', 'crabi', 'octo', 'ali'] as const

const sectionCharacters = SECTION_ORDER.map((id) => {
  const character = characters.find((item) => item.id === id)
  const layout = SECTION_LAYOUT[id]
  const [name, role] = character?.name.split(' (') ?? ['', '']
  return {
    id,
    name: name ?? '',
    designation: (role ?? '').replace(/\)$/, ''),
    quote: character?.quote ?? '',
    ...layout,
  }
})

/**
 * Personality Test Section — Discover Your AI Alter Ego
 *
 * - Full viewport blue gradient (ocean) with bubbles + fishes
 * - Centered heading + CTA
 * - Bottom white bar with 5 mascots standing
 * - Hovering a mascot pops a yellow chat tooltip (AnimatedTooltip style)
 * - Clicking/tapping a mascot opens the full-width CharacterModal
 */
export function PersonalityTestSection() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [modalIndex, setModalIndex] = useState<number | null>(null)

  const openCharacter = (id: string) => {
    const index = characters.findIndex((character) => character.id === id)
    if (index >= 0) setModalIndex(index)
  }

  return (
    <>
      <section
        id="characters"
        className="relative h-[680px] md:h-[720px] lg:h-[720px] overflow-hidden bg-linear-to-b from-transparent to-[#46E6FF] flex flex-col z-30"
      >

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
          <h2 className="font-dela-gothic-one font-bold text-white text-3xl md:text-5xl lg:text-[52px] tracking-wide leading-none mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
            Ocean Archetype
          </h2>
          
          <div className="flex gap-4 items-center">
            <Link
              href="/archetype"
              className="group whitespace-nowrap shrink-0 w-fit flex items-center gap-2 bg-[#FFA726] hover:bg-[#FFB02E] text-white font-syne font-semibold text-sm md:text-base px-7 md:px-8 py-3 rounded-full border border-white shadow-[0_4px_12px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.6)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Let&apos;s test
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>

            <Link
              href="/frame-generator"
              className="bg-white/20 block w-full font-syne font-semibold px-6 py-3 text-center text-white border border-white/30 rounded-full shadow-[inset_0px_0px_20px_5px_rgba(255,255,255,10)] hover:brightness-110 transition-all"
            >
            Create Your Event Frame
            </Link>
          </div>
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
        <div className="absolute bottom-12 left-0 w-full z-20 flex items-end justify-center gap-0 sm:gap-0 md:gap-6 lg:gap-8 xl:gap-10 px-2 sm:px-6 pointer-events-none">
          {sectionCharacters.map((character) => (
            <button
              key={character.id}
              type="button"
              onClick={() => openCharacter(character.id)}
              onMouseEnter={() => setHoveredId(character.id)}
              onMouseLeave={() => setHoveredId(null)}
              onFocus={() => setHoveredId(character.id)}
              onBlur={() => setHoveredId(null)}
              aria-haspopup="dialog"
              aria-label={`Meet ${character.name}, ${character.designation}`}
              className="group relative shrink-0 -mb-1 flex flex-col items-center pointer-events-auto cursor-pointer touch-manipulation border-0 bg-transparent p-0"
            >
              {/* Yellow chat tooltip (AnimatedTooltip style) */}
              <div className="pointer-events-none absolute bottom-full left-full z-50 mb-4 -translate-x-1/2">
                <AnimatePresence>
                  {hoveredId === character.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        transition: { type: 'spring', stiffness: 300, damping: 20 },
                      }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="min-w-[240px] rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 px-4 py-2 shadow-xl text-left"
                    >
                      <div className="text-xl font-bold text-white font-syne">{character.name}</div>
                      <div className="text-sm text-white/90">{character.designation}</div>
                      <button
                        className="text-sm text-ocean-deep mt-1 font-bold transition-colors"
                        onClick={() => openCharacter(character.id)}
                      >
                        Click to Read More →
                      </button>
                      <div className="absolute -bottom-6 left-[5%] h-4 w-4 -translate-x-1/2 rounded-full bg-orange-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Image
                src={character.image}
                alt={character.name}
                width={character.width}
                height={character.height}
                priority
                className={`w-[80px] sm:w-[124px] md:w-[168px] lg:w-[200px] h-auto object-contain transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-105 group-active:scale-95 ${
                  character.dropShadow ? 'drop-shadow-sm' : ''
                }`}
              />

              {character.wave && (
                <div className={character.wave}>
                  <Image src={Waves} alt="" width={32} height={20} className="object-contain" />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Full-width character modal */}
      {modalIndex !== null && (
        <CharacterModal index={modalIndex} onClose={() => setModalIndex(null)} />
      )}
    </>
  )
}
