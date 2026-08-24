/**
 * Theme Type Definitions
 * 
 * Provides TypeScript types for the comic ocean theme.
 * Use these types to ensure type safety when working with theme values.
 * 
 * @module types/theme
 */

/**
 * Ocean Blue Color Variants
 */
export type OceanColor = 
  | 'ocean-deep'
  | 'ocean-primary'
  | 'ocean-medium'
  | 'ocean-light'
  | 'ocean-pale'
  | 'ocean-surface'
  | 'ocean-foam'

/**
 * Accent Color Variants
 */
export type AccentColor = 
  | 'accent-coral'
  | 'accent-sunset'
  | 'accent-yellow'
  | 'accent-teal'
  | 'accent-purple'
  | 'accent-pink'

/**
 * Comic Neutral Color Variants
 */
export type ComicNeutral = 
  | 'comic-black'
  | 'comic-dark'
  | 'comic-gray'
  | 'comic-light'
  | 'comic-white'

/**
 * Semantic Color Variants
 */
export type SemanticColor = 
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

/**
 * All Theme Colors
 */
export type ThemeColor = 
  | OceanColor 
  | AccentColor 
  | ComicNeutral 
  | SemanticColor

/**
 * Font Family Variants
 */
export type FontFamily = 
  | 'heading'   // Comic Sans MS - playful headings
  | 'display'   // Impact - hero sections
  | 'body'      // Segoe UI - body text
  | 'sans'      // Same as body
  | 'mono'      // Courier New - code

/**
 * Animation Variants
 */
export type Animation = 
  | 'bounce-in'
  | 'float'
  | 'wave'
  | 'pulse-glow'
  | 'slide-in-left'
  | 'slide-in-right'
  | 'fade-in'
  | 'pop'

/**
 * Transition Duration
 */
export type TransitionDuration = 
  | 'instant'  // 100ms
  | 'fast'     // 200ms
  | 'normal'   // 300ms
  | 'slow'     // 500ms
  | 'slower'   // 800ms
  | 'slowest'  // 1200ms

/**
 * Easing Functions
 */
export type Easing = 
  | 'bounce'   // cubic-bezier(0.68, -0.55, 0.265, 1.55)
  | 'elastic'  // cubic-bezier(0.68, -0.6, 0.32, 1.6)
  | 'smooth'   // cubic-bezier(0.4, 0, 0.2, 1)

/**
 * Z-Index Layers
 */
export type ZIndex = 
  | 'base'
  | 'dropdown'
  | 'sticky'
  | 'fixed'
  | 'modal-backdrop'
  | 'modal'
  | 'popover'
  | 'tooltip'

/**
 * Button Variants
 */
export type ButtonVariant = 
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'hero'

/**
 * Card Variants
 */
export type CardVariant = 
  | 'standard'
  | 'elevated'
  | 'flat'
  | 'interactive'

/**
 * Badge Variants
 */
export type BadgeVariant = 
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

/**
 * Heading Levels
 */
export type HeadingLevel = 
  | 'hero'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'