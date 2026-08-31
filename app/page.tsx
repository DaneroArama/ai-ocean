'use client'

import {PublicLayout} from '@/components/layout'
import {
  HeroSection,
  BentoSection,
  CharacterSection,
  PersonalityTestSection,
  EventCTASection,
  AboutSection
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
        <HeroSection/>

        {/* About OCEAN Test - Section 2 */}
        <BentoSection/>
      </div>

      {/* Character Introduction - Section 3 */}
      <CharacterSection/>

      {/* Personality Test - Section 4 */}
      <PersonalityTestSection/>

      {/* Event CTA + Marquee - Section 5 */}
      <EventCTASection/>

      {/* About - Section 6 */}
      <AboutSection/>
    </PublicLayout>
  )
}
