import { useEffect, useRef, useCallback } from 'react';
import { VIEWBOX, BIRD_Y } from '../utils/constants';
import type { PoopData } from '../types/game';

interface UseBirdControlsProps {
  birdX: number;
  ammo: number;
  isPlaying: boolean;
  onMove: (x: number) => void;
  onPoop: (poop: PoopData) => void;
}

const MOVE_SPEED = 8;
const BOUNDARY_MARGIN = 20;

export function useBirdControls({ birdX, ammo, isPlaying, onMove, onPoop }: UseBirdControlsProps) {
  const keysPressed = useRef<Set<string>>(new Set());
  const touchDirection = useRef<'left' | 'right' | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const poopCounterRef = useRef(0);

  // Use refs for all values that change frequently
  const birdXRef = useRef(birdX);
  const ammoRef = useRef(ammo);
  const isPlayingRef = useRef(isPlaying);
  const onMoveRef = useRef(onMove);
  const onPoopRef = useRef(onPoop);

  birdXRef.current = birdX;
  ammoRef.current = ammo;
  isPlayingRef.current = isPlaying;
  onMoveRef.current = onMove;
  onPoopRef.current = onPoop;

  const createPoop = useCallback(() => {
    if (ammoRef.current <= 0) return;

    const poop: PoopData = {
      id: `poop-${Date.now()}-${poopCounterRef.current++}`,
      x: birdXRef.current,
      y: BIRD_Y + 15,
      createdAt: Date.now(),
    };
    onPoopRef.current(poop);
  }, []); // No deps - uses refs

  const updatePosition = useCallback(() => {
    if (!isPlayingRef.current) return;

    let dx = 0;

    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a') || keysPressed.current.has('A')) {
      dx -= MOVE_SPEED;
    }
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d') || keysPressed.current.has('D')) {
      dx += MOVE_SPEED;
    }

    if (touchDirection.current === 'left') {
      dx -= MOVE_SPEED;
    } else if (touchDirection.current === 'right') {
      dx += MOVE_SPEED;
    }

    if (dx !== 0) {
      const newX = Math.max(
        BOUNDARY_MARGIN,
        Math.min(VIEWBOX.width - BOUNDARY_MARGIN, birdXRef.current + dx)
      );
      if (newX !== birdXRef.current) {
        onMoveRef.current(newX);
      }
    }

    animationFrameRef.current = requestAnimationFrame(updatePosition);
  }, []); // No deps - uses refs

  useEffect(() => {
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, updatePosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) {
        e.preventDefault();
        keysPressed.current.add(e.key);
      }
      if (e.code === 'Space' && isPlayingRef.current) {
        e.preventDefault();
        createPoop();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [createPoop]); // Only createPoop (which is stable)

  const handleTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (!isPlayingRef.current) return;

    // Ignore touches on HUD buttons (they handle their own events)
    const target = e.target as Element;
    if (target.closest?.('[data-hud-button]')) return;

    const touch = e.touches[0];
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const thirdWidth = rect.width / 3;

    if (touchX < thirdWidth) {
      touchDirection.current = 'left';
    } else if (touchX > thirdWidth * 2) {
      touchDirection.current = 'right';
    } else {
      // Middle third = poop
      createPoop();
    }
  }, [createPoop]); // Only createPoop (which is stable)

  const handleTouchEnd = useCallback(() => {
    touchDirection.current = null;
  }, []);

  return {
    handleTouchStart,
    handleTouchEnd,
  };
}
