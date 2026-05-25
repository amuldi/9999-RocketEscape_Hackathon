import type { DifficultySettings } from './types';

export function getDifficulty(score: number): DifficultySettings {
  const longRunPressure = Math.min(score / 1000, 6);

  if (score < 30) {
    return {
      debrisInterval: Math.max(1.55, 2.15 - longRunPressure * 0.08),
      debrisBurstMax: 1,
      debrisSpeed: 128 + longRunPressure * 10,
      asteroidInterval: 4.5,
      asteroidChance: 0,
      asteroidSpeed: 0,
    };
  }

  if (score < 70) {
    return {
      debrisInterval: Math.max(1.1, 1.45 - longRunPressure * 0.08),
      debrisBurstMax: 1,
      debrisSpeed: 148 + longRunPressure * 12,
      asteroidInterval: 4.2,
      asteroidChance: 0,
      asteroidSpeed: 0,
    };
  }

  if (score < 150) {
    return {
      debrisInterval: Math.max(0.78, 1.05 - longRunPressure * 0.08),
      debrisBurstMax: 2,
      debrisSpeed: 170 + longRunPressure * 14,
      asteroidInterval: 3.4,
      asteroidChance: score >= 100 ? 0.45 : 0,
      asteroidSpeed: 230 + longRunPressure * 16,
    };
  }

  const highScorePressure = Math.min((score - 150) / 850, 10);

  return {
    debrisInterval: Math.max(0.32, 0.82 - highScorePressure * 0.045),
    debrisBurstMax: 3,
    debrisSpeed: 194 + highScorePressure * 16,
    asteroidInterval: Math.max(1.2, 2.65 - highScorePressure * 0.12),
    asteroidChance: Math.min(0.88, 0.5 + highScorePressure * 0.035),
    asteroidSpeed: 250 + highScorePressure * 18,
  };
}

export function randomDebrisBurst(maxCount: number): number {
  if (maxCount <= 1) {
    return 1;
  }

  // Bias toward smaller bursts so extra hazards ramp up without feeling unfair.
  return 1 + Math.floor(Math.random() ** 1.8 * maxCount);
}
