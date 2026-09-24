# AI Ocean Interactive Comic

An interactive scroll-driven comic experience built with **GSAP + ScrollTrigger**.

## ✅ Implemented Scenes

### Intro Scene
- Event title centered with dramatic styling
- Five mascot characters positioned around edges
- Beach background with beach sound ambience
- Scroll indicator animation
- Smooth GSAP-driven exit animations when scrolling

### Scene 1 — Calm Morning
- Beach background with parallax cloud layer
- Two narration sequences with typing animation
- Five characters enter sequentially (Turty, Sharky, Otto, Crabbi, Croco)
- Camera subtly pans when characters enter from sides
- Comic-style dialogue boxes with character names
- Coordinated entrance + dialogue + camera timeline
- Group scene transition at the end

## 🎨 Features

- **One Sacred Timeline**: Master timeline controls the entire comic flow
- **Audio System**: Reusable AudioController with fade transitions
- **Comic UI**: Custom DialogueBox and NarrationBox components
- **Responsive**: Adapts to different screen sizes
- **Performance**: Uses GSAP refs, avoids excessive React re-renders
- **Accessibility**: Respects `prefers-reduced-motion`

## 🗂️ Structure

```
app/comic/
├── page.tsx                 # Main comic page with master timeline
└── layout.tsx               # Comic-specific layout

components/comic/
├── IntroScene.tsx           # Intro scene with title and characters
├── Scene1.tsx               # Scene 1 with narration and dialogue
├── DialogueBox.tsx          # Reusable dialogue bubble component
├── NarrationBox.tsx         # Reusable narration component
└── README.md                # This file

lib/comic/
└── audioController.ts       # Audio management system

public/assets/
├── comic/
│   ├── Background Scenes/   # All background images
│   └── Sound Effects/       # All audio files
└── Mascots/                 # Character images
```

## 🎵 Audio System

The `AudioController` class handles all audio:

- **Preloads** all sound effects
- **Fade in/out** with GSAP
- **Crossfade** between scenes
- **Respects** browser autoplay restrictions
- **Reuses** audio instances for performance

### Available Sounds
- `beach` - Beach ambience (loop)
- `roughSea` - Rough sea ambience (loop)
- `stormyNight` - Stormy night ambience (loop)
- `typing` - Text typing effect
- `characterEntrance` - Character appearance
- `dialogue` - Dialogue text reveal
- `glowing` - Glowing energy effect

## 🎬 Animation Approach

### Master Timeline
The comic uses one master ScrollTrigger timeline that controls all scenes:

```tsx
const masterTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: containerRef.current,
    start: "top top",
    end: "bottom bottom",
    scrub: 1,
  },
});
```

### Scene Timelines
Each scene has its own pinned ScrollTrigger timeline:

```tsx
const sceneTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: sceneRef.current,
    start: "top top",
    end: "+=400%",  // Scene duration
    pin: true,
    scrub: 1,
  },
});
```

### Camera Movement
Subtle camera pans are achieved by transforming the background:

```tsx
gsap.to(backgroundRef.current, {
  x: cameraShift,
  duration: 1,
  ease: "power1.inOut",
});
```

## 🚀 Next Steps

The following scenes are ready to be implemented:

- **Scene 2** — Changing Sky (evening atmosphere)
- **Scene 3** — Stormy Night (glowing wave reveal)
- **Scene 4** — Different Morning (new energy in water)
- **Scene 5** — Riding the New Wave (horizontal scroll section)
- **Scene 6** — Swimming End (group arrives)
- **Scene 7** — Final Island (cinematic zoom-out)

## 📱 Responsive Behavior

- Characters scale appropriately on mobile
- Dialogue boxes reposition for smaller screens
- Camera movements are subtler on mobile
- ScrollTrigger recalculates on resize

## 🎯 Performance Optimizations

- ✅ Uses `gsap.context()` for proper cleanup
- ✅ Refs for GSAP targets (no React state for animation values)
- ✅ Transforms instead of layout properties
- ✅ Audio instances reused, not recreated
- ✅ Images optimized with Next.js Image component
- ✅ ScrollTriggers killed on unmount

## 🛠️ Development

Visit `/comic` to see the interactive comic experience.

The comic starts with the Intro scene, transitions into Scene 1, and currently shows a placeholder for upcoming scenes.

### Adding New Scenes

1. Create scene component in `components/comic/SceneX.tsx`
2. Add ScrollTrigger timeline with `pin: true`
3. Import and place in `app/comic/page.tsx`
4. Coordinate audio with `audioController`
5. Use transform-based animations for performance

## 🎨 Styling

The comic uses the project's existing design system:

- **Fonts**: Syncopate (headings), Quicksand (body), Syne (alt headings)
- **Colors**: Ocean blues, vibrant accents
- **Shadows**: Comic-style shadows from globals.css
- **Animations**: GSAP timelines (not CSS animations)
