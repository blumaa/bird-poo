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
const OFF_SCREEN_Y = -20;

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
      {/* Bullet body */}
      <ellipse cx="0" cy="0" rx="3" ry="6" fill="#333" />
      {/* Bullet tip */}
      <path d="M -3 0 L 0 -8 L 3 0" fill="#8B8B8B" />
      {/* Muzzle flash effect (trails behind) */}
      <ellipse cx="0" cy="8" rx="2" ry="4" fill="#FFA500" opacity="0.6" />
      <ellipse cx="0" cy="12" rx="1" ry="2" fill="#FF6600" opacity="0.4" />
    </g>
  );
}
