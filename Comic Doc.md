Build an interactive, scroll-driven comic experience using **GSAP + ScrollTrigger**.

The project already has all required visual and audio assets:

* Beach backgrounds
* Storm/night backgrounds
* Swimming background
* Final island background
* All five mascot character assets:

  * Sharky
  * Croco
  * Crabbi
  * Otto
  * Turty
* Beach, ocean, storm, typing, character entrance, dialogue, glowing, and other required sound effects

**Do NOT generate, replace, redesign, or recreate any visual assets. Use the existing assets exactly as provided.**

The goal is to create a cinematic, interactive comic where the user progresses through the story by scrolling.

Use **GSAP and ScrollTrigger** as the primary animation system.

The experience should feel like an interactive web comic rather than a collection of normal sections.

---

# Global Animation Requirements

Use GSAP timelines and ScrollTrigger for the entire comic.

Important requirements:

* Smooth scrolling-driven animation
* Pin important scenes when necessary
* Use scrub-based animations where appropriate
* Use GSAP timelines for coordinated animations
* Use `gsap.context()` for React cleanup
* Properly kill/revert ScrollTriggers when components unmount
* Avoid unnecessary React state updates for animation values
* Prefer refs and GSAP over React state for continuously animated properties
* Animations must remain responsive
* Do not recreate ScrollTriggers unnecessarily
* Respect `prefers-reduced-motion`
* Avoid excessive DOM nodes
* Optimize for desktop and mobile
* Do not introduce a different animation library

Use the existing asset dimensions/aspect ratios.

---

# Scene Structure

Create the comic as a sequence of scroll-controlled scenes:

1. Intro
2. Scene 1 — Calm Morning
3. Scene 2 — Changing Sky
4. Scene 3 — Strange Wave
5. Scene 4 — Different Morning
6. Scene 5 — Riding the New Wave
7. Scene 6 — Further Than Before
8. Scene 7 — Final Island

Each scene should have its own GSAP timeline where practical, while a parent comic timeline/scroll structure controls progression between scenes.

---

# INTRO

Display the event title in the center of the screen.

Use the existing beach background.

The five mascot characters should initially be partially visible around the edges of the viewport.

The beach sound effect should begin for the scene.

Add a scroll indicator around the edge of the scene telling the user to continue scrolling.

When the user scrolls:

1. Characters smoothly ease out of the viewport.
2. Event title gradually fades out.
3. The scroll indicator fades away.
4. The scene transitions naturally into Scene 1.

Use GSAP easing rather than abrupt position changes.

---

# REUSABLE BEACH BACKGROUND

The existing beach background will be reused across multiple scenes.

The background is intentionally wider than the viewport.

Use the wider background to create horizontal movement/parallax.

The sky and cloud layers should be independently controllable.

If the existing assets are already separated into layers, animate them independently.

Cloud movement should be subtle and continuous.

The background should be positioned so that horizontal camera movement feels immersive when the viewport moves left and right.

Do not stretch the background unnaturally.

Use `object-fit`, transforms, or another appropriate approach depending on the existing asset structure.

---

# SCENE 1 — Calm Morning

Start with only the beach background visible.

No characters should be visible initially.

A narration text box should appear from underneath the viewport.

Display:

"You wake to another calm morning on Cambio Island. The ocean is quiet, and the waves roll in as gently as they always have."

Then display:

"But there's one thing everyone here knows: nothing in this ocean stays the same forever. The water rises. Islands slowly sink beneath the waves. That's why no one stays in one place too long. Sooner or later, you swim on."

The text should appear with a typing-style animation.

Play the existing typing sound effect while the text is being revealed.

After the narration:

### Turty

Turty enters from the right.

Dialogue:

"Ahh… what a perfect day for a cool coconut."

Play the character entrance sound when Turty enters.

Play the dialogue/chat sound effect while the dialogue appears.

### Sharky

Sharky enters from the right.

Dialogue:

"How can you all just relax? Look, the next island's already in sight!"

Use the same character entrance/dialogue behavior.

### Otto

Otto enters from the right.

Dialogue:

