import type { StaticImageData } from 'next/image'

import MyoMaungPhoto from '@/app/assets/Persons/Speakers/MyoMaung - Myo Maung.jpeg'
import ZayarHtunPhoto from '@/app/assets/Persons/Speakers/Untitled design - Zayar Htun.jpeg'
import AungMinSoePhoto from '@/app/assets/Persons/Speakers/69ff9fa3-b1cf-4cfe-9c70-6f02c3cf29b1 - Aungmin Soe.jpg'
import KayPhoto from '@/app/assets/Persons/Speakers/0810_Kay6359_resized - Khin Moet Moet Nyein (Kay).jpg'
import ShuMawaSoePhoto from '@/app/assets/Persons/Speakers/Shu Soe Profile Pic 2026 - Shu Mawa Soe.png'
import AungKyawMinPhoto from '@/app/assets/Persons/Speakers/IMG_2682 - Aung Kyaw Minn.jpeg'
import MinKhantPhoto from '@/app/assets/Persons/Speakers/Image MK - Alean Mk.jpg'
import PyitSoneOoPhoto from '@/app/assets/Persons/Speakers/Profile Pyit - Pyit Sone Oo.png'
import AikoHuangPhoto from '@/app/assets/Persons/Speakers/1784143360016 - Aiko Huang.png'

export type SpeakerDay = 1 | 2

export type Speaker = {
  id: string
  day: SpeakerDay
  name: string
  position: string
  organization: string
  bio: string
  photo: StaticImageData
}

