export const CANVAS_SIZE = 720;
export const BOARD_SIZE = 640;
export const TARGET_SCORE = 9999;
export const INITIAL_LIVES = 3;
export const INVULNERABLE_SECONDS = 1.2;

export const BOARD = {
  x: 40,
  y: 54,
  width: BOARD_SIZE,
  height: BOARD_SIZE,
} as const;

export type GameState = 'start' | 'playing' | 'paused' | 'gameOver' | 'end';
export type GameMode = 'defense';

export type RunResult = {
  playerName: string;
  mode: GameMode;
  score: number;
  starsCollected: number;
  survivalSeconds: number;
  endedBy: 'gameOver' | 'end';
};

export type Vector = {
  x: number;
  y: number;
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DifficultySettings = {
  debrisInterval: number;
  debrisBurstMax: number;
  debrisSpeed: number;
  asteroidInterval: number;
  asteroidChance: number;
  asteroidSpeed: number;
};
