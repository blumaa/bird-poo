import { useEffect, useRef } from 'react';
import { VIEWBOX, getLevelConfig } from '../utils/constants';
import type { HumanData } from '../types/game';

interface UseHumanMovementProps {
  humans: HumanData[];
  level: number;
  isPlaying: boolean;
  onMove: (humanId: string, x: number, direction: 'left' | 'right') => void;
}

const BOUNDARY_MARGIN = 20;
const TICK_INTERVAL = 50;

export function useHumanMovement({
  humans,
  level,
  isPlaying,
  onMove,
}: UseHumanMovementProps) {
  const humansRef = useRef(humans);
  const levelRef = useRef(level);
  const onMoveRef = useRef(onMove);

  humansRef.current = humans;
  levelRef.current = level;
  onMoveRef.current = onMove;

  useEffect(() => {
    if (!isPlaying) return;

    let lastTime = 0;
    let accumulator = 0;
    let rafId: number;

    const tick = (timestamp: number) => {
      if (lastTime === 0) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;

      accumulator += delta;

      if (accumulator >= TICK_INTERVAL) {
        const ticks = Math.floor(accumulator / TICK_INTERVAL);
        accumulator -= ticks * TICK_INTERVAL;

        const levelConfig = getLevelConfig(levelRef.current);
        const speed = levelConfig.humanSpeed * ticks;

        for (const human of humansRef.current) {
          // Don't move while reacting or respawning
          if (human.reaction !== 'none' || human.isRespawning) continue;

          let newX = human.x;
          let newDirection = human.direction;

          if (human.direction === 'right') {
            newX = human.x + speed;
            if (newX >= VIEWBOX.width - BOUNDARY_MARGIN) {
              newX = VIEWBOX.width - BOUNDARY_MARGIN;
              newDirection = 'left';
            }
          } else {
            newX = human.x - speed;
            if (newX <= BOUNDARY_MARGIN) {
              newX = BOUNDARY_MARGIN;
              newDirection = 'right';
            }
          }

          onMoveRef.current(human.id, newX, newDirection);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);
}
