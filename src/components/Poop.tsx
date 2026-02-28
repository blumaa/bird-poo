import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { HUMAN_HIT_Y, getLevelConfig, checkCollision } from '../utils/constants';
import type { PoopData } from '../types/game';

interface PoopProps {
  poop: PoopData;
  level: number;
  getHumanX: () => number;
  onHit: (id: string) => void;
  onMiss: (id: string) => void;
  onRemove: (id: string) => void;
}

const GROUND_SPLAT_Y = 516; // Road surface at human's feet level
const HEAD_SPLAT_Y = HUMAN_HIT_Y + 5;

export function Poop({ poop, level, getHumanX, onHit, onMiss, onRemove }: PoopProps) {
  const poopRef = useRef<SVGGElement>(null);
  const splatRef = useRef<SVGGElement>(null);
  const hasLandedRef = useRef(false);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const splatAnimationRef = useRef<gsap.core.Tween | null>(null);
  const [showSplat, setShowSplat] = useState(false);
  const [splatPos, setSplatPos] = useState({ x: poop.x, y: GROUND_SPLAT_Y });

  const getHumanXRef = useRef(getHumanX);
  const onHitRef = useRef(onHit);
  const onMissRef = useRef(onMiss);
  const onRemoveRef = useRef(onRemove);
  const levelRef = useRef(level);

  getHumanXRef.current = getHumanX;
  onHitRef.current = onHit;
  onMissRef.current = onMiss;
  onRemoveRef.current = onRemove;
  levelRef.current = level;

  useEffect(() => {
    if (!poopRef.current || hasLandedRef.current) return;

    const levelConfig = getLevelConfig(levelRef.current);

    gsap.set(poopRef.current, { y: poop.y });

    animationRef.current = gsap.to(poopRef.current, {
      y: GROUND_SPLAT_Y,
      duration: levelConfig.poopFallDuration,
      ease: 'power1.in',
      onUpdate: () => {
        if (hasLandedRef.current || !poopRef.current) return;
        const currentY = gsap.getProperty(poopRef.current, 'y') as number;
        if (currentY < HUMAN_HIT_Y) return; // not in human's zone yet
        const humanX = getHumanXRef.current();
        if (checkCollision(humanX, poop.x)) {
          hasLandedRef.current = true;
          animationRef.current?.kill();
          setSplatPos({ x: humanX, y: HEAD_SPLAT_Y });
          setShowSplat(true);
          onHitRef.current(poop.id);
        }
      },
      onComplete: () => {
        if (hasLandedRef.current) return;
        hasLandedRef.current = true;
        const humanX = getHumanXRef.current();
        const isHit = checkCollision(humanX, poop.x);
        setSplatPos({ x: isHit ? humanX : poop.x, y: GROUND_SPLAT_Y });
        setShowSplat(true);
        if (isHit) {
          onHitRef.current(poop.id);
        } else {
          onMissRef.current(poop.id);
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

  useEffect(() => {
    if (!showSplat || !splatRef.current) return;

    splatAnimationRef.current = gsap.fromTo(
      splatRef.current,
      { scale: 0.5, opacity: 1 },
      {
        scale: 1.5,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          onRemoveRef.current(poop.id);
        },
      }
    );

    return () => {
      if (splatAnimationRef.current) {
        splatAnimationRef.current.kill();
        splatAnimationRef.current = null;
      }
    };
  }, [showSplat, poop.id]);

  return (
    <>
      {/* Falling poop - fixed X, only Y animated by GSAP */}
      {!showSplat && (
        <g ref={poopRef} transform={`translate(${poop.x}, 0)`}>
          <ellipse cx="0" cy="0" rx="8" ry="6" fill="#8B4513" />
          <ellipse cx="0" cy="-5" rx="6" ry="5" fill="#8B4513" />
          <ellipse cx="0" cy="-9" rx="4" ry="4" fill="#8B4513" />
          <ellipse cx="0" cy="-12" rx="2" ry="2" fill="#8B4513" />
        </g>
      )}

      {/* Splat effect */}
      {showSplat && (
        <g ref={splatRef} transform={`translate(${splatPos.x}, ${splatPos.y})`}>
          <ellipse cx="0" cy="0" rx="15" ry="5" fill="#8B4513" />
          <circle cx="-12" cy="-3" r="4" fill="#8B4513" />
          <circle cx="10" cy="-5" r="3" fill="#8B4513" />
          <circle cx="-8" cy="3" r="3" fill="#8B4513" />
          <circle cx="14" cy="2" r="2" fill="#8B4513" />
          <circle cx="-15" cy="-6" r="2" fill="#8B4513" />
          <circle cx="8" cy="-8" r="2" fill="#8B4513" />
        </g>
      )}
    </>
  );
}
