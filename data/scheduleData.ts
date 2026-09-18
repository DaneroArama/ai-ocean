// Types for Schedule Data
export type CardType = 'finished' | 'confirmed' | 'upcoming'

export interface Person {
  id: number
  name: string
  designation: string
  company: string
  image: string
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

// Phase Cards Data
export const phases: PhaseCard[] = [
  { phase: 'Phase 1', title: 'Pre Event', date: '20', month: 'SEP' },
  { phase: 'Phase 2', title: 'Main Event Day 1' },
  { phase: 'Phase 3', title: 'Main Event Day 2' },
  { phase: 'Phase 4', title: 'Buildathon' },
  { phase: 'Phase 5', title: 'Evaluation & Cross-Border Judging' },
  { phase: 'Phase 6', title: 'Judge Panel Discussion' },
  { phase: 'Phase 7', title: 'Awards Ceremony' },
]

// Phase Schedules Data
export const phaseSchedules: Record<number, PhaseSchedule> = {
  0: {
    type: 'finished',
    backgroundColor: 'from-green-500 to-white',
    title: 'Pre-event Online Panel',
    scheduleItems: [
      {
        time: '7:30 - 8:30 PM',
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
              { id: 1, name: 'Chaw Su Hlaing', designation: 'UX Designer (Design Systems)', company: 'Codigo', image: '/assets/Persons/Chaw Su Hlaing.png' },
              { id: 2, name: 'Hnin Hay Mar Aung', designation: 'Founder', company: 'EzyPet & EzyPro', image: '/assets/Persons/Hay Mar.png' },
              { id: 3, name: 'Kyi Sin Hsu Thar', designation: 'Product Designer', company: 'Codigo', image: '/assets/Persons/Kyi Sin.png' },
              { id: 4, name: 'Sann Lynn Htun', designation: 'Senior Designer', company: 'Codigo', image: '/assets/Persons/San Lynn.png' },
              { id: 5, name: 'Thae Su Aye', designation: 'UX Researcher', company: 'Codigo', image: '/assets/Persons/Thae Su Aye.png' },
            ]
          },
          {
            title: 'Moderator',
            description: 'Ma Phyo Thiri Thu',
            people: [
              { id: 6, name: 'Phyo Thiri Thu', designation: 'Moderator', company: 'Codigo', image: '/assets/Persons/Phyo Thiri.png' },
            ]
          }
        ]
      }
    ],
    registrationLink: {
      text: 'Join the Pre-Event Online Panel',
      buttonText: 'Register Now →'
    }
  },
  1: {
    type: 'upcoming',
    backgroundColor: 'from-gray-300 to-gray-400',
    title: 'Main Event (Day 1 & 2)',
    description: '2 days intensive product sprints',
    scheduleItems: [],
    upcomingItems: [
      'Professional Panel Discussions',
      'Industry Sharing Sessions',
      'Networking Activities',
      'Team Projects & Hands-on Building',
      'Turn Ideas into AI-powered Products'
    ]
  },
  2: {
    type: 'upcoming',
    backgroundColor: 'from-gray-300 to-gray-400',
    title: 'Main Event (Day 1 & 2)',
    description: '2 days intensive product sprints',
    scheduleItems: [],
    upcomingItems: [
      'Professional Panel Discussions',
      'Industry Sharing Sessions',
      'Networking Activities',
      'Team Projects & Hands-on Building',
      'Turn Ideas into AI-powered Products'
    ]
  },
  3: {
    type: 'upcoming',
    backgroundColor: 'from-gray-300 to-gray-400',
    title: 'Buildathon',
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
    title: 'Judge Panel Discussion',
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
