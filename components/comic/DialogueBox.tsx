interface DialogueBoxProps {
  character: string;
  children: React.ReactNode;
  /** Tail sits bottom-left by default; set true to move it bottom-right */
  tailRight?: boolean;
}

export default function DialogueBox({
  character,
  children,
  tailRight = false,
}: DialogueBoxProps) {
  return (
    <div className="relative max-w-xs">
      {/* Sketchy bubble outline - background layer so the filter never
          distorts the text sitting above it */}
      <div
        className="absolute inset-0 bg-white"
        style={{
          border: "3px solid #1a1a1a",
          borderRadius: "9999px",
          filter: "url(#sketchy-border)",
        }}
      />

      <p className="relative py-4 px-6 text-comic-dark font-quicksand font-medium text-sm md:text-base leading-relaxed">
        {children}
      </p>

      {/* Speech bubble tail - sketchy style (dark outline behind white fill,
          both displaced together so the rim stays coherent) */}
      <div
        className={`absolute -bottom-4 h-[17px] w-[34px] ${
          tailRight ? "right-12" : "left-12"
        }`}
        
      >
        <div
          className="absolute bottom-0 left-0"
          style={{
            width: 0,
            height: 0,
            borderLeft: "17px solid transparent",
            borderRight: "17px solid transparent",
            borderTop: "17px solid #1a1a1a",
          }}
        />
        <div
          className="absolute bottom-[4px] left-[2px]"
          style={{
            width: 0,
            height: 0,
            borderLeft: "15px solid transparent",
            borderRight: "15px solid transparent",
            borderTop: "15px solid white",
          }}
        />
      </div>

      {/* Character name tag - background layer, text above */}
      <div className="absolute -top-3 left-8">
        <div
          className="absolute inset-0 bg-ocean-primary"
          style={{
            border: "2px solid #1a1a1a",
            borderRadius: "9999px",
            filter: "url(#sketchy-border)",
          }}
        />
        <span className="relative block px-3 py-1 text-xs font-syne font-bold text-white">
          {character}
        </span>
      </div>

      {/* SVG Filter for sketchy effect */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <filter
            id="sketchy-border"
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.05"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <filter
            id="sketchy-tail"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
