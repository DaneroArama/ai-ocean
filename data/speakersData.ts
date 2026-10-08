import type { StaticImageData } from 'next/image'

import MyoMaungPhoto from '@/app/assets/Persons/Speakers/MyoMaung - Myo Maung.webp'
import AungKyawMinnPhoto from '@/app/assets/Persons/Speakers/IMG_2682 - Aung Kyaw Minn.webp'
import ZayarHtunPhoto from '@/app/assets/Persons/Speakers/Untitled design - Zayar Htun.webp'
import AungMinSoePhoto from '@/app/assets/Persons/Speakers/69ff9fa3-b1cf-4cfe-9c70-6f02c3cf29b1 - Aungmin Soe.webp'
import AikoHuangPhoto from '@/app/assets/Persons/Speakers/1784143360016 - Aiko Huang.webp'
import MinKhantPhoto from '@/app/assets/Persons/Speakers/Image MK - Alean Mk.webp'
import KayPhoto from '@/app/assets/Persons/Speakers/0810_Kay6359_resized - Khin Moet Moet Nyein (Kay).webp'
import PyitSoneOoPhoto from '@/app/assets/Persons/Speakers/Pyit Sone Oo.png'
import ShuMawaSoePhoto from '@/app/assets/Persons/Speakers/Shu Soe Profile Pic 2026 - Shu Mawa Soe.webp'
import AungKoKoThetPhoto from '@/app/assets/Persons/Speakers/Aung Ko Ko Thet.webp'
import KyawMyoThetPhoto from '@/app/assets/Persons/Speakers/Kyaw Myo Thet.webp'
import MyaThandarOoPhoto from '@/app/assets/Persons/Speakers/Mya Thandar Oo.webp'
import WaiYiMonSoePhoto from '@/app/assets/Persons/Speakers/Wai Yi Mon Soe 2025 - Phyo Thiri Thu.webp'
import HendraPhoto from '@/app/assets/Persons/Speakers/Hendra.webp'
import EricGloverPhoto from '@/app/assets/Persons/Speakers/Eric Glover - Phyo Thiri Thu.webp'
import SittYeYintTunPhoto from '@/app/assets/Persons/Speakers/Sitt Ye Yint Tun.png'
import KyisinHsutharPhoto from '@/app/assets/Persons/mentors/Kyisin Hsuthar.jpeg'
import SannLynnHtunPhoto from '@/app/assets/Persons/mentors/Sann Lynn Htun.jpg'
import HaymarAungPhoto from '@/app/assets/Persons/mentors/Haymar Aung.jpeg'
import PhyoThiriThuPhoto from '@/app/assets/Persons/mentors/Phyo Thiri Thu.png'
import ChawSuHlaingPhoto from '@/app/assets/Persons/mentors/Chaw Su Hlaing.png'
import ThaeSuAyePhoto from '@/app/assets/Persons/mentors/Thae Su Aye.jpg'
import BoboLinnaingMentorPhoto from '@/app/assets/Persons/mentors/bobolinnaing_profile - Bobo Linnaing.jpeg'
import ZawekaungHtetMentorPhoto from '@/app/assets/Persons/mentors/IMG_0346 - Zawekaung htet.jpeg'
import LinLinKhineMentorPhoto from '@/app/assets/Persons/mentors/IMG_20250314_200502_196 - Lin Lin Khine.jpg'
import MinNandaZanMentorPhoto from '@/app/assets/Persons/mentors/IMG_3321 - Min Nanda Zan.jpg'
import LynnhtetThantMentorPhoto from '@/app/assets/Persons/mentors/IMG_6482 - Lynnhtet Thant.jpeg'
import KyawKoKoTunMentorPhoto from '@/app/assets/Persons/mentors/me-pfp - Kyaw Ko Ko Tun.png'
import HninYuHlaingMentorPhoto from '@/app/assets/Persons/mentors/pic for mentor - Hnin Yu Hlaing.png'
import ThazinWinMentorPhoto from '@/app/assets/Persons/mentors/Thazin - Thazin Win.png'
import KoKhantMentorPhoto from '@/app/assets/Persons/mentors/uxmm - Ko Khant.png'
import MinYeHtutMentorPhoto from '@/app/assets/Persons/mentors/_HKS8529_1 - Min Ye Htut.jpg'
import PwintYeeMonPhoto from '@/app/assets/Persons/mentors/Pwint Yee Mon (Christine) 1 - Pwint Yee Mon (Christine).jpg'

