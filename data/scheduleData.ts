// Types for Schedule Data
import type { StaticImageData } from 'next/image'
import { speakers } from '@/data/speakersData'
import EiEiPhyoPhoto from '@/app/assets/Persons/Members/B6 - Ei Ei Phyo.webp'
import SuNandarPhoto from '@/app/assets/Persons/Members/B6 - SuNandar.webp'
import NawShinNadiThanPhoto from '@/app/assets/Persons/Members/Naw Shin Nadi Than.jpg'

import ChawSuHlaingPhoto from '@/app/assets/Persons/mentors/Chaw Su Hlaing.png'
import SannLynnHtunPhoto from '@/app/assets/Persons/mentors/Sann Lynn Htun.jpg'
import HaymarAungPhoto from '@/app/assets/Persons/mentors/Haymar Aung.jpeg'
import KyisinHsutharPhoto from '@/app/assets/Persons/mentors/Kyisin Hsuthar.jpeg'
import ThaeSuAyePhoto from '@/app/assets/Persons/mentors/Thae Su Aye.jpg'
import PhyoThiriThuPhoto from '@/app/assets/Persons/mentors/Phyo Thiri Thu.png'

export type CardType = 'finished' | 'confirmed' | 'upcoming'

export interface Person {
  id: number
  name: string
  designation: string
  company: string
  image: string | StaticImageData
}

export interface ScheduleEvent {
  title: string
  description: string
  people: Person[]
  highlight?: boolean
}

export interface ScheduleItem {
  time: string
  events: ScheduleEvent[]
}

export interface PhaseSchedule {
  type: CardType
  backgroundColor: string
  title: string
  description?: string
  scheduleItems: ScheduleItem[]
  upcomingItems?: string[]
  registrationLink?: {
    text: string
    buttonText: string
  }
}

export interface PhaseCard {
  phase: string
  title: string
  date?: string
  month?: string
}

// For the component props
export interface ScheduleContentProps {
  schedule: PhaseSchedule
  isActive: boolean
}

const agendaPeople: Record<string, Person> = Object.fromEntries(
  speakers.map((speaker, index) => [speaker.id, {
    id: index + 10,
    name: speaker.name,
    designation: speaker.position,
    company: speaker.organization,
    image: speaker.photo,
  }])
)

const dayOneHosts: Person[] = [
  agendaPeople['sitt-ye-yint-tun'],
  { id: 100, name: 'Ei Ei Phyo', designation: 'Host', company: '', image: EiEiPhyoPhoto },
]

const dayTwoHosts: Person[] = [
  { id: 101, name: 'Su Nandar', designation: 'Host', company: '', image: SuNandarPhoto },
  { id: 102, name: 'Naw Shin Nadi Than', designation: 'Host', company: '', image: NawShinNadiThanPhoto },
]

// Phase Cards Data
export const phases: PhaseCard[] = [
  { phase: 'Phase 1', title: 'Pre Event', date: '20', month: 'SEP' },
  { phase: 'Phase 2', title: 'Main Event Day 1' },
  { phase: 'Phase 2', title: 'Main Event Day 2' },
  { phase: 'Phase 3', title: 'Mentorship & Buildathon' },
  { phase: 'Phase 4', title: 'Evaluation & Cross-Border Judging' },
  { phase: 'Phase 5', title: 'Judge Insights' },
  { phase: 'Phase 6', title: 'Awards Ceremony' },
]

