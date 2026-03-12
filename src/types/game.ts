export type GameStatus = 'idle' | 'playing' | 'paused' | 'dying' | 'gameOver';
export type HumanCharacter = 'suit' | 'chef' | 'tourist' | 'diva';

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
  characterType?: HumanCharacter;
}

export type HumanState = 'walking' | 'shooting';
export type HumanReaction = 'none' | 'vomiting' | 'crying' | 'running';

export interface HumanData {
  id: string;
  x: number;
  direction: 'left' | 'right';
  state: HumanState;
  reaction: HumanReaction;
  isRespawning: boolean;
  character: HumanCharacter;
}

export interface GameState {
  status: GameStatus;
  birdX: number;
  humans: HumanData[];
  score: number;
  levelHits: number;
  totalHits: number;
  level: number;
  poops: PoopData[];
  bullets: BulletData[];
  ammo: number;
  maxAmmo: number;
  birdLives: number;
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'MOVE_BIRD'; x: number }
  | { type: 'MOVE_HUMAN'; humanId: string; x: number; direction: 'left' | 'right' }
  | { type: 'SPAWN_POOP'; poop: PoopData }
  | { type: 'REMOVE_POOP'; id: string }
  | { type: 'HIT_HUMAN'; id: string; humanId: string }
  | { type: 'MISS_HUMAN'; id: string }
  | { type: 'BIRD_HIT' }
  | { type: 'START_SHOOTING'; humanId: string }
  | { type: 'STOP_SHOOTING'; humanId: string }
  | { type: 'SPAWN_BULLET'; bullet: BulletData }
  | { type: 'REMOVE_BULLET'; id: string }
  | { type: 'REGEN_AMMO' }
  | { type: 'START_REACTION'; humanId: string; reaction: HumanReaction }
  | { type: 'END_REACTION'; humanId: string }
  | { type: 'START_RESPAWN'; humanId: string }
  | { type: 'FINISH_RESPAWN'; humanId: string }
  | { type: 'SYNC_HUMAN_COUNT' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'FINALIZE_GAME_OVER' }
  | { type: 'RESET_GAME' };

export interface LevelConfig {
  humanSpeed: number;
  poopFallDuration: number;
  hitsRequired: number;
  minShootInterval: number;
  maxShootInterval: number;
}
