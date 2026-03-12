import { useEffect, useRef } from 'react';
import type { BulletData, HumanData } from '../types/game';
import { PLAYER_Y, getLevelConfig } from '../utils/constants';

interface UseHumanShootingParams {
  humans: HumanData[];
  level: number;
  isPlaying: boolean;
  onStartShooting: (humanId: string) => void;
  onStopShooting: (humanId: string) => void;
  onSpawnBullet: (bullet: BulletData) => void;
}

const SHOOTING_POSE_DURATION = 1000;
const TICK_RATE = 200; // ms — check all humans every 200ms

/**
 * Per-human shooting state machine.
 * States: 'waiting' → 'aiming' → fires bullet → back to 'waiting'
 */
interface ShootingState {
  phase: 'waiting' | 'aiming';
  nextActionAt: number; // timestamp when next transition should happen
}

export function useHumanShooting({
  humans,
  level,
  isPlaying,
  onStartShooting,
  onStopShooting,
  onSpawnBullet,
}: UseHumanShootingParams): void {
  const statesRef = useRef<Map<string, ShootingState>>(new Map());
  const humansRef = useRef(humans);
  const levelRef = useRef(level);
  const onStartShootingRef = useRef(onStartShooting);
  const onStopShootingRef = useRef(onStopShooting);
  const onSpawnBulletRef = useRef(onSpawnBullet);

  humansRef.current = humans;
  levelRef.current = level;
  onStartShootingRef.current = onStartShooting;
  onStopShootingRef.current = onStopShooting;
  onSpawnBulletRef.current = onSpawnBullet;

  useEffect(() => {
    if (!isPlaying) {
      statesRef.current.clear();
      return;
    }

    function getRandomWait(): number {
      const { minShootInterval, maxShootInterval } = getLevelConfig(levelRef.current);
      return minShootInterval + Math.random() * (maxShootInterval - minShootInterval);
    }

    function tick() {
      const now = Date.now();
      const currentHumans = humansRef.current;

      // Remove states for humans that no longer exist
      for (const id of statesRef.current.keys()) {
        if (!currentHumans.find(h => h.id === id)) {
          statesRef.current.delete(id);
        }
      }

      for (const human of currentHumans) {
        const canAct = human.reaction === 'none' && !human.isRespawning;

        // Ensure every human has a state entry
        if (!statesRef.current.has(human.id)) {
          statesRef.current.set(human.id, {
            phase: 'waiting',
            nextActionAt: now + getRandomWait(),
          });
          continue;
        }

        const s = statesRef.current.get(human.id)!;

        // If human is reacting/respawning, reset to waiting
        if (!canAct) {
          if (s.phase === 'aiming') {
            onStopShootingRef.current(human.id);
          }
          statesRef.current.set(human.id, {
            phase: 'waiting',
            nextActionAt: now + getRandomWait(),
          });
          continue;
        }

        if (now < s.nextActionAt) continue;

        if (s.phase === 'waiting') {
          // Transition to aiming
          onStartShootingRef.current(human.id);
          statesRef.current.set(human.id, {
            phase: 'aiming',
            nextActionAt: now + SHOOTING_POSE_DURATION,
          });
        } else if (s.phase === 'aiming') {
          // Fire bullet and go back to waiting
          const bullet: BulletData = {
            id: `bullet-${human.id}-${now}`,
            x: human.x,
            y: PLAYER_Y - 30,
            characterType: human.character,
          };
          onSpawnBulletRef.current(bullet);
          onStopShootingRef.current(human.id);
          statesRef.current.set(human.id, {
            phase: 'waiting',
            nextActionAt: now + getRandomWait(),
          });
        }
      }
    }

    // Run first tick immediately
    tick();

    const intervalId = setInterval(tick, TICK_RATE);

    return () => {
      clearInterval(intervalId);
      // Stop any humans left in aiming pose
      for (const [humanId, s] of statesRef.current.entries()) {
        if (s.phase === 'aiming') {
          onStopShootingRef.current(humanId);
        }
      }
      statesRef.current.clear();
    };
  }, [isPlaying]);
}
