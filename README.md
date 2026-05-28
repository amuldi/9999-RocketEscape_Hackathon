# 9999: Rocket Escape

흑백 우주 보드 안에서 로켓을 조종해 별을 먹고 장애물을 피하는 웹 미니게임입니다. 월간 해커톤 “10분 안에 중독시켜라 - 웹 미니게임 챌린지” 제출을 목표로 제작했습니다.

## Play

- GitHub: https://github.com/amuldi/9999-RocketEscape_Hackathon
- Deploy: https://space-rocket-game-smoky.vercel.app
- Plan PDF: https://space-rocket-game-smoky.vercel.app/docs/9999-rocket-escape-plan.pdf

- 이동: 방향키 또는 WASD
- 닉네임 입력 후 `START`
- 순위 확인: `LEADERBOARD`
- 일시정지: P 또는 Esc

## Rules

- 별을 먹으면 기본 점수와 콤보 보너스를 얻습니다.
- 생존 시간이 길어질수록 점수가 조금씩 오릅니다.
- 점수가 오를수록 로켓과 장애물 이동 속도가 함께 빨라집니다.
- 벽, 우주 쓰레기, 소행성에 닿으면 목숨 -1
- 대각선 별똥별은 가장 빠른 장애물보다 더 빠르게 이동하며, 닿으면 목숨 -0.5
- 반짝이는 대각선 별똥별을 먹으면 목숨 +1, 최대 3
- 목숨이 0이 되면 Game Over 후 로컬 랭킹에 기록됩니다.
- 랭킹은 로그인 없이 브라우저 `localStorage`에 저장됩니다.

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
- `docs/9999-rocket-escape-plan.pdf`: 제출용 PDF 기획서
- `docs/gameplay-screenshot.png`: 기획서에 사용한 실제 게임 화면
- `public/docs`: 배포 URL에서 접근 가능한 기획서 정적 파일
- `src/main.ts`: Canvas 생성과 게임 시작점
- `src/game/core`: 게임 루프, 입력, 충돌, 난이도, 공통 타입
- `src/game/objects`: 로켓, 별, 우주 쓰레기, 소행성
- `src/game/effects`: 배경, 별똥별, 불꽃 파티클
- `src/ui`: 닉네임/랭킹 메뉴, HUD와 상태 화면
- `src/styles/global.css`: 전역 스타일