// Phase Schedules Data
export const phaseSchedules: Record<number, PhaseSchedule> = {
  0: {
    type: 'finished',
    backgroundColor: 'from-green-500 to-white',
    title: 'Pre-event Online Panel',
    scheduleItems: [
      {
        time: '7:00 - 8:30 PM',
        events: [
          {
            title: 'Panel Discussion',
            description: 'Bridge gaps in perspectives, communication, and ways of working.',
            people: []
          },
          {
            title: 'Panelists',
            description: 'Ma Chaw Su Hlaing, Ma Hnin Hay Mar Aung, Ma Kyi Sin Hsu Thar, Ko Sann Lynn Htun, Ma Thae Su Aye, Ma Phyo Thiri Thu',
            people: [
            { id: 1, name: 'Chaw Su Hlaing', designation: 'UX Designer (Design Systems)', company: 'CODIGO', image: ChawSuHlaingPhoto },
            { id: 2, name: 'Sann Lynn Htun', designation: 'Senior Software Engineer', company: 'ACE Data Systems', image: SannLynnHtunPhoto },
            { id: 3, name: 'Hnin Hay Mar Aung', designation: 'Founder', company: 'EzyPro', image: HaymarAungPhoto },
            { id: 4, name: 'Kyi Sin Hsu Thar', designation: 'Head of Programs', company: 'UXMM', image: KyisinHsutharPhoto },
            { id: 5, name: 'Thae Su Aye', designation: 'Project Researcher', company: 'LOMTech', image: ThaeSuAyePhoto },
            ]
          },
          {
            title: 'Moderator',
            description: 'Ma Phyo Thiri Thu',
            people: [
              { id: 6, name: 'Phyo Thiri Thu', designation: 'Moderator', company: 'Codigo', image: PhyoThiriThuPhoto },
            ]
          }
        ]
      }
    ],
  },
  1: {
    type: 'confirmed',
    backgroundColor: 'from-[#36c8f3] to-white',
    title: 'Main Event Day 1',
    scheduleItems: [
      {
        time: '8:30 - 9:00 AM',
        events: [{ title: 'Registration', description: 'Participants Check-in', people: [] }],
      },
      {
        time: '9:00 - 9:10 AM',
        events: [{
          title: 'Opening Ceremony',
          description: 'Hosts - Ko Sitt Ye Yint Tun, Ma Ei Ei Phyo & UXMM Founder Ma Wai Yi Mon Soe',
          people: [...dayOneHosts, agendaPeople['wai-yi-mon-soe']],
        }],
      },
      {
        time: '9:10 - 9:25 AM',
        events: [{
          title: 'Sponsor Speech & Speaker Intro by Hosts',
          description: 'Hosts - Ko Sitt Ye Yint Tun, Ma Ei Ei Phyo',
          people: dayOneHosts,
        }],
      },
      {
        time: '9:25 - 10:30 AM',
        events: [{
          title: 'Panel Discussion',
          description: 'The AI Wave Transforming Design, Dev, QA, PM, and Business Workflows',
          people: [agendaPeople['eric-glover'], agendaPeople['hendra-saputra'], agendaPeople['kyaw-myo-thet'], agendaPeople['wai-yi-mon-soe']],
        }],
      },
      {
        time: '10:30 - 11:30 AM',
        events: [{ title: 'Session 1: Accelerating Research with AI', description: 'Ko Myo Maung Maung', people: [agendaPeople['myo-maung-maung']] }],
      },
      {
        time: '11:30 - 12:15 PM',
        events: [{ title: 'Lunch Break', description: '', people: [], highlight: true }],
      },
      {
        time: '12:15 - 1:15 PM',
        events: [{ title: 'Session 2: Project management', description: 'Ko Zayar Htun', people: [agendaPeople['zayar-htun']] }],
      },
      {
        time: '1:15 - 2:15 PM',
        events: [{ title: 'Session 3: Scaling Design Systems with AI', description: 'Ko Aung Min Soe', people: [agendaPeople['aung-min-soe']] }],
      },
      {
        time: '2:15 - 2:30 PM',
        events: [{ title: 'Tea Break: Networking & Afternoon Refreshments', description: '', people: [], highlight: true }],
      },
      {
        time: '2:30 - 3:30 PM',
        events: [{ title: 'Session 4: Data Analytics', description: 'Ma Khin Moet Moet Nyein', people: [agendaPeople['khin-moet-moet-nyein']] }],
      },
      {
        time: '3:30 - 4:00 PM',
        events: [{ title: 'Day 1 Wrap-Up & What’s Next', description: 'Recap the day, capture key moments, share feedback, and look ahead to Day 2', people: [] }],
      },
    ],
  },
  2: {
    type: 'confirmed',
    backgroundColor: 'from-[#36c8f3] to-white',
    title: 'Main Event Day 2',
    scheduleItems: [
      {
        time: '8:30 - 9:00 AM',
        events: [{ title: 'Registration', description: 'Participants Check-in', people: [] }],
      },
      {
        time: '9:00 - 9:15 AM',
        events: [{ title: 'Welcome Back & Agenda Overview', description: 'Hosts - Ma Su Nandar, Ma Naw Shin Nadi Than', people: dayTwoHosts }],
      },
      {
        time: '9:15 - 10:15 AM',
        events: [{ title: 'Session 5: Business, UX & Service Design', description: 'Aiko Huang & Ko Pyit Sone Oo', people: [agendaPeople['aiko-huang'], agendaPeople['pyit-sone-oo']] }],
      },
      {
        time: '10:15 - 11:15 AM',
        events: [{ title: 'Session 6: Pitch Deck Preparation with AI & Basic Pitching', description: 'Ko Min Khant Ko Ko', people: [agendaPeople['min-khant-ko-ko']] }],
      },
      {
        time: '11:15 - 12:00 PM',
        events: [{ title: 'Lunch Break', description: '', people: [], highlight: true }],
      },
      {
        time: '12:00 - 1:15 PM',
        events: [{ title: 'Session 7: Prototyping with AI', description: 'Ma Shu Mawa Soe', people: [agendaPeople['shu-mawa-soe']] }],
      },
      {
        time: '1:15 - 2:15 PM',
        events: [{ title: 'Session 8: Debugging, Refinement, & Launching with Vercel', description: 'Ko Aung Kyaw Min', people: [agendaPeople['aung-kyaw-minn']] }],
      },
      {
        time: '2:15 - 2:45 PM',
        events: [{ title: 'Tea Break: Networking & Afternoon Refreshments', description: '', people: [], highlight: true }],
      },
      {
        time: '2:45 - 3:45 PM',
        events: [{ title: 'Project Submission & Judging Criteria Briefing', description: 'Ma Phyo Thiri Thu', people: [agendaPeople['phyo-thiri-thu']] }],
      },
      {
        time: '3:45 - 4:00 PM',
        events: [{ title: 'Day 2 Wrap-Up & What’s Next', description: 'Reflect on the journey, review next steps, celebrate the event, and prepare for what comes next', people: [] }],
      },
    ],
  },
  3: {
    type: 'upcoming',
    backgroundColor: 'from-gray-300 to-gray-400',
    title: 'Mentorship & Buildathon',
    description: 'Continuous expert mentorship support',
    scheduleItems: [],
    upcomingItems: [
      'Get Guidance from Experienced Mentors',
      'Refine your Product and Concept',
      'Prepare for Pre-judging'
    ]
  },
  4: {
    type: 'upcoming',
    backgroundColor: 'from-gray-300 to-gray-400',
    title: 'Evaluation & Cross-Border Judging',
    description: 'Product pitching submission & cross-border panel discussion',
    scheduleItems: [],
    upcomingItems: [
      'Submit Your Product',
      'Pitch your Ideas',
      'Connect with Cross-border Judges & Experts'
    ]
  },
  5: {
    type: 'upcoming',
    backgroundColor: 'from-gray-300 to-gray-400',
    title: 'Judge Insights',
    description: 'Inside the judge\'s mind : what makes a product succeed',
    scheduleItems: [],
    upcomingItems: [
      'Judges\' Expert Insights',
      'Online Panel Discussion on Product Success by Judges',
      'Discover What Makes a Product Succeed'
    ]
  },
  6: {
    type: 'upcoming',
    backgroundColor: 'from-gray-300 to-gray-400',
    title: 'Awards Ceremony',
    description: 'Evaluation, winner announcement & awards ceremony',
    scheduleItems: [],
    upcomingItems: [
      'Final Product Evaluation',
      'Panel Discussion',
      'Winner Announcement',
      'Awards and Celebration'
    ]
  },
}
