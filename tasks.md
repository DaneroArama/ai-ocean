# Implementation Plan: Event Platform

## Overview

This implementation plan converts the Event Platform design into actionable TypeScript/React tasks. The platform features a bilingual (English/Myanmar) comic-styled interface with GSAP animations, OCEAN personality testing, Convex backend with OAuth authentication, and comprehensive admin tools. Implementation progresses from foundation through public UI, animations, authentication, backend schema, personality testing system, results/analytics, registration management, winner system, and final polish.

## Tasks

- [ ] 1. Initialize project foundation and core dependencies
  - [x] 1.1 Install and configure Convex backend
    - Install Convex CLI globally and project dependencies: `npm install convex @convex-dev/auth`
    - Initialize Convex: `npx convex dev --once` to create convex/ directory
    - Create `convex/tsconfig.json` with Convex-specific TypeScript config
    - Add Convex environment variables to `.env.local`
    - _Requirements: 27_
  
  - [x] 1.2 Configure Convex Auth with OAuth providers
    - Install auth dependencies: `npm install @convex-dev/auth @auth/core`
    - Create `convex/auth.config.ts` with Google and GitHub OAuth providers
    - Configure OAuth client IDs and secrets in Convex dashboard
    - Set up auth middleware and session handling
    - _Requirements: 3.1, 3.2, 3.3, 26.1, 26.2_
  
  - [x] 1.3 Set up internationalization infrastructure with custom i18n context
    - Create `dictionaries/en.json` and `dictionaries/my.json` with initial translation keys
    - Create `lib/i18n/provider.tsx` with I18nProvider context (client component)
    - Implement locale state management with localStorage persistence
    - Create `lib/i18n/get-dictionary.ts` helper for loading dictionaries
    - Wrap root layout with I18nProvider using English as default
    - _Requirements: 1.2, 1.4, 20.1, 20.2, 20.3, 20.6_
  
  - [x] 1.4 Configure Tailwind CSS with comic theme customization
    - Extend `tailwind.config.ts` with custom color palette (ocean blues, vibrant accents)
    - Add custom font families for comic-style headings and body text
    - Define animation utilities and transition classes
    - Create custom spacing scale for consistent layouts
    - Add responsive breakpoint customization
    - _Requirements: 1.1, 17.1, 17.2, 17.3_
  
  - [x] 1.5 Install animation libraries and utilities
    - Install GSAP: `npm install gsap`
    - Install Lenis smooth scroll: `npm install lenis`
    - Install Chart.js for results visualization: `npm install chart.js react-chartjs-2`
    - Install date utilities: `npm install date-fns`
    - Create `lib/utils/cn.ts` for className utility (clsx + tailwind-merge)
    - _Requirements: 2.1, 2.6, 8.1_
  
  - [ ] 1.6 Create base directory structure and shared UI components
    - Create directory structure: components/{ui,layout,public,participant,admin}
    - Create `components/ui/Button.tsx` with variant support (primary, secondary, ghost)
    - Create `components/ui/Input.tsx` with validation state styling
    - Create `components/ui/Card.tsx` for content containers
    - Create `components/ui/Badge.tsx` for status indicators
    - Create `lib/utils/validators.ts` with common validation functions
    - _Requirements: 19.1, 19.3_

- [ ] 2. Build Convex backend schema and core queries
  - [x] 2.1 Define Convex database schema with all tables
    - Create `convex/schema.ts` with participants, registrations, personalityQuestions tables
    - Add personalityAnswers, personalityResults, archetypes tables
    - Add winners and auditLog tables
    - Define all indexes for efficient queries (by_email, by_participant, by_event, etc.)
    - Add field validation rules (enums for states, required fields)
    - _Requirements: 3.2, 4.2, 5.1, 5.2, 7.3, 9.2, 14.1, 22.4_
  
  - [-] 2.2 Implement participant authentication queries and mutations
    - Create `convex/participants.ts` with getCurrentParticipant query
    - Add getParticipantById query with authorization check
    - Add updateParticipantProfile mutation
    - Implement role-based authorization helpers (isAdmin, isParticipant)
    - Add lastLoginAt timestamp update logic
    - _Requirements: 3.2, 3.3, 3.7, 15.4, 26.3_
  
  - [-] 2.3 Implement registration queries and mutations
    - Create `convex/registrations.ts` with getMyRegistrations query
    - Add getRegistrationById query with ownership validation
    - Add createRegistration mutation with duplicate prevention
    - Add updateRegistrationState mutation with admin authorization and audit logging
    - Implement state transition validation (pending→active→completed/cancelled)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 13.1, 13.2, 13.6, 25.1_
  
  - [-] 2.4 Implement personality question management
    - Create `convex/personalityTest.ts` with getActiveQuestions query
    - Add getQuestionById query (admin only)
    - Add createQuestion mutation with bilingual validation
    - Add updateQuestion mutation with admin authorization
    - Add deleteQuestion mutation with soft-delete support (isActive: false)
    - Add reorderQuestions mutation for orderIndex management
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 12.4, 25.2_
  
  - [-] 2.5 Implement personality test administration
    - Add submitAnswer mutation with registration validation
    - Add getMyAnswers query with registration filtering
    - Add getTestProgress query returning completed/total counts
    - Implement duplicate answer prevention (unique constraint check)
    - Add answer timestamp recording
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 22.1_

- [ ] 3. Implement personality scoring and results system
  - [ ] 3.1 Create OCEAN scoring algorithm
    - Create `lib/scoring/calculate-ocean.ts` with calculateOceanScores function
    - Implement weighted scoring using question scoringWeight and answerValue
    - Normalize dimension scores to 0-100 range
    - Handle reverse-scored questions (negative weights)
    - Add algorithm version constant (v1.0.0)
    - _Requirements: 7.1, 7.2, 7.6_
  
  - [ ]* 3.2 Write property test for OCEAN scoring algorithm
    - **Property 1: Score range invariant**
    - **Validates: Requirements 7.6**
    - Use fast-check to verify all dimension scores are between 0 and 100
    - Test with randomized answer patterns
  
  - [ ] 3.3 Create archetype assignment logic
    - Create `lib/scoring/assign-archetype.ts` with assignArchetype function
    - Implement OCEAN range matching against archetype criteria
    - Add priority-based selection for overlapping ranges
    - Implement fallback to default archetype when no match
    - Add validation for archetype configuration completeness
    - _Requirements: 7.3, 9.4, 9.5_
  
  - [ ] 3.4 Implement result calculation mutation
    - Create `convex/results.ts` with calculateResults mutation
    - Fetch all answers for registration
    - Call OCEAN scoring algorithm
    - Call archetype assignment logic
    - Store personalityResults with algorithm version
    - Implement transaction semantics for atomicity
    - _Requirements: 7.1, 7.4, 22.2, 22.5_
  
  - [ ] 3.5 Implement results queries with authorization
    - Add getMyResults query filtering by participantId
    - Add getResultById query with ownership validation
    - Add getResultsWithArchetype query joining archetype data
    - Implement admin-only getAllResults query
    - _Requirements: 8.2, 15.2, 11.4_
  
  - [ ]* 3.6 Write unit tests for archetype assignment edge cases
    - Test exact boundary matching
    - Test overlapping range priority
    - Test default archetype fallback
    - _Requirements: 7.3, 9.5_

