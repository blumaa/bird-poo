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

  it('returns level 2 for 10 hits', () => {
    expect(calculateLevel(10)).toBe(2);
  });

  it('returns level 3 for 15 hits', () => {
    expect(calculateLevel(15)).toBe(3);
  });

  it('returns level 4 for 20 hits', () => {
    expect(calculateLevel(20)).toBe(4);
  });

  it('returns level 5 for 25+ hits', () => {
    expect(calculateLevel(25)).toBe(5);
    expect(calculateLevel(100)).toBe(5);
  });
});

describe('getLevelConfig', () => {
  it('returns config for level 1', () => {
    const config = getLevelConfig(1);
    expect(config.humanSpeed).toBe(2);
    expect(config.poopFallDuration).toBe(2.0);
    expect(config.hitsRequired).toBe(5);
  });

  it('returns config for level 5', () => {
    const config = getLevelConfig(5);
    expect(config.humanSpeed).toBe(6);
    expect(config.poopFallDuration).toBe(1.0);
    expect(config.hitsRequired).toBe(25);
  });

  it('clamps to level 1 if below', () => {
    const config = getLevelConfig(0);
    expect(config.humanSpeed).toBe(2);
  });

  it('clamps to level 5 if above', () => {
    const config = getLevelConfig(10);
    expect(config.humanSpeed).toBe(6);
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
