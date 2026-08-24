'use client'

import { PublicLayout } from '@/components/layout'
import { HeroSection, BentoSection, CharacterSection, PersonalityTestSection, EventCTASection, AboutSection } from '@/components/landing'

export default function Home() {
  return (
    <PublicLayout>
      {/* Hero Section - Section 1 */}
      <HeroSection />

      {/* About OCEAN Test - Section 2 */}
      <BentoSection />

      {/* Character Introduction - Section 3 */}
      <CharacterSection />

      {/* Personality Test - Section 4 */}
      <PersonalityTestSection />

      {/* Event CTA + Marquee - Section 5 */}
      <EventCTASection />

      {/* About - Section 6 */}
      <AboutSection />
    </PublicLayout>
  )
}
