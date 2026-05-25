import { normalize } from './Collision';
import type { Vector } from './types';

export class Particle {
  private age = 0;

  constructor(
    public position: Vector,
    private readonly velocity: Vector,
    private readonly lifetime: number,
    private readonly size: number,
  ) {}

  static flame(origin: Vector, direction: Vector): Particle {
    const backward = normalize({ x: -direction.x, y: -direction.y });
    const side = { x: -direction.y, y: direction.x };
    const drift = (Math.random() - 0.5) * 34;
    const speed = 70 + Math.random() * 88;

    return new Particle(
      {
        x: origin.x + side.x * drift * 0.08,
        y: origin.y + side.y * drift * 0.08,
      },
      {
        x: backward.x * speed + side.x * drift,
        y: backward.y * speed + side.y * drift,
      },
      0.24 + Math.random() * 0.2,
      2 + Math.random() * 4,
    );
  }

  update(deltaTime: number): void {
    this.age += deltaTime;
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
  }

  isAlive(): boolean {
    return this.age < this.lifetime;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const lifeRatio = 1 - this.age / this.lifetime;
    const alpha = Math.max(0, lifeRatio);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = alpha > 0.55 ? '#ffffff' : '#9f9f9f';
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.size * lifeRatio, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
