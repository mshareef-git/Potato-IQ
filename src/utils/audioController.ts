// Background audio controller for Potato IQ
import { AUDIO_ASSETS } from '../data/assetManifest';

class AudioController {
  private bgmAudio: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private hasStarted: boolean = false;
  private volume: number = 0.35;
  private listeners: Set<(state: { isPlaying: boolean; isMuted: boolean; volume: number }) => void> = new Set();

  constructor() {
    // Lazy initialize on first call
  }

  private initAudio() {
    if (this.bgmAudio) return;
    this.bgmAudio = new Audio(AUDIO_ASSETS.bgmPrimary);
    this.bgmAudio.loop = true;
    this.bgmAudio.volume = this.volume;
    this.bgmAudio.muted = this.isMuted;
  }

  public subscribe(listener: (state: { isPlaying: boolean; isMuted: boolean; volume: number }) => void) {
    this.listeners.add(listener);
    listener({ isPlaying: this.isPlaying(), isMuted: this.isMuted, volume: this.volume });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const state = { isPlaying: this.isPlaying(), isMuted: this.isMuted, volume: this.volume };
    this.listeners.forEach((l) => l(state));
  }

  public isPlaying(): boolean {
    return !!(this.bgmAudio && !this.bgmAudio.paused && !this.bgmAudio.ended);
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public startMusic() {
    this.initAudio();
    if (!this.bgmAudio) return;

    if (!this.hasStarted || this.bgmAudio.paused) {
      this.bgmAudio
        .play()
        .then(() => {
          this.hasStarted = true;
          this.notify();
        })
        .catch((err) => {
          // Autoplay blocked; user interaction will resume
          console.warn('Audio play request was blocked by browser policies:', err);
        });
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.bgmAudio) {
      this.bgmAudio.muted = this.isMuted;
    }
    this.notify();
  }

  public setVolume(newVolume: number) {
    this.volume = Math.max(0, Math.min(1, newVolume));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.volume;
    }
    this.notify();
  }

  public playSoundEffect(type: 'click' | 'buzz' | 'cry' | 'cheer') {
    if (this.isMuted) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'click') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'buzz') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'cry') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.35);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'cheer') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch {
      // AudioContext not available or blocked
    }
  }
}

export const audioController = new AudioController();
