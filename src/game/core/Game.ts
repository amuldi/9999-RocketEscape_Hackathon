import { Asteroid } from '../objects/Asteroid';
import { AudioManager } from '../audio/AudioManager';
import { Background } from '../effects/Background';
import { isCircleOutsideRect } from './Collision';
import { getDifficulty, randomDebrisBurst } from './Difficulty';
import { Input } from './Input';
import { Obstacle } from '../objects/Obstacle';
import { Particle } from '../effects/Particle';
import { Player } from '../objects/Player';
import { Star } from '../objects/Star';
import { drawHUD } from '../../ui/HUD';
import { drawEndScreen, drawGameOverScreen, drawPauseScreen, drawStartScreen } from '../../ui/screens';
import { BOARD, CANVAS_SIZE, INITIAL_LIVES, TARGET_SCORE, type GameState, type RunResult } from './types';

type GameOptions = {
  onRunEnd?: (result: RunResult) => void;
};

export class Game {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly input = new Input();
  private readonly player = new Player();
  private readonly background = new Background();
  private readonly audio = new AudioManager();

  private star = new Star(this.player.position);
  private obstacles: Obstacle[] = [];
  private asteroids: Asteroid[] = [];
  private particles: Particle[] = [];

  private state: GameState = 'start';
  private playerName = 'PLAYER';
  private score = 0;
  private starsCollected = 0;
  private combo = 0;
  private survivalSeconds = 0;
  private survivalScoreCarry = 0;
  private lives = INITIAL_LIVES;
  private lastTime = 0;
  private animationFrame = 0;
  private debrisTimer = 0;
  private asteroidTimer = 0;
  private flameTimer = 0;
  private menuOpen = true;
  private runReported = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly options: GameOptions = {},
  ) {
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvas 2D context is not available.');
    }

    this.ctx = context;
    this.configureCanvas();
  }

  start(): void {
    this.lastTime = performance.now();
    this.animationFrame = requestAnimationFrame(this.tick);
  }

  destroy(): void {
    cancelAnimationFrame(this.animationFrame);
    this.input.destroy();
    this.audio.destroy();
  }

  beginRun(playerName: string): void {
    this.audio.activate();
    this.playerName = playerName.trim() || 'PLAYER';
    this.menuOpen = false;
    this.resetRun();
    this.state = 'playing';
  }

  setMenuOpen(isOpen: boolean): void {
    this.menuOpen = isOpen;
  }

  private readonly tick = (time: number): void => {
    const deltaTime = Math.min(0.033, (time - this.lastTime) / 1000);
    this.lastTime = time;

    this.update(deltaTime);
    this.draw();

    this.animationFrame = requestAnimationFrame(this.tick);
  };

  private update(deltaTime: number): void {
    if (this.menuOpen) {
      this.input.consumeStart();
      this.input.consumePause();
    } else {
      if (this.input.consumeStart()) {
        this.handleStartAction();
      }

      if (this.input.consumePause()) {
        this.handlePauseAction();
      }
    }

    const difficultyScore = this.getDifficultyScore();
    const difficulty = getDifficulty(difficultyScore);
    const fastestObstacleSpeed = Math.max(difficulty.debrisSpeed, difficulty.asteroidSpeed);
    this.background.update(deltaTime, fastestObstacleSpeed + 150);
    this.audio.update(deltaTime, this.score, this.state === 'playing');

    if (this.state !== 'playing') {
      return;
    }

    this.addSurvivalScore(deltaTime);

    if (this.state !== 'playing') {
      return;
    }

    const previousDirection = { ...this.player.direction };
    const hitWall = this.player.update(deltaTime, this.input.getDirection(), difficultyScore);

    if (previousDirection.x !== this.player.direction.x || previousDirection.y !== this.player.direction.y) {
      this.audio.playTurn(this.player.direction, difficultyScore);
    }

    this.emitFlame(deltaTime);
    this.spawnHazards(deltaTime, difficulty.debrisInterval, difficulty.debrisBurstMax, difficulty.debrisSpeed);
    this.spawnAsteroids(deltaTime, difficulty.asteroidInterval, difficulty.asteroidChance, difficulty.asteroidSpeed);

    for (const obstacle of this.obstacles) {
      obstacle.update(deltaTime);
    }

    for (const asteroid of this.asteroids) {
      asteroid.update(deltaTime);
    }

    for (const particle of this.particles) {
      particle.update(deltaTime);
    }

    this.obstacles = this.obstacles.filter((obstacle) => !obstacle.isExpired());
    this.asteroids = this.asteroids.filter((asteroid) => !asteroid.isExpired());
    this.particles = this.particles.filter((particle) => particle.isAlive());

    this.resolveStarCollection();
    this.resolveHealMeteorCollection();
    this.resolveCollisions(hitWall);
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(BOARD.x, BOARD.y, BOARD.width, BOARD.height);

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(BOARD.x, BOARD.y, BOARD.width, BOARD.height);
    this.ctx.clip();

    this.background.draw(this.ctx);

    for (const particle of this.particles) {
      particle.draw(this.ctx);
    }

    for (const obstacle of this.obstacles) {
      obstacle.draw(this.ctx);
    }

    for (const asteroid of this.asteroids) {
      asteroid.draw(this.ctx);
    }

    this.star.draw(this.ctx);
    this.player.draw(this.ctx);
    this.ctx.restore();

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(BOARD.x, BOARD.y, BOARD.width, BOARD.height);

    drawHUD(this.ctx, this.score, this.lives, this.playerName, this.combo);

    if (this.state === 'start') {
      drawStartScreen(this.ctx);
    } else if (this.state === 'paused') {
      drawPauseScreen(this.ctx);
    } else if (this.state === 'gameOver') {
      drawGameOverScreen(this.ctx, this.score);
    } else if (this.state === 'end') {
      drawEndScreen(this.ctx);
    }
  }

  private handleStartAction(): void {
    if (this.state === 'start') {
      return;
    }

    if (this.state === 'gameOver' || this.state === 'end') {
      this.resetRun();
      this.state = 'playing';
      return;
    }

    if (this.state === 'paused') {
      this.state = 'playing';
    }
  }

  private handlePauseAction(): void {
    if (this.state === 'playing') {
      this.state = 'paused';
      return;
    }

    if (this.state === 'paused') {
      this.state = 'playing';
    }
  }

  private resetRun(): void {
    this.score = 0;
    this.starsCollected = 0;
    this.combo = 0;
    this.survivalSeconds = 0;
    this.survivalScoreCarry = 0;
    this.lives = INITIAL_LIVES;
    this.obstacles = [];
    this.asteroids = [];
    this.particles = [];
    this.debrisTimer = 0;
    this.asteroidTimer = 0;
    this.flameTimer = 0;
    this.runReported = false;
    this.player.reset();
    this.star = new Star(this.player.position);
  }

  private emitFlame(deltaTime: number): void {
    this.flameTimer += deltaTime;
    const interval = Math.max(0.012, 0.022 - this.score * 0.00002);

    while (this.flameTimer >= interval) {
      this.particles.push(Particle.flame(this.player.getFlameOrigin(), this.player.direction));
      this.flameTimer -= interval;
    }
  }

  private spawnHazards(deltaTime: number, interval: number, maxBurst: number, speed: number): void {
    this.debrisTimer += deltaTime;

    if (this.debrisTimer < interval) {
      return;
    }

    this.debrisTimer = 0;
    const burstCount = randomDebrisBurst(maxBurst);

    for (let i = 0; i < burstCount; i += 1) {
      this.obstacles.push(Obstacle.spawn(speed + Math.random() * 70));
    }
  }

  private spawnAsteroids(deltaTime: number, interval: number, chance: number, speed: number): void {
    if (this.score < 100) {
      return;
    }

    this.asteroidTimer += deltaTime;

    if (this.asteroidTimer < interval) {
      return;
    }

    this.asteroidTimer = 0;
    if (Math.random() <= chance) {
      this.asteroids.push(Asteroid.spawn(speed + Math.random() * 85, this.player.position));
    }
  }

  private resolveStarCollection(): void {
    if (!this.star.isCollectedBy(this.player.position, this.player.radius)) {
      return;
    }

    this.starsCollected += 1;
    this.combo += 1;
    this.audio.playStar(this.combo);
    this.addScore(100 + Math.min(250, this.combo * 15));

    if (this.state !== 'playing') {
      return;
    }

    this.star.respawn(this.player.position, [
      ...this.obstacles.map((obstacle) => ({
        position: obstacle.position,
        radius: Math.max(obstacle.width, obstacle.height) / 2,
      })),
      ...this.asteroids.map((asteroid) => ({
        position: asteroid.position,
        radius: asteroid.radius,
      })),
    ]);
  }

  private resolveCollisions(hitWall: boolean): void {
    if (this.player.invulnerableFor > 0) {
      return;
    }

    const outsideBoard = isCircleOutsideRect(this.player.position, this.player.radius, BOARD);
    const hitDebris = this.obstacles.some((obstacle) => obstacle.hits(this.player.position, this.player.radius));
    const hitAsteroid = this.asteroids.some((asteroid) => asteroid.hits(this.player.position, this.player.radius));

    if (hitWall || outsideBoard || hitDebris || hitAsteroid) {
      this.loseLife(1, true);
      return;
    }

    if (this.background.consumeDangerHit(this.player.position, this.player.radius)) {
      this.loseLife(0.5, false);
    }
  }

  private resolveHealMeteorCollection(): void {
    if (this.background.consumeHealHit(this.player.position, this.player.radius)) {
      this.restoreLife();
    }
  }

  private restoreLife(): void {
    this.audio.playHeal();
    this.lives = Math.min(INITIAL_LIVES, this.lives + 1);
    this.addScore(50);
  }

  private loseLife(amount: number, resetPosition: boolean): void {
    this.audio.playCrash(amount);
    this.lives -= amount;
    this.combo = 0;

    if (this.lives <= 0) {
      this.lives = 0;
      this.finishRun('gameOver');
      return;
    }

    if (resetPosition) {
      // Reset the local danger field after heavy damage to prevent repeated unavoidable hits.
      this.obstacles = [];
      this.asteroids = [];
      this.player.reset();
    }

    this.player.makeInvulnerable();
  }

  private addSurvivalScore(deltaTime: number): void {
    this.survivalSeconds += deltaTime;
    this.survivalScoreCarry += deltaTime * 5;

    const earned = Math.floor(this.survivalScoreCarry);

    if (earned <= 0) {
      return;
    }

    this.survivalScoreCarry -= earned;
    this.addScore(earned);
  }

  private addScore(points: number): void {
    this.score = Math.min(TARGET_SCORE, this.score + points);

    if (this.score >= TARGET_SCORE) {
      this.finishRun('end');
    }
  }

  private getDifficultyScore(): number {
    return this.starsCollected + Math.floor(this.survivalSeconds / 8);
  }

  private finishRun(endedBy: 'gameOver' | 'end'): void {
    this.state = endedBy;

    if (this.runReported) {
      return;
    }

    this.runReported = true;
    if (endedBy === 'end') {
      this.audio.playEnd();
    } else {
      this.audio.playGameOver();
    }
    this.options.onRunEnd?.({
      playerName: this.playerName,
      score: this.score,
      starsCollected: this.starsCollected,
      survivalSeconds: this.survivalSeconds,
      endedBy,
    });
  }

  private configureCanvas(): void {
    this.canvas.width = CANVAS_SIZE;
    this.canvas.height = CANVAS_SIZE;
    this.canvas.focus();
  }
}
