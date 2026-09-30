'use client'

import {PublicLayout} from '@/components/layout'
import {
  HeroSection,
  BentoSection,
  PersonalityTestSection,
  EventCTASection,
  AboutSection,
  MerchandiseSection,
  CommunityPartnersSection,
  ScheduleSection,
  SpeakersSection
} from '@/components/landing'
import { FloatingBubbles } from '@/components/landing/FloatingBubbles'
import { BubbleClickTrail } from '@/components/landing/BubbleClickTrail'

export default function Home() {
  return (
    <PublicLayout>

      {/* Click-anywhere bubble burst trail */}
      <BubbleClickTrail
        bubblesPerClick={12}
        sizeRange={[30,64]}
        spread={100}
        maxBubbles={120}
      />

      <div className="relative">
        {/* BUBBLES — floating to top + pop */}
        <FloatingBubbles
          count={120}
          className="inset-x-0 top-0 h-full z-50"
          sizeRange={[9, 38]}
          durationRange={[5.5, 11]}
          opacityRange={[0.28, 0.6]}
          pop
        />

        {/* Hero Section - Section 1 */}
        <div id="hero"><HeroSection/></div>

        {/* About OCEAN Test - Section 2 */}
        <div id="event"><BentoSection/></div>

        {/* Personality Test - Section 3 */}
        <PersonalityTestSection/>

      </div>

      {/* Event CTA + About Event - Section 4 */}
      <EventCTASection/>

      {/* Merchandise Section - Section 5 */}
      <MerchandiseSection/>

      {/* Schedule Section - Section 6 */}
      <ScheduleSection/>

      {/* Speakers - Section 7 */}
      <SpeakersSection/>

      {/* Community Partners - Section 8 */}
      <CommunityPartnersSection/>

      {/* About UXMM */}
      <AboutSection/>
    </PublicLayout>
  )
}