"The island's not going anywhere, Sharky. …Wait, what are you doing, Crabbi?"

### Crabbi

Crabbi enters from the left.

Dialogue:

"Just a little more sand… right here."

### Croco

Croco enters from the left.

Dialogue:

"Back in the river, I never got waves like this!"

---

# SCENE 1 — Camera Movement

Whenever a character enters:

* If the character enters from the right, subtly sway/pan the camera toward the right.
* If the character enters from the left, subtly sway/pan the camera toward the left.
* Return the camera smoothly toward the center afterward.

The camera movement should be subtle.

Do not make the user feel dizzy.

The character entrance and camera movement should be coordinated in the same GSAP timeline.

---

# SCENE 1 — Group Transition

After all five characters have entered:

Show all characters together in the scene.

Then transition toward Scene 2.

Keep the same beach background.

The transition should primarily affect the sky and cloud layers.

The clouds and sky should move slightly faster than the rest of the environment to create a subtle time-passing effect.

Do not hard-cut between the scenes.

---

# SCENE 2 — Changing Sky

Use the existing beach background.

Gradually change the atmosphere toward a brownish evening sky.

Do not replace the entire background if the existing sky layer can be animated.

Animate the sky color/opacity and other available layers using GSAP.

Narration:

"The day passes, quiet as any other. But by evening, the sky and the sea begin to change."

Use the typing sound effect.

Gradually introduce the rough-sea sound effect.

The ocean should visually feel more active than Scene 1.

---

# SCENE 3 — Stormy Night

Transition from Scene 2 into the existing stormy-night background.

The transition should be a continuous crossfade:

Beach scene fades out while the stormy-night scene fades in.

Avoid an abrupt cut.

Start the storm-night sound effect during the transition.

In the middle of the scene, reveal the existing blue glowing element.

Animate the glow using GSAP:

* opacity
* scale
* subtle pulsing
* optional blur/intensity if supported

Play the existing glowing sound effect.

Narration appears in the top-left:

"That night, a strong new wave sweeps through the ocean, something no one has ever seen. Not a storm. A rush of fresh energy. Everyone stays calm, watching, waiting for morning."

The five mascots should appear partially from underneath the viewport.

Each character should appear with a surprised `!?` visual.

Use staggered GSAP animations rather than showing everyone simultaneously.

---

# SCENE 4 — Different Morning

Transition back to the existing beach background.

The sky should now be clear and bright.

Narration appears at the top-left:

"Morning comes. The sea looks the same as always. But the moment you touch the water, you feel it: everything is different now."

Sharky should be positioned around the middle-right of the scene.

The other four characters should appear partially from underneath the viewport.

The composition should suggest that something new is about to happen.

---

# SCENE 5 — Riding the New Wave

This is the main **horizontal scrolling section**.

Use the existing long horizontal swimming background.

The user should scroll vertically, while GSAP converts the scroll progress into horizontal movement across the swimming environment.

Conceptually:

vertical scroll
→ horizontal world movement

Use a pinned section with a horizontal GSAP timeline.

Example behavior:

START
→ Sharky
→ Croco
→ Otto
→ Crabbi
→ Turty
→ all characters swimming together
→ END

The horizontal movement should feel like the characters are progressing through the ocean.

Use the existing rough-sea sound effect throughout the section.

---

## Sharky

Sharky appears first.

Dialogue:

"Everyone, these new waves are amazing! They do half the work."

Then:

"Don't just stand there watching. Get in and feel it yourselves!"

Animate the dialogue naturally with the existing dialogue/chat sound.

---

## Croco

Croco appears next.

Dialogue:

"We've swum rough water before. Now, with this push, we swim faster and better!"

---

## Otto

Otto appears next.

Dialogue:

"These waves can take us so much further now! Think of all the new islands we can reach!"

---

## Crabbi

Crabbi appears next.

Dialogue:

"Half the work means more time to build it right. Let's learn the waves first, so we move safely."

---

## Turty

Turty appears next.

Dialogue:

"Fast isn't everything. Stay smart, stay focused, and we won't get lost."

---

# SCENE 5 — Group Swimming

