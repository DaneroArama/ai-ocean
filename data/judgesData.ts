import type { StaticImageData } from 'next/image'

import PhyuMonPhoto from '@/app/assets/Persons/Judges/Phyu Mon - Phyu Mon.webp'
import MyoHtetAungPhoto from '@/app/assets/Persons/Judges/myohtetaung-portrait - Myo Htet Aung.webp'
import HarryHeinPhoto from '@/app/assets/Persons/Judges/profile - Kaung Myat Harry.webp'
import BoBoMinPhoto from '@/app/assets/Persons/Judges/IMG_4261 - Technortal Official.webp'
import LincolnLeongPhoto from '@/app/assets/Persons/Judges/photo_2026-08-30_11-34-27 - Lin Chin Leong.webp'
import AlvinPhoto from '@/app/assets/Persons/Judges/Image_20260429_105144_367 - Alvin La Min Thaw.webp'

export type Judge = {
  id: string
  name: string
  position: string
  organization: string
  bio: string
  photo: StaticImageData
}

export const judges: Judge[] = [
  {
    id: 'phyu-mon-theint',
    name: 'Phyu Mon Theint',
    position: 'Fractional CX/UX Strategist',
    organization: 'PhyuMon.com',
    bio: 'Phyu Mon Theint is a Customer Experience Strategist and Insights Researcher with over a decade of experience across fintech and telecom in APAC. She has led digital transformation programmes, built CX capabilities from the ground up, and advised senior leadership at Amdocs, Yoma Bank, and Telenor. Based in Thailand, she currently serves as a Fractional CX/UX Strategist working across sectors on funnel analysis, product strategy, and programme leadership. She is also a long-time mentor and advisor to the UX Myanmar (UXMM) community and serves on the advisory board at Doh Eain, a social enterprise focused on urban regeneration and heritage preservation.',
    photo: PhyuMonPhoto,
  },
  {
    id: 'myo-htet-aung',
    name: 'Myo Htet Aung',
    position: 'Principal Product Manager',
    organization: 'Carro',
    bio: 'Myo is a Principal Product Manager at Carro, building products across Southeast Asia. A Forbes 30 Under 30 honoree and self-taught engineer, he previously co-founded and scaled two companies: Nexlabs, a top-five digital agency in Myanmar with over 100 employees, and Better HR, a SaaS platform now operating across Southeast Asia. His background bridges business and technology, from hands-on engineering to scaling profitable ventures.',
    photo: MyoHtetAungPhoto,
  },
  {
    id: 'harry-hein',
    name: 'Harry Hein',
    position: 'Product Designer',
    organization: 'From Bangkok To',
    bio: 'Harry Hein is a Bangkok-based Senior Product Designer with seven years across AI-first products, enterprise tooling, and design systems — spanning fintech, legaltech, retail, and B2B SaaS. As UX Lead at Raytail he rebuilt a legacy POS into 200+ screens on a three-tier design system, and he has shipped for teams in Singapore, the Maldives, and Yangon. He now runs From Bangkok To, a design-and-automation practice — where most designers ship product, he ships the team’s process.',
    photo: HarryHeinPhoto,
  },
  {
    id: 'bo-bo-min',
    name: 'Bo Bo Min',
    position: 'Founder and CEO',
    organization: 'Technortal, Empire Digital Solution',
    bio: 'Bo Bo Min is a multi-venture entrepreneur and educator based in Myanmar. He is the Founder & CEO of Technortal, a hybrid education platform delivering affordable programming courses, General Manager of New Next College, and co-owner of Empire Digital Solution, a software solutions company building products like SchoolFlow and custom digital services. As a Python instructor and content creator, he has helped hundreds of learners start their tech careers. His work focuses on building systems, digital products, and AI-driven solutions that simplify complexity.',
    photo: BoBoMinPhoto,
  },
  {
    id: 'lincoln-leong',
    name: 'Lincoln Leong',
    position: 'Senior UX Consultant',
    organization: 'EMQ2',
    bio: 'Lincoln is currently a Senior UX Consultant at EMQ2, seconded to the Monetary Authority of Singapore, working on a design system to help product teams build digital financial products quickly, scalably, and securely.',
    photo: LincolnLeongPhoto,
  },
  {
    id: 'la-min-thaw-alvin',
    name: 'La Min Thaw @ Alvin',
    position: 'Lead UXUI, Deputy Team Lead',
    organization: 'General Magick Thailand, UXMM',
    bio: 'Alvin is a Lead UI/UX Designer and design leader with over a decade of experience across fintech, digital products, and technology in Southeast Asia. He currently leads UI/UX at General Magick Thailand, driving product experience, design strategy, and design systems while supporting the leadership and growth of the Product Team and collaborating with other functions. Alvin is also a co-founder of UXMM (User Experience Myanmar), where he mentors designers and contributes to workshops and community initiatives. He enjoys sharing his design journey, real-world experiences, and lessons learned to help others grow in their design careers.',
    photo: AlvinPhoto,
  },
]
