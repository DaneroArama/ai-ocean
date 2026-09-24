"use client";

import { useState } from "react";

interface AudioUnlockOverlayProps {
  onUnlock: () => Promise<void>;
}

export default function AudioUnlockOverlay({ onUnlock }: AudioUnlockOverlayProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClick = async () => {
    await onUnlock();
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ocean-deep/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center px-6">
        <h2 className="text-4xl md:text-6xl font-syncopate text-white mb-6">
          Ready to dive in?
        </h2>
        <p className="text-lg md:text-xl text-ocean-foam mb-8 font-quicksand">
          Click to start your journey with sound
        </p>
        <button
          onClick={handleClick}
          className="bg-ocean-primary hover:bg-ocean-light text-white font-syne font-bold text-xl px-8 py-4 rounded-full shadow-comic-lg hover:shadow-comic-xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Start Experience
        </button>
        <div className="mt-8 text-ocean-surface text-sm font-quicksand">
          🔊 Audio enabled for the best experience
        </div>
      </div>
    </div>
  );
}