- [ ] 4. Build public website UI foundation
  - [x] 4.1 Create responsive navbar component
    - Create `components/layout/Navbar.tsx` as client component
    - Implement logo with link to home
    - Add navigation links (Home, About, Dashboard, Sign In)
    - Integrate LanguageSwitcherDropdown component
    - Add mobile hamburger menu with slide-out drawer
    - Implement sticky positioning on scroll
    - _Requirements: 1.1, 1.5, 17.1, 17.2, 17.3, 18.2_
  
  - [ ] 4.2 Create language switcher dropdown component
    - Create `components/layout/LanguageSwitcherDropdown.tsx` as client component
    - Display current language with flag emoji (🇬🇧/🇲🇲)
    - Implement dropdown menu with language options
    - Call setLocale from useI18n hook on selection
    - Add checkmark indicator for active language
    - Close dropdown on selection or outside click
    - _Requirements: 1.2, 20.2, 20.5_
  
  - [ ] 4.3 Create footer component with bilingual content
    - Create `components/layout/Footer.tsx` as server component
    - Add social media links (Facebook, Twitter, Instagram)
    - Add contact information with email and phone
    - Add copyright notice with dynamic year
    - Implement responsive grid layout (mobile: 1 col, tablet: 2 cols, desktop: 4 cols)
    - _Requirements: 1.2, 17.1, 17.2, 17.3_
  
  - [x] 4.4 Create public layout wrapper
    - Create `app/(public)/layout.tsx` with Navbar and Footer
    - Wrap children with public layout structure
    - Add page transition container
    - Set up SEO metadata defaults
    - _Requirements: 1.1, 1.5_

- [ ] 5. Implement public website sections from screenshots
  - [x] 5.1 Build hero section (screenshot 1)
    - Create `components/public/HeroSection.tsx` as client component
    - Add event logo image with proper sizing
    - Implement animated title with typewriter effect placeholder
    - Add CTA buttons (Start Test, Learn More)
    - Add scroll indicator with bounce animation placeholder
    - Implement responsive layout (mobile: stacked, desktop: centered)
    - _Requirements: 1.1, 1.2, 17.1, 17.2, 17.3, 18.3_
  
  - [ ] 5.2 Build section 2 with content blocks
    - Create `components/public/Section2.tsx` as client component
    - Implement content grid with text and images
    - Add mascot placeholder (Shark character)
    - Use wave decorative element from assets
    - Implement responsive layout with content reflow
    - _Requirements: 1.1, 1.2, 17.1_
  
  - [ ] 5.3 Build sections 3-7 with narrative content
    - Create `components/public/Section3.tsx` through `Section7.tsx` as client components
    - Implement content blocks matching screenshot layouts
    - Add numbered icons (num_icon_1.png through num_icon_4.png) where applicable
    - Add mascot placeholders for animation (Ali, Crabi positions)
    - Use decorative elements (coral, starfish, fishes) from assets
    - Implement responsive layouts for all sections
    - _Requirements: 1.1, 1.2, 17.1, 24.4_
  
  - [ ] 5.4 Build sections 8-12 with interactive elements
    - Create `components/public/Section8.tsx` through `Section12.tsx` as client components
    - Implement content layouts matching screenshots
    - Add hover states for interactive elements
    - Position mascot placeholders strategically
    - Use title images (Title.png, Title_white.png) where applicable
    - _Requirements: 1.1, 1.2, 17.4_
  
  - [ ] 5.5 Build section 13 and assemble homepage
    - Create `components/public/Section13.tsx` with final narrative content
    - Update `app/(public)/page.tsx` to compose all sections
    - Add section spacing and dividers (wave images)
    - Ensure smooth scrolling between sections
    - Test responsive behavior across all breakpoints
    - _Requirements: 1.1, 17.1, 17.2, 17.3, 17.5_

- [ ] 6. Implement GSAP animation system
  - [ ] 6.1 Initialize GSAP with ScrollTrigger and reduced motion support
    - Create `lib/animations/gsap-init.ts` with GSAP registration
    - Register ScrollTrigger plugin globally
    - Create `lib/animations/use-reduced-motion.ts` hook checking prefers-reduced-motion
    - Add GSAP license key if using premium features
    - _Requirements: 2.1, 2.3, 18.6_
  
  - [ ] 6.2 Implement Lenis smooth scroll integration
    - Create `components/layout/SmoothScroll.tsx` client component
    - Initialize Lenis in useEffect with requestAnimationFrame loop
    - Integrate Lenis with ScrollTrigger.update
    - Add cleanup on unmount
    - Wrap root layout children with SmoothScroll
    - _Requirements: 2.6, 21.3_
  
  - [ ] 6.3 Create scroll-triggered animation utilities
    - Create `lib/animations/scroll-animations.ts` with reusable animation factories
    - Implement fadeInUp animation with configurable delay
    - Implement parallax animation for background elements
    - Implement stagger animation for list items
    - Add performance monitoring helpers (frame rate tracking)
    - _Requirements: 2.1, 2.5, 21.1, 21.2_
  
  - [ ] 6.4 Animate hero section with GSAP
    - Update HeroSection with GSAP context and refs
    - Animate title entrance with fade and slide up
    - Animate CTA buttons with stagger effect
    - Animate scroll indicator with infinite bounce
    - Add reduced motion checks before all animations
    - _Requirements: 2.1, 2.3, 2.4, 2.5_
  
  - [ ] 6.5 Animate sections 2-13 with scroll triggers
    - Add GSAP context to each section component
    - Implement scroll-triggered fade-in for content blocks
    - Add parallax effects for decorative elements (waves, coral, starfish)
    - Implement stagger animations for numbered lists
    - Ensure animations don't block content access
    - Test animation performance and add optimization flags
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 16.4, 21.1_

- [ ] 7. Implement mascot animations
  - [ ] 7.1 Create mascot animation system
    - Create `lib/animations/mascot-animations.ts` with character animation factories
    - Implement float animation (gentle up/down motion)
    - Implement swim animation (horizontal movement with rotation)
    - Implement wave animation (friendly gesture)
    - Add entrance animations (fade + slide)
    - _Requirements: 2.2, 2.5, 24.1, 24.3, 24.5_
  
  - [ ] 7.2 Animate Shark mascot across sections
    - Update sections containing Shark with animation refs
    - Apply float animation for idle state
    - Apply swim animation on scroll trigger
    - Ensure character proportions match design specs
    - Test animation smoothness and GPU acceleration
    - _Requirements: 2.1, 2.2, 24.1, 24.2, 24.3_
  
  - [ ] 7.3 Animate Alligator (Ali) and Crab (Crabi) mascots
    - Update sections containing Ali and Crabi with animation refs
    - Apply character-specific animation styles (Ali: slower, Crabi: quicker)
    - Implement interaction animations on hover/click
    - Maintain consistent sizing relative to UI elements
    - Test reduced-motion fallbacks
    - _Requirements: 2.1, 2.2, 2.3, 24.1, 24.4, 24.5_
  
  - [ ]* 7.4 Performance test animations on low-end devices
    - Test on simulated slow CPU (4x throttling)
    - Measure frame rates during scroll
    - Verify animations degrade gracefully
    - _Requirements: 2.5, 17.6, 21.1_

