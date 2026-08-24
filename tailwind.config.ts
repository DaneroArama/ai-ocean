import type { Config } from 'tailwindcss'

/**
 * Tailwind CSS v4 Configuration
 * 
 * Note: In Tailwind v4, most theme customization is done through CSS using @theme directive.
 * See app/globals.css for the primary theme configuration including:
 * - Custom color palette (ocean blues, vibrant accents)
 * - Font families (Syncopate for headings, Quicksand for body text)
 * - Animation utilities and custom keyframes
 * - Custom spacing scale
 * - Responsive breakpoints
 * 
 * This config file provides TypeScript configuration for:
 * - Content paths for class scanning
 * - Plugin configuration
 * - Additional build-time settings
 */

const config: Config = {
  /**
   * Content paths - tells Tailwind where to look for class names
   * Covers all Next.js App Router directories and component files
   */
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  /**
   * Theme extensions (complementary to @theme in globals.css)
   * Note: In v4, CSS-based theme configuration takes precedence
   */
  theme: {
    extend: {
      /**
       * Font Family Extensions
       * Provides fallback definitions for Syncopate and Quicksand fonts
       * These are loaded via next/font/google in app/layout.tsx
       */
      fontFamily: {
        // Syncopate for headings - bold, impactful, comic-style
        syncopate: [
          'var(--font-syncopate)',
          'Impact',
          'Arial Black',
          'Haettenschweiler',
          'sans-serif',
        ],
        heading: [
          'var(--font-syncopate)',
          'Impact',
          'Arial Black',
          'Haettenschweiler',
          'sans-serif',
        ],
        display: [
          'var(--font-syncopate)',
          'Impact',
          'Arial Black',
          'Haettenschweiler',
          'sans-serif',
        ],
        // Quicksand for body text - clean, friendly, readable
        quicksand: [
          'var(--font-quicksand)',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        body: [
          'var(--font-quicksand)',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        // Default sans-serif uses Quicksand
        sans: [
          'var(--font-quicksand)',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        // Monospace for code
        mono: [
          'Courier New',
          'Courier',
          'monospace',
        ],
      },

      /**
       * Custom Animation Keyframes
       * Extends the animations defined in globals.css with TypeScript typing
       */
      keyframes: {
        'bounce-in': {
          '0%': {
            transform: 'scale(0.8) translateY(20px)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(1.05) translateY(-5px)',
          },
          '100%': {
            transform: 'scale(1) translateY(0)',
            opacity: '1',
          },
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        'wave': {
          '0%, 100%': {
            transform: 'rotate(0deg)',
          },
          '25%': {
            transform: 'rotate(15deg)',
          },
          '75%': {
            transform: 'rotate(-15deg)',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(74, 144, 217, 0.5)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(74, 144, 217, 0.8)',
          },
        },
        'slide-in-left': {
          'from': {
            transform: 'translateX(-100%)',
            opacity: '0',
          },
          'to': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'slide-in-right': {
          'from': {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          'to': {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'fade-in': {
          'from': {
            opacity: '0',
          },
          'to': {
            opacity: '1',
          },
        },
        'pop': {
          '0%': {
            transform: 'scale(1)',
          },
          '50%': {
            transform: 'scale(1.1)',
          },
          '100%': {
            transform: 'scale(1)',
          },
        },
      },

      /**
       * Animation Utilities
       * Maps keyframes to Tailwind animation classes
       */
      animation: {
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'float': 'float 3s ease-in-out infinite',
        'wave': 'wave 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-in-left': 'slide-in-left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'pop': 'pop 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      /**
       * Responsive Breakpoints
       * Comic-optimized breakpoints for mobile-first design
       */
      screens: {
        'xs': '320px',   // Small phones
        'sm': '640px',   // Large phones
        'md': '768px',   // Tablets
        'lg': '1024px',  // Small desktops
        'xl': '1280px',  // Large desktops
        '2xl': '1536px', // Extra large screens
        '3xl': '1920px', // Ultra-wide displays
      },

      /**
       * Custom Spacing Scale
       * Extends default spacing with comic-style larger gaps
       */
      spacing: {
        'xs': '0.25rem',   // 4px
        'sm': '0.5rem',    // 8px
        'md': '1rem',      // 16px
        'lg': '1.5rem',    // 24px
        'xl': '2rem',      // 32px
        '2xl': '3rem',     // 48px
        '3xl': '4rem',     // 64px
        '4xl': '6rem',     // 96px
        '5xl': '8rem',     // 128px
        '6xl': '12rem',    // 192px
      },

      /**
       * Border Radius (Comic Style)
       * Rounded corners for friendly, approachable design
       */
      borderRadius: {
        'none': '0',
        'sm': '0.25rem',
        'base': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        '3xl': '3rem',
        'full': '9999px',
      },

      /**
       * Box Shadow (Comic Pop Effect)
       * Creates the signature comic book "pop" effect
       */
      boxShadow: {
        'comic-sm': '2px 2px 0px #1a1a1a',
        'comic-md': '4px 4px 0px #1a1a1a',
        'comic-lg': '6px 6px 0px #1a1a1a',
        'comic-xl': '8px 8px 0px #1a1a1a',
        'soft-sm': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'soft-md': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.2)',
      },

      /**
       * Transition Timing Functions
       * Comic-style easing for bouncy, elastic animations
       */
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'elastic': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      /**
       * Transition Duration
       * Standardized duration scale for animations
       */
      transitionDuration: {
        'instant': '100ms',
        'fast': '200ms',
        'normal': '300ms',
        'slow': '500ms',
        'slower': '800ms',
        'slowest': '1200ms',
      },

      /**
       * Z-Index Scale
       * Consistent layering for UI elements
       */
      zIndex: {
        'base': '0',
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },
    },
  },

  /**
   * Plugins
   * Additional Tailwind functionality
   */
  plugins: [
    // Add custom plugins here as needed
  ],

  /**
   * Future flags for opt-in to upcoming features
   */
  future: {
    // Enable future Tailwind features as they become available
  },

  /**
   * Experimental features
   */
  experimental: {
    // Enable experimental features as needed
  },
}

export default config
