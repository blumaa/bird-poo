import { useEffect, useRef } from 'react';

interface UseAmmoRegenProps {
  ammo: number;
  maxAmmo: number;
  isPlaying: boolean;
  onRegen: () => void;
  regenInterval: number;
}

export function useAmmoRegen({ ammo, maxAmmo, isPlaying, onRegen, regenInterval }: UseAmmoRegenProps) {
  const onRegenRef = useRef(onRegen);
  const ammoRef = useRef(ammo);
  const maxAmmoRef = useRef(maxAmmo);

  onRegenRef.current = onRegen;
  ammoRef.current = ammo;
  maxAmmoRef.current = maxAmmo;

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      if (ammoRef.current === 0) {
        onRegenRef.current();
      }
    }, regenInterval);

    return () => clearInterval(interval);
  }, [isPlaying, regenInterval]);
}
