"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import Image from "next/image";
import Link from "next/link";
import { AudioController } from "@/lib/comic/audioController";

// Import mascot images
import Tuto from "@/app/assets/Mascots/Tuto.png";
import Shark from "@/app/assets/Mascots/Shark.png";
import Octo from "@/app/assets/Mascots/Octo.png";
import Crabi from "@/app/assets/Mascots/Crabi.png";
import Ali from "@/app/assets/Mascots/Ali.png";

interface Scene7Props {
  audioController: AudioController | null;
}

// The five swimmers together in the middle of the island
const characters = [
  { name: "Sharky", image: Shark, className: "left-[30%] bottom-[2%]" },
  { name: "Otto", image: Octo, className: "left-[40%] bottom-[-10%]" },
  { name: "Crabbi", image: Crabi, className: "left-[50%] bottom-[0%]" },
  { name: "Croco", image: Ali, className: "left-[60%] bottom-[-10%]" },
  { name: "Turty", image: Tuto, className: "left-[70%] bottom-0" },
];

// Finale bookend: the mascots return around the viewport edges,
// mirroring the Intro's edge layout
const edgeCharacters = [
  {
    name: "Ali",
    src: Ali,
    className: "right-[-40%] md:right-[-18%] top-[6%] w-72 md:w-[500px]",
    transform: "scaleX(-1) rotate(30deg)",
  },
  {
    name: "Crabi",
    src: Crabi,
    className: "left-[-30%] md:left-[-20%] top-[10%] md:top-[-24%] w-72 md:w-[600px]",
    transform: "rotate(18deg)",
  },
  {
    name: "Octo",
    src: Octo,
    className: "right-[-45%] md:right-[-18%] bottom-[5%] w-72 md:w-[500px]",
    transform: "rotate(0deg)",
  },
  {
    name: "Shark",
    src: Shark,
    className: "left-[-40%] md:left-[-17%] bottom-[18%] md:bottom-[-25%] w-72 md:w-[500px]",
    transform: "scaleX(-1) rotate(-30deg)",
  },
  {
    name: "Tuto",
    src: Tuto,
    className: "left-[15%] md:left-[36%] bottom-[-20%] md:bottom-[-30%] w-72 md:w-[500px]",
    transform: "rotate(-60deg)",
  },
];

