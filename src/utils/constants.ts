import type { LevelConfig, GameState, HumanData, HumanCharacter } from '../types/game';

export const VIEWBOX = {
  width: 400,
  height: 600,
};

export const GROUND_Y = 500;
export const PLAYER_Y = 490;
export const BIRD_Y = 120;
export const BIRD_MIN_Y = 100;
export const BIRD_MAX_Y = 150;
export const PLAYER_WIDTH = 40;
export const POOP_WIDTH = 20;
export const HIT_TOLERANCE = 15;

export const MAX_AMMO = 3;
export const AMMO_REGEN_INTERVAL = 10000;
export const INITIAL_BIRD_LIVES = 3;
export const HUMAN_HIT_Y = PLAYER_Y - 45; // Top of human hit zone (above head)

const HUMAN_BOUNDARY_MARGIN = 20;

// 100 points per level, 10 points per hit = 10 hits per level
const HITS_PER_LEVEL = 10;

const CHARACTERS: HumanCharacter[] = ['suit', 'chef', 'tourist', 'diva'];

export function randomCharacter(): HumanCharacter {
  return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
}

export function getHumanCount(level: number): number {
  if (level >= 15) return 4;
  if (level >= 10) return 3;
  if (level >= 5) return 2;
  return 1;
}

export function createHuman(id: string): HumanData {
  return {
    id,
    x: HUMAN_BOUNDARY_MARGIN + Math.random() * (VIEWBOX.width - HUMAN_BOUNDARY_MARGIN * 2),
    direction: Math.random() < 0.5 ? 'left' : 'right',
    state: 'walking',
    reaction: 'none',
    isRespawning: false,
    character: randomCharacter(),
  };
}

export const INITIAL_STATE: GameState = {
  status: 'idle',
  birdX: VIEWBOX.width / 2,
  humans: [{
    id: 'human-0',
    x: VIEWBOX.width / 2,
    direction: 'right',
    state: 'walking',
    reaction: 'none',
    isRespawning: false,
    character: 'suit',
  }],
  score: 0,
  levelHits: 0,
  totalHits: 0,
  level: 1,
  poops: [],
  bullets: [],
  ammo: MAX_AMMO,
  maxAmmo: MAX_AMMO,
  birdLives: INITIAL_BIRD_LIVES,
};

// Fully formula-based: humanSpeed has no cap per spec
export function getLevelConfig(level: number): LevelConfig {
  const l = Math.max(level, 1);
  const humanCount = getHumanCount(l);
  let ammoRegenInterval = AMMO_REGEN_INTERVAL; // 10000ms base
  if (humanCount >= 4) ammoRegenInterval = 3000;
  else if (humanCount >= 3) ammoRegenInterval = 5000;
  else if (humanCount >= 2) ammoRegenInterval = 7000;

  return {
    humanSpeed:       l + 1,
    poopFallDuration: Math.max(2.0 - (l - 1) * 0.15, 0.4),
    hitsRequired:     HITS_PER_LEVEL,
    minShootInterval: Math.max(2000 - (l - 1) * 200, 150),
    maxShootInterval: Math.max(3500 - (l - 1) * 350, 300),
    ammoRegenInterval,
  };
}

// New level every 10 hits (= 100 points at 10pts/hit)
export function calculateLevel(hits: number): number {
  return Math.floor(hits / HITS_PER_LEVEL) + 1;
}

export function checkCollision(humanX: number, poopX: number): boolean {
  const humanLeft = humanX - PLAYER_WIDTH / 2;
  const humanRight = humanX + PLAYER_WIDTH / 2;
  const poopCenter = poopX;

  return poopCenter >= humanLeft - HIT_TOLERANCE && poopCenter <= humanRight + HIT_TOLERANCE;
}
