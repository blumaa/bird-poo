import { memo } from 'react';
import type { HumanState, HumanReaction, HumanCharacter } from '../types/game';
import { SuitHuman } from './characters/SuitHuman';
import { ChefHuman } from './characters/ChefHuman';
import { TouristHuman } from './characters/TouristHuman';
import { DivaHuman } from './characters/DivaHuman';

interface HumanProps {
  x: number;
  y: number;
  direction: 'left' | 'right';
  isPlaying: boolean;
  characterType?: HumanCharacter;
  humanState?: HumanState;
  humanReaction?: HumanReaction;
  isRespawning?: boolean;
  opacity?: number;
}

const CHARACTERS = {
  suit: SuitHuman,
  chef: ChefHuman,
  tourist: TouristHuman,
  diva: DivaHuman,
};

export const Human = memo(function Human({ characterType = 'suit', ...props }: HumanProps) {
  const Character = CHARACTERS[characterType];
  return <Character {...props} />;
});
