'use client'

import { useState } from 'react'
import Image, { type StaticImageData } from 'next/image'
import Waves from '@/app/assets/waves_2.png'
import EventLogo from '@/app/assets/event_logo.png'
import { speakers } from '@/data/speakersData'
import { phaseSchedules } from '@/data/scheduleData'
import styles from './SpeakersSection.module.css'

type Category = 'Speakers' | 'Panelists' | 'Judges'
type Profile = {
  id: string
  name: string
  position: string
  organization: string
  photo: StaticImageData | string
  role: 'Speaker' | 'Panelist' | 'Judge'
}

const categories: Category[] = ['Speakers', 'Panelists', 'Judges']
const profiles: Record<Category, Profile[]> = {
  Speakers: speakers.map((speaker) => ({ ...speaker, role: 'Speaker' })),
  Panelists: phaseSchedules[0].scheduleItems.flatMap((item) => item.events
    .filter((event) => event.title === 'Panelists')
    .flatMap((event) => event.people.map((person) => ({
      id: `panelist-${person.id}`,
      name: person.name,
      position: person.designation,
      organization: person.company,
      photo: person.image,
      role: 'Panelist' as const,
    })))),
  Judges: [],
}

function CategoryIcon({ category }: { category: Category }) {
  if (category === 'Speakers') {
    return <Image src={EventLogo} width={18} height={18} alt="" className={styles.filterLogo} />
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {category === 'Panelists' ? <>
        <path d="m4 14 8-8 6 6-8 8-6-6Zm6-6 6 6M6 18l-3 3M16 3V1m5 7h2M20 4l2-2" />
      </> : <>
        <path d="m8 5 4-4 9 9-4 4-9-9Zm2 6L3 18l3 3 7-7M14 19h8v3H12v-3h2Z" />
      </>}
    </svg>
  )
}

export function SpeakersSection() {
  const [activeCategory, setActiveCategory] = useState<Category>('Speakers')

  return (
    <section id="speakers" className={styles.section} aria-labelledby="speakers-heading">
      <div className={styles.waveHeader} aria-hidden="true">
        <Image src={Waves} alt="" sizes="85vw" className={styles.largeWave} />
        <Image src={Waves} alt="" sizes="55vw" className={styles.smallWave} />
      </div>
      <div className={styles.content}>
        <header className={styles.heading}>
          <span className={`${styles.badge} ${styles.speakerBadge}`}>Speakers</span>
          <span className={`${styles.badge} ${styles.judgeBadge}`}>Judges</span>
          <h2 id="speakers-heading">Our Speakers</h2>
          <span className={`${styles.badge} ${styles.panelistBadge}`}>Panelists</span>
        </header>

        <div className={styles.filters} aria-label="Filter participants">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={activeCategory === category}
              aria-controls="speaker-grid"
              className={`${styles.filter} ${activeCategory === category ? styles.activeFilter : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              <CategoryIcon category={category} />
              {category}
            </button>
          ))}
        </div>

        <div id="speaker-grid" className={styles.grid} aria-label={activeCategory}>
          {profiles[activeCategory].map((profile) => (
            <article key={profile.id} className={styles.card}>
              <div className={styles.photo}>
                <Image src={profile.photo} alt={profile.name} fill sizes="(max-width: 380px) 80vw, (max-width: 700px) 42vw, (max-width: 1100px) 29vw, (max-width: 1200px) 21vw, 250px" />
                <span className={styles.role}>{profile.role}</span>
              </div>
              <h3>{profile.name}</h3>
              <div className={styles.cardFooter}>
                <p>{profile.position}</p>
                <p className={styles.organization}>@ {profile.organization}</p>
              </div>
            </article>
          ))}
          {profiles[activeCategory].length === 0 && (
            <p className={styles.empty} role="status">Judges will be announced soon.</p>
          )}
        </div>
      </div>
    </section>
  )
}
