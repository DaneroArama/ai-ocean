'use client'

import {PublicLayout} from '@/components/layout'
import {
  HeroSection,
  BentoSection,
  CharacterSection,
  PersonalityTestSection,
  EventCTASection,
  AboutSection,
  MerchandiseSection,
  CommunityPartnersSection
} from '@/components/landing'
import { FloatingBubbles } from '@/components/landing/FloatingBubbles'

export default function Home() {
  return (
    <PublicLayout>

      <div className="relative">
        {/* BUBBLES — floating to top + pop */}
        <FloatingBubbles
          count={64}
          className="inset-x-0 top-0 h-full z-15"
          sizeRange={[9, 38]}
          durationRange={[5.5, 11]}
          opacityRange={[0.28, 0.6]}
          pop
        />

        {/* Hero Section - Section 1 */}
        <div id="hero"><HeroSection/></div>

        {/* About OCEAN Test - Section 2 */}
        <div id="event"><BentoSection/></div>
      </div>

      {/* Character Introduction - Section 3 */}
      <div id="characters">
        <CharacterSection/>
      </div>

      {/* Personality Test - Section 4 */}
      <PersonalityTestSection/>

      {/* Merchandise Section - Section 5 */}
      <MerchandiseSection/>

      {/* Event CTA + Marquee - Section 6 */}
      <EventCTASection/>

      {/* About - Section 7 */}
      <AboutSection/>

      {/* Community Partners - Section 8 */}
      <CommunityPartnersSection/>
    </PublicLayout>
  )
}