- [ ] 8. Checkpoint - Verify public website foundation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement authentication system
  - [ ] 9.1 Create sign-in page with OAuth buttons
    - Create `app/auth/signin/page.tsx` as client component
    - Add Google OAuth button with brand styling
    - Add GitHub OAuth button with brand styling
    - Add email/password fallback form
    - Integrate with Convex Auth signIn action
    - Handle authentication errors with user-friendly messages
    - _Requirements: 3.1, 3.2, 3.5, 19.2_
  
  - [ ] 9.2 Create sign-up page with profile creation
    - Create `app/auth/signup/page.tsx` as client component
    - Add OAuth signup buttons (Google, GitHub)
    - Add email/password signup form with validation
    - Implement firstName and lastName input fields
    - Set default preferredLanguage from i18n context
    - Handle signup errors and duplicate email detection
    - _Requirements: 3.1, 3.2, 3.4, 19.1_
  
  - [ ] 9.3 Create auth guard for protected routes
    - Create `components/auth/AuthGuard.tsx` as server component
    - Query getCurrentParticipant to check authentication
    - Redirect to sign-in if not authenticated
    - Pass through children if authenticated
    - _Requirements: 3.3, 3.7, 15.4_
  
  - [ ] 9.4 Create admin auth guard with role check
    - Create `components/auth/AdminAuthGuard.tsx` as server component
    - Query getCurrentParticipant and verify role === "admin"
    - Redirect to dashboard if not admin
    - Display access denied message for non-admin users
    - _Requirements: 10.3, 12.2, 12.6, 15.4, 19.5_
  
  - [ ] 9.5 Implement session management and logout
    - Add useAuthActions hook from Convex Auth
    - Create logout button component with signOut action
    - Update navbar with conditional auth links (Sign In vs Logout)
    - Update lastLoginAt on successful authentication
    - _Requirements: 3.7, 26.3_
  
  - [ ]* 9.6 Write integration tests for authentication flows
    - Test OAuth sign-in flow
    - Test email/password signup
    - Test authentication guard redirects
    - _Requirements: 3.2, 3.3, 23.2_

- [ ] 10. Build participant dashboard
  - [ ] 10.1 Create participant dashboard layout
    - Create `app/(participant)/layout.tsx` with AuthGuard
    - Add participant navbar with navigation links
    - Create sidebar for mobile navigation
    - Set up dashboard route structure
    - _Requirements: 11.1, 12.1_
  
  - [ ] 10.2 Create dashboard overview page
    - Create `app/(participant)/dashboard/page.tsx` as server component
    - Query and display participant's registrations
    - Create RegistrationCard component showing event details and state
    - Create TestProgressCard component with progress bar
    - Add conditional CTAs (Start Test, Resume Test, View Results)
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [ ] 10.3 Create registration card component
    - Create `components/participant/RegistrationCard.tsx` as client component
    - Display event identifier and registration state
    - Add StatusBadge with color coding (pending: yellow, active: green, completed: blue)
    - Add action button based on state (Activate, Start Test, View Results)
    - Implement responsive card layout
    - _Requirements: 11.1, 11.2, 17.1_
  
  - [ ] 10.4 Create test progress card component
    - Create `components/participant/TestProgressCard.tsx` as client component
    - Query getTestProgress for registration
    - Display progress bar with percentage
    - Show completed/total question counts
    - Add Resume Test button linking to test page
    - _Requirements: 11.3, 6.5_
  
  - [ ]* 10.5 Write unit tests for dashboard components
    - Test registration card state rendering
    - Test progress calculation display
    - Test conditional CTA logic
    - _Requirements: 11.1, 11.2, 23.1_

- [ ] 11. Implement personality test interface
  - [ ] 11.1 Create test page with question display
    - Create `app/(participant)/test/[registrationId]/page.tsx` as client component
    - Query getActiveQuestions and getMyAnswers
    - Implement question navigation state (currentIndex)
    - Display question text in user's preferred language
    - Show question number (N of M)
    - _Requirements: 6.1, 6.5, 20.5_
  
  - [ ] 11.2 Create Likert scale answer component
    - Create `components/participant/LikertScale.tsx` as client component
    - Render 5-point scale (Strongly Disagree to Strongly Agree)
    - Implement radio button group with custom styling
    - Add visual feedback for selected answer
    - Ensure keyboard navigation support
    - _Requirements: 6.2, 18.2, 18.6_
  
  - [ ] 11.3 Implement answer submission logic
    - Add submitAnswer mutation call on answer selection
    - Update local state to reflect answered questions
    - Automatically advance to next question after submission
    - Handle submission errors with retry option
    - Persist answers immediately to backend
    - _Requirements: 6.2, 6.6, 22.1_
  
  - [ ] 11.4 Create test navigation controls
    - Add Previous button (disabled on first question)
    - Add Next button (auto-advances after answer)
    - Add Submit Test button (appears on last question when all answered)
    - Show progress indicator at top
    - Implement keyboard shortcuts (arrow keys)
    - _Requirements: 6.5, 18.2_
  
  - [ ] 11.5 Implement test completion and result calculation trigger
    - Detect when all questions are answered
    - Show completion confirmation modal
    - Call calculateResults mutation on submit
    - Redirect to results page after calculation
    - Handle calculation errors gracefully
    - _Requirements: 7.1, 7.4, 19.2_
  
  - [ ]* 11.6 Write integration tests for test administration
    - Test question display and navigation
    - Test answer submission and persistence
    - Test test completion flow
    - _Requirements: 6.1, 6.2, 6.6, 23.2_

- [ ] 12. Build personality results display
  - [ ] 12.1 Create results page layout
    - Create `app/(participant)/results/[registrationId]/page.tsx` as server component
    - Query getMyResults with registration ID
    - Check if results exist, show "calculating" state if pending
    - Display results in bilingual format based on user preference
    - _Requirements: 8.2, 8.5, 20.5_
  
  - [ ] 12.2 Create OCEAN scores chart component
    - Create `components/participant/OceanScoresChart.tsx` as client component
    - Install and configure react-chartjs-2 for radar chart
    - Display 5-point radar chart with OCEAN dimensions
    - Add dimension labels in user's language
    - Add score tooltips on hover
    - Style chart with ocean theme colors
    - _Requirements: 8.1, 8.5_
  
  - [ ] 12.3 Create archetype display card
    - Create `components/participant/ArchetypeCard.tsx` as server component
    - Display archetype name in user's language
    - Show archetype description with rich formatting
    - List archetype traits as bullet points
    - Add archetype-specific visual styling or icon
    - _Requirements: 8.2, 8.4, 9.1_
  
  - [ ] 12.4 Create share results component
    - Create `components/participant/ShareButton.tsx` as client component
    - Add share button with social media options
    - Generate shareable link to results (privacy-respecting)
    - Copy link to clipboard functionality
    - Show success toast on share action
    - _Requirements: 8.2_
  
  - [ ]* 12.5 Write unit tests for results display
    - Test OCEAN chart rendering with sample data
    - Test archetype card with different archetypes
    - Test share functionality
    - _Requirements: 8.1, 8.2, 23.1_

- [ ] 13. Checkpoint - Verify participant features
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implement admin analytics dashboard
  - [ ] 14.1 Create admin dashboard layout
    - Create `app/(admin)/layout.tsx` with AdminAuthGuard
    - Add admin sidebar with navigation menu
    - Create breadcrumb component for navigation context
    - Set up admin route structure
    - _Requirements: 12.1, 12.2, 12.6_
  
  - [ ] 14.2 Create analytics overview page
    - Create `app/(admin)/analytics/page.tsx` as server component
    - Add event selector dropdown for filtering
    - Query analytics data for selected event
    - Display participant count summary
    - Show test completion statistics
    - _Requirements: 10.1, 10.3, 10.4_
  
  - [ ] 14.3 Create OCEAN distribution chart
    - Create `components/admin/OceanDistributionChart.tsx` as client component
    - Query aggregated OCEAN scores from analytics
    - Display bar chart showing score distributions per dimension
    - Add mean and median indicators
    - Implement responsive chart sizing
    - _Requirements: 10.1, 10.6_
  
  - [ ] 14.4 Create archetype frequency chart
    - Create `components/admin/ArchetypeFrequencyChart.tsx` as client component
    - Query archetype counts from analytics
    - Display pie or donut chart showing archetype distribution
    - Add percentage labels
    - Show absolute counts in tooltips
    - _Requirements: 10.2, 10.6_
  
  - [ ] 14.5 Implement real-time analytics updates
    - Use Convex subscriptions for live data updates
    - Update charts when new results are calculated
    - Add loading states during data fetching
    - Implement error boundaries for chart rendering failures
    - _Requirements: 10.5, 19.2_
  
  - [ ]* 14.6 Write integration tests for analytics
    - Test analytics data aggregation
    - Test chart rendering with sample data
    - Test event filtering
    - _Requirements: 10.1, 10.4, 23.2_

