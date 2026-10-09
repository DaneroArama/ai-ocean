"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { AudioController } from "@/lib/comic/audioController";
import NarrationBox from "./NarrationBox";
import CloudLayer from "./CloudLayer";

// Import mascot images
import Tuto from "@/app/assets/Mascots/Tuto.png";
import Shark from "@/app/assets/Mascots/Shark.png";
import Octo from "@/app/assets/Mascots/Octo.png";
import Crabi from "@/app/assets/Mascots/Crabi.png";
import Ali from "@/app/assets/Mascots/Ali.png";

interface Scene4Props {
  audioController: AudioController | null;
}

// Sharky sits mid-right; the other four peek up from below
const peekingCharacters = [
  { name: "Crabbi", image: Crabi, className: "left-[58%]" },
  { name: "Otto", image: Octo, className: "left-[30%] scale-x-[-1]" },
  { name: "Croco", image: Ali, className: "left-[78%]" },
  { name: "Turty", image: Tuto, className: "left-[12%] scale-x-[-1]" },
];

export default function Scene4({ audioController }: Scene4Props) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const narrationRef = useRef<HTMLDivElement>(null);
  const sharkyRef = useRef<HTMLDivElement>(null);
  const whiteOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current || !wrapperRef.current || !audioController) return;

    const ctx = gsap.context(() => {
      // Root starts hidden and crossfades in over the frozen Scene 3; the
      // Scene 3 root stays opaque for the whole window so no gradient shows
      gsap.set(sceneRef.current, { opacity: 0 });
      gsap.set(whiteOverlayRef.current, { opacity: 0 });

      // Sharky hidden initially
      if (sharkyRef.current) {
        gsap.set(sharkyRef.current, { opacity: 0, x: 120 });
      }

      // Peeking characters hidden below viewport
      peekingCharacters.forEach((character) => {
        const charElement = sceneRef.current?.querySelector(
          `[data-character="${character.name}"]`
        );
        if (charElement) gsap.set(charElement, { yPercent: 70, opacity: 0 });
      });

      const scene4Timeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom", // span driven by fixed 380vh wrapper
          scrub: 2,
          invalidateOnRefresh: true,
          id: "scene4",
        },
      });

      // Beach audio swap at scene start (0-duration: no dead scroll)
      scene4Timeline.call(
        () => {
          audioController?.fadeOut("stormyNight", 2);
          setTimeout(() => {
            audioController?.fadeIn("beach", 2, 0.3);
          }, 800);
        },
        [],
        0
      );

      // Narration appears top-left
      scene4Timeline
        .from(
          narrationRef.current,
          {
            x: -80,
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

      // Sharky slides in at middle-right
      scene4Timeline.to(
        sharkyRef.current,
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: "power2.out",
          onStart: () => {
            audioController?.play("characterEntrance", 0.3);
          },
        },
        "+=0.5"
      );

      // The other four peek up from underneath, staggered
      scene4Timeline.to(
        peekingCharacters.map(
          (c) => sceneRef.current?.querySelector(`[data-character="${c.name}"]`)
        ),
        {
          yPercent: 35,
          opacity: 1,
          duration: 1,
          stagger: 0.25,
          ease: "power2.out",
          onStart: () => {
            audioController?.play("characterEntrance", 0.25);
          },
        },
        "-=0.4"
      );

      // Hold the composition, then fade toward Scene 5
      scene4Timeline.to(
        narrationRef.current,
        {
          opacity: 0,
          duration: 1,
          ease: "power2.in",
        },
        "+=1.5"
      );

      // White out at the end so the gapless Scene 5 handoff slides white
      // over white (mirrors the Scene 5 -> 6 transition)
      scene4Timeline.to(
        whiteOverlayRef.current,
        {
          opacity: 1,
          duration: 1.2,
          ease: "power2.inOut",
        },
        "+=0.3"
      );

      // Whole-scene crossfade over the frozen Scene 3: spans exactly the 25vh
      // overlap window (25 / (380 - 100) of the trigger span)
      scene4Timeline.to(
        sceneRef.current,
        {
          opacity: 1,
          duration: scene4Timeline.duration() * (25 / 280),
          ease: "none",
        },
        0
      );

    }, sceneRef);

    return () => ctx.revert();
  }, [audioController]);

  return (
    <div ref={wrapperRef} className="h-[380vh] -mt-[125vh]">
    <div
      ref={sceneRef}
      className="scene4 sticky top-0 w-full h-screen overflow-hidden will-change-transform bg-ocean-primary"
    >
      {/* Beach Background - clear bright morning */}
      <div ref={backgroundRef} className="absolute inset-0 z-10">
        <Image
          src="/assets/comic/Background Scenes/Beach with Sky Area Transparent Background.png"
          alt="Morning Beach Background"
          fill
          className="object-cover scale-110"
          priority
        />
      </div>

      {/* Bright morning sky wash */}
      <div className="absolute inset-0 bg-linear-to-b from-sky-300/40 to-transparent to-30% z-5 pointer-events-none" />

      {/* Calm bright clouds */}
      <CloudLayer mood="calm" density="normal" />

      {/* Narration - top-left */}
      <div
        ref={narrationRef}
        className="absolute top-8 left-4 md:left-20 z-30 max-w-md md:max-w-6xl opacity-0"
      >
        <NarrationBox>
          Morning comes. The sea looks the same as always. But the moment you
          touch the water, you feel it: everything is different now.
        </NarrationBox>
      </div>

      {/* Sharky - middle-right */}
      <div
        ref={sharkyRef}
        data-character="Sharky"
        className="scene4-character absolute bottom-[30%] right-[15%] z-20 w-36 md:w-48 lg:w-[450px] opacity-0"
      >
        <Image
          src={Shark}
          alt="Sharky"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Other four peeking from underneath */}
      <div className="absolute inset-x-0 z-20 h-full pointer-events-none">
        {peekingCharacters.map((character) => (
          <div
            key={character.name}
            className={`absolute bottom-[0%] ${character.className} -translate-x-1/2`}
          >
            <div
              data-character={character.name}
              className="scene4-character w-28 md:w-40 lg:w-[450px] opacity-0"
            >
              <Image
                src={character.image}
                alt={character.name}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      {/* White overlay - fades out toward Scene 5 */}
      <div
        ref={whiteOverlayRef}
        className="absolute inset-0 z-40 bg-white pointer-events-none opacity-0"
      />
    </div>
    </div>
  );
}
