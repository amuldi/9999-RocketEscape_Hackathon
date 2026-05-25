import { BOARD, CANVAS_SIZE, TARGET_SCORE } from '../game/core/types';

export function drawStartScreen(ctx: CanvasRenderingContext2D): void {
  drawOverlay(ctx);
  drawTitle(ctx, '9999: ROCKET ESCAPE', 218);
  drawLine(ctx, 'ARROW KEYS / WASD  MOVE', 292, 18);
  drawLine(ctx, 'EAT ONE STAR AT A TIME', 326, 18);
  drawLine(ctx, 'AVOID WALLS, DEBRIS, ASTEROIDS', 360, 18);
  drawLine(ctx, 'SPACE OR ENTER TO START', 428, 18);
  drawLine(ctx, 'P OR ESC TO PAUSE', 462, 14);
}

export function drawPauseScreen(ctx: CanvasRenderingContext2D): void {
  drawOverlay(ctx);
  drawTitle(ctx, 'PAUSED', 308);
  drawLine(ctx, 'SPACE / ENTER OR P TO RESUME', 370, 18);
}

export function drawGameOverScreen(ctx: CanvasRenderingContext2D, score: number): void {
  drawOverlay(ctx);
  drawTitle(ctx, 'GAME OVER', 278);
  drawLine(ctx, `FINAL SCORE: ${score}`, 342, 20);
  drawLine(ctx, 'SPACE OR ENTER TO RESTART', 412, 18);
}

export function drawEndScreen(ctx: CanvasRenderingContext2D): void {
  drawOverlay(ctx);
  drawTitle(ctx, 'END', 248);
  drawLine(ctx, `${TARGET_SCORE} POINTS REACHED`, 326, 22);
  drawLine(ctx, 'MISSION CLEAR', 382, 20);
  drawLine(ctx, 'SPACE OR ENTER TO PLAY AGAIN', 456, 16);
}

function drawOverlay(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.fillRect(BOARD.x, BOARD.y, BOARD.width, BOARD.height);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(BOARD.x + 42, BOARD.y + 136, BOARD.width - 84, 330);
  ctx.restore();
}

function drawTitle(ctx: CanvasRenderingContext2D, text: string, y: number): void {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, CANVAS_SIZE / 2, y);
  ctx.restore();
}

function drawLine(ctx: CanvasRenderingContext2D, text: string, y: number, size: number): void {
  ctx.save();
  ctx.fillStyle = '#f1f1f1';
  ctx.font = `${size}px "Courier New", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, CANVAS_SIZE / 2, y);
  ctx.restore();
}
