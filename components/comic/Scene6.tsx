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

interface Scene6Props {
  audioController: AudioController | null;
}

// Tired swimmers spread across the middle, one-by-one entrances
const characters = [
    { name: "Turty", image: Tuto, className: "left-[81%] bottom-[40%] scale-x-[-1]" },
  { name: "Sharky", image: Shark, className: "left-[30%] bottom-[-30%] scale-x-[-1]" },
  { name: "Croco", image: Ali, className: "left-[60%] bottom-[0%] scale-x-[-1]" },
  { name: "Otto", image: Octo, className: "left-[47%] bottom-[-10%] scale-x-[-1]" },
  { name: "Crabbi", image: Crabi, className: "left-[70%] bottom-[20%]" },
];

export default function Scene6({ audioController }: Scene6Props) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const narrationRef = useRef<HTMLDivElement>(null);
  const whiteOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current || !wrapperRef.current || !audioController) return;

    const ctx = gsap.context(() => {
      // Scene starts under the white flash left over from Scene 5
      gsap.set(sceneRef.current, { opacity: 1 });
      gsap.set(whiteOverlayRef.current, { opacity: 1 });

      // Narration hidden (wrapper centers it, inner element is animated)
      gsap.set(narrationRef.current, { autoAlpha: 0, y: 40 });

      // Characters hidden - waiting off-screen to the left
      characters.forEach((character) => {
        const el = sceneRef.current?.querySelector(
          `[data-character="${character.name}"]`
        );
        if (!el) return;
        // A flipped wrapper (scale-x-[-1]) mirrors the x-axis, so local +700
        // renders as visual -700 (from the left)
        const startX = character.className.includes("scale-x-[-1]") ? 700 : -700;
        gsap.set(el, { opacity: 0, x: startX });
      });

      const scene6Timeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom", // span driven by fixed 400vh wrapper
          scrub: 2,
          invalidateOnRefresh: true,
          id: "scene6",
        },
      });

      // White flash clears, revealing the swimming-end scene (tight flash)
      scene6Timeline.to(whiteOverlayRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onStart: () => {
          // Beach ambience should already be playing - reinforce without restart
          audioController?.play("beach", 0.3);
        },
      });

      // Characters swim in from the left, one by one
      characters.forEach((character, index) => {
        const el = sceneRef.current?.querySelector(
          `[data-character="${character.name}"]`
        );
        if (!el) return;

        scene6Timeline.to(
          el,
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power2.out",
            onStart: () => {
              audioController?.play("characterEntrance", 0.25);
            },
          },
          index === 0 ? "+=0.3" : "-=0.55"
        );
      });

      // Narration - gentle fade/slide
      scene6Timeline
        .to(
          narrationRef.current,
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.2,
            ease: "power2.out",
            onStart: () => {
              audioController?.play("typing", 0.2);
            },
          },
          "+=0.5"
        )
        // Hold the moment
        .to({}, { duration: 1.5 })
        // Fade toward white → Scene 7 (tight flash)
        .to(
          whiteOverlayRef.current,
          {
            opacity: 1,
            duration: 1.2,
            ease: "power2.inOut",
          },
          "+=0.3"
        );
    }, sceneRef);

    return () => ctx.revert();
  }, [audioController]);

  return (
    <div ref={wrapperRef} className="h-[400vh]">
    <div
      ref={sceneRef}
      className="scene6 sticky top-0 w-full h-screen overflow-hidden will-change-transform bg-ocean-primary"
    >
      {/* Swimming End Background */}
      <div ref={backgroundRef} className="absolute inset-0 z-10">
        <Image
          src="/assets/comic/Background Scenes/swimming end.png"
          alt="Swimming End Background"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
      </div>

      {/* Characters - just finished swimming */}
      <div className="absolute inset-x-0 bottom-[18%] z-20 h-[55%] pointer-events-none">
        {characters.map((character) => (
          <div
            key={character.name}
            className={`absolute ${character.className} -translate-x-1/2`}
          >
            <div
              data-character={character.name}
              className="scene6-character w-[100px] md:w-[200px] lg:w-[300px] opacity-0"
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

      {/* Narration - gentle fade/slide */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 w-[min(720px,92vw)]">
        <div ref={narrationRef} className="invisible opacity-0">
          <NarrationBox>
            They didn&apos;t fight the new wave. They rode it together, and went
            further than they ever had.
          </NarrationBox>
        </div>
      </div>

      {/* White overlay - in from Scene 5, out to Scene 7 */}
      <div
        ref={whiteOverlayRef}
        className="absolute inset-0 z-40 bg-white pointer-events-none opacity-100"
      />
    </div>
    </div>
  );
}
