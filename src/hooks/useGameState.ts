import { useReducer, useCallback } from 'react';
import type { GameState, GameAction, PoopData, BulletData, HumanReaction, HumanData } from '../types/game';
import { INITIAL_STATE, VIEWBOX, calculateLevel, MAX_AMMO, getHumanCount, createHuman, randomCharacter } from '../utils/constants';

const REACTIONS: HumanReaction[] = ['vomiting', 'crying', 'running'];

function getRandomReaction(): HumanReaction {
  return REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
}

const BIRD_BOUNDARY_MARGIN = 20;
const HUMAN_BOUNDARY_MARGIN = 20;

function randomHumanX(): number {
  return HUMAN_BOUNDARY_MARGIN + Math.random() * (VIEWBOX.width - HUMAN_BOUNDARY_MARGIN * 2);
}

function updateHuman(humans: HumanData[], humanId: string, updater: (h: HumanData) => HumanData): HumanData[] {
  return humans.map(h => h.id === humanId ? updater(h) : h);
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...INITIAL_STATE,
        status: 'playing',
        birdX: VIEWBOX.width / 2,
        humans: [createHuman('human-0')],
        ammo: MAX_AMMO,
        maxAmmo: MAX_AMMO,
      };

    case 'MOVE_BIRD': {
      const clampedX = Math.max(
        BIRD_BOUNDARY_MARGIN,
        Math.min(VIEWBOX.width - BIRD_BOUNDARY_MARGIN, action.x)
      );
      return { ...state, birdX: clampedX };
    }

    case 'MOVE_HUMAN': {
      const clampedX = Math.max(
        HUMAN_BOUNDARY_MARGIN,
        Math.min(VIEWBOX.width - HUMAN_BOUNDARY_MARGIN, action.x)
      );
      return {
        ...state,
        humans: updateHuman(state.humans, action.humanId, h => ({
          ...h, x: clampedX, direction: action.direction,
        })),
      };
    }

    case 'SPAWN_POOP':
      if (state.ammo <= 0) return state;
      return {
        ...state,
        poops: [...state.poops, action.poop],
        ammo: state.ammo - 1,
      };

    case 'REMOVE_POOP':
      return { ...state, poops: state.poops.filter((p) => p.id !== action.id) };

    case 'HIT_HUMAN': {
      const human = state.humans.find(h => h.id === action.humanId);
      if (!human || human.reaction !== 'none' || human.isRespawning) {
        return state;
      }
      const newTotalHits = state.totalHits + 1;
      const newLevel = calculateLevel(newTotalHits);
      const leveledUp = newLevel > state.level;
      const newLevelHits = leveledUp ? 1 : state.levelHits + 1;
      const newScore = state.score + 10;
      return {
        ...state,
        score: newScore,
        levelHits: newLevelHits,
        totalHits: newTotalHits,
        level: newLevel,
        ammo: MAX_AMMO,
        humans: updateHuman(state.humans, action.humanId, h => ({
          ...h, reaction: getRandomReaction(), state: 'walking',
        })),
      };
    }

    case 'MISS_HUMAN':
      return state;

    case 'BIRD_HIT': {
      const newLives = state.birdLives - 1;
      if (newLives <= 0) {
        return { ...state, birdLives: 0, status: 'dying' };
      }
      return { ...state, birdLives: newLives };
    }

    case 'FINALIZE_GAME_OVER':
      return { ...state, status: 'gameOver' };

    case 'START_SHOOTING':
      return {
        ...state,
        humans: updateHuman(state.humans, action.humanId, h => ({ ...h, state: 'shooting' })),
      };

    case 'STOP_SHOOTING':
      return {
        ...state,
        humans: updateHuman(state.humans, action.humanId, h => ({ ...h, state: 'walking' })),
      };

    case 'SPAWN_BULLET':
      return { ...state, bullets: [...state.bullets, action.bullet] };

    case 'REMOVE_BULLET':
      return { ...state, bullets: state.bullets.filter((b) => b.id !== action.id) };

    case 'REGEN_AMMO':
      if (state.ammo >= state.maxAmmo) return state;
      return { ...state, ammo: state.ammo + 1 };

    case 'START_REACTION':
      return {
        ...state,
        humans: updateHuman(state.humans, action.humanId, h => ({
          ...h, reaction: action.reaction, state: 'walking',
        })),
      };

    case 'END_REACTION':
      return {
        ...state,
        humans: updateHuman(state.humans, action.humanId, h => ({ ...h, reaction: 'none' })),
      };

    case 'START_RESPAWN':
      return {
        ...state,
        humans: updateHuman(state.humans, action.humanId, h => ({
          ...h, isRespawning: true, reaction: 'none',
        })),
      };

    case 'FINISH_RESPAWN':
      return {
        ...state,
        humans: updateHuman(state.humans, action.humanId, h => ({
          ...h,
          isRespawning: false,
          x: randomHumanX(),
          direction: Math.random() < 0.5 ? 'left' : 'right',
          character: randomCharacter(),
        })),
      };

    case 'SYNC_HUMAN_COUNT': {
      const target = getHumanCount(state.level);
      if (target === state.humans.length) return state;
      if (target > state.humans.length) {
        const newHumans = [...state.humans];
        for (let i = state.humans.length; i < target; i++) {
          newHumans.push(createHuman(`human-${i}`));
        }
        return { ...state, humans: newHumans };
      }
      // Fewer needed (unlikely but safe)
      return { ...state, humans: state.humans.slice(0, target) };
    }

    case 'PAUSE_GAME':
      return state.status === 'playing' ? { ...state, status: 'paused' } : state;

    case 'RESUME_GAME':
      return state.status === 'paused' ? { ...state, status: 'playing' } : state;

    case 'RESET_GAME':
      return INITIAL_STATE;

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  const moveBird = useCallback((x: number) => {
    dispatch({ type: 'MOVE_BIRD', x });
  }, []);

  const moveHuman = useCallback((humanId: string, x: number, direction: 'left' | 'right') => {
    dispatch({ type: 'MOVE_HUMAN', humanId, x, direction });
  }, []);

  const spawnPoop = useCallback((poop: PoopData) => {
    dispatch({ type: 'SPAWN_POOP', poop });
  }, []);

  const removePoop = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_POOP', id });
  }, []);

  const hitHuman = useCallback((id: string, humanId: string) => {
    dispatch({ type: 'HIT_HUMAN', id, humanId });
  }, []);

  const missHuman = useCallback((id: string) => {
    dispatch({ type: 'MISS_HUMAN', id });
  }, []);

  const regenAmmo = useCallback(() => {
    dispatch({ type: 'REGEN_AMMO' });
  }, []);

  const birdHit = useCallback(() => {
    dispatch({ type: 'BIRD_HIT' });
  }, []);

  const finalizeGameOver = useCallback(() => {
    dispatch({ type: 'FINALIZE_GAME_OVER' });
  }, []);

  const spawnBullet = useCallback((bullet: BulletData) => {
    dispatch({ type: 'SPAWN_BULLET', bullet });
  }, []);

  const removeBullet = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_BULLET', id });
  }, []);

  const startReaction = useCallback((humanId: string, reaction: HumanReaction) => {
    dispatch({ type: 'START_REACTION', humanId, reaction });
  }, []);

  const endReaction = useCallback((humanId: string) => {
    dispatch({ type: 'END_REACTION', humanId });
  }, []);

  const startRespawn = useCallback((humanId: string) => {
    dispatch({ type: 'START_RESPAWN', humanId });
  }, []);

  const finishRespawn = useCallback((humanId: string) => {
    dispatch({ type: 'FINISH_RESPAWN', humanId });
  }, []);

  const syncHumanCount = useCallback(() => {
    dispatch({ type: 'SYNC_HUMAN_COUNT' });
  }, []);

  const pauseGame = useCallback(() => {
    dispatch({ type: 'PAUSE_GAME' });
  }, []);

  const resumeGame = useCallback(() => {
    dispatch({ type: 'RESUME_GAME' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return {
    state,
    startGame,
    moveBird,
    moveHuman,
    spawnPoop,
    removePoop,
    hitHuman,
    missHuman,
    birdHit,
    finalizeGameOver,
    spawnBullet,
    removeBullet,
    regenAmmo,
    startReaction,
    endReaction,
    startRespawn,
    finishRespawn,
    syncHumanCount,
    pauseGame,
    resumeGame,
    resetGame,
  };
}
