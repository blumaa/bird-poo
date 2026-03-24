import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { VIEWBOX } from '../utils/constants';

function isTouchPrimary() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia) return window.matchMedia('(pointer: coarse)').matches;
  return navigator.maxTouchPoints > 0;
}

export function TouchZoneHints() {
  const [isTouch] = useState(isTouchPrimary);
  const groupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!isTouch || !groupRef.current) return;

    const tl = gsap.timeline();
    tl.fromTo(groupRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' })
      .to(groupRef.current, { opacity: 0, duration: 1.2, delay: 3.5, ease: 'power1.in' });

    return () => { tl.kill(); };
  }, [isTouch]);

  if (!isTouch) return null;

  return (
    <g ref={groupRef} style={{ pointerEvents: 'none' }}>
      <g transform={`translate(${VIEWBOX.width / 2}, 555)`}>
        <rect x="-90" y="-16" width="180" height="28" rx="5" fill="black" opacity="0.35" />
        <text
          textAnchor="middle" y="4"
          fontSize="11" fill="white" fontFamily="sans-serif" fontWeight="bold"
          letterSpacing="0.5"
        >SWIPE to move · TAP to poop</text>
      </g>
    </g>
  );
}
