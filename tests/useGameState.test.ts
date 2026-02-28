import { describe, it, expect } from 'vitest';
import { gameReducer } from '../src/hooks/useGameState';
import { INITIAL_STATE, VIEWBOX, MAX_AMMO } from '../src/utils/constants';
import type { GameState, PoopData } from '../src/types/game';

describe('gameReducer', () => {
  describe('START_GAME', () => {
    it('sets status to playing', () => {
      const state = gameReducer(INITIAL_STATE, { type: 'START_GAME' });
      expect(state.status).toBe('playing');
    });

    it('resets score, hits, and level', () => {
      const modifiedState: GameState = { ...INITIAL_STATE, score: 100, levelHits: 3, totalHits: 20, level: 3 };
      const state = gameReducer(modifiedState, { type: 'START_GAME' });
      expect(state.score).toBe(0);
      expect(state.levelHits).toBe(0);
      expect(state.totalHits).toBe(0);
      expect(state.level).toBe(1);
    });

    it('clears poops and resets ammo', () => {
      const stateWithPoops: GameState = {
        ...INITIAL_STATE,
        poops: [{ id: '1', x: 100, y: 200, createdAt: Date.now() }],
        ammo: 0,
      };
      const state = gameReducer(stateWithPoops, { type: 'START_GAME' });
      expect(state.poops).toEqual([]);
      expect(state.ammo).toBe(MAX_AMMO);
    });
  });

  describe('MOVE_BIRD', () => {
    it('updates birdX', () => {
      const state = gameReducer(INITIAL_STATE, { type: 'MOVE_BIRD', x: 150 });
      expect(state.birdX).toBe(150);
    });

    it('clamps birdX to left boundary', () => {
      const state = gameReducer(INITIAL_STATE, { type: 'MOVE_BIRD', x: -50 });
      expect(state.birdX).toBe(20);
    });

    it('clamps birdX to right boundary', () => {
      const state = gameReducer(INITIAL_STATE, { type: 'MOVE_BIRD', x: 500 });
      expect(state.birdX).toBe(VIEWBOX.width - 20);
    });
  });

  describe('MOVE_HUMAN', () => {
    it('updates humanX and direction', () => {
      const state = gameReducer(INITIAL_STATE, { type: 'MOVE_HUMAN', x: 150, direction: 'left' });
      expect(state.humanX).toBe(150);
      expect(state.humanDirection).toBe('left');
    });

    it('clamps humanX to boundaries', () => {
      const state = gameReducer(INITIAL_STATE, { type: 'MOVE_HUMAN', x: 500, direction: 'right' });
      expect(state.humanX).toBe(VIEWBOX.width - 20);
    });
  });

  describe('SPAWN_POOP', () => {
    it('adds poop and decreases ammo', () => {
      const playingState: GameState = { ...INITIAL_STATE, status: 'playing', ammo: 5 };
      const poop: PoopData = { id: 'poop-1', x: 200, y: 50, createdAt: Date.now() };
      const state = gameReducer(playingState, { type: 'SPAWN_POOP', poop });
      expect(state.poops).toHaveLength(1);
      expect(state.poops[0]).toEqual(poop);
      expect(state.ammo).toBe(4);
    });

    it('does not spawn poop when ammo is 0', () => {
      const noAmmoState: GameState = { ...INITIAL_STATE, status: 'playing', ammo: 0 };
      const poop: PoopData = { id: 'poop-1', x: 200, y: 50, createdAt: Date.now() };
      const state = gameReducer(noAmmoState, { type: 'SPAWN_POOP', poop });
      expect(state.poops).toHaveLength(0);
      expect(state.ammo).toBe(0);
    });
  });

  describe('REMOVE_POOP', () => {
    it('removes poop by id', () => {
      const poop: PoopData = { id: 'poop-1', x: 200, y: 50, createdAt: Date.now() };
      const stateWithPoop: GameState = { ...INITIAL_STATE, poops: [poop] };
      const state = gameReducer(stateWithPoop, { type: 'REMOVE_POOP', id: 'poop-1' });
      expect(state.poops).toHaveLength(0);
    });

    it('preserves other poops', () => {
      const poop1: PoopData = { id: 'poop-1', x: 100, y: 100, createdAt: Date.now() };
      const poop2: PoopData = { id: 'poop-2', x: 200, y: 200, createdAt: Date.now() };
      const stateWithPoops: GameState = { ...INITIAL_STATE, poops: [poop1, poop2] };
      const state = gameReducer(stateWithPoops, { type: 'REMOVE_POOP', id: 'poop-1' });
      expect(state.poops).toHaveLength(1);
      expect(state.poops[0].id).toBe('poop-2');
    });
  });

  describe('HIT_HUMAN', () => {
    it('increases hits and score', () => {
      const playingState: GameState = { ...INITIAL_STATE, status: 'playing', level: 1 };
      const poop: PoopData = { id: 'poop-1', x: 200, y: 500, createdAt: Date.now() };
      const stateWithPoop: GameState = { ...playingState, poops: [poop] };
      const state = gameReducer(stateWithPoop, { type: 'HIT_HUMAN', id: 'poop-1' });
      expect(state.levelHits).toBe(1);
      expect(state.totalHits).toBe(1);
      expect(state.score).toBe(10);
    });

    it('levels up when hits threshold reached', () => {
      const almostLevel2: GameState = { ...INITIAL_STATE, status: 'playing', levelHits: 4, totalHits: 4, level: 1 };
      const poop: PoopData = { id: 'poop-1', x: 200, y: 500, createdAt: Date.now() };
      const stateWithPoop: GameState = { ...almostLevel2, poops: [poop] };
      const state = gameReducer(stateWithPoop, { type: 'HIT_HUMAN', id: 'poop-1' });
      expect(state.totalHits).toBe(5);
      expect(state.level).toBe(1); // Still level 1 at exactly 5 hits
    });

    it('reaches level 2 at 10 hits', () => {
      const almostLevel2: GameState = { ...INITIAL_STATE, status: 'playing', levelHits: 4, totalHits: 9, level: 1 };
      const poop: PoopData = { id: 'poop-1', x: 200, y: 500, createdAt: Date.now() };
      const stateWithPoop: GameState = { ...almostLevel2, poops: [poop] };
      const state = gameReducer(stateWithPoop, { type: 'HIT_HUMAN', id: 'poop-1' });
      expect(state.totalHits).toBe(10);
      expect(state.level).toBe(2);
      expect(state.levelHits).toBe(1); // Reset to 1 after level up (this was the hit that caused level up)
    });

    it('does not remove poop (handled separately by REMOVE_POOP after splat animation)', () => {
      const poop: PoopData = { id: 'poop-1', x: 200, y: 500, createdAt: Date.now() };
      const stateWithPoop: GameState = { ...INITIAL_STATE, status: 'playing', poops: [poop] };
      const state = gameReducer(stateWithPoop, { type: 'HIT_HUMAN', id: 'poop-1' });
      expect(state.poops).toHaveLength(1); // Poop stays until REMOVE_POOP is dispatched
    });
  });

  describe('MISS_HUMAN', () => {
    it('does not remove poop (handled separately by REMOVE_POOP after splat animation)', () => {
      const poop: PoopData = { id: 'poop-1', x: 200, y: 500, createdAt: Date.now() };
      const stateWithPoop: GameState = { ...INITIAL_STATE, status: 'playing', poops: [poop] };
      const state = gameReducer(stateWithPoop, { type: 'MISS_HUMAN', id: 'poop-1' });
      expect(state.poops).toHaveLength(1); // Poop stays until REMOVE_POOP is dispatched
    });

    it('does not affect score or hits', () => {
      const playingState: GameState = { ...INITIAL_STATE, status: 'playing', score: 50, levelHits: 3, totalHits: 5 };
      const poop: PoopData = { id: 'poop-1', x: 200, y: 500, createdAt: Date.now() };
      const stateWithPoop: GameState = { ...playingState, poops: [poop] };
      const state = gameReducer(stateWithPoop, { type: 'MISS_HUMAN', id: 'poop-1' });
      expect(state.score).toBe(50);
      expect(state.levelHits).toBe(3);
      expect(state.totalHits).toBe(5);
    });
  });

  describe('REGEN_AMMO', () => {
    it('increases ammo by 1', () => {
      const lowAmmoState: GameState = { ...INITIAL_STATE, ammo: 3 };
      const state = gameReducer(lowAmmoState, { type: 'REGEN_AMMO' });
      expect(state.ammo).toBe(4);
    });

    it('does not exceed maxAmmo', () => {
      const fullAmmoState: GameState = { ...INITIAL_STATE, ammo: MAX_AMMO };
      const state = gameReducer(fullAmmoState, { type: 'REGEN_AMMO' });
      expect(state.ammo).toBe(MAX_AMMO);
    });
  });

  describe('PAUSE_GAME', () => {
    it('sets status to paused when playing', () => {
      const playingState: GameState = { ...INITIAL_STATE, status: 'playing' };
      const state = gameReducer(playingState, { type: 'PAUSE_GAME' });
      expect(state.status).toBe('paused');
    });
  });

  describe('RESUME_GAME', () => {
    it('sets status to playing when paused', () => {
      const pausedState: GameState = { ...INITIAL_STATE, status: 'paused' };
      const state = gameReducer(pausedState, { type: 'RESUME_GAME' });
      expect(state.status).toBe('playing');
    });
  });

  describe('RESET_GAME', () => {
    it('returns to initial state', () => {
      const modifiedState: GameState = {
        status: 'gameOver',
        birdX: 100,
        humanX: 300,
        humanDirection: 'left',
        humanState: 'walking',
        humanReaction: 'none',
        isHumanRespawning: false,
        score: 500,
        levelHits: 3,
        totalHits: 25,
        level: 5,
        poops: [{ id: '1', x: 100, y: 100, createdAt: Date.now() }],
        bullets: [],
        ammo: 0,
        maxAmmo: MAX_AMMO,
        birdLives: 0,
      };
      const state = gameReducer(modifiedState, { type: 'RESET_GAME' });
      expect(state.status).toBe('idle');
      expect(state.score).toBe(0);
      expect(state.levelHits).toBe(0);
      expect(state.totalHits).toBe(0);
      expect(state.level).toBe(1);
      expect(state.poops).toEqual([]);
      expect(state.ammo).toBe(MAX_AMMO);
      expect(state.birdLives).toBe(3);
    });
  });

  describe('BIRD_HIT', () => {
    it('decreases bird lives by 1', () => {
      const playingState: GameState = { ...INITIAL_STATE, status: 'playing', birdLives: 3 };
      const state = gameReducer(playingState, { type: 'BIRD_HIT' });
      expect(state.birdLives).toBe(2);
      expect(state.status).toBe('playing');
    });

    it('sets status to gameOver when lives reach 0', () => {
      const lastLifeState: GameState = { ...INITIAL_STATE, status: 'playing', birdLives: 1 };
      const state = gameReducer(lastLifeState, { type: 'BIRD_HIT' });
      expect(state.birdLives).toBe(0);
      expect(state.status).toBe('gameOver');
    });
  });
});
