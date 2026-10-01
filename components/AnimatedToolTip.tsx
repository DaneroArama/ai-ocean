"use client";
import React, { useState, useRef, useId } from "react";
import Image, { type StaticImageData } from "next/image";
import {
  motion,
  useTransform,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from "motion/react";

export const AnimatedTooltip = ({
  items,
  variant = "default",
}: {
  variant?: "default" | "agenda";
  items: {
    id: number;
    name: string;
    designation: string;
    company?: string;
    image: string | StaticImageData;
  }[];
}) => {
  const tooltipId = useId();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const animationFrameRef = useRef<number | null>(null);

  const rotate = useSpring(
    useTransform(x, [-100, 100], [-45, 45]),
    springConfig,
  );
  const translateX = useSpring(
    useTransform(x, [-100, 100], [-50, 50]),
    springConfig,
  );

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const target = event.target as HTMLDivElement;
      const halfWidth = target.offsetWidth / 2;
      x.set(event.nativeEvent.offsetX - halfWidth);
    });
  };

  if (variant === "agenda") {
    const activePerson = items.find((item) => item.id === hoveredIndex);

    return (
      <div className="relative flex items-center -space-x-3" onMouseLeave={() => setHoveredIndex(null)}>
        <AnimatePresence>
          {activePerson && (
            <motion.div
              key={activePerson.id}
              id={tooltipId}
              role="tooltip"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="pointer-events-none absolute bottom-[calc(100%+24px)] left-2 z-50 w-max max-w-[min(340px,calc(100vw-96px))] rounded-[24px] bg-linear-to-br from-[#ffb710] to-[#ffa600] px-4 py-3 text-left shadow-[0_10px_22px_#00000020] md:left-auto md:right-[-12px]"
            >
              <div className="text-xl font-bold leading-tight text-white">{activePerson.name}</div>
              <div className="mt-1 text-sm font-semibold leading-snug text-white">{activePerson.designation}</div>
              {activePerson.company && <div className="mt-3 text-sm font-semibold leading-snug text-[#514b3d]">{activePerson.company}</div>}
              <span aria-hidden="true" className="absolute -bottom-7 left-3 size-6 rounded-full bg-[#ffae0b]" />
            </motion.div>
          )}
        </AnimatePresence>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-label={item.name}
            aria-describedby={hoveredIndex === item.id ? tooltipId : undefined}
            onMouseEnter={() => setHoveredIndex(item.id)}
            onFocus={() => setHoveredIndex(item.id)}
            onBlur={() => setHoveredIndex(null)}
            onClick={() => setHoveredIndex(item.id)}
            onKeyDown={(event) => { if (event.key === "Escape") setHoveredIndex(null); }}
            className="relative size-12 shrink-0 cursor-pointer rounded-full border-[3px] border-white bg-[#a4bfa4] shadow-[0_1px_5px_#00000030] transition-transform hover:z-10 hover:scale-105 focus-visible:z-10 md:size-[52px]"
          >
            <Image src={item.image} alt="" width={52} height={52} className="size-full rounded-full object-cover object-top" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      {items.map((item) => (
        <div
          className="group relative -mr-2"
          key={item.name}
          onMouseEnter={() => setHoveredIndex(item.id)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  },
                }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                style={{
                  translateX: translateX,
                  rotate: rotate,
                  whiteSpace: "nowrap",
                }}
                className="absolute min-w-[250px] z-9999 -top-10 -left-[10%] z-50 flex -translate-y-full flex-col items-start justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-400 px-4 py-1.5 shadow-xl"
              >
                <div className="relative z-30 text-base font-bold text-white">
                  {item.name}
                </div>
                <div className="text-sm text-white/90">{item.designation}</div>
                {item.company && (
                  <div className="text-sm text-white/80">{item.company}</div>
                )}
                <div className="absolute bg-orange-400 w-4 h-4 rounded-full -bottom-5 left-[5%]"/>
              </motion.div>
            )}
          </AnimatePresence>
          <img
            onMouseMove={handleMouseMove}
            height={100}
            width={100}
            src={typeof item.image === "string" ? item.image : item.image.src}
            alt={item.name}
            className="relative !m-0 h-10 w-10 rounded-full border-2 border-white bg-gray-300 object-cover object-top !p-0 transition duration-500 group-hover:z-30 group-hover:scale-110"
          />
        </div>
      ))}
    </>
  );
};
