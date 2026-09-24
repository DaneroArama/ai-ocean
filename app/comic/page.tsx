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
import AudioUnlockOverlay from "@/components/comic/AudioUnlockOverlay";
import { AudioController } from "@/lib/comic/audioController";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function ComicPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioControllerRef = useRef<AudioController | null>(null);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);
  const [scrollAttempted, setScrollAttempted] = useState(false);

  useEffect(() => {
    // Initialize audio controller
    audioControllerRef.current = new AudioController();

    // Try to unlock audio on first scroll
    const handleFirstScroll = async () => {
      if (!scrollAttempted && audioControllerRef.current) {
        setScrollAttempted(true);
        await audioControllerRef.current.initializeOnUserInteraction();
        
        // Check if audio unlocked successfully
        setTimeout(() => {
          if (audioControllerRef.current && !audioControllerRef.current.isUnlocked()) {
            setShowAudioPrompt(true);
          }
        }, 500);
      }
    };

    window.addEventListener("scroll", handleFirstScroll, { once: true });
    window.addEventListener("click", handleFirstScroll, { once: true });

    return () => {
      audioControllerRef.current?.cleanup();
      window.removeEventListener("scroll", handleFirstScroll);
      window.removeEventListener("click", handleFirstScroll);
    };
  }, [scrollAttempted]);

  const handleAudioUnlock = async () => {
    if (audioControllerRef.current) {
      await audioControllerRef.current.initializeOnUserInteraction();
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
        <IntroScene audioController={audioControllerRef.current} />
        
        {/* Scene 1 - Calm Morning */}
        <Scene1 audioController={audioControllerRef.current} />
        
        {/* Spacer after scene 1 */}
        <div className="h-[80vh]" />

        {/* Scene 2 - Changing Sky */}
        <Scene2 audioController={audioControllerRef.current} />
        
        {/* Scene 3 - Stormy Night */}
        <Scene3 audioController={audioControllerRef.current} />

        {/* Spacer after scene 3 */}
        <div className="h-[100vh]" />

        {/* Scene 4 - Different Morning */}
        <Scene4 audioController={audioControllerRef.current} />

        {/* Spacer after scene 4 */}
        <div className="h-[50vh]" />

        {/* Placeholder for future scenes */}
        <div className="min-h-screen flex items-center justify-center bg-ocean-primary text-white">
          <p className="text-4xl font-syncopate">More scenes coming soon...</p>
        </div>
      </div>
    </>
  );
}
