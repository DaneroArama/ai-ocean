interface NarrationBoxProps {
  children: React.ReactNode;
}

export default function NarrationBox({ children }: NarrationBoxProps) {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div 
        className="bg-white rounded-lg p-6 relative"
        style={{
          border: '3px solid #1a1a1a',
          borderRadius: '12px',
          filter: 'url(#sketchy-narration)',
        }}
      >
        <p className="text-comic-dark font-semibold font-quicksand text-base md:text-lg leading-relaxed text-center">
          {children}
        </p>
      </div>

      {/* SVG Filter for sketchy effect */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="sketchy-narration">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
