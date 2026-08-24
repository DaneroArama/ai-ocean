/**
 * Comic Theme Style Utilities
 * 
 * Pre-configured style combinations for common comic-style UI patterns.
 * Use these utilities to maintain consistency across the application.
 * 
 * @module lib/theme/comic-styles
 */

/**
 * Button Styles
 * Comic-style button variants with proper animations and interactions
 */
export const comicButton = {
  // Primary action button (coral accent)
  primary: `
    font-heading text-lg
    px-xl py-md
    bg-accent-coral text-comic-white
    rounded-lg
    shadow-comic-md
    transition-all duration-normal ease-bounce
    hover:scale-105 hover:shadow-comic-lg
    active:scale-95
    focus-visible:outline-2 focus-visible:outline-accent-teal focus-visible:outline-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `.trim().replace(/\s+/g, ' '),

  // Secondary button (ocean blue)
  secondary: `
    font-heading text-lg
    px-xl py-md
    bg-ocean-light text-comic-white
    rounded-lg
    shadow-comic-md
    transition-all duration-normal ease-bounce
    hover:scale-105 hover:shadow-comic-lg
    active:scale-95
    focus-visible:outline-2 focus-visible:outline-accent-teal focus-visible:outline-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `.trim().replace(/\s+/g, ' '),

  // Outline button (transparent with border)
  outline: `
    font-heading text-lg
    px-xl py-md
    bg-transparent text-ocean-primary
    border-3 border-ocean-primary
    rounded-lg
    shadow-comic-sm
    transition-all duration-normal ease-bounce
    hover:bg-ocean-primary hover:text-comic-white hover:scale-105 hover:shadow-comic-md
    active:scale-95
    focus-visible:outline-2 focus-visible:outline-accent-teal focus-visible:outline-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `.trim().replace(/\s+/g, ' '),

  // Ghost button (minimal styling)
  ghost: `
    font-heading text-lg
    px-lg py-sm
    bg-transparent text-ocean-medium
    rounded-lg
    transition-colors duration-normal
    hover:bg-ocean-foam hover:text-ocean-primary
    active:bg-ocean-surface
    focus-visible:outline-2 focus-visible:outline-accent-teal focus-visible:outline-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `.trim().replace(/\s+/g, ' '),

  // Large hero button (for landing page CTAs)
  hero: `
    font-display text-xl sm:text-2xl
    px-2xl py-lg
    bg-accent-coral text-comic-white
    rounded-full
    shadow-comic-xl
    transition-all duration-slow ease-bounce
    hover:scale-110 hover:shadow-comic-xl
    active:scale-100
    focus-visible:outline-2 focus-visible:outline-accent-teal focus-visible:outline-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
  `.trim().replace(/\s+/g, ' '),
}

/**
 * Card Styles
 * Comic-style card containers with proper elevation and borders
 */
export const comicCard = {
  // Standard card with comic border
  standard: `
    comic-border
    bg-ocean-foam
    rounded-xl
    p-xl
    transition-transform duration-slow ease-smooth
    hover:scale-105 hover:shadow-comic-lg
  `.trim().replace(/\s+/g, ' '),

  // Elevated card (more prominent)
  elevated: `
    comic-border
    bg-comic-white
    rounded-xl
    p-2xl
    shadow-comic-lg
    transition-all duration-slow ease-smooth
    hover:scale-105 hover:shadow-comic-xl
  `.trim().replace(/\s+/g, ' '),

  // Flat card (subtle)
  flat: `
    bg-ocean-surface
    border-2 border-ocean-pale
    rounded-lg
    p-lg
    transition-colors duration-normal
    hover:bg-ocean-foam hover:border-ocean-light
  `.trim().replace(/\s+/g, ' '),

  // Interactive card (for clickable items)
  interactive: `
    comic-border
    bg-ocean-foam
    rounded-xl
    p-xl
    cursor-pointer
    transition-all duration-normal ease-bounce
    hover:scale-105 hover:shadow-comic-lg hover:bg-ocean-surface
    active:scale-100
    focus-within:outline-2 focus-within:outline-accent-teal focus-within:outline-offset-2
  `.trim().replace(/\s+/g, ' '),
}

/**
 * Input Styles
 * Comic-style form inputs
 */
export const comicInput = {
  // Text input
  text: `
    font-body text-base
    px-md py-sm
    bg-comic-white
    border-3 border-ocean-light
    rounded-lg
    shadow-comic-sm
    transition-all duration-normal
    focus:border-accent-teal focus:shadow-comic-md focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
    placeholder:text-comic-gray
  `.trim().replace(/\s+/g, ' '),

  // Textarea
  textarea: `
    font-body text-base
    px-md py-sm
    bg-comic-white
    border-3 border-ocean-light
    rounded-lg
    shadow-comic-sm
    transition-all duration-normal
    focus:border-accent-teal focus:shadow-comic-md focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
    placeholder:text-comic-gray
    resize-none
  `.trim().replace(/\s+/g, ' '),

  // Select dropdown
  select: `
    font-body text-base
    px-md py-sm
    bg-comic-white
    border-3 border-ocean-light
    rounded-lg
    shadow-comic-sm
    transition-all duration-normal
    focus:border-accent-teal focus:shadow-comic-md focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed
    cursor-pointer
  `.trim().replace(/\s+/g, ' '),
}

