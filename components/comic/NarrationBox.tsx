import TypingText from "./TypingText";

interface NarrationBoxProps {
  children: React.ReactNode;
}

export default function NarrationBox({ children }: NarrationBoxProps) {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="relative">
        {/* Sketchy outline - background layer so the noise filter never
            distorts the text sitting above it */}
        <div
          className="absolute inset-0 bg-white"
          style={{
            border: "3px solid #1a1a1a",
            borderRadius: "12px",
            filter: "url(#sketchy-narration)",
          }}
        />
        <div className="relative p-6">
          <p className="text-comic-dark font-semibold font-quicksand text-base md:text-lg leading-relaxed text-center">
            <TypingText>{children}</TypingText>
          </p>
        </div>
      </div>

      {/* SVG Filter for sketchy effect */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="sketchy-narration" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
