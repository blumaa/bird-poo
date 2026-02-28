import { useEffect, useRef } from 'react';
import { AMMO_REGEN_INTERVAL } from '../utils/constants';

interface UseAmmoRegenProps {
  ammo: number;
  maxAmmo: number;
  isPlaying: boolean;
  onRegen: () => void;
}

export function useAmmoRegen({ ammo, maxAmmo, isPlaying, onRegen }: UseAmmoRegenProps) {
  // Use refs to avoid recreating interval when these change
  const onRegenRef = useRef(onRegen);
  const ammoRef = useRef(ammo);
  const maxAmmoRef = useRef(maxAmmo);

  onRegenRef.current = onRegen;
  ammoRef.current = ammo;
  maxAmmoRef.current = maxAmmo;

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Check ammo inside interval to avoid recreating it
      if (ammoRef.current < maxAmmoRef.current) {
        onRegenRef.current();
      }
    }, AMMO_REGEN_INTERVAL);

    return () => clearInterval(interval);
  }, [isPlaying]); // Only restart when isPlaying changes
}
