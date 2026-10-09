"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import Image from "next/image";
import { AudioController } from "@/lib/comic/audioController";
import DialogueBox from "./DialogueBox";

// Import mascot images
import Tuto from "@/app/assets/Mascots/Tuto.png";
import Shark from "@/app/assets/Mascots/Shark.png";
import Octo from "@/app/assets/Mascots/Octo.png";
import Crabi from "@/app/assets/Mascots/Crabi.png";
import Ali from "@/app/assets/Mascots/Ali.png";

interface Scene5Props {
  audioController: AudioController | null;
}

const characters = [
  {
    name: "Sharky",
    image: Shark,
    dialogues: [
      "Everyone, these new waves are amazing! They do half the work.",
      "Don't just stand there watching. Get in and feel it yourselves!",
    ],
    position: "left-[-16%] md:left-[14%] scale-x-[-1]",
    dialoguePosition: "bottom-[30%] left-[2%] md:left-[30%]",
  },
  {
    name: "Croco",
    image: Ali,
    dialogues: [
      "We've swum rough water before. Now, with this push, we swim faster and better!",
    ],
    position: "left-[-16%] md:left-[18%] scale-x-[-1]",
     dialoguePosition: "bottom-[25%] left-[10%] md:left-[30%]",
  },
  {
    name: "Otto",
    image: Octo,
    dialogues: [
      "These waves can take us so much further now! Think of all the new islands we can reach!",
    ],
    position: "left-[-16%] md:left-[14%] scale-x-[-1]",
     dialoguePosition: "bottom-[25%] left-[10%] md:left-[30%]",
  },
  {
    name: "Crabbi",
    image: Crabi,
    dialogues: [
      "Half the work means more time to build it right. Let's learn the waves first, so we move safely.",
    ],
    position: "left-[-16%] md:left-[18%] scale-x-[-1]",
     dialoguePosition: "bottom-[25%] left-[10%] md:left-[30%]",
  },
  {
    name: "Turty",
    image: Tuto,
    dialogues: [
      "Fast isn't everything. Stay smart, stay focused, and we won't get lost.",
    ],
    position: "left-[-16%] md:left-[14%] scale-x-[-1]",
     dialoguePosition: "bottom-[25%] left-[10%] md:left-[30%]",
  },
];

const groupSwimmers = [
  { name: "Sharky", image: Shark, className: "bottom-[-10%] md:bottom-[-50%] left-[10%] scale-x-[-1]" },
  { name: "Otto", image: Octo, className: "bottom-[-30%] md:bottom-[-50%] left-[30%] md:left-[46%] scale-x-[-1]" },
  { name: "Croco", image: Ali, className: "bottom-[-30%] md:bottom-[-50%] left-[0%] md:left-[28%] scale-x-[-1]" },
  { name: "Crabbi", image: Crabi, className: "bottom-[-30%] md:bottom-[-50%] left-[64%]" },
  { name: "Turty", image: Tuto, className: "bottom-[-30%] md:bottom-[-50%] left-[82%] scale-x-[-1]" },
];

