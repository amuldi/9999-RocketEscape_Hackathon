import type { Vector } from '../core/types';

const MELODY_STEPS = [0, 3, 7, 10, 7, 3, 12, 10, 0, 5, 8, 12, 8, 5, 15, 12] as const;
const BASS_STEPS = [0, 0, -5, 0, 0, 0, -7, 0] as const;

type WebAudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

export class AudioManager {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicTimer = 0;
  private beatIndex = 0;
  private lastTurnAt = 0;

  activate(): void {
    if (!this.context) {
      const AudioContextClass = window.AudioContext ?? (window as WebAudioWindow).webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      this.context = new AudioContextClass();
      this.masterGain = this.context.createGain();
      this.musicGain = this.context.createGain();
      this.sfxGain = this.context.createGain();

      this.masterGain.gain.value = 0.75;
      this.musicGain.gain.value = 0;
      this.sfxGain.gain.value = 0.55;

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.context.destination);
    }

    void this.context.resume();
  }

  update(deltaTime: number, score: number, isPlaying: boolean): void {
    if (!this.context || !this.musicGain) {
      return;
    }

    const now = this.context.currentTime;
    this.musicGain.gain.setTargetAtTime(isPlaying ? 0.08 : 0, now, 0.08);

    if (!isPlaying) {
      this.musicTimer = 0;
      return;
    }

    const stepSeconds = this.getMusicStepSeconds(score);
    this.musicTimer -= deltaTime;

    // The score raises BPM, so late-game music pushes the same rhythmic hook faster.
    while (this.musicTimer <= 0) {
      this.playMusicStep(score);
      this.musicTimer += stepSeconds;
    }
  }

  playTurn(direction: Vector, difficultyScore: number): void {
    if (!this.context) {
      return;
    }

    const now = this.context.currentTime;

    if (now - this.lastTurnAt < 0.055) {
      return;
    }

    this.lastTurnAt = now;
    const directionalPitch = direction.x !== 0 ? 520 : 620;
    const speedLift = Math.min(180, difficultyScore * 5);
    this.playTone(directionalPitch + speedLift, 0.045, 0.032, 'triangle', this.sfxGain, 0, directionalPitch + speedLift + 120);
  }

  playStar(combo: number): void {
    const base = 610 + Math.min(260, combo * 18);
    const notes = [0, 7, 12, 19];

    notes.forEach((step, index) => {
      this.playTone(base * 2 ** (step / 12), 0.075, 0.046 - index * 0.005, 'square', this.sfxGain, index * 0.035);
    });
  }

  playCrash(amount: number): void {
    const gain = amount >= 1 ? 0.16 : 0.09;

    this.playNoise(0.16, gain, 0, 500, 'lowpass');
    this.playTone(150, 0.18, gain * 0.55, 'sawtooth', this.sfxGain, 0, 54);
  }

  playHeal(): void {
    const notes = [12, 19, 24, 31];

    notes.forEach((step, index) => {
      this.playTone(440 * 2 ** (step / 12), 0.105, 0.045, 'sine', this.sfxGain, index * 0.055);
    });
    this.playNoise(0.08, 0.045, 0.03, 2800, 'highpass');
  }

  playGameOver(): void {
    [0, -3, -7, -12].forEach((step, index) => {
      this.playTone(260 * 2 ** (step / 12), 0.16, 0.05, 'triangle', this.sfxGain, index * 0.08);
    });
  }

  playEnd(): void {
    [0, 4, 7, 12, 19].forEach((step, index) => {
      this.playTone(392 * 2 ** (step / 12), 0.18, 0.052, 'square', this.sfxGain, index * 0.07);
    });
  }

  destroy(): void {
    if (this.context && this.context.state !== 'closed') {
      void this.context.close();
    }

    this.context = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
  }

  private getMusicStepSeconds(score: number): number {
    const intensity = Math.min(1, score / 9999);
    const bpm = 124 + intensity * 94;
    return 60 / bpm / 2;
  }

  private playMusicStep(score: number): void {
    const intensity = Math.min(1, score / 9999);
    const melodyStep = MELODY_STEPS[this.beatIndex % MELODY_STEPS.length];
    const octaveLift = score >= 6500 ? 12 : score >= 3200 ? 7 : 0;
    const melodyFrequency = 220 * 2 ** ((melodyStep + octaveLift) / 12);

    this.playTone(melodyFrequency, 0.07, 0.025 + intensity * 0.016, 'square', this.musicGain);

    if (this.beatIndex % 2 === 0) {
      const bassStep = BASS_STEPS[Math.floor(this.beatIndex / 2) % BASS_STEPS.length];
      this.playTone(110 * 2 ** (bassStep / 12), 0.09, 0.03, 'triangle', this.musicGain);
    }

    if (this.beatIndex % 4 === 2) {
      this.playNoise(0.025, 0.018 + intensity * 0.012, 0, 3600, 'highpass', this.musicGain);
    }

    this.beatIndex += 1;
  }

  private playTone(
    frequency: number,
    duration: number,
    gain: number,
    type: OscillatorType,
    output: AudioNode | null,
    delay = 0,
    slideTo?: number,
  ): void {
    if (!this.context || !output) {
      return;
    }

    const start = this.context.currentTime + delay;
    const end = start + duration;
    const oscillator = this.context.createOscillator();
    const amp = this.context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(1, frequency), start);

    if (slideTo !== undefined) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), end);
    }

    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), start + 0.006);
    amp.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(amp);
    amp.connect(output);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  }

  private playNoise(
    duration: number,
    gain: number,
    delay: number,
    filterFrequency: number,
    filterType: BiquadFilterType,
    output: AudioNode | null = this.sfxGain,
  ): void {
    if (!this.context || !output) {
      return;
    }

    const sampleCount = Math.max(1, Math.floor(this.context.sampleRate * duration));
    const buffer = this.context.createBuffer(1, sampleCount, this.context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < sampleCount; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount);
    }

    const start = this.context.currentTime + delay;
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const amp = this.context.createGain();

    source.buffer = buffer;
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFrequency, start);
    amp.gain.setValueAtTime(Math.max(0.0001, gain), start);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    source.connect(filter);
    filter.connect(amp);
    amp.connect(output);
    source.start(start);
    source.stop(start + duration + 0.02);
  }
}