- [ ] 15. Implement admin question management
  - [ ] 15.1 Create questions list page
    - Create `app/(admin)/questions/page.tsx` as client component
    - Query all personality questions
    - Display questions in table format with orderIndex
    - Show question text preview in both languages
    - Add filter by OCEAN dimension
    - Add search functionality
    - _Requirements: 12.4, 5.1_
  
  - [ ] 15.2 Create question editor component
    - Create `components/admin/QuestionEditor.tsx` as client component
    - Create form with bilingual text inputs (English and Myanmar)
    - Add OCEAN dimension selector dropdown
    - Add scoring weight input (-2 to +2 range)
    - Add isActive toggle switch
    - Implement form validation before submission
    - _Requirements: 5.1, 5.2, 5.4, 19.1_
  
  - [ ] 15.3 Implement question CRUD operations
    - Add create question functionality with bilingual validation
    - Add update question functionality with audit logging
    - Add delete/deactivate question functionality
    - Call appropriate Convex mutations with error handling
    - Show success/error toasts after operations
    - _Requirements: 5.3, 5.4, 25.2_
  
  - [ ] 15.4 Create question reordering interface
    - Install drag-and-drop library: `npm install @dnd-kit/core @dnd-kit/sortable`
    - Implement drag-and-drop question reordering
    - Update orderIndex values on reorder
    - Call reorderQuestions mutation
    - Add visual drag indicators
    - _Requirements: 5.5_
  
  - [ ]* 15.5 Write unit tests for question management
    - Test bilingual validation
    - Test CRUD operations
    - Test reordering logic
    - _Requirements: 5.3, 5.4, 23.1_

- [ ] 16. Implement admin archetype management
  - [ ] 16.1 Create archetypes list page
    - Create `app/(admin)/archetypes/page.tsx` as client component
    - Query all archetypes
    - Display archetypes in card grid layout
    - Show archetype name and OCEAN range summary
    - Add active/inactive status indicators
    - Add default archetype badge
    - _Requirements: 9.1, 9.2, 9.5, 12.5_
  
  - [ ] 16.2 Create archetype editor component
    - Create `components/admin/ArchetypeEditor.tsx` as client component
    - Create form with bilingual name and description inputs
    - Add traits array input (add/remove traits)
    - Create OCEAN range sliders for each dimension (min/max pairs)
    - Add priority input for overlapping range handling
    - Add isDefault and isActive toggles
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 16.3 Implement archetype CRUD operations
    - Add create archetype functionality with bilingual validation
    - Add update archetype functionality
    - Add delete/deactivate archetype functionality
    - Validate OCEAN ranges (min < max, within 0-100)
    - Show success/error messages
    - _Requirements: 9.3, 12.5_
  
  - [ ] 16.4 Implement archetype preview and testing
    - Create preview component showing sample results with archetype
    - Add test scoring tool to check archetype assignment
    - Display matching participants for each archetype
    - Add visual OCEAN range visualizations
    - _Requirements: 9.2, 9.4_
  
  - [ ]* 16.5 Write unit tests for archetype management
    - Test OCEAN range validation
    - Test priority-based assignment
    - Test default fallback logic
    - _Requirements: 9.3, 9.4, 9.5, 23.1_

- [ ] 17. Implement admin registration management
  - [ ] 17.1 Create participant list page
    - Create `app/(admin)/participants/page.tsx` as client component
    - Query all participants with pagination
    - Display participants in table with email, name, registration counts
    - Add search by email or name
    - Add filter by role (participant/admin)
    - Show registration status indicators
    - _Requirements: 12.3, 13.2_
  
  - [ ] 17.2 Create participant detail page
    - Create `app/(admin)/participants/[id]/page.tsx` as server component
    - Display participant profile information
    - Show all registrations for participant
    - Display test results if available
    - Add action buttons for registration state changes
    - _Requirements: 12.3, 13.1, 15.3_
  
  - [ ] 17.3 Implement registration state transition controls
    - Create state transition buttons (Activate, Complete, Cancel)
    - Validate state transitions before calling mutation
    - Call updateRegistrationState mutation with admin authorization
    - Record action in audit log
    - Show confirmation dialog for destructive actions
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 25.1_
  
  - [ ] 17.4 Create registration management dashboard
    - Create `app/(admin)/registrations/page.tsx` as client component
    - Display all registrations with filtering by state and event
    - Add bulk state transition actions
    - Show test completion statistics
    - Add export functionality for registration data
    - _Requirements: 4.1, 4.6, 13.2_
  
  - [ ]* 17.5 Write integration tests for registration management
    - Test state transition validation
    - Test bulk operations
    - Test audit logging
    - _Requirements: 13.1, 13.6, 23.2, 25.1_

- [ ] 18. Implement winner management system
  - [ ] 18.1 Create winners list page
    - Create `app/(admin)/winners/page.tsx` as client component
    - Query all winners with participant details
    - Display winners in table with rank and category
    - Add filter by event
    - Show published status
    - _Requirements: 14.1, 14.2, 14.4_
  
  - [ ] 18.2 Create winner designation interface
    - Create `components/admin/WinnerDesignation.tsx` as client component
    - Add participant search/selector
    - Add category input field
    - Add rank input field
    - Add publish toggle
    - Call createWinner mutation with admin ID
    - _Requirements: 14.1, 14.2_
  
  - [ ] 18.3 Create public winner announcement page
    - Create `app/(public)/winners/page.tsx` as server component
    - Query published winners for current event
    - Display winners in ranked order with participant names
    - Add winner categories as section headers
    - Implement celebratory animations (confetti, sparkles)
    - _Requirements: 14.3, 14.4_
  
  - [ ] 18.4 Implement winner notification system (optional)
    - Add email notification configuration
    - Send congratulatory email to winner on designation
    - Add notification preferences to participant profile
    - _Requirements: 14.5_
  
  - [ ]* 18.5 Write unit tests for winner management
    - Test winner designation validation
    - Test published/unpublished filtering
    - Test ranking display
    - _Requirements: 14.1, 14.2, 23.1_

