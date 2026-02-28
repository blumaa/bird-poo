export type GameStatus = 'idle' | 'playing' | 'paused' | 'gameOver';

export interface PoopData {
  id: string;
  x: number;
  y: number;
  createdAt: number;
}

export interface BulletData {
  id: string;
  x: number;
  y: number;
}

export type HumanState = 'walking' | 'shooting';
export type HumanReaction = 'none' | 'vomiting' | 'crying' | 'running';

export interface GameState {
  status: GameStatus;
  birdX: number;
  humanX: number;
  humanDirection: 'left' | 'right';
  humanState: HumanState;
  humanReaction: HumanReaction;
  isHumanRespawning: boolean;
  score: number;
  levelHits: number;    // Hits in current level (resets on level up)
  totalHits: number;    // Cumulative hits for level calculation
  level: number;
  poops: PoopData[];
  bullets: BulletData[];
  ammo: number;
  maxAmmo: number;
  birdLives: number;    // Bird lives (game over at 0)
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'MOVE_BIRD'; x: number }
  | { type: 'MOVE_HUMAN'; x: number; direction: 'left' | 'right' }
  | { type: 'SPAWN_POOP'; poop: PoopData }
  | { type: 'REMOVE_POOP'; id: string }
  | { type: 'HIT_HUMAN'; id: string }
  | { type: 'MISS_HUMAN'; id: string }
  | { type: 'BIRD_HIT' }
  | { type: 'START_SHOOTING' }
  | { type: 'STOP_SHOOTING' }
  | { type: 'SPAWN_BULLET'; bullet: BulletData }
  | { type: 'REMOVE_BULLET'; id: string }
  | { type: 'REGEN_AMMO' }
  | { type: 'START_REACTION'; reaction: HumanReaction }
  | { type: 'END_REACTION' }
  | { type: 'START_RESPAWN' }
  | { type: 'FINISH_RESPAWN' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'RESET_GAME' };

export interface LevelConfig {
  humanSpeed: number;
  poopFallDuration: number;
  hitsRequired: number;
  minShootInterval: number;
  maxShootInterval: number;
}