export type SpeakerRole = 'Speaker' | 'Panelist' | 'Moderator'

export type Speaker = {
  id: string
  name: string
  position: string
  organization: string
  bio: string
  photo: StaticImageData | string
}

export type Mentor = {
  id: string
  name: string
  position?: string
  organization?: string
  bio?: string
  photo: StaticImageData | string
}

export const speakers: Speaker[] = [
  {
    id: 'myo-maung-maung',
    name: 'Myo Maung Maung',
    position: 'VP of UI/UX, Lead UX Designer',
    organization: 'Yoma Bank',
    bio: 'Myo Maung, a Lead UX Designer with over 15 years of experience in graphic design, UI/UX design, and digital product design. He has worked across different industries, including telecom, banking, fintech, and social impact organizations, and has led UX/UI design projects for digital products and design systems. Myo is passionate about creating meaningful user experiences, design systems, and helping teams work more effectively through design and AI.',
    photo: MyoMaungPhoto,
  },
  {
    id: 'aung-kyaw-minn',
    name: 'Aung Kyaw Minn',
    position: 'Solutions Architect',
    organization: 'AYA Innovation Lab',
    bio: 'Aung Kyaw Minn began his career as a Telecom Engineer at ZTE Corporation in 2008 after earning his degree from the University of Computer Studies, Yangon. In 2010, he transitioned into software development, working as a freelance developer and delivering specialized software solutions for retail and wholesale businesses. In 2018, he founded dhobi.co, an online laundry service platform, where he served as Chief Technology Officer (CTO), leading both product development and operations. In late 2020, he joined Hana Microfinance as an Assistant Innovation Manager, spearheading the digital transformation of microfinance operations. His role encompassed managing development teams, designing application architectures, and establishing operational procedures. In early 2022, he joined Nexlabs as a Solution Architect and Lead Developer, leading the development of the Yangon Neighborhood Network Portal for Doh Eain. His leadership and technical expertise earned him the role of Head of Technology, where he oversaw software projects and shaped the company’s technological strategy. Following tech team of Nexlabs’ rebranding to Onenex, he continued in this role, leading a team of over 80 developers and driving innovative solutions in the tech industry. In August 2024, he joined AYA Bank’s Innovation Labs as a Solution Architect, where he currently plays a key role in designing and implementing cutting-edge financial technology solutions.',
    photo: AungKyawMinnPhoto,
  },
  {
    id: 'zayar-htun',
    name: 'Zayar Htun',
    position: 'Senior Manager - Digital Delivery and Operations',
    organization: 'Cheil Vietnam',
    bio: 'Senior Manager - Digital Delivery & Operations (Japan Market) @ Cheil Vietnam / Founder of PMxPO Learning and Development. PgMP® and PMP® certified Program Orchestrator with 10+ years of experience leading multi-product programs and digital transformations across international markets, including Banking, FinTech, and Energy. A former Software Engineer turned Delivery Manager, a recognized contributor to the PMI PMBOK® Guide (7th & 8th Editions) and 5th Edition of The Standard for Program Management. He specializes in Lean-Agile governance, cross-border team delivery, and incorporating modern methodologies into project management.',
    photo: ZayarHtunPhoto,
  },
  {
    id: 'aung-min-soe',
    name: 'AUNG MIN SOE ( Kinn )',
    position: 'Lead UI/UX Designer',
    organization: 'Klink Enterprise Solution',
    bio: 'Aung Min Soe (Kinn) is a Lead Product Designer with 8+ years of experience across Fintech, Enterprise SaaS, EdTech, and AI-powered products. He specializes in product design, scalable design systems, conversational UX, and bridging the gap between design and development. His recent work focuses on AI-assisted product experiences, workflow automation, and design-to-code practices that help teams move from ideas to production more effectively.',
    photo: AungMinSoePhoto,
  },
  {
    id: 'aiko-huang',
    name: 'Aiko Huang',
    position: 'Portfolio Director',
    organization: 'H3VEA Technology Services',
    bio: 'Aiko Huang is a Portfolio Director at H3VEA Technology Services, where she works at the intersection of business strategy, technology, and user experience. With 15 years of experience in education before transitioning into UX and service design, Aiko brings a multidisciplinary perspective spanning UX design, service design, enterprise architecture, and digital transformation. Today, she works closely with organisations to translate business needs into practical digital solutions, balancing user needs, operational realities, technical constraints, and commercial considerations. Her experience gives her a practical perspective on one of the most common challenges in digital projects: how to create meaningful user experiences while still delivering what the business needs.',
    photo: AikoHuangPhoto,
  },
  {
    id: 'min-khant-ko-ko',
    name: 'Min Khant Ko Ko',
    position: 'AI Instructor',
    organization: "Alex's Vlog & Genplex AI",
    bio: 'Min Khant Ko Ko is a Digital Creator, AI Evaluator, and AI Researcher advancing technology education across Burma and Thailand. Drawing on six years in marketing technology and AI creative work, he serves as a freelance AI Instructor delivering training to SMEs and corporations. As an AI Evaluator, he tests large language models for Google, Uber, and IBM. His research examines AI’s impact on the tech sector and creative jobs in Burma. In 2023, he founded Alex’s Vlog, dedicated “for the people of Burma,” and has since trained 1,000+ youth organizations, SMEs and corporate businesses in digital literacy, cybersecurity, and generative AI.',
    photo: MinKhantPhoto,
  },
  {
    id: 'khin-moet-moet-nyein',
    name: 'Khin Moet Moet Nyein',
    position: 'Chief Data & Impact Officer',
    organization: 'Doh Eain',
    bio: 'Kay leads the Data & Digital team at Doh Eain, a Myanmar-based social enterprise working across heritage restoration, urban resilience, community networks, and humanitarian response. Her work spans three pillars — impact reporting, platform development, and applied research — and she sits on the organization’s Senior Management Team, guiding how data and technology serve Doh Eain’s mission across its teams. Her data journey took shape at Yoma Bank, where she spent nearly six years building out the bank’s data function, before taking on further roles at CGAP, Shopee, and FINCA Impact Finance — moving across global development, e-commerce, and banking along the way. Drawing on this cross-sector experience, Kay is passionate about helping teams move beyond viewing data and AI as purely technical tools — instead grounding them in structured, human-centered thinking that keeps technology purposeful and accountable to the real work it’s meant to support.',
    photo: KayPhoto,
  },
  {
    id: 'eric-glover',
    name: 'Eric Glover',
    position: 'CEO',
    organization: 'CCI France-Myanmar (FMCCI)',
    bio: 'Eric Glover is the CEO of the French-Myanmar Chamber of Commerce and Industry, a non-profit membership organisation dedicated to developing and improving business conditions for French and other companies in Myanmar, including Myanmar companies of course. FMCCI believes that improving business conditions for everyone results in improving business conditions for each of its members. Eric has lived in Myanmar since 2014. He is a nuclear physicist by training, and he holds a Master degree in Journalism & Communication and another Master degree in Change management. He worked in Myanmar for years as an independent consultant before finally joining FMCCI in June 2026.',
    photo: EricGloverPhoto,
  },
  {
    id: 'hendra-saputra',
    name: 'Hendra Saputra',
    position: 'Chief Marketing Officer',
    organization: 'U9',
    bio: 'Hendra Saputra is an experienced business and marketing leader with a career spanning telecommunications, edtech, and digital ventures across Southeast Asia. As CMO of U9 Myanmar, he works across brand, marketing, product, pricing, analytics, and customer experience in one of the region’s most complex markets. Previously, he co-founded and led Kuncie, an Indonesian edtech platform, scaling it to 1 million users within its first year. A builder at heart, Hendra thrives in environments where the playbook doesn’t exist yet. His experience across startups and large-scale businesses gives him a unique perspective on building for growth, understanding customers, navigating uncertainty, and turning ideas into businesses that create real impact.',
    photo: HendraPhoto,
  },
  {
    id: 'kyaw-myo-thet',
    name: 'Kyaw Myo Thet',
    position: 'Chief Technology Officer',
    organization: 'CTZPay',
    bio: 'Ko Kyaw Myo Thet is a technology leader, Enterprise Architect, and seasoned IT professional with over 18 years of experience across technology, digital transformation, and FinTech. As a Chief Technology Officer, he leads product and technology strategy, aligning business goals with technology innovation to build impactful digital products and experiences. With extensive experience guiding cross-functional teams and shaping technology roadmaps, he brings a valuable perspective on how technology leaders turn ideas into scalable products, navigate real-world challenges, and create meaningful impact through innovation.',
    photo: KyawMyoThetPhoto,
  },
  {
    id: 'wai-yi-mon-soe',
    name: 'Wai Yi Mon Soe',
    position: 'Founder',
    organization: 'UXMM & BridgeX',
    bio: 'Wai Yi Mon Soe is a strategic design leader and the Founder of UXMM and BridgeX. With over a decade of experience in the ICT sector, including over 10 years delivering digital solutions in Singapore, she returned to Myanmar to bridge the critical gap between global standards and local needs. As a dedicated Solution Provider, Wai Yi Mon Soe specializes in aligning Business Vision with practical Execution through Enterprise UX and Service Design. Beyond consultancy, she is a driving force for ecosystem resilience. Through the UXMM Hub, she is actively rebuilding the professional landscape by training the next generation of talent and connecting them directly with workforce opportunities.',
    photo: WaiYiMonSoePhoto,
  },
  {
    id: 'aung-ko-ko-thet',
    name: 'Aung Ko Ko Thet',
    position: 'Founder',
    organization: 'Flutter Builder Professional Industry Program',
    bio: 'Aung Ko Ko Thet is a technology professional and the Myanmar Chapter Representative of theBuilderPros network, passionate about helping developers take the leap from learning to actually building. Through the Flutter Builder Professional Industry Program, he creates opportunities for developers to gain hands-on production experience, learn through real feedback and collaboration, and build evidence of what they can truly contribute. His work sits at the intersection of technology, professional learning, and industry readiness—helping developers turn skills into real-world capability.',
    photo: AungKoKoThetPhoto,
  },
  {
    id: 'mya-thandar-oo',
    name: 'Mya Thandar Oo',
    position: 'Chairwoman & Chief Marketing Officer',
    organization: 'MyJobs',
    bio: 'Mya Thandar Oo is a business leader and Chairwoman & Chief Business Officer of MyJobs Myanmar, with extensive experience spanning recruitment, workforce development, and talent intelligence. She works at the intersection of people, business, and the future of work, helping organizations navigate evolving talent needs while contributing to skills development and employment opportunities in Myanmar. With a deep understanding of the local workforce landscape, she brings valuable insights into what employers really look for, how professionals can stay relevant in a changing market, and how to build careers with long-term value.',
    photo: MyaThandarOoPhoto,
  },
  {
    id: 'pyit-sone-oo',
    name: 'Pyit Sone Oo',
    position: 'CEO',
    organization: 'BEYOND 360',
    bio: 'Pyit Sone Oo is the CEO of BEYOND 360, one of Myanmar’s fastest-growing advertising and brand agencies. With over 10 years of experience in advertising, branding, and creative strategy, he has worked with leading local and international brands across telecom, banking, FMCG, insurance, and lifestyle sectors. His work focuses on building strong brand ideas that connect business goals with human insight and culturally relevant creative execution. He is also involved in industry judging and creative evaluation, bringing a perspective shaped by both strategic thinking and hands-on agency leadership.',
    photo: PyitSoneOoPhoto,
  },
  {
    id: 'shu-mawa-soe',
    name: 'Shu Mawa Soe',
    position: 'Product Designer',
    organization: 'AYA Innovation Lab',
    bio: 'Shu is an AI-driven product designer specializing in humanizing complex systems. She received her MSc in HCI at the University of St Andrews and is now currently consulting for an AI SaaS startup. Shu’s core mission is to drive human-centered design by grounding product decisions in actual research and proven models. Her specialty is bringing soul back into digital experiences to avoid AI slop by centering real user needs and accessibility.',
    photo: ShuMawaSoePhoto,
  },
  {
    id: 'chaw-su-hlaing',
    name: 'Chaw Su Hlaing',
    position: 'UX Designer (Design Systems)',
    organization: 'CODIGO',
    bio: 'Chaw Su Hlaing is a Senior Product Designer with 6 years of experience. At Codigo, she builds enterprise systems for Porsche and Tiong Bahru Bakery, and a design system running across 8 products that her team builds production UI from with AI. She also runs The Productive Schedule, teaching design systems to designers in Myanmar.',
    photo: ChawSuHlaingPhoto,
  },
  {
    id: 'hnin-hay-mar-aung',
    name: 'Hnin Hay Mar Aung',
    position: 'Founder',
    organization: 'EzyPro',
    bio: 'Coming from a background in Tourism & Business Management, Hnin Hay Mar Aung is a Product Designer who has been crafting user-centered digital solutions across Corporate and Start-Up environments since 2020. She excels at bridging business goals with intuitive user experiences. As a Founder of EzyPro, she empowers traditional SMEs to transition smoothly into digital-first businesses. She is also the founder of EzyPet and EzyStamp.',
    photo: HaymarAungPhoto,
  },
  {
    id: 'kyi-sin-hsu-thar',
    name: 'Kyi Sin Hsu Thar',
    position: 'Head of Programs',
    organization: 'UXMM',
    bio: [
      'A versatile UI/UX Designer and product professional with international experience, including remote contributions to high-security government digital transformation projects for a Singapore-based firm. She currently serves as Head of Programs at UXMM, where she leads initiatives that create opportunities for learning, mentorship, and professional growth within the design community.',
      '',
      'As a Women in Tech Scholarship recipient, she has returned to academia to pursue an M.Sc. in Data Science and AI, embracing a new chapter of continuous learning and expanding her expertise beyond design into technology, data, and strategic thinking. Her journey reflects a commitment to evolving with the industry while using her experience to create opportunities for others.',
      '',
      'Combining user-centered design, product thinking, and data-driven approaches, she believes in learning by doing, sharing knowledge, and empowering the next generation of designers. As a mentor, she is particularly passionate about supporting aspiring designers and women in tech to build confidence, develop practical skills, and turn their potential into meaningful careers.',
    ].join('\n'),
    photo: KyisinHsutharPhoto,
  },
  {
    id: 'phyo-thiri-thu',
    name: 'Phyo Thiri Thu',
    position: 'Research & Development Manager',
    organization: 'KBZ Bank',
    bio: 'Business Research & Development Manager at a local fintech corporation with over 7 years of experience spanning product management, project delivery, digital products, learning platforms, media, and content development. Strong background in product/project management, user needs, business requirements, product development lifecycles, and data-informed decision-making.',
    photo: PhyoThiriThuPhoto,
  },
  {
    id: 'sann-lynn-htun',
    name: 'Sann Lynn Htun',
    position: 'Senior Software Engineer',
    organization: 'ACE Data Systems',
    bio: 'Sann Lynn Htun is a Senior Software Engineer with over 11 years of experience at ACE Data Systems, where he has contributed to the development of digital solutions for the banking and financial industry. Throughout his career, he has enjoyed collaborating with teams, solving real-world challenges, and supporting the growth of aspiring professionals through mentoring and knowledge sharing.',
    photo: SannLynnHtunPhoto,
  },
  {
    id: 'sitt-ye-yint-tun',
    name: 'Sitt Ye Yint Tun',
    position: 'UX/UI Designer',
    organization: 'BIM Group of Companies',
    bio: 'Sitt Ye Yint Tun is a UX/UI Designer focused on systems thinking and designing clear, usable experiences for complex products and services. He brings together user needs, business goals, and technical considerations to turn complex workflows into practical digital solutions. Beyond his design work, he actively contributes to UXMM, helping run research programs that generate meaningful insights for Myanmar’s design and tech community.',
    photo: SittYeYintTunPhoto,
  },
  {
    id: 'thae-su-aye',
    name: 'Thae Su Aye',
    position: 'Project Researcher',
    organization: 'LOMTech',
    bio: 'Project Researcher at LOMTech focused on social impact, inclusion, and making AI accessible to non-technical builders and diverse communities. Her background spans research, operations, and youth leadership across Myanmar and international platforms (SEARA member, SEALNet mentor, LP4Y coach, R&D at Indonesia’s Halal Science Center).',
    photo: ThaeSuAyePhoto,
  }
]

