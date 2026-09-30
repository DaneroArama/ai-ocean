'use client'

import { useState } from 'react'
import Image from 'next/image'
import EventLogoGrey from '@/app/assets/event_logo_grey.png'
import { phases, phaseSchedules, type Person } from '@/data/scheduleData'
import styles from './ScheduleSection.module.css'

function SpeakerAvatars({ people }: { people: Person[] }) {
  const [activePerson, setActivePerson] = useState<number | null>(null)

  return (
    <div className={styles.avatars}>
      {people.map((person) => (
        <div className={styles.person} key={person.id} onMouseEnter={() => setActivePerson(person.id)} onMouseLeave={() => setActivePerson(null)}>
          <button
            type="button"
            className={styles.avatar}
            aria-label={`About ${person.name}`}
            aria-describedby={activePerson === person.id ? `speaker-${person.id}` : undefined}
            onFocus={() => setActivePerson(person.id)}
            onBlur={() => setActivePerson(null)}
            onClick={() => setActivePerson(person.id)}
            onKeyDown={(event) => { if (event.key === 'Escape') setActivePerson(null) }}
          >
            <Image src={person.image} alt={person.name} width={38} height={38} />
          </button>
          {activePerson === person.id && (
            <div className={styles.tooltip} role="tooltip" id={`speaker-${person.id}`}>
              <strong>{person.name}</strong>
              <span>{person.designation}</span>
              <small>{person.company}</small>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function ScheduleSection() {
  const [activePhase, setActivePhase] = useState(0)
  const schedule = phaseSchedules[activePhase]

  return (
    <section className={styles.section} aria-labelledby="timeline-heading">
      <div className={styles.container}>
        <header className={styles.heading}>
          <span className={`${styles.badge} ${styles.phaseBadge}`}>6 Phases</span>
          <h2 id="timeline-heading">Timeline &amp; Agenda</h2>
          <span className={`${styles.badge} ${styles.eventBadge}`}>Event</span>
        </header>

        <div className={styles.phases} aria-label="Event phases" data-lenis-prevent-horizontal>
          {phases.map((phase, index) => (
            <button
              key={`${phase.phase}-${index}`}
              type="button"
              className={`${styles.phase} ${activePhase === index ? styles.selected : ''}`}
              aria-pressed={activePhase === index}
              aria-controls="phase-agenda"
              onClick={() => setActivePhase(index)}
            >
              {activePhase === index && <span className={styles.rays} aria-hidden="true" />}
              <span className={styles.phaseLabel}>{phase.phase}{phaseSchedules[index].type === 'finished' ? ' Complete' : ''}</span>
              <span className={styles.phaseTitle}>{phase.title}</span>
              {activePhase === index && phase.date ? (
                <span className={styles.date}>{phase.date}<span>{phase.month}</span></span>
              ) : (
                <Image src={EventLogoGrey} alt="" className={styles.phaseLogo} width={44} height={44} />
              )}
            </button>
          ))}
        </div>

        <div className={styles.agenda} id="phase-agenda" aria-labelledby="agenda-title">
          <div className={styles.agendaHeader}>
            <h3 id="agenda-title">{schedule.title}</h3>
            <div className={styles.logos} aria-hidden="true">
              {[0, 90, 180].map((rotation) => <Image key={rotation} src={EventLogoGrey} alt="" width={24} height={24} style={{ transform: `rotate(${rotation}deg)` }} />)}
            </div>
          </div>
          <div className={styles.agendaBody} key={activePhase}>
            {schedule.type === 'upcoming' ? (
              <div className={styles.upcoming}>
                <span className={styles.upcomingLabel}>Coming up · {phases[activePhase].phase}</span>
                <h4>{schedule.title}</h4>
                <p>{schedule.description}</p>
                <ul>{schedule.upcomingItems?.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            ) : schedule.scheduleItems.map((item, index) => (
              <div className={styles.scheduleItem} key={index}>
                <p className={styles.time}>{item.time}</p>
                <div className={styles.events}>
                  {item.events.map((event) => (
                    <div className={styles.event} key={event.title}>
                      <div className={styles.eventCopy}>
                        <h4>{event.title}</h4>
                        {event.description && <p>{event.description}</p>}
                      </div>
                      {event.people.length > 0 && <SpeakerAvatars people={event.people} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