- [ ] 19. Checkpoint - Verify admin features
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 20. Implement comprehensive error handling
  - [ ] 20.1 Create error boundary components
    - Create `components/ErrorBoundary.tsx` for React error boundaries
    - Add fallback UI with error message and reset button
    - Implement error logging to console in development
    - Add different error boundaries for different route groups
    - _Requirements: 19.2, 19.6_
  
  - [ ] 20.2 Implement form validation utilities
    - Update `lib/utils/validators.ts` with email, password, text validators
    - Add bilingual text validator (both fields required)
    - Add OCEAN range validator (0-100, min < max)
    - Create FormError component for displaying field errors
    - _Requirements: 19.1, 19.3_
  
  - [ ] 20.3 Add global error handling for Convex mutations
    - Create error handling wrapper for Convex mutation calls
    - Display toast notifications for mutation errors
    - Implement retry logic for transient failures
    - Show user-friendly error messages (hide technical details)
    - _Requirements: 19.2, 19.3, 19.5_
  
  - [ ] 20.4 Implement session expiration handling
    - Detect authentication expiration in API calls
    - Show session expired modal with re-authenticate option
    - Preserve current route for redirect after re-authentication
    - _Requirements: 19.4, 26.3_
  
  - [ ]* 20.5 Write unit tests for error handling
    - Test form validation logic
    - Test error boundary rendering
    - Test error message display
    - _Requirements: 19.1, 19.2, 23.1_

- [ ] 21. Implement accessibility features
  - [ ] 21.1 Add semantic HTML and ARIA attributes
    - Audit all components for semantic HTML (header, nav, main, article, section)
    - Add proper heading hierarchy (h1 → h2 → h3)
    - Add ARIA labels to interactive elements
    - Add ARIA live regions for dynamic content (toast notifications, charts)
    - Add ARIA expanded/hidden states for dropdowns and modals
    - _Requirements: 18.1, 18.5_
  
  - [ ] 21.2 Implement keyboard navigation support
    - Ensure all interactive elements are keyboard accessible (tab navigation)
    - Add visible focus indicators with custom styling
    - Implement keyboard shortcuts for test navigation (arrow keys, Enter)
    - Add skip-to-content link for screen reader users
    - Test tab order throughout application
    - _Requirements: 18.2, 18.7_
  
  - [ ] 21.3 Add alternative text and image descriptions
    - Add alt text to all images (mascots, logos, decorative elements)
    - Use empty alt="" for purely decorative images
    - Add aria-label to icon buttons
    - Add figure captions where appropriate
    - _Requirements: 18.3_
  
  - [ ] 21.4 Verify color contrast ratios
    - Audit all text colors against backgrounds using contrast checker
    - Adjust colors to meet WCAG AA standards (4.5:1 for normal, 3:1 for large)
    - Test with browser high contrast mode
    - Add color-blind friendly alternatives for charts
    - _Requirements: 18.4_
  
  - [ ] 21.5 Implement comprehensive reduced-motion support
    - Verify all animations respect prefers-reduced-motion
    - Provide instant transitions as fallback
    - Test with reduced-motion enabled in OS settings
    - Add toggle in user preferences for animation control
    - _Requirements: 2.3, 18.6, 21.4_
  
  - [ ]* 21.6 Conduct accessibility audit with automated tools
    - Run axe DevTools on all major pages
    - Run Lighthouse accessibility audit
    - Test with screen reader (NVDA or JAWS)
    - Document remaining manual testing requirements
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

- [ ] 22. Optimize performance
  - [ ] 22.1 Implement code splitting and lazy loading
    - Use Next.js dynamic imports for heavy components (charts, animation libs)
    - Lazy load GSAP and ScrollTrigger on public pages only
    - Lazy load admin components on admin routes
    - Split dictionaries by page/feature
    - _Requirements: 16.2, 16.3_
  
  - [ ] 22.2 Optimize images and assets
    - Convert all images to Next.js Image component
    - Add proper width, height, and sizes attributes
    - Implement priority loading for above-fold images
    - Add lazy loading for below-fold images
    - Consider WebP format for better compression
    - _Requirements: 1.3, 16.3_
  
  - [ ] 22.3 Implement animation performance optimizations
    - Use will-change CSS property for animated elements
    - Force GPU acceleration with transform3d(0,0,0)
    - Reduce animation complexity on low-end devices
    - Debounce scroll event handlers
    - Clean up GSAP contexts on unmount
    - _Requirements: 2.5, 16.4, 17.6, 21.1, 21.2_
  
  - [ ] 22.4 Add caching strategies
    - Configure Next.js caching for static pages
    - Use Convex query caching for frequently accessed data
    - Implement stale-while-revalidate for analytics
    - Add service worker for offline support (optional)
    - _Requirements: 16.5_
  
  - [ ] 22.5 Implement performance monitoring
    - Add Web Vitals tracking (LCP, FID, CLS)
    - Monitor animation frame rates in development
    - Add performance marks for key user interactions
    - Set up Lighthouse CI for automated performance checks
    - _Requirements: 21.1, 21.3, 21.5_
  
  - [ ]* 22.6 Run Lighthouse performance audit
    - Achieve score >80 on desktop, >70 on mobile
    - Fix critical performance issues
    - Document optimization recommendations
    - _Requirements: 16.1, 16.6_

- [ ] 23. Implement security hardening
  - [ ] 23.1 Add Content Security Policy headers
    - Configure CSP headers in next.config.ts
    - Restrict script sources to self and trusted CDNs
    - Restrict style sources appropriately
    - Add nonce support for inline scripts if needed
    - _Requirements: 29.3_
  
  - [ ] 23.2 Implement input sanitization
    - Add HTML sanitization for user-generated content
    - Escape special characters in all user inputs
    - Validate and sanitize on backend before storage
    - Use parameterized queries in Convex (built-in protection)
    - _Requirements: 29.1, 29.2, 29.4_
  
  - [ ] 23.3 Add rate limiting for authentication
    - Implement rate limiting in Convex auth mutations
    - Limit failed login attempts per IP/email
    - Add CAPTCHA for repeated failures (optional)
    - Log suspicious authentication patterns
    - _Requirements: 26.5_
  
  - [ ] 23.4 Configure secure session cookies
    - Set httpOnly, secure, and sameSite flags on cookies
    - Implement session timeout enforcement
    - Add CSRF token validation
    - Test session security in different scenarios
    - _Requirements: 26.1, 26.2, 26.3_
  
  - [ ] 23.5 Implement audit logging for sensitive actions
    - Verify audit log creation for all admin actions
    - Add IP address and user agent to audit records
    - Create audit log viewer for admins
    - Implement log retention policy
    - _Requirements: 25.1, 25.2, 25.3, 25.4, 25.5_
  
  - [ ]* 23.6 Conduct security review and testing
    - Test for XSS vulnerabilities
    - Test for SQL injection (N/A with Convex, verify)
    - Test authentication bypass attempts
    - Test authorization boundary violations
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 26.4, 29.1, 29.2_

- [ ] 24. Implement responsive design refinements
  - [ ] 24.1 Audit and fix mobile layouts
    - Test all pages on mobile viewport (320px - 767px)
    - Fix any horizontal scrolling issues
    - Ensure touch targets are minimum 44x44px
    - Test hamburger menu functionality
    - Verify text readability at small sizes
    - _Requirements: 17.1, 17.4_
  
  - [ ] 24.2 Audit and fix tablet layouts
    - Test all pages on tablet viewport (768px - 1023px)
    - Adjust grid layouts for optimal use of space
    - Test landscape and portrait orientations
    - Verify navigation usability
    - _Requirements: 17.2_
  
  - [ ] 24.3 Audit and fix desktop layouts
    - Test all pages on desktop viewport (1024px+)
    - Test ultra-wide screens (2560px+)
    - Ensure content doesn't stretch too wide (max-width constraints)
    - Verify all animations work smoothly
    - _Requirements: 17.3_
  
  - [ ] 24.4 Test text reflow and zoom support
    - Test zoom levels up to 200% on all pages
    - Verify no horizontal scrolling at zoom
    - Test text scaling in browser settings
    - Ensure all content remains accessible
    - _Requirements: 17.5_
  
  - [ ] 24.5 Implement adaptive animation complexity
    - Detect device capabilities (GPU, CPU)
    - Reduce animation complexity on low-end devices
    - Disable parallax effects on mobile for performance
    - Test on various device tiers
    - _Requirements: 17.6, 21.2_

