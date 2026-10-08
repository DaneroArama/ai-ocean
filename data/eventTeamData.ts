import type { StaticImageData } from 'next/image'

import AungAyeThanPhoto from '@/app/assets/Persons/Members/AungAyeThan.webp'
import AungPhoneMyatPhoto from '@/app/assets/Persons/Members/Aung Phone Myat.webp'
import AungSoeKhinePhoto from '@/app/assets/Persons/Members/Aung Soe Khine.webp'
import EiEiPhyoPhoto from '@/app/assets/Persons/Members/B6 - Ei Ei Phyo.webp'
import EiThawZinPhoto from '@/app/assets/Persons/Members/B6 - Ei Thaw Zin.webp'
import GharManiSiThuPhoto from '@/app/assets/Persons/Members/B6 - Ghar Mani Si Thu.webp'
import MinNaingPhoto from '@/app/assets/Persons/Members/B6 - Min Naing.webp'
import SuNandarPhoto from '@/app/assets/Persons/Members/B6 - SuNandar.webp'
import ToeHtetArkarPhoto from '@/app/assets/Persons/Members/B6 - Toe Htet Arkar.webp'
import KhaingZinThetPhoto from '@/app/assets/Persons/Members/Khaing Zin Thet.webp'
import LynnMyatBhoneHtutPhoto from '@/app/assets/Persons/Members/Lynn Myat Bhone Htut.webp'
import NweOoLwinPhoto from '@/app/assets/Persons/Members/Nwe Oo Lwin.webp'
import NyeinZayarNaingPhoto from '@/app/assets/Persons/Members/Nyein Zayar Naing.webp'
import ThiriPhyoNaingPhoto from '@/app/assets/Persons/Members/Thiri Phyo Naing.webp'
import KyiSinHsuTharPhoto from '@/app/assets/Persons/mentors/Kyisin Hsuthar.jpeg'
import PhyoThiriThuPhoto from '@/app/assets/Persons/mentors/Phyo Thiri Thu.png'
import SittYeYintTunPhoto from '@/app/assets/Persons/Speakers/Sitt Ye Yint Tun.png'
import WaiYiMonSoePhoto from '@/app/assets/Persons/Speakers/Wai Yi Mon Soe 2025 - Phyo Thiri Thu.webp'
import ZayarHtunPhoto from '@/app/assets/Persons/Speakers/Untitled design - Zayar Htun.webp'
import LaMinThawPhoto from '@/app/assets/Persons/Judges/Image_20260429_105144_367 - Alvin La Min Thaw.webp'
import KoKhantMentorPhoto from '@/app/assets/Persons/mentors/uxmm - Ko Khant.png'
import MinYeHtutMentorPhoto from '@/app/assets/Persons/mentors/_HKS8529_1 - Min Ye Htut.jpg'
import ChanMyaMyaKhinPhoto from '@/app/assets/Persons/Members/ChanMyaMyaKhin.jpg'
import AungPhonePyaeZawPhoto from '@/app/assets/Persons/Members/Aung Bhone Pyae Sone.jpeg'
import AyeSandiMyintPhoto from '@/app/assets/Persons/Members/Aye Sandi Myint.jpeg'
import HtetArkarPhoto from '@/app/assets/Persons/Members/Htet Arkar.jpg'
import NawShinNadiThanPhoto from '@/app/assets/Persons/Members/Naw Shin Nadi Than.jpg'
import SiThuAungPhoto from '@/app/assets/Persons/Members/Si Thu Aung.jpg'
import Sora from '@/app/assets/Persons/Members/Sora.jpg'
import KyalSinLinNaungPhoto from '@/app/assets/Persons/Members/Kyal Sin Lin Naung.jpg'
import SiThuNandaPhoto from '@/app/assets/Persons/Members/Si Thu Nanda.png'
import SawTheinWinTunPhoto from '@/app/assets/Persons/Members/Saw Thein Win Tun.jpg'

export type TeamMember = {
  name: string
  photo?: StaticImageData
}

export const eventTeam: TeamMember[] = [
  { name: 'Aung Aye Than', photo: AungAyeThanPhoto },
  { name: 'Aung Phone Myat', photo: AungPhoneMyatPhoto },
  { name: 'Aung Bhone Pyae Zaw', photo: AungPhonePyaeZawPhoto },
  { name: 'Aung Soe Khine', photo: AungSoeKhinePhoto },
  { name: 'Aye Sandi Myint', photo: AyeSandiMyintPhoto },
  { name: 'Barry', photo: KoKhantMentorPhoto },
  { name: 'Chan Mya Mya Khin', photo: ChanMyaMyaKhinPhoto },
  { name: 'Ei Ei Phyo', photo: EiEiPhyoPhoto },
  { name: 'Ei Thaw Zin', photo: EiThawZinPhoto },
  { name: 'Ghar Mani Si Thu', photo: GharManiSiThuPhoto },
  { name: 'Htet Arkar', photo: HtetArkarPhoto },
  { name: 'Khaing Zin Thet', photo: KhaingZinThetPhoto },
  { name: 'Kyal Sin Lin Naung', photo: KyalSinLinNaungPhoto },
  { name: 'Kyi Sin Hsu Thar', photo: KyiSinHsuTharPhoto },
  { name: 'La Min Thaw', photo: LaMinThawPhoto },
  { name: 'Lynn Myat Bhone Htut', photo: LynnMyatBhoneHtutPhoto },
  { name: 'Min Naing', photo: MinNaingPhoto },
  { name: 'Min Ye Htut Myat', photo: MinYeHtutMentorPhoto },
  { name: 'Naw Shin Nandi Than', photo: NawShinNadiThanPhoto },
  { name: 'Nwe Oo Lwin', photo: NweOoLwinPhoto },
  { name: 'Nyein Zayar Naing', photo: NyeinZayarNaingPhoto },
  { name: 'Phyo Thiri Thu', photo: PhyoThiriThuPhoto },
  { name: 'Saw Thein Win Tun', photo: SawTheinWinTunPhoto },
  { name: 'Si Thu Aung', photo: SiThuAungPhoto },
  { name: 'Si Thu Nanda', photo: SiThuNandaPhoto },
  { name: 'Sora', photo: Sora },
  { name: 'Sitt Ye Yint Tun', photo: SittYeYintTunPhoto },
  { name: 'Su Nandar', photo: SuNandarPhoto },
  { name: 'Thiri Phyo Naing', photo: ThiriPhyoNaingPhoto },
  { name: 'Toe Htet Arkar', photo: ToeHtetArkarPhoto },
  { name: 'Wai Yi Mon Soe', photo: WaiYiMonSoePhoto },
  { name: 'Zayar Htun', photo: ZayarHtunPhoto },
]
