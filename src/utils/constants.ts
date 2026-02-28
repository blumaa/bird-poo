import type { LevelConfig, GameState } from '../types/game';

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

export const MAX_AMMO = 5;
export const AMMO_REGEN_INTERVAL = 2000;
export const INITIAL_BIRD_LIVES = 3;
export const HUMAN_HIT_Y = PLAYER_Y - 45; // Top of human hit zone (above head)

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: { humanSpeed: 2, poopFallDuration: 2.0, hitsRequired: 5,  minShootInterval: 4000, maxShootInterval: 7000 },
  2: { humanSpeed: 3, poopFallDuration: 1.8, hitsRequired: 10, minShootInterval: 3500, maxShootInterval: 6000 },
  3: { humanSpeed: 4, poopFallDuration: 1.5, hitsRequired: 15, minShootInterval: 3000, maxShootInterval: 5000 },
  4: { humanSpeed: 5, poopFallDuration: 1.2, hitsRequired: 20, minShootInterval: 2500, maxShootInterval: 4000 },
  5: { humanSpeed: 6, poopFallDuration: 1.0, hitsRequired: 25, minShootInterval: 2000, maxShootInterval: 3000 },
};

export const MAX_LEVEL = 5;

export const INITIAL_STATE: GameState = {
  status: 'idle',
  birdX: VIEWBOX.width / 2,
  humanX: VIEWBOX.width / 2,
  humanDirection: 'right',
  humanState: 'walking',
  humanReaction: 'none',
  isHumanRespawning: false,
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

export function getLevelConfig(level: number): LevelConfig {
  const clampedLevel = Math.min(Math.max(level, 1), MAX_LEVEL);
  return LEVEL_CONFIGS[clampedLevel];
}

export function calculateLevel(hits: number): number {
  if (hits >= 25) return 5;
  if (hits >= 20) return 4;
  if (hits >= 15) return 3;
  if (hits >= 10) return 2;
  return 1;
}

export function checkCollision(humanX: number, poopX: number): boolean {
  const humanLeft = humanX - PLAYER_WIDTH / 2;
  const humanRight = humanX + PLAYER_WIDTH / 2;
  const poopCenter = poopX;

  return poopCenter >= humanLeft - HIT_TOLERANCE && poopCenter <= humanRight + HIT_TOLERANCE;
}
