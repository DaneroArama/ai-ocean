"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { AudioController } from "@/lib/comic/audioController";
import DialogueBox from "./DialogueBox";
import NarrationBox from "./NarrationBox";
import CloudLayer from "./CloudLayer";

// Import mascot images
import Tuto from "@/app/assets/Mascots/Tuto.png";
import Shark from "@/app/assets/Mascots/Shark.png";
import Octo from "@/app/assets/Mascots/Octo.png";
import Crabi from "@/app/assets/Mascots/Crabi.png";
import Ali from "@/app/assets/Mascots/Ali.png";

interface Scene1Props {
  audioController: AudioController | null;
}

const characters = [
  {
    name: "Turty",
    image: Tuto,
    dialogue: "Ahh… what a perfect day for a cool coconut.",
    side: "right",
  },
  {
    name: "Sharky",
    image: Shark,
    dialogue: "How can you all just relax? Look, the next island's already in sight!",
    side: "right",
  },
  {
    name: "Otto",
    image: Octo,
    dialogue: "The island's not going anywhere, Sharky. …Wait, what are you doing, Crabbi?",
    side: "right",
  },
  {
    name: "Crabbi",
    image: Crabi,
    dialogue: "Just a little more sand… right here.",
    side: "left",
  },
  {
    name: "Croco",
    image: Ali,
    dialogue: "Back in the river, I never got waves like this!",
    side: "left",
  },
];

