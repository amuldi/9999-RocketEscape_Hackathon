import { BOARD, type Vector } from '../core/types';

type BackgroundStar = Vector & {
  radius: number;
  alpha: number;
};

type MeteorKind = 'danger' | 'heal';

type Meteor = {
  position: Vector;
  velocity: Vector;
  length: number;
  radius: number;
  life: number;
  kind: MeteorKind;
};

export class Background {
  private readonly stars: BackgroundStar[];
  private meteors: Meteor[] = [];
  private dangerMeteorTimer = 22 + Math.random() * 22;
  private healMeteorTimer = 52 + Math.random() * 40;

  constructor() {
    this.stars = Array.from({ length: 100 }, () => ({
      x: BOARD.x + Math.random() * BOARD.width,
      y: BOARD.y + Math.random() * BOARD.height,
      radius: Math.random() < 0.72 ? 1 : 1.6,
      alpha: 0.32 + Math.random() * 0.6,
    }));
  }

  update(deltaTime: number, meteorSpeed: number): void {
    this.dangerMeteorTimer -= deltaTime;
    this.healMeteorTimer -= deltaTime;

    if (this.meteors.length === 0) {
      if (this.healMeteorTimer <= 0) {
        this.spawnMeteor('heal', meteorSpeed);
        this.healMeteorTimer = 55 + Math.random() * 45;
        this.dangerMeteorTimer = Math.max(this.dangerMeteorTimer, 14 + Math.random() * 12);
      } else if (this.dangerMeteorTimer <= 0) {
        this.spawnMeteor('danger', meteorSpeed);
        this.dangerMeteorTimer = 24 + Math.random() * 26;
      }
    }

    for (const meteor of this.meteors) {
      meteor.position.x += meteor.velocity.x * deltaTime;
      meteor.position.y += meteor.velocity.y * deltaTime;
      meteor.life -= deltaTime;
    }

    this.meteors = this.meteors.filter((meteor) => meteor.life > 0 && this.isInsideLooseBounds(meteor));
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.beginPath();
    ctx.rect(BOARD.x, BOARD.y, BOARD.width, BOARD.height);
    ctx.clip();

    for (const star of this.stars) {
      ctx.globalAlpha = star.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(star.x, star.y, star.radius, star.radius);
    }

    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#ffffff';

    for (const meteor of this.meteors) {
      this.drawMeteor(ctx, meteor);
    }

    ctx.restore();
  }

  consumeDangerHit(playerPosition: Vector, playerRadius: number): boolean {
    const hitIndex = this.meteors.findIndex(
      (meteor) => meteor.kind === 'danger' && this.meteorHitsPlayer(meteor, playerPosition, playerRadius),
    );

    if (hitIndex === -1) {
      return false;
    }

    this.meteors.splice(hitIndex, 1);
    return true;
  }

  consumeHealHit(playerPosition: Vector, playerRadius: number): boolean {
    const hitIndex = this.meteors.findIndex(
      (meteor) => meteor.kind === 'heal' && this.meteorHitsPlayer(meteor, playerPosition, playerRadius),
    );

    if (hitIndex === -1) {
      return false;
    }

    this.meteors.splice(hitIndex, 1);
    return true;
  }

  private spawnMeteor(kind: MeteorKind, speed: number): void {
    const path = randomDiagonalPath();
    const direction = normalize({
      x: path.to.x - path.from.x,
      y: path.to.y - path.from.y,
    });
    const diagonalDistance = Math.hypot(path.to.x - path.from.x, path.to.y - path.from.y);

    this.meteors.push({
      position: path.from,
      velocity: {
        x: direction.x * speed,
        y: direction.y * speed,
      },
      length: kind === 'heal' ? 58 : 74,
      radius: kind === 'heal' ? 15 : 12,
      life: diagonalDistance / speed + 0.08,
      kind,
    });
  }

  private drawMeteor(ctx: CanvasRenderingContext2D, meteor: Meteor): void {
    const tail = {
      x: meteor.position.x - meteor.velocity.x * 0.005 * meteor.length,
      y: meteor.position.y - meteor.velocity.y * 0.005 * meteor.length,
    };
    const alpha = Math.min(1, meteor.life / 0.55);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = meteor.kind === 'heal' ? '#ffffff' : '#d8d8d8';
    ctx.lineWidth = meteor.kind === 'heal' ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(meteor.position.x, meteor.position.y);
    ctx.lineTo(tail.x, tail.y);
    ctx.stroke();

    ctx.globalAlpha = meteor.kind === 'heal' ? 0.9 : 0.75;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(meteor.position.x, meteor.position.y, meteor.radius, 0, Math.PI * 2);
    ctx.stroke();

    if (meteor.kind === 'heal') {
      const sparkle = 7 + Math.sin(performance.now() / 95) * 3;
      ctx.beginPath();
      ctx.moveTo(meteor.position.x - sparkle, meteor.position.y);
      ctx.lineTo(meteor.position.x + sparkle, meteor.position.y);
      ctx.moveTo(meteor.position.x, meteor.position.y - sparkle);
      ctx.lineTo(meteor.position.x, meteor.position.y + sparkle);
      ctx.stroke();
    }

    ctx.restore();
  }

  private isInsideLooseBounds(meteor: Meteor): boolean {
    const margin = 80;

    return (
      meteor.position.x > BOARD.x - margin &&
      meteor.position.x < BOARD.x + BOARD.width + margin &&
      meteor.position.y > BOARD.y - margin &&
      meteor.position.y < BOARD.y + BOARD.height + margin
    );
  }

  private meteorHitsPlayer(meteor: Meteor, playerPosition: Vector, playerRadius: number): boolean {
    const tail = getMeteorTail(meteor);
    return distanceToSegment(playerPosition, tail, meteor.position) <= playerRadius + meteor.radius;
  }
}

function randomDiagonalPath(): { from: Vector; to: Vector } {
  const paths = [
    {
      from: { x: BOARD.x, y: BOARD.y },
      to: { x: BOARD.x + BOARD.width, y: BOARD.y + BOARD.height },
    },
    {
      from: { x: BOARD.x + BOARD.width, y: BOARD.y + BOARD.height },
      to: { x: BOARD.x, y: BOARD.y },
    },
    {
      from: { x: BOARD.x + BOARD.width, y: BOARD.y },
      to: { x: BOARD.x, y: BOARD.y + BOARD.height },
    },
    {
      from: { x: BOARD.x, y: BOARD.y + BOARD.height },
      to: { x: BOARD.x + BOARD.width, y: BOARD.y },
    },
  ];

  return paths[Math.floor(Math.random() * paths.length)] ?? paths[0];
}

function normalize(vector: Vector): Vector {
  const length = Math.hypot(vector.x, vector.y) || 1;
  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}

function getMeteorTail(meteor: Meteor): Vector {
  return {
    x: meteor.position.x - meteor.velocity.x * 0.005 * meteor.length,
    y: meteor.position.y - meteor.velocity.y * 0.005 * meteor.length,
  };
}

function distanceToSegment(point: Vector, start: Vector, end: Vector): number {
  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;
  const lengthSquared = segmentX * segmentX + segmentY * segmentY;

  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const ratio = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) / lengthSquared),
  );
  const nearest = {
    x: start.x + segmentX * ratio,
    y: start.y + segmentY * ratio,
  };

  return Math.hypot(point.x - nearest.x, point.y - nearest.y);
}