- [ ] 25. Implement graceful degradation and fallbacks
  - [ ] 25.1 Add JavaScript disabled fallback
    - Test core functionality with JavaScript disabled
    - Ensure authentication forms work without JS
    - Display static content as fallback
    - Add <noscript> messages where appropriate
    - _Requirements: 28.3_
  
  - [ ] 25.2 Implement browser compatibility detection
    - Detect unsupported browsers (>3 years old)
    - Show compatibility warning banner
    - Provide download links to modern browsers
    - Gracefully handle missing browser APIs
    - _Requirements: 28.5_
  
  - [ ] 25.3 Add fallback UI for unsupported features
    - Provide static images when animations fail
    - Use standard selects when custom dropdowns fail
    - Fallback to simple layouts when modern CSS unavailable
    - Test in older browsers (last 2 versions of major browsers)
    - _Requirements: 28.1, 28.2, 28.4_
  
  - [ ]* 25.4 Test graceful degradation scenarios
    - Test with slow network (3G)
    - Test with JavaScript disabled
    - Test on older browsers
    - Document known limitations
    - _Requirements: 28.1, 28.2, 28.3, 28.4, 28.5_

- [ ] 26. Implement deployment configuration
  - [ ] 26.1 Configure environment variables
    - Create `.env.example` with all required variables
    - Document environment variables in README
    - Set up development, staging, and production configs
    - Add validation for required environment variables at startup
    - _Requirements: 27.1, 27.2, 27.3, 27.5_
  
  - [ ] 26.2 Set up Convex deployment
    - Configure Convex production deployment
    - Set up environment-specific Convex projects
    - Configure OAuth credentials for production
    - Test production Convex functions
    - _Requirements: 27.1, 30.1_
  
  - [ ] 26.3 Configure Next.js production build
    - Optimize next.config.ts for production
    - Add compression and minification settings
    - Configure static optimization
    - Test production build locally
    - _Requirements: 27.1, 30.1_
  
  - [ ] 26.4 Implement health check endpoint
    - Create `/api/health` route handler
    - Return system status and uptime
    - Check database connectivity
    - Add version information
    - _Requirements: 30.2_
  
  - [ ] 26.5 Set up error logging and monitoring
    - Configure error logging service (Sentry or similar)
    - Add error tracking to client and server
    - Set up alert notifications for critical errors
    - Configure performance monitoring
    - _Requirements: 19.6, 30.3, 30.4, 30.5_
  
  - [ ]* 26.6 Create deployment documentation
    - Document deployment steps
    - Create CI/CD pipeline configuration
    - Document rollback procedures
    - Create monitoring runbook
    - _Requirements: 30.1_

- [ ] 27. Comprehensive testing and QA
  - [ ] 27.1 Write unit tests for business logic
    - Test OCEAN scoring calculation
    - Test archetype assignment logic
    - Test validation functions
    - Test utility functions
    - Achieve 80% code coverage for critical paths
    - _Requirements: 23.1, 23.4_
  
  - [ ]* 27.2 Write property-based tests for scoring invariants
    - **Property 2: Scoring consistency**
    - **Validates: Requirements 7.1, 22.3**
    - Test that same answers always produce same scores
    - Test that scores are deterministic
  
  - [ ]* 27.3 Write integration tests for user workflows
    - Test complete registration → test → results flow
    - Test admin question management workflow
    - Test authentication and authorization
    - Test state transitions
    - _Requirements: 23.2_
  
  - [ ]* 27.4 Write E2E tests for critical user journeys
    - Install Playwright: `npm install -D @playwright/test`
    - Test user signup and login flow
    - Test personality test completion
    - Test results viewing
    - Test admin dashboard access
    - _Requirements: 23.5_
  
  - [ ] 27.5 Conduct manual QA testing
    - Test all features on multiple browsers (Chrome, Firefox, Safari, Edge)
    - Test on multiple devices (mobile, tablet, desktop)
    - Test with different screen readers
    - Test with keyboard-only navigation
    - Test all language switching scenarios
    - Verify mascot animations match design specs
    - _Requirements: 1.1, 2.2, 18.7, 24.1, 24.2, 24.3, 24.4_

- [ ] 28. Final polish and optimization
  - [ ] 28.1 Review and refine animations
    - Fine-tune animation timings and easing
    - Ensure mascot animations feel natural
    - Polish micro-interactions (hover, focus states)
    - Add delightful loading states
    - _Requirements: 2.5, 24.5_
  
  - [ ] 28.2 Review and improve copy and translations
    - Audit all English content for clarity
    - Verify all Myanmar translations are accurate
    - Ensure consistent terminology across platform
    - Add helpful tooltips and hints
    - _Requirements: 1.2, 20.4_
  
  - [ ] 28.3 Optimize database queries and indexes
    - Review Convex query performance
    - Add missing indexes for common queries
    - Optimize analytics aggregation queries
    - Test query performance under load
    - _Requirements: 22.3, 22.4_
  
  - [ ] 28.4 Final accessibility review
    - Run final accessibility audit
    - Fix any remaining accessibility issues
    - Document manual accessibility testing steps
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_
  
  - [ ] 28.5 Final security review
    - Review all authorization rules
    - Verify input sanitization throughout
    - Check for sensitive data exposure
    - Review audit logging completeness
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 29.1, 29.2, 29.3, 29.4_
  
  - [ ] 28.6 Create user documentation
    - Write participant guide (how to take test, view results)
    - Write admin guide (managing questions, archetypes, winners)
    - Create troubleshooting FAQ
    - Document browser requirements
    - _Requirements: 28.5_

