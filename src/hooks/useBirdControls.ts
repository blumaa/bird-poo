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
const SWIPE_THRESHOLD = 10; // pixels before classifying as swipe
const TAP_MAX_DURATION = 200; // ms
const FRICTION = 0.92; // velocity decay per frame (lower = more friction)
const VELOCITY_MIN = 0.3; // stop when velocity drops below this
const SWIPE_MULTIPLIER = 1.8; // amplify swipe velocity for snappier feel

export function useBirdControls({ birdX, ammo, isPlaying, onMove, onPoop }: UseBirdControlsProps) {
  const keysPressed = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number | null>(null);
  const poopCounterRef = useRef(0);

  // Refs for frequently changing values
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

  // Touch state refs
  const touchStartXRef = useRef<number | null>(null);
  const lastTouchXRef = useRef<number | null>(null);
  const touchStartTimeRef = useRef(0);
  const isSwipingRef = useRef(false);
  const activeTouchIdRef = useRef<number | null>(null);

  // Velocity for inertia (in SVG units per frame)
  const velocityRef = useRef(0);
  // Track last few touch deltas for velocity calculation
  const lastTouchTimeRef = useRef(0);
  const svgRatioRef = useRef(1);

  const createPoop = useCallback(() => {
    if (ammoRef.current <= 0) return;

    const poop: PoopData = {
      id: `poop-${Date.now()}-${poopCounterRef.current++}`,
      x: birdXRef.current,
      y: BIRD_Y + 15,
      createdAt: Date.now(),
    };
    onPoopRef.current(poop);
  }, []);

  const clampX = useCallback((x: number) => {
    return Math.max(BOUNDARY_MARGIN, Math.min(VIEWBOX.width - BOUNDARY_MARGIN, x));
  }, []);

  const updatePosition = useCallback(() => {
    if (!isPlayingRef.current) return;

    let dx = 0;

    // Keyboard movement
    if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a') || keysPressed.current.has('A')) {
      dx -= MOVE_SPEED;
    }
    if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d') || keysPressed.current.has('D')) {
      dx += MOVE_SPEED;
    }

    // Apply inertia velocity (only when not actively swiping)
    if (!isSwipingRef.current && Math.abs(velocityRef.current) > VELOCITY_MIN) {
      dx += velocityRef.current;
      velocityRef.current *= FRICTION;
    } else if (Math.abs(velocityRef.current) <= VELOCITY_MIN) {
      velocityRef.current = 0;
    }

    if (dx !== 0) {
      const newX = clampX(birdXRef.current + dx);
      if (newX !== birdXRef.current) {
        onMoveRef.current(newX);
      }
      // Kill velocity if we hit the wall
      if (newX <= BOUNDARY_MARGIN || newX >= VIEWBOX.width - BOUNDARY_MARGIN) {
        velocityRef.current = 0;
      }
    }

    animationFrameRef.current = requestAnimationFrame(updatePosition);
  }, [clampX]);

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

  // Keyboard controls
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
  }, [createPoop]);

  const handleTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (!isPlayingRef.current) return;

    const target = e.target as Element;
    if (target.closest?.('[data-hud-button]')) return;

    const touch = e.touches[0];
    activeTouchIdRef.current = touch.identifier;
    touchStartXRef.current = touch.clientX;
    lastTouchXRef.current = touch.clientX;
    touchStartTimeRef.current = Date.now();
    lastTouchTimeRef.current = Date.now();
    isSwipingRef.current = false;
    velocityRef.current = 0; // Kill any existing inertia when touching

    // Cache SVG ratio
    const rect = e.currentTarget.getBoundingClientRect();
    svgRatioRef.current = VIEWBOX.width / rect.width;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (!isPlayingRef.current || activeTouchIdRef.current === null) return;

    // Find the active touch
    let touch: React.Touch | null = null;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === activeTouchIdRef.current) {
        touch = e.touches[i];
        break;
      }
    }
    if (!touch || lastTouchXRef.current === null || touchStartXRef.current === null) return;

    // Check if we've exceeded swipe threshold from start
    if (!isSwipingRef.current) {
      if (Math.abs(touch.clientX - touchStartXRef.current) > SWIPE_THRESHOLD) {
        isSwipingRef.current = true;
      } else {
        return;
      }
    }

    // Calculate delta and move bird
    const screenDelta = touch.clientX - lastTouchXRef.current;
    const now = Date.now();
    const dt = now - lastTouchTimeRef.current;

    lastTouchXRef.current = touch.clientX;
    lastTouchTimeRef.current = now;

    const svgDelta = screenDelta * svgRatioRef.current;

    // Track velocity (SVG units per 16ms frame, smoothed)
    if (dt > 0) {
      const instantVelocity = (svgDelta / dt) * 16 * SWIPE_MULTIPLIER;
      velocityRef.current = instantVelocity;
    }

    // Move bird directly while swiping
    const newX = clampX(birdXRef.current + svgDelta);
    onMoveRef.current(newX);
  }, [clampX]);

  const handleTouchEnd = useCallback(() => {
    if (!isSwipingRef.current && (Date.now() - touchStartTimeRef.current) < TAP_MAX_DURATION) {
      createPoop();
    }

    // On release, let inertia carry (velocity is already set from last touchmove)
    isSwipingRef.current = false;
    activeTouchIdRef.current = null;
    touchStartXRef.current = null;
    lastTouchXRef.current = null;
  }, [createPoop]);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}
