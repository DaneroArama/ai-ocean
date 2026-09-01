'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import Image from "next/image"
import gsap from 'gsap'

import uxmmLogo from "@/app/assets/uxmm_logo.svg"
import Shark from '@/app/assets/Mascots/Shark.png'
import Ali from '@/app/assets/Mascots/Ali.png'
import Crabi from '@/app/assets/Mascots/Crabi.png'
import Octo from '@/app/assets/Mascots/Octo.png'
import Tuto from '@/app/assets/Mascots/Tuto.png'

const popupMascots = [Shark, Crabi, Octo, Ali, Tuto]

function ComingSoonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const tl = gsap.timeline()
    tl.fromTo('.cs-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.25 })
    tl.fromTo('.cs-card', { scale: 0.6, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: 0, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.1')
    tl.fromTo('.cs-emoji', { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.4, ease: 'back.out(2)' }, '-=0.25')
    tl.fromTo('.cs-text > *', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.08, ease: 'power2.out' }, '-=0.2')
  }, [open])

  const handleClose = useCallback(() => {
    const tl = gsap.timeline({ onComplete: onClose })
    tl.to('.cs-card', { scale: 0.8, opacity: 0, y: 30, duration: 0.3, ease: 'power2.in' })
    tl.to('.cs-backdrop', { opacity: 0, duration: 0.2 }, '-=0.1')
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={handleClose}>
      <div className="cs-backdrop absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="cs-card relative z-10 bg-gradient-to-br from-[#0B5D7D] via-[#02A4E3] to-[#1CB2E5] rounded-3xl p-8 md:p-10 max-w-md mx-4 text-center shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cs-emoji mb-4 select-none flex justify-center">
          <Image src={Octo} alt="Octo mascot" width={80} height={80} className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-lg" />
        </div>
        <div className="cs-text space-y-3">
          <h2 className="font-syne text-2xl md:text-3xl font-bold text-white">
            Coming Soooooon!
          </h2>
          <p className="font-quicksand text-white/80 text-sm md:text-base leading-relaxed">
            Our octopus friends are still building the registration waves.
            <br />
            Hold tight — something amazing is surfacing!
          </p>
          <div className="flex justify-center gap-3 pt-2">
            {popupMascots.map((src, i) => (
              <div key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                <Image src={src} alt="" width={40} height={40} className="w-10 h-10 object-contain" />
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={handleClose}
          className="mt-6 px-6 py-2 bg-white/20 hover:bg-white/30 text-white font-syne font-semibold rounded-full border border-white/30 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  )
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showComingSoon, setShowComingSoon] = useState(false)

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)
  const closeMobileMenu = () => setMobileMenuOpen(false)

  const scrollTo = (id: string) => {
    closeMobileMenu()
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <nav className="fixed z-[1030] w-full">
        <div className="bg-ocean-primary/30 backdrop-blur-sm">
          <div className="mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <Image
                  src={uxmmLogo}
                  alt="UXMM Logo"
                  width={50}
                  height={50}
                  className="h-full w-12"
                />
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => scrollTo('hero')}
                  className="font-syne text-base font-semibold tracking-wider text-white [text-shadow:0_1.95px_0_#00000033] hover:text-ocean-foam transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollTo('event')}
                  className="font-syne text-base font-semibold tracking-wider text-white [text-shadow:0_1.95px_0_#00000033] hover:text-ocean-foam transition-colors"
                >
                  Event
                </button>
                <button
                  onClick={() => scrollTo('characters')}
                  className="font-syne text-base font-semibold tracking-wider text-white [text-shadow:0_1.95px_0_#00000033] hover:text-ocean-foam transition-colors"
                >
                  Characters
                </button>
              </div>

              {/* Desktop Register Button */}
              <div className="hidden md:flex">
                <button
                  onClick={() => setShowComingSoon(true)}
                  className="bg-ocean-primary/20 font-syne [text-shadow:0_1.95px_0_#00000033] px-6 py-2 text-white border border-white/30 rounded-full shadow-[inset_0px_0px_20px_5px_rgba(255,255,255,10)] hover:brightness-110 transition-all font-medium"
                >
                  Register
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                  aria-label="Toggle menu"
                  aria-expanded={mobileMenuOpen}
                >
                  {mobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-ocean-primary/95 backdrop-blur-sm border-t border-white/10 animate-slide-in-top">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollTo('hero')}
                className="block w-full text-left font-syncopate text-base font-medium text-white hover:text-ocean-foam py-3 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollTo('event')}
                className="block w-full text-left font-syncopate text-base font-medium text-white hover:text-ocean-foam py-3 transition-colors"
              >
                Event
              </button>
              <button
                onClick={() => scrollTo('characters')}
                className="block w-full text-left font-syncopate text-base font-medium text-white hover:text-ocean-foam py-3 transition-colors"
              >
                Characters
              </button>

              {/* Mobile Register Button */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => { closeMobileMenu(); setShowComingSoon(true); }}
                  className="bg-white/20 block w-full font-syncopate px-6 py-3 text-center text-white border border-white/30 rounded-full shadow-[inset_0px_0px_20px_5px_rgba(255,255,255,10)] hover:brightness-110 transition-all font-medium"
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <ComingSoonModal open={showComingSoon} onClose={() => setShowComingSoon(false)} />
    </>
  )
}
