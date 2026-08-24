/**
 * Tailwind Theme Demo Component
 * 
 * Demonstrates the custom comic-style theme configuration
 * Tests: colors, fonts, animations, spacing, shadows, and responsive breakpoints
 * 
 * Requirements validated: 1.1, 17.1, 17.2, 17.3
 */

export function TailwindThemeDemo() {
  return (
    <div className="min-h-screen bg-ocean-foam p-4 md:p-8 lg:p-12">
      {/* Header Section - Comic Fonts */}
      <header className="text-center mb-6xl">
        <h1 className="font-syncopate text-4xl md:text-5xl lg:text-6xl text-ocean-deep mb-lg">
          Comic Theme Demo
        </h1>
        <p className="font-quicksand text-lg md:text-xl text-comic-gray max-w-2xl mx-auto">
          Testing ocean blues, vibrant accents, custom fonts, and responsive layouts
        </p>
      </header>

      {/* Color Palette Section */}
      <section className="mb-4xl">
        <h2 className="font-heading text-3xl text-ocean-primary mb-xl">Ocean Blues</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-md">
          <ColorCard color="ocean-deep" label="Deep" />
          <ColorCard color="ocean-primary" label="Primary" />
          <ColorCard color="ocean-medium" label="Medium" />
          <ColorCard color="ocean-light" label="Light" />
          <ColorCard color="ocean-pale" label="Pale" />
          <ColorCard color="ocean-surface" label="Surface" />
          <ColorCard color="ocean-foam" label="Foam" />
        </div>

        <h2 className="font-heading text-3xl text-accent-coral mb-xl mt-3xl">
          Vibrant Accents
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-md">
          <ColorCard color="accent-coral" label="Coral" />
          <ColorCard color="accent-sunset" label="Sunset" />
          <ColorCard color="accent-yellow" label="Yellow" />
          <ColorCard color="accent-teal" label="Teal" />
          <ColorCard color="accent-purple" label="Purple" />
          <ColorCard color="accent-pink" label="Pink" />
        </div>
      </section>

      {/* Animation Section */}
      <section className="mb-4xl">
        <h2 className="font-heading text-3xl text-ocean-primary mb-xl">
          Comic Animations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          <AnimationCard animation="bounce-in" label="Bounce In" />
          <AnimationCard animation="float" label="Float" />
          <AnimationCard animation="wave" label="Wave" />
          <AnimationCard animation="pulse-glow" label="Pulse Glow" />
          <AnimationCard animation="slide-in-left" label="Slide Left" />
          <AnimationCard animation="slide-in-right" label="Slide Right" />
          <AnimationCard animation="fade-in" label="Fade In" />
          <AnimationCard animation="pop" label="Pop" />
        </div>
      </section>

      {/* Comic Shadows Section */}
      <section className="mb-4xl">
        <h2 className="font-heading text-3xl text-ocean-primary mb-xl">
          Comic Shadows
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
          <ShadowCard shadow="shadow-comic-sm" label="Comic Small" />
          <ShadowCard shadow="shadow-comic-md" label="Comic Medium" />
          <ShadowCard shadow="shadow-comic-lg" label="Comic Large" />
          <ShadowCard shadow="shadow-comic-xl" label="Comic XL" />
        </div>
      </section>

      {/* Spacing Scale Section */}
      <section className="mb-4xl">
        <h2 className="font-heading text-3xl text-ocean-primary mb-xl">
          Custom Spacing Scale
        </h2>
        <div className="space-y-md">
          <SpacingDemo size="xs" pixels="4px" />
          <SpacingDemo size="sm" pixels="8px" />
          <SpacingDemo size="md" pixels="16px" />
          <SpacingDemo size="lg" pixels="24px" />
          <SpacingDemo size="xl" pixels="32px" />
          <SpacingDemo size="2xl" pixels="48px" />
          <SpacingDemo size="3xl" pixels="64px" />
          <SpacingDemo size="4xl" pixels="96px" />
        </div>
      </section>

      {/* Responsive Breakpoints Section */}
      <section className="mb-4xl">
        <h2 className="font-heading text-3xl text-ocean-primary mb-xl">
          Responsive Breakpoints
        </h2>
        <div className="bg-comic-white p-lg rounded-xl shadow-comic-md">
          <div className="font-body space-y-sm">
            <BreakpointIndicator bp="xs" minWidth="320px" label="Small phones" />
            <BreakpointIndicator bp="sm" minWidth="640px" label="Large phones" />
            <BreakpointIndicator bp="md" minWidth="768px" label="Tablets" />
            <BreakpointIndicator bp="lg" minWidth="1024px" label="Small desktops" />
            <BreakpointIndicator bp="xl" minWidth="1280px" label="Large desktops" />
            <BreakpointIndicator bp="2xl" minWidth="1536px" label="Extra large" />
            <BreakpointIndicator bp="3xl" minWidth="1920px" label="Ultra-wide" />
          </div>
        </div>
        
        {/* Current breakpoint indicator */}
        <div className="mt-lg p-md bg-ocean-primary text-comic-white rounded-lg text-center font-body">
          <p className="xs:hidden">Current: Below 320px</p>
          <p className="hidden xs:block sm:hidden">Current: XS (320px+)</p>
          <p className="hidden sm:block md:hidden">Current: SM (640px+)</p>
          <p className="hidden md:block lg:hidden">Current: MD (768px+) - Tablet</p>
          <p className="hidden lg:block xl:hidden">Current: LG (1024px+) - Desktop</p>
          <p className="hidden xl:block 2xl:hidden">Current: XL (1280px+)</p>
          <p className="hidden 2xl:block 3xl:hidden">Current: 2XL (1536px+)</p>
          <p className="hidden 3xl:block">Current: 3XL (1920px+) - Ultra-wide</p>
        </div>
      </section>

      {/* Font Families Section */}
      <section className="mb-4xl">
        <h2 className="font-heading text-3xl text-ocean-primary mb-xl">
          Custom Font Families
        </h2>
        <div className="space-y-lg">
          <div className="bg-comic-white p-lg rounded-xl shadow-soft-md">
            <h3 className="font-syncopate text-2xl text-ocean-deep mb-sm">
              Syncopate - Comic Headings
            </h3>
            <p className="font-body text-comic-gray">
              Used for bold, impactful comic-style headings and titles
            </p>
          </div>
          
          <div className="bg-comic-white p-lg rounded-xl shadow-soft-md">
            <h3 className="font-quicksand text-2xl text-ocean-deep mb-sm">
              Quicksand - Body Text
            </h3>
            <p className="font-body text-comic-gray">
              Clean, friendly, and highly readable font for all body content
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

// Helper Components

function ColorCard({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-sm">
      <div
        className={`w-20 h-20 md:w-24 md:h-24 rounded-lg shadow-comic-sm bg-${color}`}
      />
      <span className="font-body text-sm text-comic-gray">{label}</span>
    </div>
  )
}

function AnimationCard({ animation, label }: { animation: string; label: string }) {
  return (
    <div className={`bg-ocean-light p-lg rounded-xl text-center animate-${animation}`}>
      <div className="w-16 h-16 mx-auto mb-md bg-comic-white rounded-full flex items-center justify-center shadow-comic-sm">
        <span className="text-2xl">🌊</span>
      </div>
      <p className="font-body text-sm text-comic-white font-semibold">{label}</p>
    </div>
  )
}

function ShadowCard({ shadow, label }: { shadow: string; label: string }) {
  return (
    <div className={`bg-comic-white p-lg rounded-xl ${shadow}`}>
      <div className="w-16 h-16 mx-auto mb-md bg-ocean-primary rounded-lg flex items-center justify-center">
        <span className="text-2xl">📦</span>
      </div>
      <p className="font-body text-sm text-comic-gray text-center font-semibold">
        {label}
      </p>
    </div>
  )
}

function SpacingDemo({ size, pixels }: { size: string; pixels: string }) {
  return (
    <div className="flex items-center gap-md">
      <div className="w-24 font-mono text-sm text-comic-gray">{size}</div>
      <div className="flex items-center gap-sm">
        <div className={`bg-ocean-primary h-8 w-${size}`} />
        <span className="font-body text-sm text-comic-gray">{pixels}</span>
      </div>
    </div>
  )
}

function BreakpointIndicator({
  bp,
  minWidth,
  label,
}: {
  bp: string
  minWidth: string
  label: string
}) {
  return (
    <div className="flex items-center justify-between py-sm">
      <span className="font-mono text-sm text-ocean-primary font-semibold">{bp}</span>
      <span className="font-body text-sm text-comic-gray">{minWidth}</span>
      <span className="font-body text-sm text-comic-dark">{label}</span>
    </div>
  )
}
