import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { BIRD_Y } from '../utils/constants';
import { BirdGraphic } from './BirdGraphic';

interface BirdProps {
  x: number;
  y?: number;
  direction: 'left' | 'right';
  isPlaying: boolean;
  isHurt?: boolean;
}

export function Bird({ x, y, direction, isPlaying, isHurt = false }: BirdProps) {
  const scaleX = direction === 'left' ? -1 : 1;
  const wingsRef = useRef<SVGGElement>(null);
  const birdRef = useRef<SVGGElement>(null);
  const hurtAnimationRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!isPlaying || !wingsRef.current) return;

    const tl = gsap.timeline({ repeat: -1 });

    tl.to(wingsRef.current, {
      y: -8,
      duration: 0.12,
      ease: 'power2.out',
    }).to(wingsRef.current, {
      y: 6,
      duration: 0.12,
      ease: 'power2.in',
    });

    return () => {
      tl.kill();
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!isHurt || !birdRef.current) return;

    if (hurtAnimationRef.current) {
      hurtAnimationRef.current.kill();
    }

    const tl = gsap.timeline();
    hurtAnimationRef.current = tl;

    tl.to(birdRef.current, { x: -8, y: -4, duration: 0.04 })
      .to(birdRef.current, { x: 8, y: 4, duration: 0.04 })
      .to(birdRef.current, { x: -6, y: 3, duration: 0.04 })
      .to(birdRef.current, { x: 6, y: -3, duration: 0.04 })
      .to(birdRef.current, { x: -4, y: 2, duration: 0.04 })
      .to(birdRef.current, { x: 4, y: -2, duration: 0.04 })
      .to(birdRef.current, { x: 0, y: 0, duration: 0.08, ease: 'power2.out' });

    return () => {
      if (hurtAnimationRef.current) {
        hurtAnimationRef.current.kill();
        hurtAnimationRef.current = null;
      }
    };
  }, [isHurt]);

  const bodyFill = isHurt ? '#FF4444' : '#4A4A4A';
  const wingFill = isHurt ? '#FF6666' : '#6B6B6B';

  return (
    <g transform={`translate(${x}, ${y ? y : BIRD_Y}) scale(${scaleX}, 1)`}>
      <BirdGraphic
        ref={birdRef}
        wingsRef={wingsRef}
        bodyFill={bodyFill}
        wingFill={wingFill}
        isHurt={isHurt}
      />
    </g>
  );
}