export default function Scene7({ audioController }: Scene7Props) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const whiteOverlayRef = useRef<HTMLDivElement>(null);
  const topTextRef = useRef<HTMLDivElement>(null);
  const bottomTextRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sceneRef.current || !wrapperRef.current || !audioController) return;

    const ctx = gsap.context(() => {
      // Scene starts under the white flash left over from Scene 6
      gsap.set(sceneRef.current, { opacity: 1 });
      gsap.set(whiteOverlayRef.current, { opacity: 1 });

      // Camera begins zoomed in
      gsap.set(cameraRef.current, { scale: 1.6 });

      // Texts hidden
      gsap.set(topTextRef.current, { autoAlpha: 0, y: -30 });
      gsap.set(bottomTextRef.current, { autoAlpha: 0, y: 30 });

      // Characters hidden below their spots
      characters.forEach((character) => {
        const el = sceneRef.current?.querySelector(
          `[data-character="${character.name}"]`
        );
        if (el) gsap.set(el, { opacity: 0, y: 60 });
      });

      // Finale bookend pieces stay hidden until the end
      gsap.set(".scene7-edge-character", { opacity: 0 });
      gsap.set(ctaRef.current, { opacity: 0, y: 24, scale: 0.9 });

      // Scroll position feeds the joke sting's volume (0 -> 0.9 across finale)
      const bayVolume = { value: 0 };

      const scene7Timeline = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom", // span driven by fixed 500vh wrapper
          scrub: 1,
          invalidateOnRefresh: true,
          id: "scene7",
        },
      });

      // White flash clears, revealing the final island (tight flash)
      scene7Timeline.to(whiteOverlayRef.current, {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
        onStart: () => {
          audioController?.play("beach", 0.3);
        },
      });

      // The five characters rise together in the middle
      scene7Timeline.to(
        characters.map((character) =>
          sceneRef.current?.querySelector(
            `[data-character="${character.name}"]`
          )
        ),
        {
          opacity: 1,
          y: 0,
          duration: 6,
          stagger: 0.12,
          ease: "power2.out",
        },
        1
      );

      // Slow cinematic zoom-out - reveals the whole island and ocean
      scene7Timeline.to(
        cameraRef.current,
        {
          scale: 1,
          duration: 10,
          ease: "none",
        },
        2.2
      );

      // Top text fades in during the zoom-out
      scene7Timeline.to(
        topTextRef.current,
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          onStart: () => {
            audioController?.play("typing", 0.2);
          },
        },
        3
      );

      // Bottom-right quote fades in later
      scene7Timeline.to(
        bottomTextRef.current,
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          onStart: () => {
            audioController?.play("typing", 0.2);
          },
        },
        6.5
      );

      // Finale bookend: the middle swimmers clear out, the Intro's edge
      // mascots return around the viewport, and the CTA takes the middle
      scene7Timeline.to(
        "[data-character]",
        {
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
        },
        9.2
      );

      // The narration texts clear out with the swimmers so the
      // bookend (edge mascots + CTA) stands alone at the end
      scene7Timeline.to(
        [topTextRef.current, bottomTextRef.current],
        {
          autoAlpha: 0,
          duration: 0.5,
          ease: "power2.in",
        },
        9.2
      );

      scene7Timeline.to(
        ".scene7-edge-character",
        {
          opacity: 1,
          duration: 5,
          stagger: 0.06,
          ease: "power2.out",
        },
        9.35
      );

      scene7Timeline.to(
        ctaRef.current,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        9.5
      );

      // Joke sting: volume swells with the scroll across the finale and the
      // clip plays through only once. Auto-fits to the timeline end; change
      // `value` here for the peak volume.
      scene7Timeline.fromTo(
        bayVolume,
        { value: 0 },
        {
          value: 0.9,
          duration: Math.max(scene7Timeline.duration() - 9.2, 0.5),
          ease: "none",
          onUpdate: () => {
            audioController?.scrubOneShot("ending", bayVolume.value);
          },
        },
        9.2
      );
    }, sceneRef);

    return () => ctx.revert();
  }, [audioController]);

  return (
    <div ref={wrapperRef} className="h-[500vh]">
    <div
      ref={sceneRef}
      className="scene7 sticky top-0 w-full h-screen overflow-hidden will-change-transform bg-ocean-primary"
    >
      {/* Camera - background and characters zoom out together */}
      <div ref={cameraRef} className="absolute inset-0">
        {/* Final Island Background */}
        <div className="absolute inset-0 z-10">
          <Image
            src="/assets/comic/Background Scenes/Island Final.png"
            alt="Final Island Background"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Characters - all five together in the middle */}
        <div className="absolute inset-x-0 bottom-[22%] z-20 h-[55%] pointer-events-none">
          {characters.map((character) => (
            <div
              key={character.name}
              className={`absolute ${character.className} -translate-x-1/2`}
            >
              <div
                data-character={character.name}
                className="scene7-character w-[80px] md:w-[100px] lg:w-[200px] opacity-0"
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

      {/* Finale bookend - mascots around the viewport edges (mirrors Intro) */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        {edgeCharacters.map((mascot) => (
          <div
            key={mascot.name}
            className={`scene7-edge-character absolute opacity-0 ${mascot.className}`}
            style={{ transform: mascot.transform }}
          >
            <Image
              src={mascot.src}
              alt={mascot.name}
              className="w-full h-auto object-contain"
            />
          </div>
        ))}
      </div>

      {/* Event page CTA - appears in the middle at the very end */}
      <div className="absolute left-1/2 bottom-[22%] z-[45] -translate-x-1/2">
        <div ref={ctaRef} className="opacity-0">
          <Link
            href="/"
            className="block bg-white border-2 border-black text-black font-syne font-bold text-sm md:text-base px-6 py-3 rounded-md shadow-[5px_5px_0_rgba(0,0,0,0.85)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_rgba(0,0,0,0.85)] transition-all whitespace-nowrap"
          >
            Go to Event Page
          </Link>
        </div>
      </div>

      {/* Top text */}
      <div
        ref={topTextRef}
        className="absolute top-20 md:top-6 inset-x-0 z-30 px-6 md:px-28 text-center invisible opacity-0"
      >
        <p className="text-white font-quicksand text-lg md:text-2xl leading-relaxed drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
          The AI wave is here, and it&apos;s changing the ocean for everyone.
          How will you ride it? Let&apos;s explore what&apos;s possible,
          together.
        </p>
      </div>

      {/* Bottom-right quote */}
      <div
        ref={bottomTextRef}
        className="absolute bottom-20 md:bottom-6 right-6 z-30 text-right invisible opacity-0"
      >
        <p className="text-white font-quicksand text-base md:text-xl leading-relaxed drop-shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
          The wave was never something to fear.
          <br />
          It was something to ride.
        </p>
      </div>

      {/* White overlay - in from Scene 6 */}
      <div
        ref={whiteOverlayRef}
        className="absolute inset-0 z-40 bg-white pointer-events-none opacity-100"
      />
    </div>
    </div>
  );
}
