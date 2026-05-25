import type { Rect, Vector } from './types';

export function distance(a: Vector, b: Vector): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function circleIntersectsCircle(a: Vector, aRadius: number, b: Vector, bRadius: number): boolean {
  return distance(a, b) <= aRadius + bRadius;
}

export function circleIntersectsRect(center: Vector, radius: number, rect: Rect): boolean {
  const nearestX = clamp(center.x, rect.x, rect.x + rect.width);
  const nearestY = clamp(center.y, rect.y, rect.y + rect.height);
  return Math.hypot(center.x - nearestX, center.y - nearestY) <= radius;
}

export function isCircleOutsideRect(center: Vector, radius: number, rect: Rect): boolean {
  return (
    center.x - radius < rect.x ||
    center.x + radius > rect.x + rect.width ||
    center.y - radius < rect.y ||
    center.y + radius > rect.y + rect.height
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function normalize(vector: Vector): Vector {
  const length = Math.hypot(vector.x, vector.y);

  if (length === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
  };
}
