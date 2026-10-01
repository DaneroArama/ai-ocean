import type { StaticImageData } from 'next/image'

import MyoMaungPhoto from '@/app/assets/Persons/Speakers/MyoMaung - Myo Maung.webp'
import AungKyawMinnPhoto from '@/app/assets/Persons/Speakers/IMG_2682 - Aung Kyaw Minn.webp'
import ZayarHtunPhoto from '@/app/assets/Persons/Speakers/Untitled design - Zayar Htun.webp'
import AungMinSoePhoto from '@/app/assets/Persons/Speakers/69ff9fa3-b1cf-4cfe-9c70-6f02c3cf29b1 - Aungmin Soe.webp'
import AikoHuangPhoto from '@/app/assets/Persons/Speakers/1784143360016 - Aiko Huang.webp'
import MinKhantPhoto from '@/app/assets/Persons/Speakers/Image MK - Alean Mk.webp'
import KayPhoto from '@/app/assets/Persons/Speakers/0810_Kay6359_resized - Khin Moet Moet Nyein (Kay).webp'
import PyitSoneOoPhoto from '@/app/assets/Persons/Speakers/Profile Pyit - Pyit Sone Oo.webp'
import ShuMawaSoePhoto from '@/app/assets/Persons/Speakers/Shu Soe Profile Pic 2026 - Shu Mawa Soe.webp'
import AungKoKoThetPhoto from '@/app/assets/Persons/Speakers/Aung Ko Ko Thet.webp'
import KyawMyoThetPhoto from '@/app/assets/Persons/Speakers/Kyaw Myo Thet.webp'
import MyaThandarOoPhoto from '@/app/assets/Persons/Speakers/Mya Thandar Oo.webp'
import WaiYiMonSoePhoto from '@/app/assets/Persons/Speakers/Wai Yi Mon Soe 2025 - Phyo Thiri Thu.webp'
import HendraPhoto from '@/app/assets/Persons/Speakers/Hendra.webp'
import EricGloverPhoto from '@/app/assets/Persons/Speakers/Eric Glover - Phyo Thiri Thu.webp'
import SittYeYintTunPhoto from '@/app/assets/Persons/Speakers/Sitt Ye Yint Tun - Sittye Yint Tun.webp'
import KyisinHsutharPhoto from '@/app/assets/Persons/Kyisin Hsuthar.jpeg'
import SannLynnHtunPhoto from '@/app/assets/Persons/Sann Lynn Htun.jpg'
import HaymarAungPhoto from '@/app/assets/Persons/Haymar Aung.jpeg'
import PhyoThiriThuPhoto from '@/app/assets/Persons/Phyo Thiri Thu.png'
import ChawSuHlaingPhoto from '@/app/assets/Persons/Chaw Su Hlaing.png'
import ThaeSuAyePhoto from '@/app/assets/Persons/Thae Su Aye.jpg'

export type SpeakerDay = 1 | 2

export type SpeakerRole = 'Speaker' | 'Panelist' | 'Moderator'

export type Speaker = {
  id: string
  day: SpeakerDay
  name: string
  position: string
  organization: string
  bio: string
  photo: StaticImageData | string
}