export default function Scene1({ audioController }: Scene1Props) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const narration1Ref = useRef<HTMLDivElement>(null);
  const narration2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current || !audioController) return;

    const ctx = gsap.context(() => {
      // Set initial opacity to 0 for fade-in effect
      gsap.set(sceneRef.current, { opacity: 0 });

      // Set all characters and dialogues to invisible initially
      characters.forEach((character) => {
        const charElement = sceneRef.current?.querySelector(
          `[data-character="${character.name}"]`
        );
        const dialogueElement = sceneRef.current?.querySelector(
          `[data-dialogue="${character.name}"]`
        );
        if (charElement) gsap.set(charElement, { opacity: 0, x: 0 });
        if (dialogueElement) gsap.set(dialogueElement, { opacity: 0, scale: 1 });
      });

      const scene1Timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sceneRef.current,
          start: "center center",
          end: "+=200%", // Reduced from 400% - tighter pacing
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          markers: process.env.NODE_ENV === "development",
          id: "scene1",
        },
      });

      // Fade in the entire scene first
      scene1Timeline.to(sceneRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.inOut",
      });

      // Narration 1 appears
      scene1Timeline
        .from(
          narration1Ref.current,
          {
            y: 100,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            onStart: () => {
              audioController.play("typing", 0.2);
            },
          },
          "+=0.3"
        )
        .to(narration1Ref.current, {
          opacity: 1,
          duration: 1,
        })
        .to(
          narration1Ref.current,
          {
            y: -50,
            opacity: 0,
            duration: 1,
            ease: "power2.in",
          },
          "+=1"
        );

      // Narration 2 appears
      scene1Timeline
        .from(narration2Ref.current, {
          y: 100,
          opacity: 0,
          duration: 1,
          ease: "power2.out",
          onStart: () => {
            audioController.play("typing", 0.2);
          },
        })
        .to(narration2Ref.current, {
          opacity: 1,
          duration: 1,
        })
        .to(
          narration2Ref.current,
          {
            y: -50,
            opacity: 0,
            duration: 1,
            ease: "power2.in",
          },
          "+=1"
        );

      // Characters enter one by one
      characters.forEach((character, index) => {
        const charElement = sceneRef.current?.querySelector(
          `[data-character="${character.name}"]`
        );
        const dialogueElement = sceneRef.current?.querySelector(
          `[data-dialogue="${character.name}"]`
        );

        if (!charElement || !dialogueElement) return;

        const enterFrom = character.side === "right" ? 200 : -200;
        const cameraShift = character.side === "right" ? 20 : -20;

        // Character enters from side
        scene1Timeline
          .fromTo(
            charElement,
            {
              x: enterFrom,
              opacity: 0,
            },
            {
              x: 0,
              opacity: 1,
              duration: 1.5,
              ease: "power2.out",
              onStart: () => {
                audioController?.play("characterEntrance", 0.3);
              },
            },
            `+=0.5`
          )
          // Camera subtly shifts
          .to(
            backgroundRef.current,
            {
              x: cameraShift,
              duration: 1,
              ease: "power1.inOut",
            },
            "<"
          )
          // Dialogue appears
          .fromTo(
            dialogueElement,
            {
              scale: 0,
              opacity: 0,
            },
            {
              scale: 1,
              opacity: 1,
              duration: 0.5,
              ease: "back.out(1.7)",
              onStart: () => {
                audioController?.play("dialogue", 0.2);
              },
            },
            "+=0.3"
          )
          // Camera returns to center
          .to(
            backgroundRef.current,
            {
              x: 0,
              duration: 1,
              ease: "power1.inOut",
            },
            "+=0.5"
          )
          // Dialogue fades
          .to(
            dialogueElement,
            {
              opacity: 0,
              duration: 0.5,
            },
            "+=0.8"
          );
      });

      // Group scene at the end
      scene1Timeline.to(
        ".scene1-character",
        {
          scale: 0.8,
          y: -50,
          duration: 2,
          stagger: 0.1,
          ease: "power2.inOut",
        },
        "+=1"
      );

      // Fade out entire Scene 1 at the very end
      scene1Timeline.to(
        sceneRef.current,
        {
          opacity: 0,
          duration: 1.2,
          ease: "power2.inOut",
        },
        "+=0.5"
      );
    }, sceneRef);

    return () => ctx.revert();
  }, [audioController]);

  return (
    <div ref={sceneRef} className="scene1 relative w-full min-h-screen overflow-visible will-change-transform bg-linear-to-b from-ocean-medium to-ocean-light to-10%">
      {/* Beach Background with parallax */}
      <div ref={backgroundRef} className="absolute inset-0 z-10">
        <Image
          src="/assets/comic/Background Scenes/Beach with Sky Area Transparent Background.png"
          alt="Beach Background"
          fill
          className="object-cover scale-110"
          priority
        />
      </div>

     
        {/* Animated Clouds - Calm mood */}
        <CloudLayer mood="calm" density="dense" />

      {/* Narration boxes */}
      <div
        ref={narration1Ref}
        className="absolute bottom-24 left-[50%] z-30 opacity-0"
      >
        <NarrationBox>
          You wake to another calm morning on Cambio Island. The ocean is quiet,
          and the waves roll in as gently as they always have.
        </NarrationBox>
      </div>

      <div
        ref={narration2Ref}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 opacity-0"
      >
        <NarrationBox>
          But there's one thing everyone here knows: nothing in this ocean stays
          the same forever. The water rises. Islands slowly sink beneath the waves.
          That's why no one stays in one place too long. Sooner or later, you swim
          on.
        </NarrationBox>
      </div>

      {/* Characters */}
      <div className="absolute inset-0 z-20">
        {characters.map((character, index) => (
          <div key={character.name}>
            {/* Character */}
            <div
              data-character={character.name}
              className={`scene1-character absolute ${
                index === 0
                  ? "bottom-[15%] right-[10%]"
                  : index === 1
                  ? "bottom-[20%] right-[25%]"
                  : index === 2
                  ? "bottom-[15%] right-[40%]"
                  : index === 3
                  ? "bottom-[18%] left-[15%]"
                  : "bottom-[22%] left-[30%]"
              } w-40 h-40`}
            >
              <Image
                src={character.image}
                alt={character.name}
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Dialogue */}
            <div
              data-dialogue={character.name}
              className={`absolute ${
                index === 0
                  ? "bottom-[35%] right-[8%]"
                  : index === 1
                  ? "bottom-[40%] right-[20%]"
                  : index === 2
                  ? "bottom-[35%] right-[35%]"
                  : index === 3
                  ? "bottom-[38%] left-[10%]"
                  : "bottom-[42%] left-[25%]"
              } z-30`}
            >
              <DialogueBox character={character.name}>
                {character.dialogue}
              </DialogueBox>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