- [ ] 29. Final checkpoint - Production readiness verification
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 30. Buildathon Role Discovery & Registration — New Feature (Buildathon Role Discovery & Registration — Feature Brief)
  - [ ] 30.1 Extend Convex schema for Buildathon ecosystem
    - Update `convex/schema.ts` — add `buildathonRoles` table (category enum `product/design/engineering/data/business/team`, nameEn/My, descriptionEn/My, traits, `isActive`, `priority`) per `New Feature:9`
    - Add `roleDiscoveryQuestions` table (`category`, `type: single|multiple|scenario|scale`, `textEn/textMy`, `options: {id,labelEn,labelMy}[]`, `required`, `scoringSignals: {roleId, weight}[]`, `order`, `isActive`, `version`) + indexes `by_active, by_category, by_version, by_order` per `New Feature:6/7`
    - Add `buildathonRegistrations` table (`participantId`, `basicInfo: {name,email,phone,university,occupation,experienceLevel,currentProfession}`, `interests:string[]`, `skills:string[]`, `preferences:{teamSize,theme}`, `state: draft|assessment|recommended|role_selected|submitted`, `selectedRoleId?`, `assessmentVersion`, `createdAt/updatedAt`) — keep `currentProfession` vs `selectedRoleId` vs `interests` separate per `New Feature:4`, add `by_participant`, `by_state`, `by_selectedRole`
    - Add `roleDiscoveryAnswers` table (`registrationId`, `questionId`, `optionIds:string[]`, `isNotSure:boolean`, `answeredAt`, `responseMs?`) + indexes `by_registration`, `by_registration_and_question`
    - Add `roleRecommendations` table (`registrationId`, `rankedRoles: {roleId, affinity:0-100, explanationEn/My}[] (top3)`, `confidence: high|moderate|low`, `confidenceScore`, `assessmentVersion`, `calculatedAt`) + index `by_registration`
    - Add `assessmentVersions` table (`version:string v1/v2`, `questionIds`, `createdAt`, `isActive`) per `New Feature:15` for reproducibility
    - Define all indexes; bilingual fields never affect scoring per `New Feature:16`
    - _Requirements: New Feature 4,6,9,14,15,16_

  - [ ] 30.2 Implement role discovery question engine (admin CRUD, no full form builder v1)
    - Create `convex/roleDiscoveryQuestions.ts` — `getActiveQuestions(version?)` shuffles `options` positions server-side while preserving `option.id` → `scoringSignals` identity per `New Feature:8`, `getQuestionById (admin)`, `createQuestion`/`updateQuestion` with bilingual `EN+MY` required validation + `scoringSignals` (hidden weights `+3/+2/+1`) validation, soft-delete `isActive:false`, `reorderQuestions` (order), `getQuestionsByVersion`, `listQuestions` with `by_category` filter
    - Seed `convex/seedRoleDiscovery.ts` — 20–30 casual scenario questions (`New Feature:5/6`) e.g. “Your team has three ideas but time for one…” with 4–5 shuffled options → Research/Product/Design/Engineering/Planning signals, include `I'm not sure yet` option where appropriate `New Feature:13`
    - Add auditLog on create/update/reorder per existing pattern `convex/personalityTest.ts`
    - _Requirements: New Feature 5,6,7,8,13,16_

  - [ ] 30.3 Implement hidden role-affinity scoring + confidence
    - Create `lib/scoring/roleAffinity.ts` — `calculateRoleAffinity(answers, questions, roles) => Map<roleId, raw>` sums `scoringSignals.weight` per selected `optionIds`; normalize to 0-100 affinity; `rankRoles` returns top3 with `explanationEn/My` per role (“You seem to enjoy understanding problems…” `New Feature:10`); `calculateConfidence` uses randomized positions (already), cross-perspective consistency, `isNotSure` rate, response timing `responseMs` per `New Feature:12` → `high|moderate|low` + score
    - Create `convex/roleDiscoveryResults.ts` — `calculateRecommendations(registrationId)` tx: fetch `roleDiscoveryAnswers` → `roleAffinity` → `confidence` → insert `roleRecommendations` with `assessmentVersion`, idempotent, never expose raw scores per `New Feature:8`
    - Add `getMyRecommendations`, `getRecommendationsByRegistration (participant/admin)`, `getAllRoleDistribution` for analytics
    - _Requirements: New Feature 8,10,12_

  - [ ] 30.4 Implement multi-step Buildathon registration backend
    - Create `convex/buildathonRegistrations.ts` — `createDraft(participantId, version)` (state `draft`), `updateBasicInfo`/`updateBackground`/`updateInterests`/`updatePreferences` with validation (`email/phone/university/occupation/experienceLevel` `New Feature:4`), `submitAnswers` (calls `roleDiscoveryAnswers` insert with duplicate + `isNotSure` handling), `getMyBuildathonRegistration`, `getRegistrationProgress` ( `Basic→Background→Interests→Assessment→Recommended→Choose→Preferences→Review→Submit` `New Feature:3` counts), `confirmRoleSelection(registrationId, selectedRoleId|"Other")` validates participant ownership, never overwrites assessment automatically per `New Feature:4:107`, `submitRegistration` (state `submitted`), `getRegistrationWithRecommendations` join
    - State machine `draft → assessment → recommended → role_selected → submitted`, separate `Registration` vs `Assessment` concepts per `New Feature:14`
    - Add bilingual `preferredLanguage` handling (scores identical regardless of `EN/MY` `New Feature:16`)
    - _Requirements: New Feature 3,4,11,14,16_

  - [ ] 30.5 Build participant multi-step registration UI
    - Create `app/(participant)/buildathon/register/page.tsx` client — stepper `Basic → Background → Interests & Skills → Role Discovery Assessment → Recommended Roles → Choose Role → Preferences → Review → Submit` with progress bar per `New Feature:3:68`
    - Components `components/participant/buildathon/StepProgress.tsx`, `BasicInfoStep.tsx`, `BackgroundStep.tsx`, `InterestsStep.tsx` (chips for `Skills/Interests` `New Feature:4`), `AssessmentStep.tsx` (renders `single|multiple|scenario|scale`, shuffled options, `I'm not sure yet` `New Feature:13`, casual conversational copy `New Feature:5`), `RecommendedRolesCard.tsx` (🥇92% 🥈84% 🥉78% + “These are possibilities, not labels.” `New Feature:10`), `RoleChoiceStep.tsx` (`[Product Manager][UX Researcher][Other]` participant decides `New Feature:11:331`), `BuildathonPreferencesStep.tsx`, `ReviewStep.tsx`
    - Integrate `FloatingBubbles` for ocean feel, `gsap` transitions, `lib/i18n` bilingual `EN/MY`, `useMyBuildathonRegistration` Convex subscription
    - Enforce “Let the participant decide” — recommendation never auto-fills `selectedRoleId`
    - _Requirements: New Feature 3,4,5,11,16,20_

  - [ ] 30.6 Extend participant dashboard
    - Update `app/(participant)/dashboard/page.tsx` — add `My Event` card: `Registration Status/Profile/Interests/Skills/Role Discovery Result/Recommended Roles/Selected Buildathon Role/Team/Event Schedule` per `New Feature:17`
    - Create `components/participant/MyBuildathonCard.tsx` — shows `Current Profession: Frontend Developer | Interests: AI/Product | Assessment: PM/UX Researcher | Selected: Product Manager` example `New Feature:4:89`
    - Add `Your Team` placeholder (`Product Manager / UI-UX / Frontend / Backend / AI Engineer` `New Feature:17:482`) pool from `selectedRoleId` for future team formation `New Feature:19` (no auto-assign v1)
    - _Requirements: New Feature 4,17,19_

  - [ ] 30.7 Build admin role & question management
    - Create `app/(admin)/role-discovery/questions/page.tsx` — table `by_order`, preview EN/MY, filter `by_category`, search, drag reorder via `@dnd-kit` (reuse `tasks.md:15.4` pattern), toggle `isActive`
    - `components/admin/RoleQuestionEditor.tsx` — bilingual `textEn/textMy`, `category`, `type`, dynamic `options` (add/remove, `I'm not sure` toggle), `scoringSignals` (role→weight matrix hidden), `required/order`
    - Create `app/(admin)/roles/page.tsx` + `components/admin/RoleEditor.tsx` — `nameEn/My`, `descriptionEn/My`, `category`, `traits`, `isActive/priority` per `New Feature:9:234`; CRUD `convex/buildathonRoles.ts` with validation, seed initial 12-15 roles extensible to full 20+ ecosystem
    - Add `assessmentVersions` admin view (v1 active, v2 draft, questionIds snapshot) for reproducibility `New Feature:15:426`
    - _Requirements: New Feature 6,7,9,15_

  - [ ] 30.8 Build admin Buildathon analytics
    - Create `app/(admin)/analytics/buildathon/page.tsx` — cards: `Total participants / completion / by_state / by_experience / by_occupation` `New Feature:18:503`, `interest / skill / tech distribution` (bar), `role discovery` section:
      - `Recommended role distribution` vs `Selected role distribution` (paired bar `Recommended PM 28% vs Selected 21%` `New Feature:18:525`)
      - `Recommendation vs Selected cross-tab`,
      - `Confidence distribution` `high|moderate|low` `New Feature:12:353`
    - Components `components/admin/BuildathonRoleChart.tsx`, `RecommendedVsSelectedChart.tsx`, `ConfidenceChart.tsx` via `Chart.js` (already `package.json:16`)
    - Convex `convex/buildathonAnalytics.ts` — `getRegistrationStats`, `getInterestDistribution`, `getRoleRecommendationDistribution(version)`, `getRoleSelectedDistribution`, `getConfidenceDistribution` — live subscriptions
    - _Requirements: New Feature 18_

  - [ ] 30.9 Tests, bilingual QA & versioning
    - Property test `affinity 0-100`, shuffle invariant (same `option.id` scores irrespective of position `New Feature:8`), `isNotSure` doesn't invalidate `New Feature:12:340`, `selectedRoleId` never overwritten `New Feature:4`
    - Unit: `assign` top3 + explanations, `confidence` thresholds, bilingual `EN/MY` same `roleRecommendations` per `New Feature:16`
    - Seed + manual QA: casual tone `New Feature:5:127` (“What would you naturally want to do?” not “How good are you at leadership?”), confidence `High/Moderate` without marking failure `New Feature:12:370`
    - _Requirements: New Feature 5,8,12,16,20_

