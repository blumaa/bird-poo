import { useEffect, useRef } from 'react';
import { VIEWBOX, getLevelConfig } from '../utils/constants';
import type { HumanReaction } from '../types/game';

interface UseHumanAIProps {
  humanX: number;
  humanDirection: 'left' | 'right';
  level: number;
  isPlaying: boolean;
  humanReaction?: HumanReaction;
  isRespawning?: boolean;
  onMove: (x: number, direction: 'left' | 'right') => void;
}

const BOUNDARY_MARGIN = 20;

export function useHumanAI({
  humanX,
  humanDirection,
  level,
  isPlaying,
  humanReaction = 'none',
  isRespawning = false,
  onMove,
}: UseHumanAIProps) {
  // Use refs for all frequently changing values
  const humanXRef = useRef(humanX);
  const directionRef = useRef(humanDirection);
  const levelRef = useRef(level);
  const onMoveRef = useRef(onMove);

  humanXRef.current = humanX;
  directionRef.current = humanDirection;
  levelRef.current = level;
  onMoveRef.current = onMove;

  useEffect(() => {
    // Don't move while reacting or respawning
    if (!isPlaying || humanReaction !== 'none' || isRespawning) return;

    const moveHuman = () => {
      const levelConfig = getLevelConfig(levelRef.current);
      const speed = levelConfig.humanSpeed;

      let newX = humanXRef.current;
      let newDirection = directionRef.current;

      if (directionRef.current === 'right') {
        newX = humanXRef.current + speed;
        if (newX >= VIEWBOX.width - BOUNDARY_MARGIN) {
          newX = VIEWBOX.width - BOUNDARY_MARGIN;
          newDirection = 'left';
        }
      } else {
        newX = humanXRef.current - speed;
        if (newX <= BOUNDARY_MARGIN) {
          newX = BOUNDARY_MARGIN;
          newDirection = 'right';
        }
      }

      onMoveRef.current(newX, newDirection);
    };

    const interval = setInterval(moveHuman, 50);
    return () => clearInterval(interval);
  }, [isPlaying, humanReaction, isRespawning]); // Removed level and onMove from deps
}
