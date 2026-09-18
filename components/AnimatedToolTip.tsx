"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";

export const AnimatedTooltip = ({
  items,
}: {
  items: {
    id: number;
    name: string;
    designation: string;
    company?: string;
    image: string;
  }[];
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const animationFrameRef = useRef<number | null>(null);
  const avatarRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig,
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig,
  );

  const handleMouseMove = (event: any) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const halfWidth = event.target.offsetWidth / 2;
      x.set(event.nativeEvent.offsetX - halfWidth);
    });
  };

  const handleMouseEnter = (itemId: number) => {
    setHoveredIndex(itemId);
    const avatarEl = avatarRefs.current[itemId];
    if (avatarEl) {
      const rect = avatarEl.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  };

  return (
    <>
      {/* Fixed positioned tooltip portal */}
      <AnimatePresence>
        {hoveredIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 10,
              },
            }}
            exit={{ opacity: 0, y: 20, scale: 0.6 }}
            style={{
              translateX: translateX,
              rotate: rotate,
              whiteSpace: "nowrap",
              left: tooltipPosition.x,
              top: tooltipPosition.y,
            }}
            className="fixed z-[9999] flex -translate-x-1/2 -translate-y-full flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 px-5 py-4 shadow-xl min-w-[220px] pointer-events-none"
          >
            <div className="relative z-30 text-lg font-bold text-white">
              {items.find(item => item.id === hoveredIndex)?.name}
            </div>
            <div className="text-sm text-white/90">
              {items.find(item => item.id === hoveredIndex)?.designation}
            </div>
            {items.find(item => item.id === hoveredIndex)?.company && (
              <div className="text-sm text-white/80">
                {items.find(item => item.id === hoveredIndex)?.company}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar images */}
      {items.map((item, idx) => (
        <div
          ref={(el) => { avatarRefs.current[item.id] = el; }}
          className="group relative -mr-4"
          key={item.name}
          onMouseEnter={() => handleMouseEnter(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <img
            onMouseMove={handleMouseMove}
            height={100}
            width={100}
            src={item.image}
            alt={item.name}
            className="relative !m-0 h-10 w-10 rounded-full border-2 border-white bg-gray-300 object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-110"
          />
        </div>
      ))}
    </>
  );
};