export const speakers: Speaker[] = [
  {
    id: 'myo-maung-maung',
    day: 1,
    name: 'Myo Maung Maung',
    position: 'VP of UI/UX, Lead UX Designer',
    organization: 'Yoma Bank',
    bio: 'Myo Maung, a Lead UX Designer with over 15 years of experience in graphic design, UI/UX design, and digital product design. He has worked across different industries, including telecom, banking, fintech, and social impact organizations, and has led UX/UI design projects for digital products and design systems. Myo is passionate about creating meaningful user experiences, design systems, and helping teams work more effectively through design and AI.',
    photo: MyoMaungPhoto,
  },
  {
    id: 'aung-kyaw-minn',
    day: 1,
    name: 'Aung Kyaw Minn',
    position: 'Solutions Architect',
    organization: 'AYA Innovation Lab',
    bio: 'Aung Kyaw Minn began his career as a Telecom Engineer at ZTE Corporation in 2008 after earning his degree from the University of Computer Studies, Yangon. In 2010, he transitioned into software development, working as a freelance developer and delivering specialized software solutions for retail and wholesale businesses. In 2018, he founded dhobi.co, an online laundry service platform, where he served as Chief Technology Officer (CTO), leading both product development and operations. In late 2020, he joined Hana Microfinance as an Assistant Innovation Manager, spearheading the digital transformation of microfinance operations. His role encompassed managing development teams, designing application architectures, and establishing operational procedures. In early 2022, he joined Nexlabs as a Solution Architect and Lead Developer, leading the development of the Yangon Neighborhood Network Portal for Doh Eain. His leadership and technical expertise earned him the role of Head of Technology, where he oversaw software projects and shaped the company’s technological strategy. Following tech team of Nexlabs’ rebranding to Onenex, he continued in this role, leading a team of over 80 developers and driving innovative solutions in the tech industry. In August 2024, he joined AYA Bank’s Innovation Labs as a Solution Architect, where he currently plays a key role in designing and implementing cutting-edge financial technology solutions.',
    photo: AungKyawMinnPhoto,
  },
  {
    id: 'zayar-htun',
    day: 1,
    name: 'Zayar Htun',
    position: 'Senior Manager - Digital Delivery and Operations',
    organization: 'Cheil Vietnam',
    bio: 'Senior Manager - Digital Delivery & Operations (Japan Market) @ Cheil Vietnam / Founder of PMxPO Learning and Development. PgMP® and PMP® certified Program Orchestrator with 10+ years of experience leading multi-product programs and digital transformations across international markets, including Banking, FinTech, and Energy. A former Software Engineer turned Delivery Manager, a recognized contributor to the PMI PMBOK® Guide (7th & 8th Editions) and 5th Edition of The Standard for Program Management. He specializes in Lean-Agile governance, cross-border team delivery, and incorporating modern methodologies into project management.',
    photo: ZayarHtunPhoto,
  },
  {
    id: 'aung-min-soe',
    day: 1,
    name: 'AUNG MIN SOE ( Kinn )',
    position: 'Lead Product Designer',
    organization: 'Klink Enterprise Solution',
    bio: 'Aung Min Soe (Kinn) is a Lead Product Designer with 8+ years of experience across Fintech, Enterprise SaaS, EdTech, and AI-powered products. He specializes in product design, scalable design systems, conversational UX, and bridging the gap between design and development. His recent work focuses on AI-assisted product experiences, workflow automation, and design-to-code practices that help teams move from ideas to production more effectively.',
    photo: AungMinSoePhoto,
  },
  {
    id: 'aiko-huang',
    day: 1,
    name: 'Aiko Huang',
    position: 'Portfolio Director',
    organization: 'H3VEA Technology Services',
    bio: 'Aiko Huang is a Portfolio Director at H3VEA Technology Services, where she works at the intersection of business strategy, technology, and user experience. With 15 years of experience in education before transitioning into UX and service design, Aiko brings a multidisciplinary perspective spanning UX design, service design, enterprise architecture, and digital transformation. Today, she works closely with organisations to translate business needs into practical digital solutions, balancing user needs, operational realities, technical constraints, and commercial considerations. Her experience gives her a practical perspective on one of the most common challenges in digital projects: how to create meaningful user experiences while still delivering what the business needs.',
    photo: AikoHuangPhoto,
  },
  {
    id: 'min-khant-ko-ko',
    day: 1,
    name: 'Min Khant Ko Ko',
    position: 'AI Instructor',
    organization: "Alex's Vlog & Genplex AI",
    bio: 'Min Khant Ko Ko is a Digital Creator, AI Evaluator, and AI Researcher advancing technology education across Burma and Thailand. Drawing on six years in marketing technology and AI creative work, he serves as a freelance AI Instructor delivering training to SMEs and corporations. As an AI Evaluator, he tests large language models for Google, Uber, and IBM. His research examines AI’s impact on the tech sector and creative jobs in Burma. In 2023, he founded Alex’s Vlog, dedicated “for the people of Burma,” and has since trained 1,000+ youth organizations, SMEs and corporate businesses in digital literacy, cybersecurity, and generative AI.',
    photo: MinKhantPhoto,
  },
  {
    id: 'khin-moet-moet-nyein',
    day: 1,
    name: 'Khin Moet Moet Nyein',
    position: 'Chief Data & Impact Officer',
    organization: 'Doh Eain',
    bio: 'Kay leads the Data & Digital team at Doh Eain, a Myanmar-based social enterprise working across heritage restoration, urban resilience, community networks, and humanitarian response. Her work spans three pillars — impact reporting, platform development, and applied research — and she sits on the organization’s Senior Management Team, guiding how data and technology serve Doh Eain’s mission across its teams. Her data journey took shape at Yoma Bank, where she spent nearly six years building out the bank’s data function, before taking on further roles at CGAP, Shopee, and FINCA Impact Finance — moving across global development, e-commerce, and banking along the way. Drawing on this cross-sector experience, Kay is passionate about helping teams move beyond viewing data and AI as purely technical tools — instead grounding them in structured, human-centered thinking that keeps technology purposeful and accountable to the real work it’s meant to support.',
    photo: KayPhoto,
  },
  {
    id: 'pyit-sone-oo',
    day: 1,
    name: 'Pyit Sone Oo',
    position: 'CEO',
    organization: 'BEYOND 360',
    bio: 'Pyit Sone Oo is the CEO of BEYOND 360, one of Myanmar’s fastest-growing advertising and brand agencies. With over 10 years of experience in advertising, branding, and creative strategy, he has worked with leading local and international brands across telecom, banking, FMCG, insurance, and lifestyle sectors. His work focuses on building strong brand ideas that connect business goals with human insight and culturally relevant creative execution. He is also involved in industry judging and creative evaluation, bringing a perspective shaped by both strategic thinking and hands-on agency leadership.',
    photo: PyitSoneOoPhoto,
  },
  {
    id: 'shu-mawa-soe',
    day: 2,
    name: 'Shu Mawa Soe',
    position: 'Executive UXUI Specialist',
    organization: 'AYA Innovation Lab',
    bio: 'Shu is an AI-driven product designer specializing in humanizing complex systems. She received her MSc in HCI at the University of St Andrews and is now currently consulting for an AI SaaS startup. Shu’s core mission is to drive human-centered design by grounding product decisions in actual research and proven models. Her specialty is bringing soul back into digital experiences to avoid AI slop by centering real user needs and accessibility.',
    photo: ShuMawaSoePhoto,
  },
  {
    id: 'aung-ko-ko-thet',
    day: 2,
    name: 'Aung Ko Ko Thet',
    position: 'Founder, Solution Architect',
    organization: 'Magixx Genesis Value Network',
    bio: 'Aung Ko Ko Thet is a technology professional and the Myanmar Chapter Representative of theBuilderPros network, passionate about helping developers take the leap from learning to actually building. Through the Flutter Builder Professional Industry Program, he creates opportunities for developers to gain hands-on production experience, learn through real feedback and collaboration, and build evidence of what they can truly contribute. His work sits at the intersection of technology, professional learning, and industry readiness—helping developers turn skills into real-world capability.',
    photo: AungKoKoThetPhoto,
  },
  {
    id: 'kyaw-myo-thet',
    day: 2,
    name: 'Kyaw Myo Thet',
    position: 'Chief Technology Officer',
    organization: 'CTZPay',
    bio: 'Ko Kyaw Myo Thet is a technology leader, Enterprise Architect, and seasoned IT professional with over 18 years of experience across technology, digital transformation, and FinTech. As a Chief Technology Officer, he leads product and technology strategy, aligning business goals with technology innovation to build impactful digital products and experiences. With extensive experience guiding cross-functional teams and shaping technology roadmaps, he brings a valuable perspective on how technology leaders turn ideas into scalable products, navigate real-world challenges, and create meaningful impact through innovation.',
    photo: KyawMyoThetPhoto,
  },
  {
    id: 'mya-thandar-oo',
    day: 2,
    name: 'Mya Thandar Oo',
    position: 'Chief Marketing Officer',
    organization: 'MyJobs',
    bio: 'Mya Thandar Oo is a business leader and Chairwoman & Chief Business Officer of MyJobs Myanmar, with extensive experience spanning recruitment, workforce development, and talent intelligence. She works at the intersection of people, business, and the future of work, helping organizations navigate evolving talent needs while contributing to skills development and employment opportunities in Myanmar. With a deep understanding of the local workforce landscape, she brings valuable insights into what employers really look for, how professionals can stay relevant in a changing market, and how to build careers with long-term value.',
    photo: MyaThandarOoPhoto,
  },
  {
    id: 'wai-yi-mon-soe',
    day: 2,
    name: 'Wai Yi Mon Soe',
    position: 'Founder',
    organization: 'UXMM & BridgeX',
    bio: 'Wai Yi Mon Soe is a strategic design leader and the Founder of UXMM and BridgeX. With over a decade of experience in the ICT sector, including over 10 years delivering digital solutions in Singapore, she returned to Myanmar to bridge the critical gap between global standards and local needs. As a dedicated Solution Provider, Wai Yi Mon Soe specializes in aligning Business Vision with practical Execution through Enterprise UX and Service Design. Beyond consultancy, she is a driving force for ecosystem resilience. Through the UXMM Hub, she is actively rebuilding the professional landscape by training the next generation of talent and connecting them directly with workforce opportunities.',
    photo: WaiYiMonSoePhoto,
  },
  {
    id: 'hendra-saputra',
    day: 2,
    name: 'Hendra Saputra',
    position: 'Chief Marketing Officer',
    organization: 'U9',
    bio: 'Hendra Saputra is an experienced business and marketing leader with a career spanning telecommunications, edtech, and digital ventures across Southeast Asia. As CMO of U9 Myanmar, he works across brand, marketing, product, pricing, analytics, and customer experience in one of the region’s most complex markets. Previously, he co-founded and led Kuncie, an Indonesian edtech platform, scaling it to 1 million users within its first year. A builder at heart, Hendra thrives in environments where the playbook doesn’t exist yet. His experience across startups and large-scale businesses gives him a unique perspective on building for growth, understanding customers, navigating uncertainty, and turning ideas into businesses that create real impact.',
    photo: HendraPhoto,
  },
  {
    id: 'eric-glover',
    day: 2,
    name: 'Eric Glover',
    position: 'CEO',
    organization: 'CCI France-Myanmar (FMCCI)',
    bio: 'Eric Glover is the CEO of the French-Myanmar Chamber of Commerce and Industry, a non-profit membership organisation dedicated to developing and improving business conditions for French and other companies in Myanmar, including Myanmar companies of course. FMCCI believes that improving business conditions for everyone results in improving business conditions for each of its members. Eric has lived in Myanmar since 2014. He is a nuclear physicist by training, and he holds a Master degree in Journalism & Communication and another Master degree in Change management. He worked in Myanmar for years as an independent consultant before finally joining FMCCI in June 2026.',
    photo: EricGloverPhoto,
  },
  {
    id: 'sitt-ye-yint-tun',
    day: 2,
    name: 'Sitt Ye Yint Tun',
    position: 'UX/UI Designer',
    organization: 'BIM Group of Companies',
    bio: 'Sitt Ye Yint Tun is a UX/UI Designer focused on systems thinking and designing clear, usable experiences for complex products and services. He brings together user needs, business goals, and technical considerations to turn complex workflows into practical digital solutions. Beyond his design work, he actively contributes to UXMM, helping run research programs that generate meaningful insights for Myanmar’s design and tech community.',
    photo: SittYeYintTunPhoto,
  },
  {
    id: 'kyi-sin-hsu-thar',
    day: 1,
    name: 'Kyi Sin Hsu Thar',
    position: 'Head of Programs',
    organization: 'UXMM',
    bio: 'A versatile UI/UX Designer and product professional with international experience, including remote contributions to high-security government digital transformation projects for a Singapore-based firm. She currently serves as Head of Programs at UXMM, where she leads initiatives that create opportunities for learning, mentorship, and professional growth within the design community. As a Women in Tech Scholarship recipient, she has returned to academia to pursue an M.Sc. in Data Science and AI, embracing a new chapter of continuous learning and expanding her expertise beyond design into technology, data, and strategic thinking.',
    photo: KyisinHsutharPhoto,
  },
  {
    id: 'sann-lynn-htun',
    day: 1,
    name: 'Sann Lynn Htun',
    position: 'Senior Software Engineer',
    organization: 'ACE Data Systems',
    bio: 'Sann Lynn Htun is a Senior Software Engineer with over 11 years of experience at ACE Data Systems, where he has contributed to the development of digital solutions for the banking and financial industry. Throughout his career, he has enjoyed collaborating with teams, solving real-world challenges, and supporting the growth of aspiring professionals through mentoring and knowledge sharing.',
    photo: SannLynnHtunPhoto,
  },
  {
    id: 'hnin-hay-mar-aung',
    day: 1,
    name: 'Hnin Hay Mar Aung',
    position: 'Founder',
    organization: 'EzyPro',
    bio: 'Coming from a background in Tourism & Business Management, Hnin Hay Mar Aung is a Product Designer who has been crafting user-centered digital solutions across Corporate and Start-Up environments since 2020. She excels at bridging business goals with intuitive user experiences. As a Founder of EzyPro, she empowers traditional SMEs to transition smoothly into digital-first businesses. She is also the founder of EzyPet and EzyStamp.',
    photo: HaymarAungPhoto,
  },
  {
    id: 'phyo-thiri-thu',
    day: 1,
    name: 'Phyo Thiri Thu',
    position: 'Research & Development Manager',
    organization: 'KBZ Bank',
    bio: 'Business Research & Development Manager at a local fintech corporation with over 7 years of experience spanning product management, project delivery, digital products, learning platforms, media, and content development. Strong background in product/project management, user needs, business requirements, product development lifecycles, and data-informed decision-making.',
    photo: PhyoThiriThuPhoto,
  },
  {
    id: 'chaw-su-hlaing',
    day: 1,
    name: 'Chaw Su Hlaing',
    position: 'UX Designer (Design Systems)',
    organization: 'CODIGO',
    bio: 'Chaw Su Hlaing is a Senior Product Designer with 6 years of experience. At Codigo, she builds enterprise systems for Porsche and Tiong Bahru Bakery, and a design system running across 8 products that her team builds production UI from with AI. She also runs The Productive Schedule, teaching design systems to designers in Myanmar.',
    photo: ChawSuHlaingPhoto,
  },
  {
    id: 'thae-su-aye',
    day: 1,
    name: 'Thae Su Aye',
    position: 'Project Researcher',
    organization: 'LOMTech',
    bio: 'Project Researcher at LOMTech focused on social impact, inclusion, and making AI accessible to non-technical builders and diverse communities. Her background spans research, operations, and youth leadership across Myanmar and international platforms (SEARA member, SEALNet mentor, LP4Y coach, R&D at Indonesia’s Halal Science Center).',
    photo: ThaeSuAyePhoto,
  },
]

