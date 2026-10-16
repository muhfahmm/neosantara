// soundManager.ts - Pengelola Musik & Efek Suara Global Neosantara
'use client';

const PLAYLIST = [
  '/audio/bgm1.mp3',
  '/audio/bgm2.mp3',
];

const STORAGE_KEY_MUSIC_VOL = 'neosantara_music_volume';
const STORAGE_KEY_SFX_VOL = 'neosantara_sfx_volume';

class SoundManager {
  private static instance: SoundManager;
  private musicAudio: HTMLAudioElement | null = null;
  private currentTrackIndex = 0;
  private musicVolume = 0.8; // default 80% (0.0 - 1.0)
  private sfxVolume = 0.7; // default 70%
  private isUserInteracted = false;
  private isPlaying = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      const savedMusic = localStorage.getItem(STORAGE_KEY_MUSIC_VOL);
      if (savedMusic !== null) {
        const parsed = parseFloat(savedMusic);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.musicVolume = parsed;
        }
      }

      const savedSfx = localStorage.getItem(STORAGE_KEY_SFX_VOL);
      if (savedSfx !== null) {
        const parsed = parseFloat(savedSfx);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.sfxVolume = parsed;
        }
      }

      this.initAudio();
      this.playMusic();
      this.attachUserInteractionListener();

      window.addEventListener('beforeunload', () => {
        this.stopMusic();
      });
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private initAudio() {
    if (typeof window === 'undefined') return;

    this.musicAudio = new Audio();
    this.musicAudio.preload = 'auto';
    this.musicAudio.volume = this.musicVolume;
    this.musicAudio.muted = this.musicVolume === 0;
    this.musicAudio.src = PLAYLIST[this.currentTrackIndex];

    // Otomatis putar lagu berikutnya saat lagu selesai (playlist loop berurutan)
    this.musicAudio.addEventListener('ended', () => {
      this.nextTrack();
    });

    this.musicAudio.addEventListener('error', (e) => {
      console.warn('Audio playback issue:', e);
    });
  }

  private attachUserInteractionListener() {
    if (typeof window === 'undefined') return;

    const startPlaybackOnFirstInteraction = () => {
      if (this.isUserInteracted) return;
      this.isUserInteracted = true;
      this.playMusic();

      window.removeEventListener('click', startPlaybackOnFirstInteraction);
      window.removeEventListener('keydown', startPlaybackOnFirstInteraction);
      window.removeEventListener('pointerdown', startPlaybackOnFirstInteraction);
    };

    window.addEventListener('click', startPlaybackOnFirstInteraction, { passive: true });
    window.addEventListener('keydown', startPlaybackOnFirstInteraction, { passive: true });
    window.addEventListener('pointerdown', startPlaybackOnFirstInteraction, { passive: true });
  }

  public playMusic() {
    if (!this.musicAudio) return;
    if (this.musicVolume <= 0) {
      this.musicAudio.muted = true;
      this.musicAudio.pause();
      this.isPlaying = false;
      return;
    }

    this.musicAudio.muted = false;
    this.musicAudio.volume = this.musicVolume;
    this.musicAudio.play().then(() => {
      this.isPlaying = true;
    }).catch(() => {
      // Browser autoplay policy might block before interaction
    });
  }

  public pauseMusic() {
    if (!this.musicAudio) return;
    this.musicAudio.pause();
    this.isPlaying = false;
  }

  public stopMusic() {
    if (!this.musicAudio) return;
    this.musicAudio.pause();
    this.musicAudio.currentTime = 0;
    this.musicAudio.src = '';
    this.musicAudio = null;
    this.isPlaying = false;
  }

  public nextTrack() {
    if (!this.musicAudio) return;
    this.currentTrackIndex = (this.currentTrackIndex + 1) % PLAYLIST.length;
    this.musicAudio.src = PLAYLIST[this.currentTrackIndex];
    this.musicAudio.volume = this.musicVolume;
    this.musicAudio.muted = this.musicVolume === 0;
    if (this.musicVolume > 0) {
      this.musicAudio.play().catch(() => {});
    } else {
      this.musicAudio.pause();
      this.isPlaying = false;
    }
  }

  public setMusicVolume(percent: number) {
    // percent: 0 to 100
    const clamped = Math.max(0, Math.min(100, percent));
    const volume = clamped / 100;
    this.musicVolume = volume;

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MUSIC_VOL, volume.toString());
      window.dispatchEvent(new CustomEvent('neosantara_music_vol_changed', { detail: { volume: clamped } }));
    }

    if (this.musicAudio) {
      if (clamped === 0) {
        this.musicAudio.volume = 0;
        this.musicAudio.muted = true;
        this.musicAudio.pause();
        this.isPlaying = false;
      } else {
        this.musicAudio.muted = false;
        this.musicAudio.volume = volume;
        if (this.musicAudio.paused && this.isUserInteracted) {
          this.musicAudio.play().catch(() => {});
        }
      }
    }
  }

  public getMusicVolume(): number {
    return Math.round(this.musicVolume * 100);
  }

  public setSfxVolume(percent: number) {
    const clamped = Math.max(0, Math.min(100, percent));
    const volume = clamped / 100;
    this.sfxVolume = volume;

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SFX_VOL, volume.toString());
      window.dispatchEvent(new CustomEvent('neosantara_sfx_vol_changed', { detail: { volume: clamped } }));
    }
  }

  public getSfxVolume(): number {
    return Math.round(this.sfxVolume * 100);
  }
}

export const soundManager = typeof window !== 'undefined' ? SoundManager.getInstance() : null;
