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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const narration1Ref = useRef<HTMLDivElement>(null);
  const narration2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current || !wrapperRef.current || !audioController) return;

    const ctx = gsap.context(() => {
      // Root starts hidden and crossfades in over the frozen Intro; the
      // Intro stays opaque for the whole window so no gradient shows
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
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom", // span driven by fixed 400vh wrapper
          scrub: 2,
          invalidateOnRefresh: true,
          id: "scene1",
        },
      });

      // Narration 1 appears - starts after the whole-scene crossfade has
      // finished (crossfade spans the first 25/300 of the trigger = timeline
      // 0 -> ~3.8; absolute 7 leaves a beat after the scene settles)
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
          7
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

      // Whole-scene crossfade over the frozen Intro: spans exactly the 25vh
      // overlap window (25 / (400 - 100) of the trigger span)
      scene1Timeline.to(
        sceneRef.current,
        {
          opacity: 1,
          duration: scene1Timeline.duration() * (25 / 300),
          ease: "none",
        },
        0
      );

    }, sceneRef);

    return () => ctx.revert();
  }, [audioController]);

  return (
    <div ref={wrapperRef} className="h-[400vh] -mt-[125vh]">
    <div ref={sceneRef} className="scene1 sticky top-0 w-full h-screen overflow-hidden will-change-transform bg-linear-to-b from-ocean-medium to-ocean-light to-10%">
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
        className="absolute bottom-24 inset-x-0 z-30 opacity-0"
      >
        <NarrationBox>
          You wake to another calm morning on Cambio Island. The ocean is quiet,
          and the waves roll in as gently as they always have.
        </NarrationBox>
      </div>

      <div
        ref={narration2Ref}
        className="absolute bottom-24 inset-x-0 z-30 opacity-0"
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
                  ? "bottom-[-50%] right-[-10%] md:bottom-[-20%] md:right-[0%]"
                  : index === 1
                  ? "bottom-[-60%] right-[0%] md:bottom-[-30%] md:right-[20%]"
                  : index === 2
                  ? "bottom-[-50%] right-[60%] md:right-[40%]"
                  : index === 3
                  ? "bottom-[-70%] md:bottom-[-45%] left-[25%] md:left-[15%]"
                  : "bottom-[-60%] md:bottom-[-55%] left-[0%]"
              } w-[200px] md:w-[400px] h-full`}
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
                  ? "bottom-[50%] md:bottom-[80%] right-[0%]"
                  : index === 1
                  ? "bottom-[40%] md:bottom-[70%] right-[20%]"
                  : index === 2
                  ? "bottom-[50%] md:bottom-[45%] right-[20%] md:right-[35%]"
                  : index === 3
                  ? "bottom-[30%] md:bottom-[48%] left-[20%]"
                : "bottom-[42%] left-[5%]"
            } z-30 opacity-0`}
            >
              <DialogueBox character={character.name}>
                {character.dialogue}
              </DialogueBox>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
