import type { Vector } from './types';

const DIRECTION_KEYS = new Map<string, Vector>([
  ['ArrowUp', { x: 0, y: -1 }],
  ['KeyW', { x: 0, y: -1 }],
  ['ArrowDown', { x: 0, y: 1 }],
  ['KeyS', { x: 0, y: 1 }],
  ['ArrowLeft', { x: -1, y: 0 }],
  ['KeyA', { x: -1, y: 0 }],
  ['ArrowRight', { x: 1, y: 0 }],
  ['KeyD', { x: 1, y: 0 }],
]);

export class Input {
  private desiredDirection: Vector = { x: 1, y: 0 };
  private startQueued = false;
  private pauseQueued = false;

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const direction = DIRECTION_KEYS.get(event.code);

    if (direction) {
      event.preventDefault();
      this.desiredDirection = direction;
      return;
    }

    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      this.startQueued = true;
      return;
    }

    if (event.code === 'KeyP' || event.code === 'Escape') {
      event.preventDefault();
      this.pauseQueued = true;
    }
  };

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
  }

  getDirection(): Vector {
    return this.desiredDirection;
  }

  consumeStart(): boolean {
    const queued = this.startQueued;
    this.startQueued = false;
    return queued;
  }

  consumePause(): boolean {
    const queued = this.pauseQueued;
    this.pauseQueued = false;
    return queued;
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
  }
}
