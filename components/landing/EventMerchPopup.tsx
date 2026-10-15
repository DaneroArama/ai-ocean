'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import XIcon from '@/app/assets/X.svg'
import EventMerchImage from '@/app/assets/Merchandise/Event Merch.png'

const SHOW_DELAY_MS = 15_000

function Sparkle({className}: {className?: string}) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 0c.6 6.3 5.7 11.4 12 12-6.3.6-11.4 5.7-12 12-.6-6.3-5.7-11.4-12-12C6.3 11.4 11.4 6.3 12 0z" />
    </svg>
  )
}

export const EventMerchPopup = () => {
  const [isOpen, setIsOpen] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const isOpening = useRef(false)

  // Show the popup 15s after the site loads
  useEffect(() => {
    const timer = window.setTimeout(() => setIsOpen(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isOpen || !overlayRef.current || !panelRef.current) return
    isOpening.current = true
    const ctx = gsap.context(() => {
      gsap.fromTo(overlayRef.current, {opacity: 0}, {opacity: 1, duration: 0.35, ease: 'power2.out'})
      gsap.fromTo(
        panelRef.current,
        {opacity: 0, scale: 0.9, y: 30},
        {opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.4)', delay: 0.08, onComplete: () => { isOpening.current = false }}
      )
    })
    return () => ctx.revert()
  }, [isOpen])

  const handleClose = useCallback(() => {
    if (!overlayRef.current || !panelRef.current || isOpening.current) return
    isOpening.current = false
    const ctx = gsap.context(() => {
      gsap.to(panelRef.current, {opacity: 0, scale: 0.95, y: 20, duration: 0.25, ease: 'power2.in'})
      gsap.to(overlayRef.current, {opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => setIsOpen(false)})
    })
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    if (!isOpen) {
      isOpening.current = false
      return
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, handleClose])

  const handleShop = () => {
    isOpening.current = false
    handleClose()
    document.getElementById('merch')?.scrollIntoView({behavior: 'smooth'})
  }

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      data-lenis-prevent
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-merch-popup-title"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="relative aspect-square w-[min(90vw,440px)] overflow-hidden rounded-3xl bg-gradient-to-b from-sky-400 to-cyan-500 p-7 text-center shadow-2xl sm:p-8"
      >
        {/* Sparkles */}
        <Sparkle className="pointer-events-none absolute -left-5 -top-5 h-24 w-24 text-amber-300 sm:h-28 sm:w-28" />
        <Sparkle className="pointer-events-none absolute left-7 top-1/3 h-4 w-4 text-white/90" />
        <Sparkle className="pointer-events-none absolute right-12 top-16 h-5 w-5 text-white" />
        <Sparkle className="pointer-events-none absolute bottom-28 left-10 h-3 w-3 text-white/80" />
        <Sparkle className="pointer-events-none absolute bottom-1/4 right-6 h-4 w-4 text-white/90" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close event merch popup"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white transition hover:scale-110 hover:bg-white/50 active:scale-95"
        >
          <Image src={XIcon} alt="" width={14} height={14} />
        </button>

        <div className="relative flex h-full flex-col items-center">
          <h2 id="event-merch-popup-title" className="font-dela-gothic-one mt-4 text-3xl text-white drop-shadow-sm sm:text-4xl">
            Event Merch
          </h2>
          <p className="font-syne mx-auto mt-3 max-w-[85%] text-xs font-semibold leading-relaxed text-white/90 sm:text-sm">
            Explore event-exclusive items made for participants, supporters, and collectors.
          </p>

          <div className="relative mt-2 min-h-0 w-full flex-1">
            <Image
              src={EventMerchImage}
              alt="Event merch — tote bags and t-shirts"
              fill
              sizes="(max-width: 440px) 90vw, 440px"
              className="object-contain drop-shadow-xl"
              priority
            />
          </div>

          <button
            type="button"
            onClick={handleShop}
            className="font-syne mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105 hover:from-yellow-500 hover:to-orange-500 active:scale-95 sm:text-base"
          >
            Shop Merch
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 10h12M11 5l5 5-5 5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