## Notes

### Implementation Strategy

This plan follows a **foundation-first, feature-by-feature** approach:

1. **Phases 1-2**: Establish backend and frontend infrastructure
2. **Phases 3-8**: Build public website with animations (user-facing experience)
3. **Phases 9-13**: Implement participant features (authentication → dashboard → test → results)
4. **Phases 14-19**: Build admin features (analytics → questions → archetypes → registrations → winners)
5. **Phases 20-29**: Production hardening (error handling, accessibility, performance, security, testing)

### Task Marking Conventions

- **Core implementation tasks**: Must be completed for MVP
- **Tasks marked with `*`**: Optional test-related sub-tasks that can be skipped for faster delivery
- **Checkpoint tasks**: Natural pause points to verify functionality before continuing

### Technology Decisions

- **TypeScript** throughout for type safety
- **Convex** eliminates need for REST API layer
- **GSAP** for complex animations, CSS transitions for simple ones
- **Custom i18n context** instead of route-based locale switching
- **Chart.js** for data visualization in results and analytics

### Requirements Traceability

Each task explicitly references requirements from the requirements document (e.g., _Requirements: 1.1, 1.2_) to ensure complete coverage. All 30 requirements are addressed across the implementation phases.

### Parallel Execution Opportunities

Tasks within the same phase often have minimal dependencies and can be worked on in parallel by different developers or sequentially by AI agents. The dependency graph below identifies safe parallel execution waves.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4", "1.5"] },
    { "id": 2, "tasks": ["1.6", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "2.5"] },
    { "id": 4, "tasks": ["3.1"] },
    { "id": 5, "tasks": ["3.2", "3.3"] },
    { "id": 6, "tasks": ["3.4", "3.5", "3.6"] },
    { "id": 7, "tasks": ["4.1", "4.2", "4.3"] },
    { "id": 8, "tasks": ["4.4", "5.1"] },
    { "id": 9, "tasks": ["5.2", "5.3"] },
    { "id": 10, "tasks": ["5.4"] },
    { "id": 11, "tasks": ["5.5", "6.1"] },
    { "id": 12, "tasks": ["6.2", "6.3"] },
    { "id": 13, "tasks": ["6.4", "6.5"] },
    { "id": 14, "tasks": ["7.1"] },
    { "id": 15, "tasks": ["7.2", "7.3"] },
    { "id": 16, "tasks": ["7.4"] },
    { "id": 17, "tasks": ["9.1", "9.2"] },
    { "id": 18, "tasks": ["9.3", "9.4"] },
    { "id": 19, "tasks": ["9.5", "9.6"] },
    { "id": 20, "tasks": ["10.1"] },
    { "id": 21, "tasks": ["10.2", "10.3", "10.4"] },
    { "id": 22, "tasks": ["10.5", "11.1"] },
    { "id": 23, "tasks": ["11.2", "11.3"] },
    { "id": 24, "tasks": ["11.4"] },
    { "id": 25, "tasks": ["11.5", "11.6"] },
    { "id": 26, "tasks": ["12.1"] },
    { "id": 27, "tasks": ["12.2", "12.3"] },
    { "id": 28, "tasks": ["12.4", "12.5"] },
    { "id": 29, "tasks": ["14.1"] },
    { "id": 30, "tasks": ["14.2", "14.3", "14.4"] },
    { "id": 31, "tasks": ["14.5", "14.6"] },
    { "id": 32, "tasks": ["15.1"] },
    { "id": 33, "tasks": ["15.2"] },
    { "id": 34, "tasks": ["15.3"] },
    { "id": 35, "tasks": ["15.4", "15.5"] },
    { "id": 36, "tasks": ["16.1"] },
    { "id": 37, "tasks": ["16.2"] },
    { "id": 38, "tasks": ["16.3"] },
    { "id": 39, "tasks": ["16.4", "16.5"] },
    { "id": 40, "tasks": ["17.1"] },
    { "id": 41, "tasks": ["17.2"] },
    { "id": 42, "tasks": ["17.3"] },
    { "id": 43, "tasks": ["17.4", "17.5"] },
    { "id": 44, "tasks": ["18.1"] },
    { "id": 45, "tasks": ["18.2"] },
    { "id": 46, "tasks": ["18.3", "18.4"] },
    { "id": 47, "tasks": ["18.5"] },
    { "id": 48, "tasks": ["20.1", "20.2"] },
    { "id": 49, "tasks": ["20.3", "20.4"] },
    { "id": 50, "tasks": ["20.5", "21.1", "21.2", "21.3"] },
    { "id": 51, "tasks": ["21.4", "21.5"] },
    { "id": 52, "tasks": ["21.6", "22.1", "22.2"] },
    { "id": 53, "tasks": ["22.3", "22.4"] },
    { "id": 54, "tasks": ["22.5", "22.6"] },
    { "id": 55, "tasks": ["23.1", "23.2", "23.3"] },
    { "id": 56, "tasks": ["23.4", "23.5"] },
    { "id": 57, "tasks": ["23.6", "24.1", "24.2", "24.3"] },
    { "id": 58, "tasks": ["24.4", "24.5"] },
    { "id": 59, "tasks": ["25.1", "25.2", "25.3"] },
    { "id": 60, "tasks": ["25.4", "26.1", "26.2"] },
    { "id": 61, "tasks": ["26.3", "26.4", "26.5"] },
    { "id": 62, "tasks": ["26.6", "27.1"] },
    { "id": 63, "tasks": ["27.2", "27.3"] },
    { "id": 64, "tasks": ["27.4"] },
    { "id": 65, "tasks": ["27.5", "28.1", "28.2"] },
    { "id": 66, "tasks": ["28.3", "28.4", "28.5"] },
    { "id": 67, "tasks": ["28.6"] },
    { "id": 68, "tasks": ["30.1"] },
    { "id": 69, "tasks": ["30.2", "30.3"] },
    { "id": 70, "tasks": ["30.4"] },
    { "id": 71, "tasks": ["30.5"] },
    { "id": 72, "tasks": ["30.6", "30.7"] },
    { "id": 73, "tasks": ["30.8"] },
    { "id": 74, "tasks": ["30.9"] }
  ]
}
```
