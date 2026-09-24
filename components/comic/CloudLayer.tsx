"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import CloudSvg from "@/app/assets/comic/clound.svg";

interface CloudLayerProps {
  mood?: "calm" | "changing" | "stormy";
  density?: "sparse" | "normal" | "dense";
}

const CLOUD_CONFIG = {
  calm: {
    count: {
      sparse: 2,
      normal: 3,
      dense: 7,
    },
    speed: {
      min: 70,
      max: 130,
    },
    scale: {
      min: 0.8,
      max: 1.2,
    },
    opacity: {
      min: 0.35,
      max: 1,
    },
    drift: 8,
  },

  changing: {
    count: {
      sparse: 3,
      normal: 5,
      dense: 12,
    },
    speed: {
      min: 50,
      max: 100,
    },
    scale: {
      min: 0.9,
      max: 1.4,
    },
    opacity: {
      min: 0.4,
      max: 1,
    },
    drift: 12,
  },

  stormy: {
    count: {
      sparse: 5,
      normal: 8,
      dense: 12,
    },
    speed: {
      min: 25,
      max: 80,
    },
    scale: {
      min: 1,
      max: 1.6,
    },
    opacity: {
      min: 0.3,
      max: 1,
    },
    drift: 18,
  },
} as const;

export default function CloudLayer({
  mood = "calm",
  density = "normal",
}: CloudLayerProps) {
  const cloudContainerRef = useRef<HTMLDivElement>(null);

  const config = CLOUD_CONFIG[mood];

  useEffect(() => {
    const container = cloudContainerRef.current;

    if (!container) return;

    const clouds = gsap.utils.toArray<HTMLElement>(
      container.querySelectorAll(".cloud"),
    );

    const ctx = gsap.context(() => {
      clouds.forEach((cloud, index) => {
        const startX = Math.random() * 120 - 20;
        const yPosition = Math.random() * 40;

        const scale =
          config.scale.min +
          Math.random() * (config.scale.max - config.scale.min);

        const duration =
          config.speed.min +
          Math.random() * (config.speed.max - config.speed.min);

        const delay = Math.random() * 5;

        gsap.set(cloud, {
          x: `${startX}vw`,
          y: `${yPosition}vh`,
          scale,
          opacity: 0.6,
        });

        gsap.to(cloud, {
          x: "120vw",
          duration,
          delay,
          ease: "none",
          repeat: -1,

          onRepeat: () => {
            gsap.set(cloud, {
              x: "-20vw",
              y: `${yPosition}vh`,
            });
          },
        });
      });
    }, container);

    return () => {
      ctx.revert();
    };
  }, [mood, density, config]);

  const count = config.count[density];

  return (
    <div
      ref={cloudContainerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 5 }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="cloud absolute"
          style={{
            width: "clamp(200px, 25vw, 400px)",
          }}
        >
          <Image
            src={CloudSvg}
            alt=""
            className="h-auto w-full object-contain"
          />
        </div>
      ))}
    </div>
  );
}