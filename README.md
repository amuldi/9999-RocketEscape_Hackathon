# Space Rocket Game

흑백 우주 보드 안에서 로켓을 조종해 별을 먹고 장애물을 피하는 웹 미니게임입니다. 월간 해커톤 “10분 안에 중독시켜라 - 웹 미니게임 챌린지” 제출을 목표로 제작했습니다.

## Play

- GitHub: https://github.com/amuldi/SpaceRocketGame_Hackathon
- Deploy: https://space-rocket-game-smoky.vercel.app

- 이동: 방향키 또는 WASD
- 시작 / 재시작: Space 또는 Enter
- 일시정지: P 또는 Esc

## Rules

- 별을 먹으면 점수 +1
- 점수가 오를수록 로켓 속도가 빨라집니다.
- 벽, 우주 쓰레기, 소행성에 닿으면 목숨 -1
- 대각선 별똥별에 닿으면 목숨 -0.5
- 반짝이는 대각선 별똥별을 먹으면 목숨 +1, 최대 3
- 목숨이 0이 되면 Game Over

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Stack

- Vite
- TypeScript
- HTML Canvas
- CSS

## Files

- `PROJECT_PLAN.md`: 해커톤 제출용 기획서
- `src/game`: 게임 로직과 엔티티
- `src/ui`: HUD와 상태 화면
- `src/styles/global.css`: 전역 스타일
