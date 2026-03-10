import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { BIRD_Y } from '../utils/constants';

interface BulletProps {
  startX: number;
  startY: number;
  getBirdX: () => number;
  onHit: () => void;
  onMiss: () => void;
}

const BULLET_SPEED = 0.8; // seconds to travel from startY to BIRD_Y
const HIT_TOLERANCE = 30;
const OFF_SCREEN_Y = -200;

export function Bullet({ startX, startY, getBirdX, onHit, onMiss }: BulletProps) {
  const bulletRef = useRef<SVGGElement>(null);
  const hasCompletedRef = useRef(false);
  const hitCheckDoneRef = useRef(false);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  const onHitRef = useRef(onHit);
  const onMissRef = useRef(onMiss);
  const getBirdXRef = useRef(getBirdX);

  onHitRef.current = onHit;
  onMissRef.current = onMiss;
  getBirdXRef.current = getBirdX;

  useEffect(() => {
    if (!bulletRef.current || hasCompletedRef.current) return;

    gsap.set(bulletRef.current, { y: startY });

    // Scale duration so bullet travels at constant speed all the way off screen
    const distToCheck = startY - BIRD_Y;
    const distTotal = startY - OFF_SCREEN_Y;
    const totalDuration = BULLET_SPEED * (distTotal / distToCheck);

    animationRef.current = gsap.to(bulletRef.current, {
      y: OFF_SCREEN_Y,
      duration: totalDuration,
      ease: 'none',
      onUpdate: () => {
        if (hitCheckDoneRef.current || hasCompletedRef.current) return;
        const currentY = gsap.getProperty(bulletRef.current!, 'y') as number;
        if (currentY <= BIRD_Y + 15) {
          hitCheckDoneRef.current = true;
          const birdX = getBirdXRef.current();
          if (Math.abs(birdX - startX) < HIT_TOLERANCE) {
            hasCompletedRef.current = true;
            animationRef.current?.kill();
            onHitRef.current();
          }
          // else: missed bird, continue flying off screen
        }
      },
      onComplete: () => {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onMissRef.current();
        }
      },
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
        animationRef.current = null;
      }
    };
  }, []); // Empty deps - only run once on mount

  return (
    <g ref={bulletRef} transform={`translate(${startX}, 0)`}>
      {/* Bullet — Cubist faceted angular shard */}
      {/* Main body — dark quadrilateral */}
      <polygon points="-3,6 -4,-2 0,-4 4,-2 3,6" fill="#2A2A3A" stroke="#111" strokeWidth="2" />
      {/* Left face — lighter plane (Cubist light source) */}
      <polygon points="-4,-2 -3,6 0,2 0,-4" fill="#4A4A5A" />
      {/* Tip — angular diamond */}
      <polygon points="-3,-2 0,-9 3,-2" fill="#C0C0C0" stroke="#111" strokeWidth="1.5" />
      {/* Propellant trail — angular ochre wedge */}
      <polygon points="-2,6 0,14 2,6" fill="#D4A820" opacity="0.7" />
      {/* Trailing heat — crimson angular sliver */}
      <polygon points="-1,12 0,18 1,12" fill="#8B1A1A" opacity="0.5" />
    </g>
  );
}