const mentorIds = new Set([
  'kyi-sin-hsu-thar',
  'sann-lynn-htun',
  'hnin-hay-mar-aung',
  'phyo-thiri-thu',
  'chaw-su-hlaing',
  'thae-su-aye',
])

const mentorPhotos: Record<string, StaticImageData> = {
  'kyi-sin-hsu-thar': KyisinHsutharPhoto,
  'sann-lynn-htun': SannLynnHtunPhoto,
  'hnin-hay-mar-aung': HaymarAungPhoto,
  'phyo-thiri-thu': PhyoThiriThuPhoto,
  'chaw-su-hlaing': ChawSuHlaingPhoto,
  'thae-su-aye': ThaeSuAyePhoto,
}

const existingMentors: Mentor[] = speakers
  .filter((speaker) => mentorIds.has(speaker.id))
  .map(({ id, name, position, organization, bio }) => ({
    id,
    name,
    position,
    organization,
    bio,
    photo: mentorPhotos[id],
  }))

export const mentors: Mentor[] = [
  ...existingMentors,
  {
    id: 'bobo-linnaing',
    name: 'Bobo Linnaing',
    position: 'UI/UX Designer',
    organization: 'SANDP1T Ltd.',
    bio: 'Bobo Linnaing is a UI/UX Designer with a background in medicine who transitioned into the design field in 2021. He currently works on B2B SaaS and enterprise products across areas such as supply chain, document management, and electronic healthcare system, with a focus on user experience, interface design, and design systems',
    photo: BoboLinnaingMentorPhoto,
  },
  {
    id: 'zawekaung-htet',
    name: 'Zawe Kaung Htet',
    position: 'Senior UI UX Designer',
    organization: 'U9',
    bio: 'I’m Zawe Kaung Htet, a Senior UI/UX Designer at U9 with over eight years of experience in the industry. I’ve worked on a wide range of digital products and solutions across FinTech, e-wallets and digital banking, telecom, e-commerce, POS, PWA, and more. I’m passionate about creating simple, intuitive, and meaningful experiences that solve real user needs and bring value to businesses.',
    photo: ZawekaungHtetMentorPhoto,
  },
  {
    id: 'lin-lin-khine',
    name: 'Lin Lin Khine',
    position: 'QA Analyst',
    organization: 'Carro',
    bio: 'I have around 8 years experience in QA Analyst, with experience working closely with product, business, design and engineering teams to deliver user-focused solutions along with value.',
    photo: LinLinKhineMentorPhoto,
  },
  {
    id: 'min-nanda-zan',
    name: 'Min Nanda Zan',
    position: 'Product Designer & UX Specialist',
    organization: 'Wave Money',
    bio: 'Min Nanda Zan, widely known as Kanzo, is a seasoned Product Designer at Wave Money and a dedicated Instructor at UXMM with over 8 years of industry experience. Since beginning his career in 2018, he has specialized in UX design, focusing on creating intuitive and impactful digital financial services that cater to millions of users. In addition to his professional role at Wave Money, Kanzo is deeply committed to nurturing the next generation of designers as an instructor for beginner UI/UX classes at UXMM. His approach combines deep technical expertise with a passion for design thinking, aiming to elevate the digital ecosystem in Myanmar through both high-quality product development and community mentorship.',
    photo: MinNandaZanMentorPhoto,
  },
  {
    id: 'lynnhtet-thant',
    name: 'Lynn Htet Thant',
    position: 'User Experience Lead',
    organization: 'KBZ',
    bio: 'I’m Lynn Htet Thant — a product designer and A passionate UX designer with 5 years of experience creating user-centered interfaces and applications. Skilled in the entire design process, from user research and prototyping to usability testing and implementation. Equally enthusiastic about sharing knowledge and fostering the next generation of UX professionals. Proficient in creating intuitive, secure, and compliant interfaces that enhance the user experience, visually appealing interfaces for SaaS (Software as a Service) products and drive business growth. I design with love a lot of web apps and mobile applications for various industries. I perform as a UX researcher, UX analyst, UX designer and UI designer passionately.',
    photo: LynnhtetThantMentorPhoto,
  },
  {
    id: 'kyaw-ko-ko-tun',
    name: 'Kyaw Ko Ko Tun',
    position: 'Founder / Senior Fullstack Developer',
    organization: "Let's Tech Club / OSBAY",
    bio: 'Kyaw Ko Ko Tun (Brady) is a software engineer, system architect, and the founder of Let’s Tech Club. His journey in technology began at age 12, entering the professional software industry by age 15. He is passionate about designing scalable backend architectures, reliable systems, and production-ready engineering workflows. Beyond system architecture, Brady is driven by a long-term vision to build a sustainable tech startup ecosystem in Myanmar. Through Let’s Tech Club, he leads practical developer bootcamps, technical hackathons, and community initiatives designed to connect local talents with the right, high-impact opportunities. His core mission centers on equipping local developers with production-grade skills and helping build the foundation for future technology ventures.',
    photo: KyawKoKoTunMentorPhoto,
  },
  {
    id: 'pwint-yee-mon',
    name: 'Pwint Yee Mon',
    position: 'UI/UX Consultant',
    organization: 'SANDP1T',
    bio: 'Ma Pwint Yee Mon (Christine) သည် Singapore အခြေစိုက် SANDP1T တွင် UI/UX Consultant အဖြစ် လုပ်ကိုင်နေသူဖြစ်ပြီး Myanmar နှင့် Singapore အခြေစိုက် ကုမ္ပဏီများတွင် ၅ နှစ်ကျော် အတွေ့အကြုံရှိသူဖြစ်ပါတယ်။ UI Designer အဖြစ် စတင်ခဲ့ပြီး ယခုအခါတွင် Interaction Design၊ System Thinking နှင့် UX Mindset များကို အဓိကထားကာ Service Design ဘက်တွင် တာဝန်ယူလုပ်ကိုင်နေပါတယ်။ ဒါ့အပြင် UX community များတွင် ပါဝင်ကာ knowledge sharing ပြုလုပ်ခြင်းကို နှစ်သက်သူဖြစ်ပြီး Figma Community တွင်လည်း UX နှင့် Workshop templates များကိုလည်း ပူးပေါင်းမျှဝေထားသူဖြစ်ပါတယ်။',
    photo: PwintYeeMonPhoto,
  },
  {
    id: 'hnin-yu-hlaing',
    name: 'Hnin Yu Hlaing',
    position: 'Lead UI/UX Designer',
    organization: 'LomTech Global',
    bio: 'Hello, my name is Hnin Yu Hlaing (Joyce). I’m currently working as a Design Team Lead at LOMTech, where I lead design initiatives and mentor designers to grow both creatively and strategically. Over the past five years, I’ve collaborated with international teams to create solutions that effectively balance both business goals and user needs. As a mentor, what I want to focus on in this UXMM program is helping designers move beyond just “designing UI/UX.” I want them to start thinking like product leaders, understanding real-world impact and being able to create meaningful, practical solutions.',
    photo: HninYuHlaingMentorPhoto,
  },
  {
    id: 'thazin-win',
    name: 'Thazin Win',
    position: 'Senior UI/UX Specialist',
    organization: 'U9 Myanmar',
    bio: 'Thazin Win is a Senior UI/UX Specialist at U9 Myanmar, with experience spanning product design, UX research, usability testing, and digital product development. She has worked across fintech, telecommunications, and digital services, with a particular interest in creating usable and inclusive experiences for people with different levels of digital literacy. Beyond her professional work, Thazin actively contributes to Myanmar’s UX community through mentoring, teaching, and knowledge sharing. She is passionate about helping designers and cross-functional teams understand how UX can create meaningful value for both users and businesses.',
    photo: ThazinWinMentorPhoto,
  },
  { id: 'ko-khant', 
    name: 'Barry',
    position: 'Product Designer',
    organization: 'MyJobS Myanmar / Ninja Van Myanmar / SupaCart',
    bio: 'Hello there. I’m a Senior UX/UI Designer and Product Designer with experience designing digital products across different industries from both local and foreign. Currently I’m contributing in Ninja Van Myanmar and MyJobs Myanmar as a Senior Designer. And I’m also taking responsibility as a Project Manager Assistant at SupaCart. I used to take part in mentoring newbies via classes and online courses at Let’s Tech Club and Compass back in the past.မင်္ဂလာပါဗျ၊​ ကျွန်တော်ကတော့ Local နဲ့ Foreign Industries တွေမှာရှိတဲ့ Companies တွေမှာ Senior UXUI Designer အနေနဲ့ကော Product Designer အနေနဲ့ပါ လုပ်ကိုင်ဖူးတဲ့ အတွေ့အကြုံရှိပါတယ်ခင်ဗျာ၊ လက်ရှိမှာတော့ Ninja Van Myanmar, MyJobs Myanmar နဲ့ SupaCart တို့မှာ လုပ်ကိုင်လျက်ရှိပါတယ်၊ အရင်တုန်းကတော့   Community ထဲအသစ်ဝင်ရောက်လာသူတွေကို သင်တန်းတွေကတစ်ဆင့် သင်ကြားပို့ချဖူးပါတယ်ခင်ဗျာ။',
    photo: KoKhantMentorPhoto },
  {
    id: 'min-ye-htut',
    name: 'Min Ye Htut',
    position: 'UX/UI Designer',
    organization: 'Yoma Group Technology',
    bio: 'Min Ye is a UX/UI Designer passionate about turning real-world problems into simple, meaningful digital experiences. With experience across Myanmar’s startup and corporate landscape, he brings together user-centered design, technology, and business thinking to create solutions that are both useful for people and valuable for organizations.',
    photo: MinYeHtutMentorPhoto,
  },
]

/** Roster role per person — someone may hold several (Speaker + Panelist,
 *  Speaker + Moderator) and then appears in each of their tabs. */
export const rolesById: Record<string, SpeakerRole[]> = {
  'myo-maung-maung': ['Speaker'],
  'aung-kyaw-minn': ['Speaker'],
  'zayar-htun': ['Speaker'],
  'aung-min-soe': ['Speaker'],
  'aiko-huang': ['Speaker'],
  'min-khant-ko-ko': ['Speaker'],
  'khin-moet-moet-nyein': ['Speaker'],
  'pyit-sone-oo': ['Speaker', 'Panelist'],
  'shu-mawa-soe': ['Speaker', 'Moderator', 'Panelist'],
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
