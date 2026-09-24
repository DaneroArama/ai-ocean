"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import Image from "next/image";
import { AudioController } from "@/lib/comic/audioController";
import NarrationBox from "./NarrationBox";

// Import mascot images
import Tuto from "@/app/assets/Mascots/Tuto.png";
import Shark from "@/app/assets/Mascots/Shark.png";
import Octo from "@/app/assets/Mascots/Octo.png";
import Crabi from "@/app/assets/Mascots/Crabi.png";
import Ali from "@/app/assets/Mascots/Ali.png";

interface Scene3Props {
  audioController: AudioController | null;
}

const characters = [
  { name: "Sharky", image: Shark, className: "bottom-[-10%] left-[10%] scale-x-[-1] -rotate-20" },
  { name: "Turty", image: Tuto, className: "bottom-[-20%] left-[30%] scale-x-[-1]" },
  { name: "Otto", image: Octo, className: "bottom-[-20%] left-[70%]" },
  { name: "Crabbi", image: Crabi, className: "bottom-[-20%] left-[50%]" },
  { name: "Croco", image: Ali, className: "bottom-[-15%] left-[90%]" },
];

export default function Scene3({ audioController }: Scene3Props) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const narrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current || !audioController) return;

    const ctx = gsap.context(() => {
      // Start fully transparent - crossfades in as Scene 2 fades out
      gsap.set(sceneRef.current, { opacity: 0 });

      // Glow starts hidden
      if (glowRef.current) {
        gsap.set(glowRef.current, { opacity: 0, scale: 0.6 });
      }

      // Characters partially hidden below the viewport, !? hidden
      characters.forEach((character) => {
        const charElement = sceneRef.current?.querySelector(
          `[data-character="${character.name}"]`
        );
        const markElement = sceneRef.current?.querySelector(
          `[data-mark="${character.name}"]`
        );
        if (charElement) gsap.set(charElement, { yPercent: 55, opacity: 0 });
        if (markElement) gsap.set(markElement, { opacity: 0, scale: 0 });
      });

      const scene3Timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sceneRef.current,
          start: "top top",
          end: "+=250%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          markers: process.env.NODE_ENV === "development",
          id: "scene3",
        },
      });

      // Crossfade in from Scene 2 + start storm-night audio
      scene3Timeline.to(sceneRef.current, {
        opacity: 1,
        duration: 1,
        ease: "power2.inOut",
        onStart: () => {
          audioController?.fadeOut("roughSea", 2);
          setTimeout(() => {
            audioController?.fadeIn("stormyNight", 2, 0.3);
          }, 800);
        },
      });

      // Narration appears top-left
      scene3Timeline
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

      // Mid-scene: reveal the blue glowing element
      scene3Timeline.to(
        glowRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: "power2.out",
          onStart: () => {
            audioController?.play("glowing", 0.4);
          },
        },
        "+=0.5"
      );

      // Subtle pulsing glow
      scene3Timeline.to(
        glowRef.current,
        {
          opacity: 0.65,
          scale: 1.08,
          duration: 0.8,
          ease: "sine.inOut",
          yoyo: true,
          repeat: 3,
        },
        "-=0.2"
      );

      // Characters rise partially from underneath, staggered, with "!?"
      characters.forEach((character, index) => {
        const charElement = sceneRef.current?.querySelector(
          `[data-character="${character.name}"]`
        );
        const markElement = sceneRef.current?.querySelector(
          `[data-mark="${character.name}"]`
        );

        if (!charElement) return;

        const position = `>${index === 0 ? "+=0.3" : "-=0.55"}`;

        scene3Timeline.to(
          charElement,
          {
            yPercent: 20,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            onStart: () => {
              audioController?.play("characterEntrance", 0.25);
            },
          },
          position
        );

        if (markElement) {
          scene3Timeline.to(
            markElement,
            {
              opacity: 1,
              scale: 1,
              duration: 0.4,
              ease: "back.out(2.5)",
              onStart: () => {
                audioController?.play("dialogue", 0.2);
              },
            },
            "-=0.4"
          );
        }
      });

      // Hold the moment, then fade out toward Scene 4
      scene3Timeline.to(
        [narrationRef.current, glowRef.current],
        {
          opacity: 0,
          duration: 1,
          ease: "power2.in",
        },
        "+=1.5"
      );

      scene3Timeline.to(
        sceneRef.current,
        {
          opacity: 0,
          duration: 1.2,
          ease: "power2.inOut",
          onStart: () => {
            audioController?.fadeOut("stormyNight", 2);
          },
        },
        "-=0.3"
      );
    }, sceneRef);

    return () => ctx.revert();
  }, [audioController]);

  return (
    <div
      ref={sceneRef}
      className="scene3 relative w-full h-screen overflow-hidden will-change-transform"
    >
      {/* Stormy Night Background */}
      <div ref={backgroundRef} className="absolute inset-0 z-10">
        <Image
          src="/assets/comic/Background Scenes/Stormy Night.png"
          alt="Stormy Night Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Blue glowing element over the wave */}
      <div
        ref={glowRef}
        className="absolute left-[20%] top-[35%] z-15 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0"
        style={{
          width: "clamp(250px, 40vw, 550px)",
          height: "clamp(150px, 25vw, 320px)",
          background:
            "radial-gradient(ellipse at center, rgba(80, 220, 255, 0.85) 0%, rgba(40, 160, 255, 0.45) 35%, rgba(30, 100, 220, 0.15) 65%, transparent 80%)",
          filter: "blur(18px)",
          mixBlendMode: "screen",
        }}
      />

      {/* Narration - top-left */}
      <div
        ref={narrationRef}
        className="absolute top-8 left-4 md:left-20 z-30 max-w-md md:max-w-6xl opacity-0"
      >
        <NarrationBox>
          That night, a strong new wave sweeps through the ocean, something no
          one has ever seen. Not a storm. A rush of fresh energy. Everyone stays
          calm, watching, waiting for morning.
        </NarrationBox>
      </div>

      {/* Characters partially rising from underneath */}
      <div className="absolute inset-x-0 bottom-0 z-20 h-full pointer-events-none">
        {characters.map((character) => (
          <div key={character.name} className={`absolute ${character.className} -translate-x-1/2`}>
            {/* Surprised !? mark */}
            <div
              data-mark={character.name}
              className="absolute top-10 left-1/2 -translate-x-1/2 z-10 opacity-0"
            >
              <span className="text-3xl md:text-4xl font-syncopate font-bold text-yellow-300 drop-shadow-[2px_2px_0_rgba(0,0,0,0.6)]">
                !?
              </span>
            </div>

            {/* Character - mostly below viewport */}
            <div
              data-character={character.name}
              className="scene3-character w-28 md:w-[400px] lg:w-[450px] opacity-0"
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
    </div>
  );
}
