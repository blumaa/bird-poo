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
      {/* Falling poop — Cubist angular faceted turd */}
      {!showSplat && (
        <g ref={poopRef} transform={`translate(${poop.x}, 0)`}>
          {/* Bottom tier — wide angular trapezoid */}
          <polygon points="-8,5 -6,-2 6,-2 8,5" fill="#5D3010" stroke="#111" strokeWidth="2" />
          {/* Middle tier */}
          <polygon points="-5,-2 -4,-8 4,-8 5,-2" fill="#7A4020" stroke="#111" strokeWidth="2" />
          {/* Upper tier */}
          <polygon points="-3,-8 -2,-13 3,-13 3,-8" fill="#8B5030" stroke="#111" strokeWidth="2" />
          {/* Top peak */}
          <polygon points="-1,-13 0,-17 2,-13" fill="#9B6040" stroke="#111" strokeWidth="1.5" />
          {/* Cubist light-plane facet — off-center highlight shard */}
          <polygon points="-2,0 2,-6 4,0" fill="#9B6040" opacity="0.7" />
        </g>
      )}

      {/* Splat effect — angular geometric burst */}
      {showSplat && (
        <g ref={splatRef} transform={`translate(${splatPos.x}, ${splatPos.y})`}>
          {/* Central diamond */}
          <polygon points="-12,0 0,-4 12,0 0,6" fill="#5D3010" stroke="#111" strokeWidth="1.5" />
          {/* Radiating angular shards */}
          <polygon points="0,0 14,-6 16,2" fill="#7A4020" stroke="#111" strokeWidth="1" />
          <polygon points="0,0 -14,-6 -16,2" fill="#5D3010" stroke="#111" strokeWidth="1" />
          <polygon points="0,0 8,-12 14,-8" fill="#8B5030" stroke="#111" strokeWidth="1" />
          <polygon points="0,0 -8,-12 -14,-8" fill="#7A4020" stroke="#111" strokeWidth="1" />
          <polygon points="0,0 10,8 4,14" fill="#5D3010" stroke="#111" strokeWidth="1" />
          <polygon points="0,0 -10,8 -4,14" fill="#7A4020" stroke="#111" strokeWidth="1" />
        </g>
      )}
    </>
  );
}