export function speakersForDay(day: SpeakerDay): Speaker[] {
  return speakers.filter((s) => s.day === day)
}

/** Roster role per person — someone may hold several (Speaker + Panelist,
 *  Speaker + Moderator) and then appears in each of their tabs.
 *  Judges are deliberately absent until publicly announced. */
export const rolesById: Record<string, SpeakerRole[]> = {
  'myo-maung-maung': ['Speaker'],
  'aung-kyaw-minn': ['Speaker'],
  'zayar-htun': ['Speaker'],
  'aung-min-soe': ['Speaker'],
  'aiko-huang': ['Speaker'],
  'min-khant-ko-ko': ['Speaker'],
  'khin-moet-moet-nyein': ['Speaker'],
  'pyit-sone-oo': ['Speaker', 'Panelist'],
  'shu-mawa-soe': ['Speaker', 'Moderator'],
  'aung-ko-ko-thet': ['Panelist'],
  'kyaw-myo-thet': ['Panelist'],
  'mya-thandar-oo': ['Panelist'],
  'wai-yi-mon-soe': ['Panelist'],
  'hendra-saputra': ['Panelist'],
  'eric-glover': ['Panelist'],
  'sitt-ye-yint-tun': ['Moderator'],
  'kyi-sin-hsu-thar': ['Panelist'],
  'sann-lynn-htun': ['Panelist'],
  'hnin-hay-mar-aung': ['Panelist'],
  'phyo-thiri-thu': ['Moderator'],
  'chaw-su-hlaing': ['Panelist'],
  'thae-su-aye': ['Panelist'],
}
