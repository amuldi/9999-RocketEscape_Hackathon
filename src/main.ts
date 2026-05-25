import { Game } from './game/Game';
import { CANVAS_SIZE } from './game/types';
import './styles/global.css';

const app = document.querySelector<HTMLElement>('#app');

if (!app) {
  throw new Error('App element was not found.');
}

const canvas = document.createElement('canvas');
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;
canvas.tabIndex = 0;
canvas.setAttribute('aria-label', 'Space Rocket Game board');
canvas.setAttribute('role', 'img');

app.append(canvas);

const game = new Game(canvas);
game.start();

window.addEventListener('beforeunload', () => {
  game.destroy();
});
