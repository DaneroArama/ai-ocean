"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { AudioController } from "@/lib/comic/audioController";
import CloudLayer from "./CloudLayer";

// Import mascot images
import Ali from "@/app/assets/Mascots/Ali.png";
import Crabi from "@/app/assets/Mascots/Crabi.png";
import Octo from "@/app/assets/Mascots/Octo.png";
import Shark from "@/app/assets/Mascots/Shark.png";
import Tuto from "@/app/assets/Mascots/Tuto.png";

// Import title image
import TitleWhite from "@/app/assets/Title_white.png";

interface IntroSceneProps {
  audioController: AudioController | null;
}

const mascots = [
  {
    name: "Ali",
    src: Ali,
    className: "right-[-18%] top-[6%] w-40 md:w-[500px]",
    transform: "scaleX(-1) rotate(30deg)", // Flipped horizontally and rotated
    exit: { xPercent: 100, yPercent: -50 },
  },
  {
    name: "Crabi",
    src: Crabi,
    className: "left-[-20%] -top-[24%] w-36 md:w-[600px]",
    transform: "rotate(18deg)",
    exit: { xPercent: -100, yPercent: -50 },
  },
  {
    name: "Octo",
    src: Octo,
    className: "right-[-20%] bottom-[-18%] w-36 md:w-[500px]",
    transform: "rotate(0deg)",
    exit: { xPercent: 100, yPercent: 50 },
  },
  {
    name: "Shark",
    src: Shark,
    className: "left-[-17%] bottom-[-25%] w-32 md:w-[500px]",
    transform: "scaleX(-1) rotate(-30deg)", // Flipped horizontally and rotated
    exit: { xPercent: -100, yPercent: 50 },
  },
  {
    name: "Tuto",
    src: Tuto,
    className: "left-[36%] bottom-[-30%] w-32 md:w-[500px]",
    transform: "rotate(-60deg)",
    exit: { yPercent: 100 },
  },
];

export default function IntroScene({ audioController }: IntroSceneProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const charactersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current || !audioController) return;

    // Try to unlock audio immediately on any interaction with this scene
    const handleInteraction = async () => {
      if (!audioController.isUnlocked()) {
        console.log("Attempting to unlock audio from intro scene interaction...");
        await audioController.initializeOnUserInteraction();
      }
      // Try to start beach sound after unlocking
      if (audioController.isUnlocked()) {
        console.log("Audio is unlocked, starting beach sound");
        setTimeout(() => {
          audioController.fadeIn("beach", 2, 0.3);
        }, 100);
      }
    };

    const scene = sceneRef.current;
    // Listen for multiple interaction types
    scene.addEventListener("touchstart", handleInteraction, { once: true, passive: true });
    scene.addEventListener("mousedown", handleInteraction, { once: true });
    scene.addEventListener("wheel", handleInteraction, { once: true, passive: true });

    const ctx = gsap.context(() => {
      // Set initial states for characters - make them VISIBLE at start
      mascots.forEach((mascot) => {
        const element = document.querySelector(`[data-mascot="${mascot.name}"]`);
        if (element) {
          // Start visible with initial transform preserved
          gsap.set(element, { 
            autoAlpha: 1,
            // Don't override the CSS transform
          });
        }
      });

      // Pin the intro scene
      const introTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: sceneRef.current,
          start: "top top",
          end: "+=150%", // Extended to allow smooth transition
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          markers: process.env.NODE_ENV === "development",
          id: "intro-scene",
          onEnter: () => {
            // Start beach sound when intro scene is entered
            console.log("Intro scene entered, audio unlocked:", audioController.isUnlocked());
            if (audioController.isUnlocked()) {
              console.log("Starting beach audio from onEnter");
              setTimeout(() => {
                audioController.fadeIn("beach", 2, 0.3);
              }, 100);
            } else {
              console.log("Audio not unlocked yet - waiting for user interaction");
            }
          },
        },
      });

      // Animate characters out using their exit positions when scrolling (first half)
      mascots.forEach((mascot) => {
        const element = document.querySelector(`[data-mascot="${mascot.name}"]`);
        if (element) {
          introTimeline.to(
            element,
            {
              ...mascot.exit,
              autoAlpha: 0,
              duration: 0.6,
              ease: "power2.in",
            },
            0
          );
        }
      });

      // Fade out title
      introTimeline.to(
        titleRef.current,
        {
          opacity: 0,
          scale: 0.9,
          duration: 0.6,
          ease: "power2.in",
        },
        0
      );

      // Fade out scroll indicator
      introTimeline.to(
        scrollIndicatorRef.current,
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        },
        0
      );

      // Fade entire scene to black (second half)
      introTimeline.to(
        sceneRef.current,
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut",
        },
        0.2 // Start after characters exit
      );
    }, sceneRef);

    return () => {
      ctx.revert();
      scene.removeEventListener("touchstart", handleInteraction);
      scene.removeEventListener("mousedown", handleInteraction);
      scene.removeEventListener("wheel", handleInteraction);
    };
  }, [audioController]);

  return (
    <div
      ref={sceneRef}
      className="intro-scene relative w-full h-screen overflow-hidden will-change-transform"
    >
      {/* Beach Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/comic/Background Scenes/Intro.png"
          alt="Beach Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Characters around edges */}
      <div ref={charactersRef} className="absolute inset-0 z-10">
        {mascots.map((mascot) => (
          <div
            key={mascot.name}
            data-mascot={mascot.name}
            className={`intro-character absolute ${mascot.className}`}
            style={{ 
              opacity: 1, 
              visibility: "visible",
              transform: mascot.transform, // Apply transform inline
            }}
          >
            <Image
              src={mascot.src}
              alt={mascot.name}
              className="w-full h-auto object-contain pointer-events-none"
              priority
            />
          </div>
        ))}
      </div>

      {/* Title */}
      <div
        ref={titleRef}
        className="absolute inset-0 z-20 flex items-center justify-center"
      >
        <div className="relative w-full max-w-4xl px-4">
          <Image
            src={TitleWhite}
            alt="Into the AI Ocean"
            className="w-full h-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)]"
            priority
          />
          {/* Glow effect behind title */}
          <div className="absolute inset-0 bg-white/10 rounded-3xl blur-3xl -z-10 scale-110" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 text-center"
      >
        <p className="text-white text-lg font-syne mb-4 drop-shadow-lg">
          Scroll to start
        </p>
        <div className="flex gap-2 justify-center">
          <svg
            className="w-6 h-6 text-white animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
