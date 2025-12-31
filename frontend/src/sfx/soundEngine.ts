/**
 * Sound Engine
 * 
 * Global SFX system for DCK Tools
 * Features:
 * - Play sounds with volume control
 * - Enable/disable toggle
 * - 150ms cooldown to prevent overlap
 * - iOS-safe autoplay fallback
 * - LocalStorage persistence
 */

export type SFXName =
  | 'shotgun'
  | 'alert'
  | 'rug'
  | 'buy'
  | 'sell'
  | 'sniperReady';

/**
 * Sound file paths
 * Note: Using placeholder paths - replace with actual audio files
 */
export const SFXFiles: Record<SFXName, string> = {
  shotgun: '/sounds/shotgun.mp3',
  alert: '/sounds/alert.mp3',
  rug: '/sounds/rug.mp3',
  buy: '/sounds/buy.mp3',
  sell: '/sounds/sell.mp3',
  sniperReady: '/sounds/sniper_ready.mp3',
};

/**
 * Cooldown tracker to prevent sound overlap
 */
const cooldowns: Map<SFXName, number> = new Map();
const COOLDOWN_MS = 150;

/**
 * Global SFX Engine
 */
class SoundEngine {
  enabled: boolean;
  volume: number;

  constructor() {
    // Load from localStorage
    this.enabled = localStorage.getItem('sfx_enabled') !== 'false';
    this.volume = parseFloat(localStorage.getItem('sfx_volume') || '0.7');
  }

  /**
   * Toggle sound on/off
   */
  toggle(on: boolean) {
    this.enabled = on;
    localStorage.setItem('sfx_enabled', String(on));
  }

  /**
   * Set volume (0-1)
   */
  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    localStorage.setItem('sfx_volume', String(this.volume));
  }

  /**
   * Play sound with cooldown
   */
  play(name: SFXName) {
    if (!this.enabled) return;

    // Check cooldown
    const lastPlayed = cooldowns.get(name) || 0;
    const now = Date.now();
    if (now - lastPlayed < COOLDOWN_MS) {
      return; // Still in cooldown
    }

    // Update cooldown
    cooldowns.set(name, now);

    // Create and play audio
    try {
      const audio = new Audio(SFXFiles[name]);
      audio.volume = this.volume;
      
      // iOS-safe autoplay fallback
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn(`Failed to play sound "${name}":`, error);
        });
      }
    } catch (error) {
      console.error(`Error playing sound "${name}":`, error);
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      enabled: this.enabled,
      volume: this.volume,
    };
  }
}

/**
 * Global singleton instance
 */
export const SFX = new SoundEngine();

export default SFX;
