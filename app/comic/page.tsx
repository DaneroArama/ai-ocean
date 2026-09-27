"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import IntroScene from "@/components/comic/IntroScene";
import Scene1 from "@/components/comic/Scene1";
import Scene2 from "@/components/comic/Scene2";
import Scene3 from "@/components/comic/Scene3";
import Scene4 from "@/components/comic/Scene4";
import Scene5Horizontal from "@/components/comic/Scene5Horizontal";
import Scene6 from "@/components/comic/Scene6";
import Scene7 from "@/components/comic/Scene7";
import AudioUnlockOverlay from "@/components/comic/AudioUnlockOverlay";
import { AudioController } from "@/lib/comic/audioController";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function ComicPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [audioController, setAudioController] = useState<AudioController | null>(null);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);

  useEffect(() => {
    // Initialize audio controller once at mount
    const controller = new AudioController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time external system init; single cascading render at mount
    setAudioController(controller);

    // Try to unlock audio on first scroll
    const handleFirstScroll = async () => {
      await controller.initializeOnUserInteraction();

      // Check if audio unlocked successfully
      setTimeout(() => {
        if (!controller.isUnlocked()) {
          setShowAudioPrompt(true);
        }
      }, 500);
    };

    window.addEventListener("scroll", handleFirstScroll, { once: true });
    window.addEventListener("click", handleFirstScroll, { once: true });

    return () => {
      controller.cleanup();
      window.removeEventListener("scroll", handleFirstScroll);
      window.removeEventListener("click", handleFirstScroll);
    };
  }, []);

  const handleAudioUnlock = async () => {
    if (audioController) {
      await audioController.initializeOnUserInteraction();
      setShowAudioPrompt(false);
    }
  };

  useGSAP(
    () => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        return;
      }

      // Refresh ScrollTrigger on window resize
      const handleResize = () => {
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", handleResize);

      // Enable ScrollTrigger debug markers in development
      if (process.env.NODE_ENV === "development") {
        ScrollTrigger.defaults({
          markers: false, // Set to true to see all markers
        });
      }

      return () => {
        window.removeEventListener("resize", handleResize);
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    },
    { scope: containerRef }
  );

  return (
    <>
      {/* Audio unlock overlay - only shows if needed */}
      {showAudioPrompt && <AudioUnlockOverlay onUnlock={handleAudioUnlock} />}

      <div
        ref={containerRef}
        className="comic-container relative w-full bg-linear-to-b from-ocean-primary to-ocean-light"
      >
        {/* Intro Scene */}
        <IntroScene audioController={audioController} />
        
        {/* Scene 1 - Calm Morning */}
        <Scene1 audioController={audioController} />

        {/* Scene 2 - Changing Sky */}
        <Scene2 audioController={audioController} />
        
        {/* Scene 3 - Stormy Night */}
        <Scene3 audioController={audioController} />

        {/* Scene 4 - Different Morning */}
        <Scene4 audioController={audioController} />
        
        {/* Scene 5 - Riding the New Wave (horizontal scroll) */}
        <Scene5Horizontal audioController={audioController} />

        {/* Scene 6 - Swimming End */}
        <Scene6 audioController={audioController} />

        {/* Scene 7 - Final Island */}
        <Scene7 audioController={audioController} />
      </div>
    </>
  );
}
