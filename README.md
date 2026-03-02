# Bird Poo

A browser-based arcade game where you play as a bird trying to poop on unsuspecting humans below.

## How to Play

- **Move**: Touch/drag left or right on screen to fly the bird
- **Poop**: Tap to drop a poop bomb on the human
- **Dodge**: Avoid the bullets the human fires back at you

**Lives**: You start with 3 lives. Getting hit by a bullet costs a life. Lose all 3 and it's game over.

**Ammo**: You have limited ammo that slowly regenerates.

## How It Was Made

Built as a progressive web app (PWA) using React and Vite.

### Tech Stack

- **React 18** — component architecture and state management via `useReducer`
- **TypeScript** — fully typed throughout
- **GSAP** — all animations: walking legs/arms, bird wing flap, poop trajectory, level-up overlay, human shake on hit
- **SVG** — the entire game is rendered in a single `<svg>` viewBox (400×600), which scales to fill any screen size
- **Vite + vite-plugin-pwa** — fast dev server, production build, and PWA manifest/service worker generation
- **Supabase** — cloud Postgres database backing the top-10 leaderboard (row-level security, public read/insert)

### Architecture

The game uses a single reducer (`useGameState`) as the source of truth for all game state: bird position, human position, score, level, ammo, lives, poop projectiles, and bullets. Logic hooks (`useHumanAI`, `useHumanShooting`, `useAmmoRegen`, `useBirdControls`) drive behavior by calling action dispatchers.

All visuals are SVG components. Characters are drawn in a Picasso cubist style — angular polygons, split geometric planes, simultaneous profile+frontal views. The human has six animated states: side-walk, front-turn, shooting, vomiting, crying, and running.

### PWA

The game installs as a full-screen portrait app on iOS and Android via "Add to Home Screen". The service worker precaches all assets for offline play.

## Contributing

Contributions are welcome. To get started:

1. Fork the repository
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Run tests: `npm run test`
5. Make your changes and ensure tests pass: `npm run test:run`
6. Open a pull request with a clear description of what you changed and why

Please keep PRs focused — one feature or fix per PR. Follow the existing code style (TypeScript strict, React hooks, GSAP for all animations).

## License

MIT License

Copyright (c) 2026 blumaa

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
