import { memo, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { BIRD_Y } from '../utils/constants';
import type { HumanCharacter } from '../types/game';

interface BulletProps {
  id: string;
  startX: number;
  startY: number;
  characterType?: HumanCharacter;
  getBirdX: () => number;
  onHit: (id: string) => void;
  onMiss: (id: string) => void;
}

const BULLET_SPEED = 0.8; // seconds to travel from startY to BIRD_Y
const HIT_TOLERANCE = 30;
const OFF_SCREEN_Y = -200;

// Suit: metal bullet shard
function SuitProjectile() {
  return (
    <>
      <polygon points="-3,6 -4,-2 0,-4 4,-2 3,6" fill="#2A2A3A" stroke="#111" strokeWidth="2" />
      <polygon points="-4,-2 -3,6 0,2 0,-4" fill="#4A4A5A" />
      <polygon points="-3,-2 0,-9 3,-2" fill="#C0C0C0" stroke="#111" strokeWidth="1.5" />
      <polygon points="-2,6 0,14 2,6" fill="#D4A820" opacity="0.7" />
      <polygon points="-1,12 0,18 1,12" fill="#8B1A1A" opacity="0.5" />
    </>
  );
}

// Chef: big spinning pancake/steak with steam
function ChefProjectile() {
  return (
    <>
      {/* Big golden pancake */}
      <ellipse cx="0" cy="-2" rx="8" ry="5" fill="#E8A050" stroke="#111" strokeWidth="2" />
      <ellipse cx="-1" cy="-3" rx="5" ry="3" fill="#C87830" opacity="0.6" />
      {/* Pat of butter on top */}
      <polygon points="-3,-5 3,-7 4,-4 -2,-3" fill="#F5D040" stroke="#111" strokeWidth="1" />
      {/* Steam trails */}
      <path d="M -4,4 Q -6,10 -4,14" stroke="#DDD" strokeWidth="2" fill="none" opacity="0.5" />
      <path d="M 2,4 Q 4,10 2,14" stroke="#DDD" strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M 0,6 Q 1,12 -1,18" stroke="#DDD" strokeWidth="1.5" fill="none" opacity="0.3" />
    </>
  );
}

// Tourist: big water squirt blob with splashy droplets
function TouristProjectile() {
  return (
    <>
      {/* Big water blob */}
      <polygon points="-6,6 -5,-4 0,-10 5,-4 6,6" fill="#4488BB" stroke="#2266AA" strokeWidth="2" />
      <polygon points="-5,-4 0,-10 0,0 -3,3" fill="#66CCEE" opacity="0.7" />
      {/* Splash droplets flying off sides */}
      <circle cx="-7" cy="0" r="2" fill="#66AADD" opacity="0.7" />
      <circle cx="7" cy="-2" r="2" fill="#66AADD" opacity="0.6" />
      <circle cx="-5" cy="-6" r="1.5" fill="#88CCEE" opacity="0.5" />
      <circle cx="5" cy="-7" r="1.5" fill="#88CCEE" opacity="0.5" />
      {/* Water trail */}
      <polygon points="-3,6 0,16 3,6" fill="#4488BB" opacity="0.5" />
      <polygon points="-1,14 0,20 1,14" fill="#66CCEE" opacity="0.3" />
    </>
  );
}

// Diva: purple umbrella tip with musical notes and sparkle
function DivaProjectile() {
  return (
    <>
      {/* Purple umbrella point */}
      <polygon points="-3,6 -4,-2 0,-10 4,-2 3,6" fill="#6B3FA0" stroke="#111" strokeWidth="2" />
      <polygon points="-4,-2 0,-10 0,2" fill="#8B5FC0" />
      {/* Sparkle ring */}
      <circle cx="0" cy="-4" r="7" fill="none" stroke="#D4447C" strokeWidth="1.5" opacity="0.5" />
      {/* Musical note trailing */}
      <circle cx="-3" cy="10" r="2" fill="#CC2244" opacity="0.7" />
      <line x1="-1" y1="10" x2="-1" y2="4" stroke="#CC2244" strokeWidth="1.5" opacity="0.7" />
      {/* Rose petal */}
      <polygon points="2,8 6,6 7,12 3,14" fill="#D4447C" opacity="0.6" />
      {/* Sparkle dots */}
      <circle cx="-6" cy="-2" r="1" fill="#F5F0E0" opacity="0.8" />
      <circle cx="6" cy="0" r="1" fill="#F5F0E0" opacity="0.7" />
    </>
  );
}

const PROJECTILES: Record<HumanCharacter, React.FC> = {
  suit: SuitProjectile,
  chef: ChefProjectile,
  tourist: TouristProjectile,
  diva: DivaProjectile,
};

export const Bullet = memo(function Bullet({ id, startX, startY, characterType = 'suit', getBirdX, onHit, onMiss }: BulletProps) {
  const bulletRef = useRef<SVGGElement>(null);
  const hasCompletedRef = useRef(false);
  const hitCheckDoneRef = useRef(false);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  const idRef = useRef(id);
  const onHitRef = useRef(onHit);
  const onMissRef = useRef(onMiss);
  const getBirdXRef = useRef(getBirdX);

  idRef.current = id;
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
            onHitRef.current(idRef.current);
          }
          // else: missed bird, continue flying off screen
        }
      },
      onComplete: () => {
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onMissRef.current(idRef.current);
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

  const Projectile = PROJECTILES[characterType];

  return (
    <g ref={bulletRef} transform={`translate(${startX}, 0)`}>
      <Projectile />
    </g>
  );
});
