import { circleIntersectsRect } from '../core/Collision';
import { BOARD, type Rect, type Vector } from '../core/types';

type SpawnSide = 'left' | 'right' | 'top' | 'bottom';

export class Obstacle {
  readonly width: number;
  readonly height: number;
  readonly velocity: Vector;
  position: Vector;

  constructor(position: Vector, velocity: Vector, horizontal: boolean) {
    this.position = position;
    this.velocity = velocity;
    this.width = horizontal ? 50 : 14;
    this.height = horizontal ? 14 : 50;
  }

  static spawn(speed: number): Obstacle {
    const side = pickSide();
    const padding = 42;

    switch (side) {
      case 'left':
        return new Obstacle(
          { x: BOARD.x - padding, y: BOARD.y + Math.random() * BOARD.height },
          { x: speed, y: 0 },
          true,
        );
      case 'right':
        return new Obstacle(
          { x: BOARD.x + BOARD.width + padding, y: BOARD.y + Math.random() * BOARD.height },
          { x: -speed, y: 0 },
          true,
        );
      case 'top':
        return new Obstacle(
          { x: BOARD.x + Math.random() * BOARD.width, y: BOARD.y - padding },
          { x: 0, y: speed },
          false,
        );
      case 'bottom':
        return new Obstacle(
          { x: BOARD.x + Math.random() * BOARD.width, y: BOARD.y + BOARD.height + padding },
          { x: 0, y: -speed },
          false,
        );
    }
  }

  update(deltaTime: number): void {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  getBounds(): Rect {
    return {
      x: this.position.x - this.width / 2,
      y: this.position.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  hits(playerPosition: Vector, playerRadius: number): boolean {
    return circleIntersectsRect(playerPosition, playerRadius, this.getBounds());
  }

  isExpired(): boolean {
    const margin = 72;

    return (
      this.position.x < BOARD.x - margin ||
      this.position.x > BOARD.x + BOARD.width + margin ||
      this.position.y < BOARD.y - margin ||
      this.position.y > BOARD.y + BOARD.height + margin
    );
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const bounds = this.getBounds();

    ctx.save();
    ctx.strokeStyle = '#dddddd';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

    ctx.beginPath();
    if (bounds.width > bounds.height) {
      ctx.moveTo(bounds.x + 9, bounds.y + bounds.height / 2);
      ctx.lineTo(bounds.x + bounds.width - 9, bounds.y + bounds.height / 2);
    } else {
      ctx.moveTo(bounds.x + bounds.width / 2, bounds.y + 9);
      ctx.lineTo(bounds.x + bounds.width / 2, bounds.y + bounds.height - 9);
    }
    ctx.stroke();
    ctx.restore();
  }
}

function pickSide(): SpawnSide {
  const sides: SpawnSide[] = ['left', 'right', 'top', 'bottom'];
  return sides[Math.floor(Math.random() * sides.length)] ?? 'left';
}
