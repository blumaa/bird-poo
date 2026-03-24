import { useEffect, useRef } from 'react';
import type { BulletData, HumanData } from '../types/game';
import { PLAYER_Y, getLevelConfig } from '../utils/constants';

interface UseHumanShootingParams {
  humans: HumanData[];
  level: number;
  isPlaying: boolean;
  onSpawnBullet: (bullet: BulletData) => void;
}

const TICK_RATE = 200; // ms — check all humans every 200ms

interface ShootingState {
  phase: 'waiting';
  nextActionAt: number;
}

export function useHumanShooting({
  humans,
  level,
  isPlaying,
  onSpawnBullet,
}: UseHumanShootingParams): void {
  const statesRef = useRef<Map<string, ShootingState>>(new Map());
  const humansRef = useRef(humans);
  const levelRef = useRef(level);
  const onSpawnBulletRef = useRef(onSpawnBullet);

  humansRef.current = humans;
  levelRef.current = level;
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
          statesRef.current.set(human.id, {
            phase: 'waiting',
            nextActionAt: now + getRandomWait(),
          });
          continue;
        }

        if (now < s.nextActionAt) continue;

        // Fire immediately — no aiming warning
        const bullet: BulletData = {
          id: `bullet-${human.id}-${now}`,
          x: human.x,
          y: PLAYER_Y - 30,
          characterType: human.character,
        };
        onSpawnBulletRef.current(bullet);
        statesRef.current.set(human.id, {
          phase: 'waiting',
          nextActionAt: now + getRandomWait(),
        });
      }
    }

    // Run first tick immediately
    tick();

    const intervalId = setInterval(tick, TICK_RATE);

    return () => {
      clearInterval(intervalId);
      statesRef.current.clear();
    };
  }, [isPlaying]);
}
