import { clamp, normalize } from '../core/Collision';
import { BOARD, INVULNERABLE_SECONDS, type Rect, type Vector } from '../core/types';

export class Player {
  readonly radius = 17;
  readonly width = 44;
  readonly baseSpeed = 235;

  position: Vector = { x: 0, y: 0 };
  direction: Vector = { x: 1, y: 0 };
  invulnerableFor = 0;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.position = {
      x: BOARD.x + BOARD.width / 2,
      y: BOARD.y + BOARD.height / 2,
    };
    this.direction = { x: 1, y: 0 };
    this.invulnerableFor = INVULNERABLE_SECONDS;
  }

  update(deltaTime: number, requestedDirection: Vector, score: number): boolean {
    const nextDirection = normalize(requestedDirection);

    if (nextDirection.x !== 0 || nextDirection.y !== 0) {
      this.direction = nextDirection;
    }

    const speed = this.getSpeed(score);
    const nextX = this.position.x + this.direction.x * speed * deltaTime;
    const nextY = this.position.y + this.direction.y * speed * deltaTime;
    const clampedX = clamp(nextX, BOARD.x + this.radius, BOARD.x + BOARD.width - this.radius);
    const clampedY = clamp(nextY, BOARD.y + this.radius, BOARD.y + BOARD.height - this.radius);
    const hitWall = clampedX !== nextX || clampedY !== nextY;

    this.position.x = clampedX;
    this.position.y = clampedY;
    this.invulnerableFor = Math.max(0, this.invulnerableFor - deltaTime);

    return hitWall;
  }

  private getSpeed(score: number): number {
    // Star collection raises player speed in step with the faster obstacle field.
    return this.baseSpeed + Math.min(560, score * 2.5);
  }

  makeInvulnerable(): void {
    this.invulnerableFor = INVULNERABLE_SECONDS;
  }

  getFlameOrigin(): Vector {
    return {
      x: this.position.x - this.direction.x * (this.width / 2 + 4),
      y: this.position.y - this.direction.y * (this.width / 2 + 4),
    };
  }

  getBounds(): Rect {
    return {
      x: this.position.x - this.radius,
      y: this.position.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    };
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const blinkOff = this.invulnerableFor > 0 && Math.floor(this.invulnerableFor * 16) % 2 === 0;

    if (blinkOff) {
      return;
    }

    const angle = Math.atan2(this.direction.y, this.direction.x);

    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(angle);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f8f8f8';
    ctx.fillStyle = '#f8f8f8';

    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(8, -11);
    ctx.lineTo(-18, -9);
    ctx.lineTo(-24, 0);
    ctx.lineTo(-18, 9);
    ctx.lineTo(8, 11);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(5, 0, 4.2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-10, -9);
    ctx.lineTo(-22, -18);
    ctx.lineTo(-16, -7);
    ctx.moveTo(-10, 9);
    ctx.lineTo(-22, 18);
    ctx.lineTo(-16, 7);
    ctx.stroke();

    ctx.restore();
  }
}
