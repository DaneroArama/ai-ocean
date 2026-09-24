interface DialogueBoxProps {
  character: string;
  children: React.ReactNode;
}

export default function DialogueBox({ character, children }: DialogueBoxProps) {
  return (
    <div className="relative max-w-xs">
      {/* Speech bubble with sketchy border */}
      <div 
        className="bg-white rounded-2xl p-4 relative"
        style={{
          border: '3px solid #1a1a1a',
          borderRadius: '16px',
          filter: 'url(#sketchy-border)',
        }}
      >
        <p className="text-comic-dark font-quicksand text-sm md:text-base leading-relaxed">
          {children}
        </p>

        {/* Speech bubble tail - sketchy style */}
        <div 
          className="absolute -bottom-3 left-8"
          style={{
            width: 0,
            height: 0,
            borderLeft: '15px solid transparent',
            borderRight: '15px solid transparent',
            borderTop: '15px solid white',
            filter: 'url(#sketchy-tail)',
          }}
        />
        <div 
          className="absolute -bottom-4 left-7"
          style={{
            width: 0,
            height: 0,
            borderLeft: '17px solid transparent',
            borderRight: '17px solid transparent',
            borderTop: '17px solid #1a1a1a',
          }}
        />
      </div>

      {/* Character name tag */}
      <div 
        className="absolute -top-3 left-4 bg-ocean-primary text-white px-3 py-1 rounded-full text-xs font-syne font-bold"
        style={{
          border: '2px solid #1a1a1a',
          filter: 'url(#sketchy-border)',
        }}
      >
        {character}
      </div>

      {/* SVG Filter for sketchy effect */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="sketchy-border">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          <filter id="sketchy-tail">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
