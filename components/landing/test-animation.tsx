'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function TestAnimation() {
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log('TestAnimation mounted')
    console.log('GSAP version:', gsap.version)
    console.log('Box ref:', boxRef.current)
    
    if (boxRef.current) {
      gsap.fromTo(
        boxRef.current,
        { opacity: 0, y: 100 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 2,
          onStart: () => console.log('Animation started'),
          onComplete: () => console.log('Animation completed')
        }
      )
    }
  }, [])

  return (
    <div ref={boxRef} style={{ 
      width: '200px', 
      height: '200px', 
      background: 'red', 
      margin: '50px auto' 
    }}>
      Test Box
    </div>
  )
}
