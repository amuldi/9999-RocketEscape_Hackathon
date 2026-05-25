import { circleIntersectsCircle, normalize } from './Collision';
import { BOARD, type Vector } from './types';

type SpawnSide = 'left' | 'right' | 'top' | 'bottom';

export class Asteroid {
  readonly radius: number;
  readonly velocity: Vector;
  position: Vector;
  private readonly notches: number[];

  constructor(position: Vector, velocity: Vector, radius: number) {
    this.position = position;
    this.velocity = velocity;
    this.radius = radius;
    this.notches = Array.from({ length: 9 }, () => 0.78 + Math.random() * 0.34);
  }

  static spawn(speed: number, playerPosition: Vector): Asteroid {
    const side = pickSide();
    const radius = 24 + Math.random() * 14;
    const padding = 58;
    const spawn = positionForSide(side, padding);

    let target = {
      x: BOARD.x + BOARD.width * (0.18 + Math.random() * 0.64),
      y: BOARD.y + BOARD.height * (0.18 + Math.random() * 0.64),
    };

    // Avoid a spawn line that directly crosses the player when possible.
    if (Math.hypot(target.x - playerPosition.x, target.y - playerPosition.y) < 95) {
      target = {
        x: BOARD.x + BOARD.width - (target.x - BOARD.x),
        y: BOARD.y + BOARD.height - (target.y - BOARD.y),
      };
    }

    const direction = normalize({ x: target.x - spawn.x, y: target.y - spawn.y });

    return new Asteroid(
      spawn,
      {
        x: direction.x * speed,
        y: direction.y * speed,
      },
      radius,
    );
  }

  update(deltaTime: number): void {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  hits(playerPosition: Vector, playerRadius: number): boolean {
    return circleIntersectsCircle(this.position, this.radius, playerPosition, playerRadius);
  }

  isExpired(): boolean {
    const margin = 96;

    return (
      this.position.x < BOARD.x - margin ||
      this.position.x > BOARD.x + BOARD.width + margin ||
      this.position.y < BOARD.y - margin ||
      this.position.y > BOARD.y + BOARD.height + margin
    );
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < this.notches.length; i += 1) {
      const angle = (i / this.notches.length) * Math.PI * 2;
      const radius = this.radius * (this.notches[i] ?? 1);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-this.radius * 0.25, -this.radius * 0.1, this.radius * 0.16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.radius * 0.18, this.radius * 0.24, this.radius * 0.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

function positionForSide(side: SpawnSide, padding: number): Vector {
  switch (side) {
    case 'left':
      return { x: BOARD.x - padding, y: BOARD.y + Math.random() * BOARD.height };
    case 'right':
      return { x: BOARD.x + BOARD.width + padding, y: BOARD.y + Math.random() * BOARD.height };
    case 'top':
      return { x: BOARD.x + Math.random() * BOARD.width, y: BOARD.y - padding };
    case 'bottom':
      return { x: BOARD.x + Math.random() * BOARD.width, y: BOARD.y + BOARD.height + padding };
  }
}

function pickSide(): SpawnSide {
  const sides: SpawnSide[] = ['left', 'right', 'top', 'bottom'];
  return sides[Math.floor(Math.random() * sides.length)] ?? 'left';
}
