"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { AudioController } from "@/lib/comic/audioController";
import NarrationBox from "./NarrationBox";
import CloudLayer from "./CloudLayer";

interface Scene2Props {
  audioController: AudioController | null;
}

export default function Scene2({ audioController }: Scene2Props) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const skyOverlayRef = useRef<HTMLDivElement>(null);
  const narrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current || !audioController) return;

    const ctx = gsap.context(() => {
      // Set initial opacity to 0 for fade-in effect
      gsap.set(sceneRef.current, { opacity: 0 });

      const scene2Timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sceneRef.current,
          start: "top top",
          end: "+=150%", // Shorter scene - just time passing
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          markers: process.env.NODE_ENV === "development",
          id: "scene2",
        },
      });

      // Fade in the entire scene first
      scene2Timeline.to(sceneRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.inOut",
      });

      // Gradually darken the sky overlay (brownish evening)
      scene2Timeline.to(
        skyOverlayRef.current,
        {
          opacity: 1,
          duration: 5,
          ease: "power1.inOut",
        },
        0.5
      );

      // Narration appears
      scene2Timeline
        .from(
          narrationRef.current,
          {
            y: 100,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            onStart: () => {
              audioController?.play("typing", 0.2);
            },
          },
          "+=0.3"
        )
        .to(narrationRef.current, {
          opacity: 1,
          duration: 1,
        });

      // Gradually fade in rough sea sound while fading out beach
      scene2Timeline.to(
        {},
        {
          duration: 2,
          onStart: () => {
            // Crossfade from beach to rough sea
            audioController?.fadeOut("beach", 2);
            setTimeout(() => {
              audioController?.fadeIn("roughSea", 2, 0.25);
            }, 1000); // Start rough sea halfway through beach fadeout
          },
        },
        1
      );

      // Keep narration visible, then fade out at the end
      scene2Timeline.to(
        narrationRef.current,
        {
          opacity: 0,
          duration: 1,
          ease: "power2.in",
        },
        "+=1.5"
      );

      // Fade entire scene to prepare for Scene 3
      scene2Timeline.to(
        sceneRef.current,
        {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
        },
        "+=0.5"
      );
    }, sceneRef);

    return () => ctx.revert();
  }, [audioController]);

  return (
    <div
      ref={sceneRef}
      className="scene2 relative w-full h-screen overflow-hidden will-change-transform"
    >
      {/* Beach Background - same as Scene 1 */}
      <div ref={backgroundRef} className="absolute inset-0 z-10">
        <Image
          src="/assets/comic/Background Scenes/Beach with Sky Area Transparent Background.png"
          alt="Beach Background"
          fill
          className="object-cover scale-110"
          priority
        />
      </div>

      {/* Evening Sky Overlay - brownish tint */}
      <div
        ref={skyOverlayRef}
        className="absolute inset-0 bg-linear-to-b from-yellow-800 to-yellow-600 to-20% z-5 pointer-events-none opacity-0"
      />

      {/* Animated Clouds - Changing mood (faster) */}
      <CloudLayer mood="stormy" density="dense" />

      {/* Narration */}
      <div
        ref={narrationRef}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 opacity-0"
      >
        <NarrationBox>
          The day passes, quiet as any other. But by evening, the sky and the sea
          begin to change.
        </NarrationBox>
      </div>
    </div>
  );
}
