'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import EventLogoGrey from '@/app/assets/event_logo_grey.png'
import EventLogoYellow from '@/app/assets/event_logo_yellow.png'
import Waves from '@/app/assets/waves_2.png'
import { AnimatedTooltip } from '@/components/AnimatedToolTip'
import { phases, phaseSchedules } from '@/data/scheduleData'

gsap.registerPlugin(ScrollTrigger)

const defaultActivePhase = phases.findIndex(phase => phase.month === 'NOV' && phase.date === '1')

export function ScheduleSection() {
  const [activePhase, setActivePhase] = useState(defaultActivePhase >= 0 ? defaultActivePhase : 0)
  const schedule = phaseSchedules[activePhase]
  const rootRef = useRef<HTMLElement>(null)
  const phasesRef = useRef<HTMLDivElement>(null)
  const detailRef = useRef<HTMLDivElement>(null)