/**
 * Badge Styles
 * Comic-style badges and status indicators
 */
export const comicBadge = {
  // Default badge
  default: `
    inline-flex items-center
    font-heading text-sm
    px-md py-xs
    bg-ocean-surface text-ocean-primary
    rounded-full
    shadow-comic-sm
  `.trim().replace(/\s+/g, ' '),

  // Success badge
  success: `
    inline-flex items-center
    font-heading text-sm
    px-md py-xs
    bg-success/20 text-success
    border-2 border-success
    rounded-full
    shadow-comic-sm
  `.trim().replace(/\s+/g, ' '),

  // Warning badge
  warning: `
    inline-flex items-center
    font-heading text-sm
    px-md py-xs
    bg-warning/20 text-warning
    border-2 border-warning
    rounded-full
    shadow-comic-sm
  `.trim().replace(/\s+/g, ' '),

  // Error badge
  error: `
    inline-flex items-center
    font-heading text-sm
    px-md py-xs
    bg-error/20 text-error
    border-2 border-error
    rounded-full
    shadow-comic-sm
  `.trim().replace(/\s+/g, ' '),

  // Info badge
  info: `
    inline-flex items-center
    font-heading text-sm
    px-md py-xs
    bg-info/20 text-info
    border-2 border-info
    rounded-full
    shadow-comic-sm
  `.trim().replace(/\s+/g, ' '),
}

/**
 * Heading Styles
 * Comic-style typography hierarchy
 */
export const comicHeading = {
  // Hero heading (largest)
  hero: `
    font-display
    text-5xl sm:text-6xl md:text-7xl lg:text-8xl
    text-ocean-deep
    leading-tight
    tracking-tight
  `.trim().replace(/\s+/g, ' '),

  // H1 heading
  h1: `
    font-heading
    text-4xl sm:text-5xl md:text-6xl
    text-ocean-primary
    leading-tight
  `.trim().replace(/\s+/g, ' '),

  // H2 heading
  h2: `
    font-heading
    text-3xl sm:text-4xl md:text-5xl
    text-ocean-primary
    leading-snug
  `.trim().replace(/\s+/g, ' '),

  // H3 heading
  h3: `
    font-heading
    text-2xl sm:text-3xl md:text-4xl
    text-ocean-medium
    leading-snug
  `.trim().replace(/\s+/g, ' '),

  // H4 heading
  h4: `
    font-heading
    text-xl sm:text-2xl md:text-3xl
    text-ocean-medium
    leading-normal
  `.trim().replace(/\s+/g, ' '),

  // H5 heading
  h5: `
    font-heading
    text-lg sm:text-xl md:text-2xl
    text-ocean-medium
    leading-normal
  `.trim().replace(/\s+/g, ' '),

  // H6 heading
  h6: `
    font-heading
    text-base sm:text-lg md:text-xl
    text-ocean-medium
    leading-normal
  `.trim().replace(/\s+/g, ' '),
}

/**
 * Animation Styles
 * Pre-configured animation combinations
 */
export const comicAnimation = {
  // Entrance animation (fade in + bounce)
  entrance: 'animate-bounce-in animate-fade-in',

  // Floating mascot
  floatingMascot: 'animate-float transition-transform duration-slow ease-elastic hover:scale-110',

  // Interactive element
  interactive: 'transition-all duration-normal ease-bounce hover:scale-105 active:scale-95',

  // Pulse glow for CTAs
  pulseGlow: 'animate-pulse-glow',

  // Slide in from left
  slideInLeft: 'animate-slide-in-left',

  // Slide in from right
  slideInRight: 'animate-slide-in-right',
}

/**
 * Container Styles
 * Common layout containers
 */
export const comicContainer = {
  // Page section
  section: `
    w-full
    px-lg md:px-xl lg:px-2xl
    py-2xl md:py-3xl lg:py-4xl
  `.trim().replace(/\s+/g, ' '),

  // Centered content container
  content: `
    max-w-7xl
    mx-auto
    px-lg md:px-xl
  `.trim().replace(/\s+/g, ' '),

  // Full-width hero section
  hero: `
    min-h-screen
    w-full
    px-lg md:px-xl lg:px-2xl
    py-6xl
    flex items-center justify-center
  `.trim().replace(/\s+/g, ' '),
}

/**
 * Utility function to combine styles with proper spacing
 * Handles class name merging and deduplication
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
