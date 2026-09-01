'use client';

import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

export interface FlowSectionProps {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const FlowSection: React.FC<FlowSectionProps> = ({
                                                          className,
                                                          style = {},
                                                          children,
                                                        }) => (
  <section
    data-flow-section
    className={cn('relative min-h-screen w-full overflow-hidden', className)}
  >
    <div
      className={cn(
        'flow-art-container relative flex min-h-screen w-full flex-col justify-between gap-6 px-[4vw] pt-[clamp(2rem,8vw,4vw)] pb-[4vw]',
        'will-change-transform'
      )}
      style={{ transformOrigin: 'bottom left', ...style }}
    >
      {children}
    </div>
  </section>
);

interface FlowArtProps {
  children: React.ReactNode;
  className?: string;
}

const FlowArt: React.FC<FlowArtProps> = ({ children, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sections = Array.from(containerRef.current.querySelectorAll<HTMLElement>('[data-flow-section]'));
    if (sections.length === 0) return;

    const triggers: ScrollTrigger[] = [];

    sections.forEach((section, i) => {
      const container = section.querySelector('.flow-art-container');
      if (!container) return;

      if (i > 0) {
        gsap.set(container, { rotation: 30, transformOrigin: 'bottom left' });
        const tween = gsap.to(container, {
          rotation: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'top 25%',
            scrub: true,
          },
        });
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
      }

      if (i < sections.length - 1) {
        triggers.push(
          ScrollTrigger.create({
            trigger: section,
            start: 'bottom bottom',
            end: 'bottom top',
            pin: true,
            pinSpacing: false,
          })
        );
      }
    });

    ScrollTrigger.refresh();

    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <main ref={containerRef} className={cn('w-full overflow-x-hidden', className)}>
      {children}
    </main>
  );
};

export default FlowArt;
