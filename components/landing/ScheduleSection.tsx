'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import EventLogoGrey from '@/app/assets/event_logo_grey.png'
import EventLogoYellow from '@/app/assets/event_logo_yellow.png'
import EventLogoColoured from '@/app/assets/event_logo_coloured.png'
import { AnimatedTooltip } from '@/components/AnimatedToolTip'

// Mascot imports
import Crabi from '@/app/assets/Mascots/Crabi.png'
import Octo from '@/app/assets/Mascots/Octo.png'
import Shark from '@/app/assets/Mascots/Shark.png'
import Croco from '@/app/assets/Mascots/Ali.png'
import Tuto from '@/app/assets/Mascots/Tuto.png'

// Import data and types from separate file
import { 
  phases, 
  phaseSchedules, 
  type CardType, 
  type ScheduleContentProps 
} from '@/data/scheduleData'

const SkeletonScheduleItem = () => (
  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
    <div className="grid grid-cols-[140px_1fr_auto] gap-4 items-start">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </div>
      <div className="space-y-2">
        <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
        <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
      </div>
      <div className="h-10 w-20 bg-gray-200 rounded-full animate-pulse"></div>
    </div>
  </div>
)

const ScheduleContent = ({ schedule, isActive }: ScheduleContentProps) => {
  if (!isActive) {
    // Skeleton State
    return (
      <div className="space-y-3">
        <SkeletonScheduleItem />
        <SkeletonScheduleItem />
      </div>
    )
  }

  if (schedule.type === 'upcoming') {
    // Upcoming - Title, Description, and Activity List with Mascots and Background Elements
    return (
      <div className="relative flex items-center justify-center min-h-[300px] mb-16">
        {/* Dotted Background Pattern (absolute, behind everything) */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #9ca3af 2px, transparent 2px)',
            backgroundSize: '24px 24px'
          }}></div>
        </div>

        {/* Three-Column Skeleton Items (mimicking actual schedule layout) */}
        <div className="absolute inset-6 space-y-3 opacity-30 pointer-events-none z-0">
          {/* Skeleton Item 1 */}
          <div className="p-4">
            <div className="grid grid-cols-[120px_1fr_auto] gap-4 items-start">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-300 rounded w-48"></div>
                <div className="h-3 bg-gray-300 rounded w-full"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Skeleton Item 2 */}
          <div className="p-4">
            <div className="grid grid-cols-[120px_1fr_auto] gap-4 items-start">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-300 rounded w-40"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Skeleton Item 3 */}
          <div className="p-4">
            <div className="grid grid-cols-[120px_1fr_auto] gap-4 items-start">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="space-y-2">
                <div className="h-5 bg-gray-300 rounded w-44"></div>
                <div className="h-3 bg-gray-300 rounded w-4/5"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Mascots positioned around the card */}
        <div className="absolute -left-[60%] -top-[80%] w-full h-[600px] z-5" style={{ animationDuration: '3s' }}>
          <Image src={Crabi} alt="Crabi" fill className="object-contain w-full h-full rotate-45" />
        </div>
        <div className="absolute -right-[60%] -top-[60%] w-full h-[600px] z-5" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
          <Image src={Croco} alt="Croco" fill className="object-contain scale-x-[-1] -rotate-20" />
        </div>
        <div className="absolute right-10 -bottom-[180%] w-full h-[600px] z-5" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
          <Image src={Shark} alt="Shark" fill className="object-contain scale-x-[-1] -rotate-20" />
        </div>
        <div className="absolute -left-[50%] -bottom-[170%] w-full h-[600px] z-5" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
          <Image src={Tuto} alt="Tuto" fill className="object-contain -rotate-20" />
        </div>
        <div className="absolute -right-[50%] -bottom-[170%] w-full h-[600px] z-5" style={{ animationDuration: '4s', animationDelay: '1.5s' }}>
          <Image src={Octo} alt="Octo" fill className="object-contain" />
        </div>

        {/* Content Bubble (on top with bg-white) */}
        <div className="relative z-10 overflow-visible text-left space-y-3 py-6 px-6 bg-white rounded-3xl shadow-2xl max-w-2xl">
          <div>
            <h2 className="text-2xl font-syne font-bold text-yellow-500">
              {schedule.title}
            </h2>
            {schedule.description && (
              <p className="text-ocean-primary text-base font-semibold">
                {schedule.description}
              </p>
            )}
          </div>

          {/* Activity List */}
          {schedule.upcomingItems && schedule.upcomingItems.length > 0 && (
            <div className="space-y-2">
              {schedule.upcomingItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-start gap-2">
                  <div className="w-6 h-6 flex items-center justify-center shrink-0 relative">
                    <Image src={EventLogoYellow} alt="Event Icon" fill className="object-contain" />
                  </div>
                  <p className="text-sm text-ocean-primary font-semibold text-left flex-1 max-w-lg">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="absolute bg-white w-8 h-8 rounded-full -bottom-6 right-10"/>
          <div className="absolute bg-white w-4 h-4 rounded-full -bottom-10 right-20"/>
        </div>
      </div>
    )
  }

  // Active Schedule with Items
  return (
    <div className="max-h-[400px] overflow-y-auto pr-6">
      <div className="space-y-3 overflow-visible">
      {schedule.scheduleItems.map((item, idx) => {
        const hasMultipleEvents = item.events.length > 1
        const isHighlight = item.events.some(e => e.highlight)
        
        return (
          <div
            key={idx}
            className={`border-2 border-dashed rounded-xl p-4 overflow-visible ${
              isHighlight ? 'border-yellow-400 bg-yellow-50' : ''
            }`}
          >
            {/* Responsive Grid: Stack on mobile, two columns on desktop */}
            <div className="grid grid-cols-1 md:grid-cols-[120px_auto] gap-3 md:gap-4 items-start">
              {/* Column 1: Time */}
              <div className={`font-bold text-sm ${isHighlight ? 'text-yellow-600' : 'text-ocean-deep'}`}>
                {item.time}
              </div>
              
              {/* Column 2: Events with inline avatars */}
              <div className={`${hasMultipleEvents ? 'space-y-4' : ''} overflow-visible`}>
                {item.events.map((event, eventIdx) => (
                  <div key={eventIdx} className={`${eventIdx > 0 ? 'pt-4 border-t border-gray-200' : ''} overflow-visible`}>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4 overflow-visible relative">
                      {/* Title and Description */}
                      <div className="flex-1">
                        <p className={`font-bold text-base mb-1 ${event.highlight ? 'text-yellow-600' : 'text-ocean-deep'}`}>
                          {event.title}
                        </p>
                        {event.description && (
                          <p className="text-gray-600 text-sm font-semibold">{event.description}</p>
                        )}
                      </div>
                      
                      {/* Avatars aligned with title/description */}
                      <div className="flex items-start shrink-0 relative z-50 md:pr-10">
                        {event.people.length > 0 ? (
                          <AnimatedTooltip items={event.people} />
                        ) : event.highlight ? (
                          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                            <span className="text-white text-xl">⊙</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
      </div>
      
      {/* Registration Link */}
      {schedule.registrationLink && (
        <div className="text-center space-y-3 mt-4">
          <p className="text-ocean-primary font-semibold text-sm">
            {schedule.registrationLink.text}
          </p>
          <button className="bg-linear-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-syne font-semibold px-8 py-3 rounded-full transition-all duration-500 ease-out hover:scale-105 active:scale-95">
            {schedule.registrationLink.buttonText}
          </button>
        </div>
      )}
    </div>
  )
}

// ScheduleContent with Custom Scrollbar (like CharacterSection)
const ScheduleContentWithScrollbar = ({ schedule, isActive }: ScheduleContentProps) => {
  const bioRef = useRef<HTMLDivElement>(null)
  const scrollbarThumbRef = useRef<HTMLDivElement>(null)
  const scrollbarTrackRef = useRef<HTMLDivElement>(null)
  const isDraggingScrollbarRef = useRef(false)
  
  const [scrollTop, setScrollTop] = useState(0)
  const [isScrollbarDragging, setIsScrollbarDragging] = useState(false)

  // Bio scrollbar handlers
  const handleBioScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isDraggingScrollbarRef.current) return
    const target = e.currentTarget
    const maxScroll = target.scrollHeight - target.clientHeight
    const scrollPercentage = maxScroll > 0 ? target.scrollTop / maxScroll : 0
    setScrollTop(scrollPercentage)
  }

  const updateBioScrollFromPosition = (clientY: number) => {
    const track = scrollbarTrackRef.current
    const bio = bioRef.current
    if (!track || !bio) return
    const rect = track.getBoundingClientRect()
    const y = clientY - rect.top
    const percentage = Math.max(0, Math.min(1, y / rect.height))
    const maxScroll = bio.scrollHeight - bio.clientHeight
    if (maxScroll <= 0) return
    bio.scrollTop = percentage * maxScroll
    setScrollTop(percentage)
  }

  const handleScrollbarThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDraggingScrollbarRef.current = true
    setIsScrollbarDragging(true)
  }

  const handleScrollbarThumbTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation()
    isDraggingScrollbarRef.current = true
    setIsScrollbarDragging(true)
  }

  const handleScrollbarTrackMouseDown = (e: React.MouseEvent) => {
    if (e.target === scrollbarThumbRef.current || scrollbarThumbRef.current?.contains(e.target as Node)) return
    updateBioScrollFromPosition(e.clientY)
    isDraggingScrollbarRef.current = true
    setIsScrollbarDragging(true)
  }

  const handleScrollbarTrackTouchStart = (e: React.TouchEvent) => {
    updateBioScrollFromPosition(e.touches[0].clientY)
    isDraggingScrollbarRef.current = true
    setIsScrollbarDragging(true)
  }

  useEffect(() => {
    if (!isScrollbarDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingScrollbarRef.current) return
      e.preventDefault()
      updateBioScrollFromPosition(e.clientY)
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingScrollbarRef.current) return
      updateBioScrollFromPosition(e.touches[0].clientY)
    }
    const handleEnd = () => {
      isDraggingScrollbarRef.current = false
      setIsScrollbarDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: false })
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleEnd)

    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleEnd)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isScrollbarDragging])

  // Early returns after all hooks
  if (!isActive) {
    return <ScheduleContent schedule={schedule} isActive={isActive} />
  }

  if (schedule.type === 'upcoming') {
    return <ScheduleContent schedule={schedule} isActive={isActive} />
  }

  // Active Schedule with Custom Scrollbar
  return (
    <div className="flex max-h-[400px]" data-lenis-prevent>
      <div
        ref={bioRef}
        onScroll={handleBioScroll}
        className="flex-1 overflow-y-auto pr-0 md:pr-12 space-y-3"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {schedule.scheduleItems.map((item, idx) => {
          const hasMultipleEvents = item.events.length > 1
          const isHighlight = item.events.some(e => e.highlight)
          
          return (
            <div
              key={idx}
              className={`border-2 border-dashed rounded-xl p-4 overflow-visible ${
                isHighlight ? 'border-yellow-400 bg-yellow-50' : ''
              }`}
            >
              {/* Responsive Grid: Stack on mobile, two columns on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-[120px_auto] gap-3 md:gap-4 items-start">
                {/* Column 1: Time */}
                <div className={`font-bold text-sm ${isHighlight ? 'text-yellow-600' : 'text-ocean-deep'}`}>
                  {item.time}
                </div>
                
                {/* Column 2: Events with inline avatars */}
                <div className={`${hasMultipleEvents ? 'space-y-4' : ''} overflow-visible`}>
                  {item.events.map((event, eventIdx) => (
                    <div key={eventIdx} className={`${eventIdx > 0 ? 'pt-4 border-t border-gray-200' : ''} overflow-visible`}>
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4 overflow-visible relative">
                        {/* Title and Description */}
                        <div className="flex-1">
                          <p className={`font-bold text-base mb-1 ${event.highlight ? 'text-yellow-600' : 'text-ocean-deep'}`}>
                            {event.title}
                          </p>
                          {event.description && (
                            <p className="text-gray-600 text-sm font-semibold">{event.description}</p>
                          )}
                        </div>
                        
                        {/* Avatars aligned with title/description */}
                        <div className="flex items-start shrink-0 relative z-50 md:pr-10">
                          {event.people.length > 0 ? (
                            <AnimatedTooltip items={event.people} />
                          ) : event.highlight ? (
                            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center">
                              <span className="text-white text-xl">⊙</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Registration Link */}
        {schedule.registrationLink && (
          <div className="text-center space-y-3 mt-4">
            <p className="text-ocean-primary font-semibold text-sm">
              {schedule.registrationLink.text}
            </p>
            <button className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-syne font-semibold px-8 py-3 rounded-full transition-all duration-500 ease-out hover:scale-110 active:scale-95 shadow-lg hover:shadow-xl">
              {schedule.registrationLink.buttonText}
            </button>
          </div>
        )}
      </div>

      {/* Single-line Scrollbar */}
      <div className="w-8 flex flex-col items-center py-1 select-none">
        <div
          ref={scrollbarTrackRef}
          onMouseDown={handleScrollbarTrackMouseDown}
          onTouchStart={handleScrollbarTrackTouchStart}
          className="flex-1 w-[20px] flex justify-center relative cursor-pointer touch-none"
        >
          <div className="w-[2px] h-full bg-gray-300 rounded-full" />
          <div
            ref={scrollbarThumbRef}
            onMouseDown={handleScrollbarThumbMouseDown}
            onTouchStart={handleScrollbarThumbTouchStart}
            className={`absolute left-1/2 w-7 h-7 -ml-[14px] transition-none will-change-transform cursor-grab active:cursor-grabbing touch-none ${isScrollbarDragging ? 'scale-110' : 'hover:scale-105'} select-none`}
            style={{
              top: `${scrollTop * 100}%`,
              transform: 'translateY(-50%)',
            }}
          >
            <Image
              src={EventLogoColoured}
              alt="Scroll indicator"
              width={28}
              height={28}
              className="object-contain w-7 h-7 drop-shadow-md pointer-events-none"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export const ScheduleSection = () => {
  const [activePhase, setActivePhase] = useState<number | null>(null)
  const [selectedCardType, setSelectedCardType] = useState<CardType | null>(null)
  
  const finishedCardRef = useRef<HTMLDivElement>(null)
  const confirmedCardRef = useRef<HTMLDivElement>(null)
  const upcomingCardRef = useRef<HTMLDivElement>(null)

  // Handle phase selection and card animation
  useEffect(() => {
    if (activePhase === null) {
      // Initial state - cards stacked upward, first at bottom (biggest), alternating tilt
      gsap.to([finishedCardRef.current, confirmedCardRef.current, upcomingCardRef.current], {
        y: (index) => -index * 15,
        scale: (index) => 1 + index * 0.03,
        rotation: (index) => index % 2 === 0 ? -2 : 2,
        zIndex: (index) => 3 - index,
        duration: 0.7,
        ease: 'power3.out',
      })
      setSelectedCardType(null)
      return
    }

    const newCardType = phaseSchedules[activePhase].type
    const previousCardType = selectedCardType

    // Map card type to ref
    const cardRefs = {
      finished: finishedCardRef,
      confirmed: confirmedCardRef,
      upcoming: upcomingCardRef,
    }

    const selectedCard = cardRefs[newCardType].current
    const otherCards = Object.entries(cardRefs)
      .filter(([type]) => type !== newCardType)
      .map(([, ref]) => ref.current)

    // Animate selected card up and remove tilt
    gsap.to(selectedCard, {
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      zIndex: 50,
      duration: 0.7,
      ease: 'power3.out',
    })

    // Animate other cards down
    gsap.to(otherCards, {
      y: 1500,
      zIndex: 0,
      duration: 0.7,
      ease: 'power3.out',
    })

    // If there was a previous card type and it's different, animate it down
    if (previousCardType && previousCardType !== newCardType) {
      const previousCard = cardRefs[previousCardType].current
      gsap.to(previousCard, {
        y: 1500,
        zIndex: 0,
        duration: 0.7,
        ease: 'power3.out',
      })
    }

    setSelectedCardType(newCardType)
  }, [activePhase, selectedCardType])

  const handlePhaseClick = (index: number) => {
    setActivePhase(index)
  }

  return (
    <section className="py-20 px-4 bg-[#F0FBFF] relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 animate-in slide-in-from-bottom-4 fade-in duration-1000">
          <div className="inline-block bg-linear-to-br from-[#0041A810] to-white border-white/30 border px-6 py-2 rounded-full mb-4">
            <span className="font-syne text-ocean-deep font-bold uppercase tracking-wide">EVENT</span>
          </div>
          <h2 className="font-syne text-4xl md:text-5xl font-bold text-ocean-deep">
            Timeline & Schedule
          </h2>
        </div>

        {/* Mobile: Detail Cards First, Phase Cards Below */}
        <div className="md:hidden">
          {/* Stacked Event Cards (Mobile) */}
          <div className={`relative max-w-7xl mx-auto mb-8 animate-in slide-in-from-bottom-6 fade-in duration-1000 delay-200 overflow-hidden transition-all duration-300 ${
            selectedCardType ? 'min-h-[500px]' : 'min-h-0'
          }`}>
            {/* Finished Card (Blue) */}
            <div
              ref={finishedCardRef}
              className={`absolute left-0 right-0 bg-linear-to-b from-ocean-primary to-65% to-white rounded-3xl px-4 pb-8 transition-all duration-300 ${
                selectedCardType !== 'finished' ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 visible'
              }`}
            >
              {/* Browser-like Header with Title and Logos */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-syne font-bold text-white">
                    {activePhase !== null ? phaseSchedules[activePhase].title : phaseSchedules[0].title}
                  </h3>
                </div>
                {/* Rotated Logos */}
                <div className="flex gap-1">
                  <div className="relative w-6 h-6">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain" />
                  </div>
                  <div className="relative w-6 h-6">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain -rotate-90" />
                  </div>
                  <div className="relative w-6 h-6">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain" />
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="bg-white rounded-2xl p-6 overflow-visible">
                <ScheduleContentWithScrollbar 
                  schedule={phaseSchedules[0]} 
                  isActive={true}
                />
              </div>
            </div>

            {/* Confirmed Card (Green) */}
            <div
              ref={confirmedCardRef}
              className={`absolute left-0 right-0 bg-linear-to-b from-green-500 via-[#A9D9BE] to-65% to-white rounded-3xl px-4 pb-8 transition-all duration-300 ${
                selectedCardType !== 'confirmed' ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 visible'
              }`}
            >
              {/* Browser-like Header with Title and Logos */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-syne font-bold text-white">
                    {phaseSchedules[2].title}
                  </h3>
                </div>
                {/* Rotated Logos */}
                <div className="flex gap-1">
                  <div className="relative w-6 h-6">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain" />
                  </div>
                  <div className="relative w-6 h-6">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain rotate-90" />
                  </div>
                  <div className="relative w-6 h-6">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain rotate-180" />
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="bg-white rounded-2xl p-6 overflow-visible">
                <ScheduleContentWithScrollbar 
                  schedule={phaseSchedules[2]} 
                  isActive={true}
                />
              </div>
            </div>

            {/* Upcoming Card (Grey) */}
            <div
              ref={upcomingCardRef}
              className={`overflow-hidden absolute left-0 right-0 bg-gradient-to-br from-gray-300 to-gray-400 rounded-3xl px-4 pb-8 transition-all duration-300 ${
                selectedCardType !== 'upcoming' ? 'opacity-0 pointer-events-none invisible' : 'opacity-100 visible'
              }`}
            >
              {/* Browser-like Header with Title and Logos */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-syne font-bold text-white">
                    {phaseSchedules[3].title}
                  </h3>
                </div>
                {/* Rotated Logos */}
                <div className="flex gap-1">
                  <div className="relative w-6 h-6">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain" />
                  </div>
                  <div className="relative w-6 h-6">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain rotate-90" />
                  </div>
                  <div className="relative w-6 h-6">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain rotate-180" />
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="bg-white rounded-2xl p-6 overflow-visible">
                <ScheduleContentWithScrollbar 
                  schedule={phaseSchedules[3]} 
                  isActive={true}
                />
              </div>
            </div>
          </div>

          {/* Phase Cards - Horizontal Scroll (Mobile) */}
          <div className="overflow-x-auto pb-4 -mx-4 px-4 animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-400">
            {!selectedCardType && (
              <p className="text-center text-sm text-gray-500 font-medium mb-4 animate-pulse">
                ← Tap a phase to view details →
              </p>
            )}
            <div className="flex gap-4 min-w-max">
              {phases.map((phase, index) => {
                const isActive = activePhase === index
                
                return (
                  <div
                    key={index}
                    onClick={() => handlePhaseClick(index)}
                    className={`relative flex flex-col items-start justify-between min-h-[180px] w-[160px] flex-shrink-0 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-700 ease-out group hover:scale-105 cursor-pointer ${
                      isActive 
                        ? 'bg-[#3BA96A]' 
                        : 'bg-white'
                    }`}
                  >
                    {/* Dotted Border */}
                    <div 
                      className={`absolute inset-1.5 rounded-2xl border-2 border-dashed transition-all duration-700 ease-out pointer-events-none ${
                        isActive
                          ? 'border-white opacity-100'
                          : 'border-[#3BA96A] opacity-0 group-hover:opacity-100'
                      }`}
                    />
                    
                    <div className="transition-all duration-700 ease-out">
                      <div className={`text-sm font-syne font-semibold mb-2 transition-colors duration-700 ease-out ${
                        isActive ? 'text-white' : 'text-orange-400'
                      }`}>
                        {phase.phase}
                      </div>
                      <h3 className={`font-syne font-bold text-sm mb-4 leading-tight transition-colors duration-700 ease-out ${
                        isActive ? 'text-white' : 'text-ocean-deep'
                      }`}>
                        {phase.title}
                      </h3>
                    </div>
                    
                    {phase.date && index === 0 ? (
                      <div className="flex flex-col items-start gap-1 font-syne group-hover:scale-110 transition-all duration-700 ease-out">
                        <span className={`text-3xl font-bold leading-none transition-colors duration-700 ease-out ${
                          isActive ? 'text-white' : 'text-[#3BA96A]'
                        }`}>
                          {phase.date}
                        </span>
                        <span className={`text-lg font-bold mb-0.5 transition-colors duration-700 ease-out ${
                          isActive ? 'text-white' : 'text-ocean-deep'
                        }`}>
                          {phase.month}
                        </span>
                      </div>
                    ) : (
                      <div className="relative w-10 h-10 group-hover:transition-all duration-700 ease-out group-hover:scale-110">
                        <Image
                          src={EventLogoGrey}
                          alt="Date TBA"
                          fill
                          className={`object-contain transition-all duration-700 ease-out ${
                            isActive ? 'brightness-0 invert' : ''
                          }`}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Desktop: Phase Cards First, Detail Cards Below */}
        <div className="hidden md:block">
          {/* Phase Cards */}
          {!selectedCardType && (
            <p className="text-center text-sm text-gray-500 font-medium mb-4 animate-pulse">
              Click a phase card to view details
            </p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-20 animate-in slide-in-from-bottom-6 fade-in duration-1000 delay-200">
            {phases.map((phase, index) => {
              const isActive = activePhase === index
              
              return (
                <div
                  key={index}
                  onClick={() => handlePhaseClick(index)}
                  className={`relative flex flex-col items-start justify-between min-h-[200px] rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-700 ease-out group hover:scale-105 cursor-pointer ${
                    isActive 
                      ? 'bg-[#3BA96A]' 
                      : 'bg-white'
                  }`}
                >
                  {/* Dotted Border - Shows on hover, white when active */}
                  <div 
                    className={`absolute inset-1.5 rounded-2xl border-2 border-dashed transition-all duration-700 ease-out pointer-events-none ${
                      isActive
                        ? 'border-white opacity-100'
                        : 'border-[#3BA96A] opacity-0 group-hover:opacity-100'
                    }`}
                  />
                  
                  <div className="transition-all duration-700 ease-out">
                    <div className={`text-sm font-syne font-semibold mb-2 transition-colors duration-700 ease-out ${
                      isActive ? 'text-white' : 'text-orange-400'
                    }`}>
                      {phase.phase}
                    </div>
                    <h3 className={`font-syne font-bold text-base mb-4 leading-tight transition-colors duration-700 ease-out ${
                      isActive ? 'text-white' : 'text-ocean-deep'
                    }`}>
                      {phase.title}
                    </h3>
                  </div>
                  
                  {phase.date && index === 0 ? (
                    // Only show date for Phase 1 (confirmed)
                    <div className="flex flex-col items-start gap-1 font-syne group-hover:scale-110 transition-all duration-700 ease-out">
                      <span className={`text-4xl font-bold leading-none transition-colors duration-700 ease-out ${
                        isActive ? 'text-white' : 'text-[#3BA96A]'
                      }`}>
                        {phase.date}
                      </span>
                      <span className={`text-xl font-bold mb-0.5 transition-colors duration-700 ease-out ${
                        isActive ? 'text-white' : 'text-ocean-deep'
                      }`}>
                        {phase.month}
                      </span>
                    </div>
                  ) : (
                    // Show grey logo for other phases (dates not confirmed)
                    <div className="relative w-12 h-12 group-hover:transition-all duration-700 ease-out group-hover:scale-110">
                      <Image
                        src={EventLogoGrey}
                        alt="Date TBA"
                        fill
                        className={`object-contain transition-all duration-700 ease-out ${
                          isActive ? 'brightness-0 invert' : ''
                        }`}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Stacked Event Cards (Desktop) */}
          <div className="relative max-w-7xl mx-auto min-h-[500px] animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-400">
            {/* Finished Card (Blue) - Desktop */}
            <div
              ref={finishedCardRef}
              className="absolute left-0 right-0 bg-linear-to-b from-ocean-primary to-65% to-white rounded-3xl px-4 pb-8 cursor-pointer group hover:scale-105 transition-transform duration-300 overflow-visible"
            >
              {/* Browser-like Header with Title and Logos */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-syne font-bold text-white">
                    {activePhase !== null ? phaseSchedules[activePhase].title : phaseSchedules[0].title}
                  </h3>
                </div>
                {/* Rotated Logos */}
                <div className="flex gap-2">
                  <div className="relative w-7 h-7">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain" />
                  </div>
                  <div className="relative w-7 h-7">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain rotate-90" />
                  </div>
                 <div className="relative w-7 h-7">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain rotate-180" />
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div 
                className={`bg-white rounded-2xl p-6 transition-all duration-700 overflow-visible ${
                  activePhase === null || selectedCardType !== 'finished' ? 'blur-[2px] pointer-events-none' : 'blur-0'
                }`}
              >
                <ScheduleContent 
                  schedule={activePhase !== null ? phaseSchedules[activePhase] : phaseSchedules[0]} 
                  isActive={activePhase !== null && selectedCardType === 'finished'}
                />
              </div>
            </div>

            {/* Confirmed Card (Green) - Desktop */}
            <div
              ref={confirmedCardRef}
              className="absolute left-0 right-0 bg-linear-to-b from-green-500 via-[#A9D9BE] to-65% to-white rounded-3xl px-4 pb-8 cursor-pointer group hover:scale-105 transition-transform duration-300"
            >
              {/* Browser-like Header with Title and Logos */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-syne font-bold text-white">
                    {activePhase !== null ? phaseSchedules[activePhase].title : phaseSchedules[2].title}
                  </h3>
                </div>
                {/* Rotated Logos */}
                <div className="flex gap-2">
                  <div className="relative w-7 h-7">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain" />
                  </div>
                  <div className="relative w-7 h-7">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain rotate-90" />
                  </div>
                 <div className="relative w-7 h-7">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain rotate-180" />
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div 
                className={`bg-white rounded-2xl p-6 transition-all duration-700 overflow-visible ${
                  activePhase === null || selectedCardType !== 'confirmed' ? 'blur-[2px] pointer-events-none' : 'blur-0'
                }`}
              >
                <ScheduleContent 
                  schedule={activePhase !== null ? phaseSchedules[activePhase] : phaseSchedules[2]} 
                  isActive={activePhase !== null && selectedCardType === 'confirmed'}
                />
              </div>
            </div>

            {/* Upcoming Card (Grey) - Desktop */}
            <div
              ref={upcomingCardRef}
              className="overflow-hidden absolute left-0 right-0 bg-gradient-to-br from-gray-300 to-gray-400 rounded-3xl px-4 pb-8 cursor-pointer group hover:scale-105 transition-transform duration-300"
            >
              {/* Browser-like Header with Title and Logos */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-syne font-bold text-white">
                    {activePhase !== null ? phaseSchedules[activePhase].title : phaseSchedules[3].title}
                  </h3>
                </div>
                {/* Rotated Logos */}
                <div className="flex gap-2">
                  <div className="relative w-7 h-7">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain" />
                  </div>
                  <div className="relative w-7 h-7">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain rotate-90" />
                  </div>
                 <div className="relative w-7 h-7">
                    <Image src={EventLogoGrey} alt="Event Logo" fill className="object-contain rotate-180" />
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div 
                className={`bg-white rounded-2xl p-6 transition-all duration-700 overflow-visible ${
                  activePhase === null || selectedCardType !== 'upcoming' ? 'blur-[2px] pointer-events-none' : 'blur-0'
                }`}
              >
                <ScheduleContent 
                  schedule={activePhase !== null ? phaseSchedules[activePhase] : phaseSchedules[3]} 
                  isActive={activePhase !== null && selectedCardType === 'upcoming'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
