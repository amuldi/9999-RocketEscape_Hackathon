import { circleIntersectsCircle, distance } from './Collision';
import { BOARD, type Vector } from './types';

export class Star {
  readonly radius = 12;
  position: Vector = { x: 0, y: 0 };

  constructor(playerPosition: Vector) {
    this.respawn(playerPosition);
  }

  respawn(playerPosition: Vector): void {
    let candidate = this.randomPosition();
    let attempts = 0;

    while (distance(candidate, playerPosition) < 88 && attempts < 40) {
      candidate = this.randomPosition();
      attempts += 1;
    }

    this.position = candidate;
  }

  isCollectedBy(playerPosition: Vector, playerRadius: number): boolean {
    return circleIntersectsCircle(this.position, this.radius, playerPosition, playerRadius);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.lineWidth = 1.6;

    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const radius = i % 2 === 0 ? this.radius : this.radius * 0.42;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
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
    ctx.restore();
  }

  private randomPosition(): Vector {
    const padding = 28;

    return {
      x: BOARD.x + padding + Math.random() * (BOARD.width - padding * 2),
      y: BOARD.y + padding + Math.random() * (BOARD.height - padding * 2),
    };
  }
}
