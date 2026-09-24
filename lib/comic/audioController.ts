import gsap from "gsap";

type SoundEffect =
  | "beach"
  | "roughSea"
  | "stormyNight"
  | "typing"
  | "characterEntrance"
  | "dialogue"
  | "glowing";

export class AudioController {
  private sounds: Map<SoundEffect, HTMLAudioElement> = new Map();
  private initialized = false;
  private unlocked = false;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    const soundPaths: Record<SoundEffect, string> = {
      beach: "/assets/comic/Sound Effects/Beach.mp3",
      roughSea: "/assets/comic/Sound Effects/Rough Sea.mp3",
      stormyNight: "/assets/comic/Sound Effects/Stormy Night.mp3",
      typing: "/assets/comic/Sound Effects/Text Showup.mp3",
      characterEntrance: "/assets/comic/Sound Effects/Charater Showup.mp3",
      dialogue: "/assets/comic/Sound Effects/Text Showup.mp3",
      glowing: "/assets/comic/Sound Effects/Shining Something.mp3",
    };

    Object.entries(soundPaths).forEach(([key, path]) => {
      const audio = new Audio(path);
      audio.preload = "auto";
      audio.loop = key === "beach" || key === "roughSea" || key === "stormyNight";
      
      // Add error handler
      audio.addEventListener('error', (e) => {
        console.error(`Failed to load audio ${key} from ${path}:`, e);
      });
      
      // Add loaded handler
      audio.addEventListener('canplaythrough', () => {
        console.log(`Audio ${key} loaded successfully from ${path}`);
      });
      
      this.sounds.set(key as SoundEffect, audio);
      console.log(`Registered sound: ${key} with path: ${path}, loop: ${audio.loop}`);
    });
  }

  async play(soundEffect: SoundEffect, volume: number = 0.5): Promise<void> {
    // Don't play if audio hasn't been unlocked by user interaction
    if (!this.unlocked) {
      return;
    }

    const sound = this.sounds.get(soundEffect);
    if (!sound) return;

    try {
      sound.volume = volume;
      await sound.play();
      this.initialized = true;
    } catch (error) {
      // Browser autoplay restriction - silently fail
      console.warn(`Autoplay blocked for ${soundEffect}`);
    }
  }

  pause(soundEffect: SoundEffect) {
    const sound = this.sounds.get(soundEffect);
    if (sound) {
      sound.pause();
    }
  }

  stop(soundEffect: SoundEffect) {
    const sound = this.sounds.get(soundEffect);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  fadeIn(soundEffect: SoundEffect, duration: number = 1, targetVolume: number = 0.5) {
    console.log(`fadeIn called for ${soundEffect}, unlocked: ${this.unlocked}`);
    
    if (!this.unlocked) {
      console.warn(`Cannot fadeIn ${soundEffect} - audio not unlocked yet`);
      return;
    }
    
    const sound = this.sounds.get(soundEffect);
    if (!sound) {
      console.warn(`Sound ${soundEffect} not found`);
      return;
    }

    console.log(`Starting fadeIn for ${soundEffect}, current time: ${sound.currentTime}, volume: ${sound.volume}`);
    
    sound.volume = 0;
    sound.currentTime = 0;
    
    // Play the sound first
    sound.play().then(() => {
      console.log(`${soundEffect} playing successfully, fading to volume ${targetVolume}`);
      // Then animate volume
      gsap.to(sound, {
        volume: targetVolume,
        duration,
        ease: "power2.inOut",
        onUpdate: () => {
          console.log(`${soundEffect} volume: ${sound.volume.toFixed(2)}`);
        },
        onComplete: () => {
          console.log(`${soundEffect} fade complete at volume ${sound.volume}`);
        }
      });
    }).catch((error) => {
      console.error(`Failed to play ${soundEffect}:`, error);
    });
  }

  fadeOut(soundEffect: SoundEffect, duration: number = 1) {
    const sound = this.sounds.get(soundEffect);
    if (!sound) return;

    gsap.to(sound, {
      volume: 0,
      duration,
      ease: "power2.inOut",
      onComplete: () => {
        this.stop(soundEffect);
      },
    });
  }

  crossfade(
    fromSound: SoundEffect,
    toSound: SoundEffect,
    duration: number = 1.5,
    targetVolume: number = 0.5
  ) {
    this.fadeOut(fromSound, duration);
    setTimeout(() => {
      this.fadeIn(toSound, duration, targetVolume);
    }, duration * 500); // Start halfway through the fadeout
  }

  cleanup() {
    this.sounds.forEach((sound) => {
      sound.pause();
      sound.src = "";
    });
    this.sounds.clear();
  }

  // Attempt to initialize audio on user interaction
  async initializeOnUserInteraction() {
    if (this.unlocked) return;

    try {
      // Try to play and immediately pause a sound to unlock audio
      const beach = this.sounds.get("beach");
      if (beach) {
        beach.volume = 0;
        await beach.play();
        beach.pause();
        beach.currentTime = 0;
        beach.volume = 0.5;
        this.unlocked = true;
        this.initialized = true;
        console.log("Audio unlocked successfully");
      }
    } catch (error) {
      console.warn("Could not initialize audio - user interaction required");
    }
  }

  // Get unlock status
  isUnlocked(): boolean {
    return this.unlocked;
  }
}