export const speakers: Speaker[] = [
  {
    id: 'myo-maung',
    day: 1,
    name: 'Ko Myo Maung',
    position: 'VP of UI/UX, Lead UX Designer',
    organization: 'Yoma Bank',
    bio: 'Myo Maung, a Lead UX Designer with over 15 years of experience in graphic design, UI/UX design, and digital product design. He has worked across different industries, including telecom, banking, fintech, and social impact organizations, and has led UX/UI design projects for digital products and design systems. Myo is passionate about creating meaningful user experiences, design systems, and helping teams work more effectively through design and AI.',
    photo: MyoMaungPhoto,
  },
  {
    id: 'zayar-htun',
    day: 1,
    name: 'Ko Zayar Htun',
    position: 'Senior Manager — Digital Delivery & Operations',
    organization: 'Cheil Vietnam',
    bio: 'PgMP® and PMP® certified Program Orchestrator with 10+ years of experience leading multi-product programs and digital transformations across international markets, including Banking, FinTech, and Energy. A former Software Engineer turned Delivery Manager, a recognized contributor to the PMI PMBOK® Guide (7th & 8th Editions) and 5th Edition of The Standard for Program Management. He specializes in Lean-Agile governance, cross-border team delivery, and incorporating modern methodologies into project management.',
    photo: ZayarHtunPhoto,
  },
  {
    id: 'aung-min-soe',
    day: 1,
    name: 'Ko Aung Min Soe',
    position: 'Lead UI/UX Designer',
    organization: 'Klink Enterprise',
    bio: 'I am Aung Min Soe (Kinn), a Lead Product Designer with 8+ years of experience across Fintech, Enterprise SaaS, EdTech, and AI-powered products. I specialize in product design, scalable design systems, conversational UX, and bridging the gap between design and development. My recent work focuses on AI-assisted product experiences, workflow automation, and design-to-code practices that help teams move from ideas to production more effectively.',
    photo: AungMinSoePhoto,
  },
  {
    id: 'kay-nyein',
    day: 1,
    name: 'Ma Khin Moet Moet Nyein (Kay)',
    position: 'Chief Data & Impact Officer',
    organization: 'Doh Eain',
    bio: "Kay leads the Data & Digital team at Doh Eain, a Myanmar-based social enterprise working across heritage restoration, urban resilience, community networks, and humanitarian response. Her work spans three pillars — impact reporting, platform development, and applied research — and she sits on the organization's Senior Management Team, guiding how data and technology serve Doh Eain's mission across its teams. Her data journey took shape at Yoma Bank, where she spent nearly six years building out the bank's data function, before taking on further roles at CGAP, Shopee, and FINCA Impact Finance — moving across global development, e-commerce, and banking along the way. Drawing on this cross-sector experience, Kay is passionate about helping teams move beyond viewing data and AI as purely technical tools — instead grounding them in structured, human-centered thinking that keeps technology purposeful and accountable to the real work it's meant to support.",
    photo: KayPhoto,
  },
  {
    id: 'shu-mawa-soe',
    day: 2,
    name: 'Ma Shu Mawa Soe',
    position: 'Product Designer',
    organization: 'Pave ERP, AYA Innovation Lab',
    bio: "Shu is an AI-driven product designer specializing in humanizing complex systems. She received her MSc in HCI at the University of St Andrews and is now currently consulting for an AI SaaS startup. Shu's core mission is to drive human-centered design by grounding product decisions in actual research and proven models. Her specialty is bringing soul back into digital experiences to avoid AI slop by centering real user needs and accessibility.",
    photo: ShuMawaSoePhoto,
  },
  {
    id: 'aung-kyaw-min',
    day: 2,
    name: 'Ko Aung Kyaw Min',
    position: 'Solution Architect',
    organization: 'AYA Bank Innovation Labs',
    bio: "Aung Kyaw Minn began his career as a Telecom Engineer at ZTE Corporation in 2008 after earning his degree from the University of Computer Studies, Yangon. In 2010, he transitioned into software development, working as a freelance developer and delivering specialized software solutions for retail and wholesale businesses. In 2018, he founded dhobi.co, an online laundry service platform, where he served as Chief Technology Officer (CTO), leading both product development and operations. In late 2020, he joined Hana Microfinance as an Assistant Innovation Manager, spearheading the digital transformation of microfinance operations. His role encompassed managing development teams, designing application architectures, and establishing operational procedures. In early 2022, he joined Nexlabs as a Solution Architect and Lead Developer, leading the development of the Yangon Neighborhood Network Portal for Doh Eain. His leadership and technical expertise earned him the role of Head of Technology, where he oversaw software projects and shaped the company's technological strategy. Following tech team of Nexlabs' rebranding to Onenex, he continued in this role, leading a team of over 80 developers and driving innovative solutions in the tech industry. In August 2024, he joined AYA Bank's Innovation Labs as a Solution Architect, where he currently plays a key role in designing and implementing cutting-edge financial technology solutions.",
    photo: AungKyawMinPhoto,
  },
  {
    id: 'min-khant-ko-ko',
    day: 2,
    name: 'Ko Min Khant Ko Ko',
    position: 'Lead UI/UX Designer',
    organization: "Alex's Vlog & Genplex AI",
    bio: "Min Khant Ko Ko is a Digital Creator, AI Evaluator, and AI Researcher advancing technology education across Burma and Thailand. Drawing on six years in marketing technology and AI creative work, he serves as a freelance AI Instructor delivering training to SMEs and corporations. As an AI Evaluator, he tests large language models for Google, Uber, and IBM. His research examines AI's impact on the tech sector and creative jobs in Burma. In 2023, he founded Alex's Vlog, dedicated \"for the people of Burma,\" and has since trained 1,000+ youth organizations, SMEs and corporate businesses in digital literacy, cybersecurity, and generative AI.",
    photo: MinKhantPhoto,
  },
  {
    id: 'pyit-sone-oo',
    day: 2,
    name: 'Ko Pyit Sone Oo',
    position: 'CEO',
    organization: 'BEYOND 360',
    bio: "Pyit Sone Oo is the CEO of BEYOND 360, one of Myanmar's fastest-growing advertising and brand agencies. With over 10 years of experience in advertising, branding, and creative strategy, he has worked with leading local and international brands across telecom, banking, FMCG, insurance, and lifestyle sectors. His work focuses on building strong brand ideas that connect business goals with human insight and culturally relevant creative execution. He is also involved in industry judging and creative evaluation, bringing a perspective shaped by both strategic thinking and hands-on agency leadership.",
    photo: PyitSoneOoPhoto,
  },
  {
    id: 'aiko-huang',
    day: 2,
    name: 'Aiko Huang',
    position: 'Portfolio Director',
    organization: 'H3VEA Technology Services',
    bio: 'Aiko Huang is a Portfolio Director at H3VEA Technology Services, where she works at the intersection of business strategy, technology, and user experience. With 15 years of experience in education before transitioning into UX and service design, Aiko brings a multidisciplinary perspective spanning UX design, service design, enterprise architecture, and digital transformation. Today, she works closely with organisations to translate business needs into practical digital solutions, balancing user needs, operational realities, technical constraints, and commercial considerations. Her experience gives her a practical perspective on one of the most common challenges in digital projects: how to create meaningful user experiences while still delivering what the business needs.',
    photo: AikoHuangPhoto,
  },
]

export function speakersForDay(day: SpeakerDay): Speaker[] {
  return speakers.filter((s) => s.day === day)
}
