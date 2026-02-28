import { useEffect, useRef } from 'react';
import type { BulletData, HumanReaction } from '../types/game';
import { PLAYER_Y, getLevelConfig } from '../utils/constants';

interface UseHumanShootingParams {
  humanX: number;
  level: number;
  isPlaying: boolean;
  humanReaction?: HumanReaction;
  isRespawning?: boolean;
  onStartShooting: () => void;
  onStopShooting: () => void;
  onSpawnBullet: (bullet: BulletData) => void;
}

const SHOOTING_POSE_DURATION = 1000; // 1 second to aim and shoot

export function useHumanShooting({
  humanX,
  level,
  isPlaying,
  humanReaction = 'none',
  isRespawning = false,
  onStartShooting,
  onStopShooting,
  onSpawnBullet,
}: UseHumanShootingParams): void {
  const shootTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const poseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use refs for all values to avoid effect recreation
  const humanXRef = useRef(humanX);
  const levelRef = useRef(level);
  const onStartShootingRef = useRef(onStartShooting);
  const onStopShootingRef = useRef(onStopShooting);
  const onSpawnBulletRef = useRef(onSpawnBullet);

  humanXRef.current = humanX;
  levelRef.current = level;
  onStartShootingRef.current = onStartShooting;
  onStopShootingRef.current = onStopShooting;
  onSpawnBulletRef.current = onSpawnBullet;

  useEffect(() => {
    // Don't shoot while reacting or respawning
    if (!isPlaying || humanReaction !== 'none' || isRespawning) {
      // Clear all timeouts when not playing
      if (shootTimeoutRef.current) {
        clearTimeout(shootTimeoutRef.current);
        shootTimeoutRef.current = null;
      }
      if (poseTimeoutRef.current) {
        clearTimeout(poseTimeoutRef.current);
        poseTimeoutRef.current = null;
      }
      return;
    }

    const scheduleShot = () => {
      const { minShootInterval, maxShootInterval } = getLevelConfig(levelRef.current);
      const interval = minShootInterval + Math.random() * (maxShootInterval - minShootInterval);

      shootTimeoutRef.current = setTimeout(() => {
        // Start shooting pose
        onStartShootingRef.current();

        // After pose duration, spawn bullet and return to walking
        poseTimeoutRef.current = setTimeout(() => {
          const bullet: BulletData = {
            id: `bullet-${Date.now()}`,
            x: humanXRef.current,
            y: PLAYER_Y - 30, // Start from gun position
          };
          onSpawnBulletRef.current(bullet);
          onStopShootingRef.current();

          // Schedule next shot
          scheduleShot();
        }, SHOOTING_POSE_DURATION);
      }, interval);
    };

    // Start the shooting cycle
    scheduleShot();

    return () => {
      if (shootTimeoutRef.current) {
        clearTimeout(shootTimeoutRef.current);
      }
      if (poseTimeoutRef.current) {
        clearTimeout(poseTimeoutRef.current);
      }
    };
  }, [isPlaying, humanReaction, isRespawning]); // Removed callback deps
}