After Turty's dialogue finishes:

Bring all five characters together.

They should appear as if they are swimming together through the ocean.

Animate their position to create a subtle swimming motion.

Do not make the swimming animation distract from the horizontal scrolling.

The group should move naturally with the environment.

As the section approaches its end:

* Fade out the rough-sea sound.
* Fade in the beach sound.
* Transition the visual scene toward white.

The screen should gradually become white.

Then transition into Scene 6.

---

# SCENE 6 — Swimming End

Use the existing Swimming End background.

Beach ambience should now be playing.

The five characters should fade into the scene one by one.

They should look like they have just finished swimming a long distance.

Then reveal the narration:

"They didn't fight the new wave. They rode it together, and went further than they ever had."

Use a gentle fade/slide animation for the text.

At the end of the scene:

Fade toward white.

Then transition into Scene 7.

---

# SCENE 7 — Final Island

Use the existing Final Island background.

Keep the beach sound continuously playing.

Place all five characters together in the middle.

The scene should begin relatively zoomed in.

Then slowly zoom the camera out using GSAP.

The zoom-out should reveal more of the island and surrounding ocean.

The final scene should feel expansive and open.

Display this text at the top:

"The AI wave is here, and it's changing the ocean for everyone. How will you ride it? Let's explore what's possible, together."

Display this text in the bottom-right corner:

"The wave was never something to fear.
It was something to ride."

Keep the final camera zoom-out slow and cinematic.

Do not abruptly end the animation.

---

# Audio System

Use the existing sound assets.

Create a small reusable audio controller rather than scattering audio logic throughout every component.

Required audio behavior:

* Beach ambience
* Typing sound
* Character entrance sound
* Dialogue/chat sound
* Rough sea
* Storm night
* Glowing energy
* Smooth audio fade transitions

Important:

Do not repeatedly create new Audio objects every time an animation runs.

Reuse audio instances where appropriate.

Respect browser autoplay restrictions.

Start audio only after the user's first interaction/scroll if required by the browser.

When transitioning between scenes, fade audio volumes using GSAP instead of abruptly stopping sounds.

---

# Responsive Behavior

The comic must work on:

* Desktop
* Laptop
* Tablet
* Mobile

The desktop experience can use more horizontal movement.

On smaller screens:

* Keep characters visible
* Adjust character scale
* Adjust dialogue positions
* Preserve the important composition
* Avoid characters being permanently cropped
* Recalculate ScrollTrigger measurements on resize

Use responsive GSAP values where appropriate.

---

# Performance

This is an animation-heavy experience.

Optimize it carefully.

Requirements:

* Avoid excessive React re-renders.
* Use transforms instead of animating layout properties where possible.
* Use `will-change` only where useful.
* Do not continuously update React state for scroll position.
* Use GSAP refs.
* Clean up all timelines and ScrollTriggers.
* Lazy-load scenes/assets where appropriate.
* Avoid unnecessarily rendering every scene at full resolution simultaneously.
* Keep the animation smooth on lower-end laptops.

The animation should prioritize smoothness over excessive visual effects.

---

# Implementation Architecture

Before writing the code, inspect the existing project structure and identify:

1. Framework/version
2. Existing component structure
3. Existing asset locations
4. Existing mascot components/assets
5. Existing audio files
6. Existing styling system
7. Existing GSAP installation/configuration

Do not unnecessarily rewrite the project.

Integrate into the existing architecture.

Prefer a structure similar to:

Comic
├── Intro
├── Scene1
├── Scene2
├── Scene3
├── Scene4
├── Scene5Horizontal
├── Scene6
├── Scene7
└── audio controller

Create reusable components/hooks where they genuinely simplify the implementation.

Do not over-engineer the project.

---

# Important

Do not generate placeholder artwork.

Do not replace the existing backgrounds.

Do not create placeholder mascot images.

Do not replace the existing sound effects.

Use the assets already present in the project.

First inspect the project and determine the actual asset filenames and dimensions.

Then implement the comic using **GSAP + ScrollTrigger**.

The final result should feel like a polished interactive cinematic web comic where scrolling controls the story.
