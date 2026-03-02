import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  checkCollision,
  getLevelConfig,
  PLAYER_WIDTH,
  HIT_TOLERANCE,
} from '../src/utils/constants';

describe('calculateLevel', () => {
  it('returns level 1 for 0 hits', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('returns level 1 for 9 hits', () => {
    expect(calculateLevel(9)).toBe(1);
  });

  it('returns level 2 for 10 hits (100 points)', () => {
    expect(calculateLevel(10)).toBe(2);
  });

  it('returns level 3 for 20 hits (200 points)', () => {
    expect(calculateLevel(20)).toBe(3);
  });

  it('scales indefinitely with no cap', () => {
    expect(calculateLevel(50)).toBe(6);
    expect(calculateLevel(100)).toBe(11);
    expect(calculateLevel(1000)).toBe(101);
  });
});

describe('getLevelConfig', () => {
  it('returns base config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.humanSpeed).toBe(2);
    expect(config.poopFallDuration).toBe(2.0);
    expect(config.hitsRequired).toBe(10);
    expect(config.minShootInterval).toBe(4000);
    expect(config.maxShootInterval).toBe(7000);
  });

  it('increments humanSpeed by 1 per level with no cap', () => {
    expect(getLevelConfig(1).humanSpeed).toBe(2);
    expect(getLevelConfig(5).humanSpeed).toBe(6);
    expect(getLevelConfig(20).humanSpeed).toBe(21);
    expect(getLevelConfig(100).humanSpeed).toBe(101);
  });

  it('reduces shoot intervals each level', () => {
    expect(getLevelConfig(2).minShootInterval).toBe(3600);
    expect(getLevelConfig(2).maxShootInterval).toBe(6300);
  });

  it('floors shoot intervals at minimum values', () => {
    const config = getLevelConfig(1000);
    expect(config.minShootInterval).toBe(300);
    expect(config.maxShootInterval).toBe(600);
  });

  it('clamps to level 1 if given 0 or below', () => {
    expect(getLevelConfig(0).humanSpeed).toBe(2);
  });
});

describe('checkCollision', () => {
  it('returns true when poop is directly on human', () => {
    expect(checkCollision(200, 200)).toBe(true);
  });

  it('returns true when poop is within human bounds', () => {
    const humanX = 200;
    const poopX = humanX + PLAYER_WIDTH / 4;
    expect(checkCollision(humanX, poopX)).toBe(true);
  });

  it('returns true when poop is at edge with tolerance', () => {
    const humanX = 200;
    const poopX = humanX + PLAYER_WIDTH / 2 + HIT_TOLERANCE;
    expect(checkCollision(humanX, poopX)).toBe(true);
  });

  it('returns false when poop is beyond tolerance', () => {
    const humanX = 200;
    const poopX = humanX + PLAYER_WIDTH / 2 + HIT_TOLERANCE + 1;
    expect(checkCollision(humanX, poopX)).toBe(false);
  });

  it('returns false when poop is far from human', () => {
    expect(checkCollision(100, 300)).toBe(false);
  });
});
