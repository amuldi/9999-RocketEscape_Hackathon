import type { Game } from '../game/core/Game';
import type { RunResult } from '../game/core/types';

type RankingEntry = RunResult & {
  id: string;
  createdAt: string;
};

const RANKING_KEY = '9999-rocket-escape:defense-ranking';
const NAME_KEY = '9999-rocket-escape:last-name';
const MAX_RANKING_ENTRIES = 10;

export type GameMenu = {
  showResult: (result: RunResult) => void;
};

export function createGameMenu(root: HTMLElement, game: Game): GameMenu {
  const overlay = document.createElement('section');
  overlay.className = 'menu-overlay';
  overlay.setAttribute('aria-label', 'Game setup and ranking');

  const panel = document.createElement('div');
  panel.className = 'menu-panel';

  const title = document.createElement('h1');
  title.textContent = '9999: Rocket Escape';

  const intro = document.createElement('p');
  intro.className = 'menu-copy';
  intro.textContent = '닉네임을 정하고 바로 시작하세요. 점수는 별 획득, 생존 시간, 콤보로 계산됩니다.';

  const label = document.createElement('label');
  label.className = 'field-label';
  label.textContent = 'NICKNAME';

  const input = document.createElement('input');
  input.className = 'nickname-input';
  input.maxLength = 12;
  input.placeholder = 'PLAYER';
  input.value = loadLastName();
  input.autocomplete = 'off';
  input.spellcheck = false;
  label.append(input);

  const startButton = document.createElement('button');
  startButton.className = 'start-button';
  startButton.type = 'button';
  startButton.textContent = 'START';

  const leaderboardButton = document.createElement('button');
  leaderboardButton.className = 'leaderboard-button';
  leaderboardButton.type = 'button';
  leaderboardButton.textContent = 'LEADERBOARD';
  leaderboardButton.setAttribute('aria-expanded', 'false');

  const rankingSection = document.createElement('div');
  rankingSection.className = 'ranking-section is-hidden';

  const rankingTitle = document.createElement('h2');
  rankingTitle.textContent = 'LOCAL RANKING';

  const rankingList = document.createElement('ol');
  rankingList.className = 'ranking-list';

  rankingSection.append(rankingTitle, rankingList);
  panel.append(title, intro, label, startButton, leaderboardButton, rankingSection);
  overlay.append(panel);
  root.append(overlay);

  function startDefenseRun(): void {
    const playerName = sanitizeName(input.value);
    input.value = playerName;
    localStorage.setItem(NAME_KEY, playerName);
    hideRanking();
    overlay.classList.add('is-hidden');
    game.setMenuOpen(false);
    game.beginDefenseRun(playerName);
  }

  startButton.addEventListener('click', startDefenseRun);
  leaderboardButton.addEventListener('click', () => {
    if (rankingSection.classList.contains('is-hidden')) {
      renderRanking(rankingList);
      showRanking();
      return;
    }

    hideRanking();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      startDefenseRun();
    }
  });

  renderRanking(rankingList);
  input.focus();

  return {
    showResult(runResult: RunResult): void {
      const saved = saveRanking(runResult);
      renderRanking(rankingList, saved);
      hideRanking();
      game.setMenuOpen(true);
      overlay.classList.remove('is-hidden');
      startButton.focus();
    },
  };

  function showRanking(): void {
    rankingSection.classList.remove('is-hidden');
    leaderboardButton.setAttribute('aria-expanded', 'true');
  }

  function hideRanking(): void {
    rankingSection.classList.add('is-hidden');
    leaderboardButton.setAttribute('aria-expanded', 'false');
  }
}

function sanitizeName(value: string): string {
  const name = value.trim().replace(/\s+/g, ' ').slice(0, 12);
  return name || 'PLAYER';
}

function loadLastName(): string {
  return sanitizeName(localStorage.getItem(NAME_KEY) ?? '');
}

function runResultId(result: RunResult): string {
  return `${result.playerName}:${result.score}:${Math.round(result.survivalSeconds * 1000)}`;
}

function saveRanking(result: RunResult): RankingEntry[] {
  const entry: RankingEntry = {
    ...result,
    id: runResultId(result),
    createdAt: new Date().toISOString(),
  };
  const ranking = [...loadRanking(), entry]
    .sort((a, b) => b.score - a.score || b.starsCollected - a.starsCollected)
    .slice(0, MAX_RANKING_ENTRIES);

  localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
  return ranking;
}

function loadRanking(): RankingEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RANKING_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isRankingEntry) : [];
  } catch {
    return [];
  }
}

function isRankingEntry(entry: unknown): entry is RankingEntry {
  if (!entry || typeof entry !== 'object') {
    return false;
  }

  const value = entry as Partial<RankingEntry>;
  return typeof value.playerName === 'string' && typeof value.score === 'number' && typeof value.createdAt === 'string';
}

function renderRanking(list: HTMLOListElement, entries = loadRanking()): void {
  list.replaceChildren();

  if (entries.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'ranking-empty';
    empty.textContent = '아직 기록이 없습니다.';
    list.append(empty);
    return;
  }

  for (const entry of entries) {
    const item = document.createElement('li');
    const name = document.createElement('span');
    const score = document.createElement('strong');
    const detail = document.createElement('small');

    name.textContent = entry.playerName;
    score.textContent = entry.score.toString();
    detail.textContent = `${entry.starsCollected} stars / ${Math.floor(entry.survivalSeconds)}s`;
    item.append(name, score, detail);
    list.append(item);
  }
}
