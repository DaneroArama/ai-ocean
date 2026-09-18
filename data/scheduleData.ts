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
            people: [
              { id: 1, name: 'Chaw Su Hlaing', designation: 'UX Designer (Design Systems)', company: 'Codigo', image: '/placeholder.jpg' },
              { id: 2, name: 'Hnin Hay Mar Aung', designation: 'Founder', company: 'EzyPet & EzyPro', image: '/placeholder.jpg' },
              { id: 3, name: 'Kyi Sin Hsu Thar', designation: 'Product Designer', company: 'Codigo', image: '/placeholder.jpg' },
              { id: 4, name: 'Sann Lynn Htun', designation: 'Senior Designer', company: 'Codigo', image: '/placeholder.jpg' },
              { id: 5, name: 'Thae Su Aye', designation: 'UX Researcher', company: 'Codigo', image: '/placeholder.jpg' },
              { id: 6, name: 'Phyo Thiri Thu', designation: 'Moderator', company: 'Codigo', image: '/placeholder.jpg' },
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
    type: 'finished',
    backgroundColor: 'from-cyan-400 to-blue-500',
    title: 'Main Event (Day 1 & 2)',
    description: '2 days intensive product sprints',
    scheduleItems: [
      {
        time: '8:30 AM',
        events: [
          {
            title: 'Arrival Time for Attendees',
            description: 'Kick off the journey with insights from industry professionals.',
            people: []
          }
        ]
      },
      {
        time: '9:00 - 9:10 AM',
        events: [
          {
            title: 'Opening Ceremony',
            description: 'Welcome speech and event overview.',
            people: [
              { id: 1, name: 'Hnin Hay Mar Aung', designation: 'Founder', company: 'EzyPet & EzyPro', image: '/placeholder.jpg' },
            ]
          },
          {
            title: 'Keynote Speech',
            description: 'Future of UX Design in Southeast Asia.',
            people: [
              { id: 2, name: 'Chaw Su Hlaing', designation: 'UX Designer', company: 'Codigo', image: '/placeholder.jpg' },
            ]
          }
        ]
      },
      {
        time: '9:10 - 9:25 AM',
        events: [
          {
            title: 'Panel Discussion',
            description: 'Kick off the journey with insights from industry professionals.',
            people: [
              { id: 1, name: 'Hnin Hay Mar Aung', designation: 'Founder', company: 'EzyPet & EzyPro', image: '/placeholder.jpg' },
              { id: 2, name: 'Chaw Su Hlaing', designation: 'UX Designer', company: 'Codigo', image: '/placeholder.jpg' },
              { id: 3, name: 'Kyi Sin Hsu Thar', designation: 'Product Designer', company: 'Codigo', image: '/placeholder.jpg' },
            ]
          }
        ]
      },
      {
        time: '12:00 - 1:00 PM',
        events: [
          {
            title: 'Lunch Break',
            description: '',
            people: [],
            highlight: true
          }
        ]
      }
    ],
    upcomingItems: [
      'Professional Panel Discussions',
      'Industry Sharing Sessions',
      'Networking Activities',
      'Team Projects & Hands-on Building',
      'Turn Ideas into AI-powered Products'
    ]
  },
  2: {
    type: 'confirmed',
    backgroundColor: 'from-green-400 to-emerald-600',
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