export default function Scene5({ audioController }: Scene5Props) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const whiteOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current || !wrapperRef.current || !audioController) return;

    const ctx = gsap.context(() => {
      // Root stays opaque so the handoff from Scene 4 never reveals the
      // page gradient
      gsap.set(sceneRef.current, { opacity: 1 });
      // Starts white: Scene 4 fades out to white, so the gapless handoff
      // slides white over white until the clear below reveals the ride
      gsap.set(whiteOverlayRef.current, { opacity: 1 });

      // Solo characters hidden off to the left
      characters.forEach((character) => {
        const charElement = sceneRef.current?.querySelector(
          `[data-character="${character.name}"]`
        );
        const dialogueElements = sceneRef.current?.querySelectorAll(
          `[data-dialogue="${character.name}"]`
        );
        if (charElement) gsap.set(charElement, { x: -700, opacity: 0 });
        dialogueElements?.forEach((el) => gsap.set(el, { opacity: 0, scale: 0 }));
      });

      // Group swimmers hidden off to the left
      groupSwimmers.forEach((swimmer) => {
        const el = sceneRef.current?.querySelector(
          `[data-group="${swimmer.name}"]`
        );
        const startX = swimmer.className.includes("scale-x-[-1]") ? -700 : 700;
        if (el) gsap.set(el, { x: startX, opacity: 0, y: 40 });
      });

      const scene5Timeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom", // span driven by fixed 700vh wrapper
          scrub: 2,
          invalidateOnRefresh: true,
          id: "scene5",
        },
      });

      // Rough-sea audio swap at scene start (0-duration: no dead scroll)
      scene5Timeline.call(
        () => {
          audioController?.fadeOut("beach", 2);
          setTimeout(() => {
            audioController?.fadeIn("roughSea", 2, 0.3);
          }, 800);
        },
        [],
        0
      );

      // Each character: enter → talk → exit off-screen
      characters.forEach((character) => {
        const charElement = sceneRef.current?.querySelector(
          `[data-character="${character.name}"]`
        );
        const dialogueElements = sceneRef.current?.querySelectorAll(
          `[data-dialogue="${character.name}"]`
        );

        if (!charElement) return;

        // Enter from the left
        scene5Timeline.to(
          charElement,
          {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power2.out",
            onStart: () => {
              audioController?.play("characterEntrance", 0.3);
            },
          },
          "+=0.4"
        );

        // Dialogues pop in sequence
        dialogueElements?.forEach((dialogue) => {
          scene5Timeline.to(
            dialogue,
            {
              opacity: 1,
              scale: 1,
              duration: 0.5,
              ease: "back.out(1.7)",
              onStart: () => {
                audioController?.play("dialogue", 0.25);
              },
            },
            "+=0.3"
          );
          scene5Timeline.to(
            dialogue,
            {
              opacity: 0,
              duration: 0.4,
              ease: "power2.in",
            },
            "+=1"
          );
        });

        // Exit - swims back out of screen to the left
        scene5Timeline.to(
          charElement,
          {
            x: -700,
            opacity: 0,
            duration: 1,
            ease: "power2.in",
          },
          "+=0.3"
        );
      });

      // All five swim in together from the left
      scene5Timeline.to(
        groupSwimmers.map((s) =>
          sceneRef.current?.querySelector(`[data-group="${s.name}"]`)
        ),
        {
          x: 0,
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.15,
          ease: "power2.out",
          onStart: () => {
            audioController?.play("characterEntrance", 0.3);
          },
        },
        "+=0.5"
      );

      // Subtle swimming bob while the world keeps moving
      groupSwimmers.forEach((swimmer, index) => {
        const el = sceneRef.current?.querySelector(
          `[data-group="${swimmer.name}"]`
        );
        if (!el) return;
        scene5Timeline.to(
          el,
          {
            y: -25,
            duration: 1,
            repeat: 5,
            yoyo: true,
            ease: "sine.inOut",
          },
          index === 0 ? "-=0.4" : "<"
        );
      });

      // Crossfade audio back to beach + fade visual to white (tight flash)
      scene5Timeline.to(
        whiteOverlayRef.current,
        {
          opacity: 1,
          duration: 1.2,
          ease: "power2.inOut",
          onStart: () => {
            audioController?.fadeOut("roughSea", 2);
            setTimeout(() => {
              audioController?.fadeIn("beach", 2, 0.3);
            }, 800);
          },
        },
        "+=1"
      );

      // Horizontal world pan across the ENTIRE timeline (inserted last,
      // spans from 0 to full timeline duration)
      scene5Timeline.to(
        backgroundRef.current,
        {
          x: () => {
            const bg = backgroundRef.current;
            if (!bg) return 0;
            return Math.min(0, -(bg.scrollWidth - window.innerWidth));
          },
          duration: scene5Timeline.duration(),
          ease: "none",
        },
        0
      );

      // White flash from Scene 4's handoff clears, revealing the ride
      // (tight flash; absolute position 0 so no content timing shifts)
      scene5Timeline.to(
        whiteOverlayRef.current,
        {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
        },
        0
      );
    }, sceneRef);

    return () => ctx.revert();
  }, [audioController]);

  return (
    <div ref={wrapperRef} className="h-[700vh]">
    <div
      ref={sceneRef}
      className="scene5 sticky top-0 w-full h-screen overflow-hidden will-change-transform bg-ocean-primary"
    >
      {/* Long horizontal swimming world - 3932x1080 */}
      <div
        ref={backgroundRef}
        className="absolute inset-y-0 left-0 h-full aspect-[3932/1080] max-w-none z-10"
      >
        <Image
          src="/assets/comic/Background Scenes/swimming background.png"
          alt="Swimming Background"
          fill
          sizes="3932px"
          className="object-cover"
          priority
        />
      </div>

      {/* Solo characters - each appears, talks, exits */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {characters.map((character) => (
          <div key={character.name}>
            {/* Character - position/flip on wrapper (GSAP-free, same as group),
                GSAP animates only the inner element */}
            <div
              className={`absolute bottom-[-15%] ${character.position} w-[400px] md:w-[500px] rotate-25`}
            >
              <div
                data-character={character.name}
                className="scene5-character opacity-0"
              >
                <Image
                  src={character.image}
                  alt={character.name}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {/* Dialogues - one per line, stacked so only one shows at a time */}
            <div
              className={`absolute md:bottom-[40%] ${character.dialoguePosition} w-[min(420px,80vw)]`}
            >
              {character.dialogues.map((dialogue, index) => (
                <div
                  key={index}
                  data-dialogue={character.name}
                  className="absolute left-0 bottom-0 opacity-0"
                >
                  <DialogueBox character={character.name}>
                    {dialogue}
                  </DialogueBox>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Group swimmers - appear together at the end */}
      <div className="absolute inset-x-0 bottom-[10%] z-20 h-[50%] pointer-events-none">
        {groupSwimmers.map((swimmer) => (
          <div
            key={swimmer.name}
            className={`absolute ${swimmer.className} rotate-25 -translate-x-1/2`}
          >
            <div
              data-group={swimmer.name}
              className="scene5-group w-[200px] md:w-[300px] lg:w-[500px] opacity-0"
            >
              <Image
                src={swimmer.image}
                alt={swimmer.name}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      {/* White transition overlay → Scene 6 */}
      <div
        ref={whiteOverlayRef}
        className="absolute inset-0 z-40 bg-white pointer-events-none opacity-0"
      />
    </div>
    </div>
  );
}
