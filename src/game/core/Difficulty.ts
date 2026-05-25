import type { DifficultySettings } from './types';

export function getDifficulty(score: number): DifficultySettings {
  const earlyRamp = Math.min(score, 150);
  const longRunPressure = Math.min(Math.max(score - 150, 0) / 100, 10);

  if (score < 30) {
    return {
      debrisInterval: Math.max(1.08, 1.65 - score * 0.015),
      debrisBurstMax: 1,
      debrisSpeed: 235 + score * 2,
      asteroidInterval: 4.5,
      asteroidChance: 0,
      asteroidSpeed: 0,
    };
  }

  if (score < 70) {
    return {
      debrisInterval: Math.max(0.74, 1.1 - (score - 30) * 0.009),
      debrisBurstMax: 1,
      debrisSpeed: 300 + (score - 30) * 2.3,
      asteroidInterval: 4.2,
      asteroidChance: 0,
      asteroidSpeed: 0,
    };
  }

  if (score < 150) {
    const debrisSpeed = 380 + (score - 70) * 2;

    return {
      debrisInterval: Math.max(0.48, 0.8 - (score - 70) * 0.004),
      debrisBurstMax: 2,
      debrisSpeed,
      asteroidInterval: 3.1,
      asteroidChance: score >= 100 ? 0.45 : 0,
      asteroidSpeed: score >= 100 ? debrisSpeed + 80 : 0,
    };
  }

  const debrisSpeed = Math.min(820, 520 + longRunPressure * 42 + Math.min(earlyRamp, 150) * 0.14);
  const asteroidSpeed = Math.min(920, debrisSpeed + 95 + longRunPressure * 10);

  return {
    debrisInterval: Math.max(0.18, 0.62 - longRunPressure * 0.043),
    debrisBurstMax: 3,
    debrisSpeed,
    asteroidInterval: Math.max(0.75, 2.05 - longRunPressure * 0.12),
    asteroidChance: Math.min(0.9, 0.5 + longRunPressure * 0.04),
    asteroidSpeed,
  };
}

export function randomDebrisBurst(maxCount: number): number {
  if (maxCount <= 1) {
    return 1;
  }

  // Bias toward smaller bursts so extra hazards ramp up without feeling unfair.
  return 1 + Math.floor(Math.random() ** 1.8 * maxCount);
}
