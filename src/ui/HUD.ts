import { BOARD } from '../game/core/types';

export function drawHUD(ctx: CanvasRenderingContext2D, score: number, lives: number, playerName: string, combo: number): void {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px "Courier New", monospace';
  ctx.textBaseline = 'middle';

  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score.toString().padStart(5, '0')}`, BOARD.x + 18, BOARD.y + 24);

  ctx.textAlign = 'center';
  ctx.fillText(`${playerName.toUpperCase()}  COMBO:${combo}`, BOARD.x + BOARD.width / 2, BOARD.y + 24);

  ctx.textAlign = 'right';
  ctx.fillText(`LIFE: ${formatLife(lives)}`, BOARD.x + BOARD.width - 18, BOARD.y + 24);
  ctx.restore();
}

function formatLife(lives: number): string {
  return Number.isInteger(lives) ? lives.toString() : lives.toFixed(1);
}
