import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { VIEWBOX } from '../utils/constants';

const THIRD = VIEWBOX.width / 3; // ~133

function isTouchPrimary() {
  // matchMedia('(pointer: coarse)') is the CSS-standard way to detect a
  // finger-first device. It returns true on phones/tablets and false on
  // desktops (even those with a touchscreen), so hybrid devices like Surface
  // laptops correctly return false. Falls back to maxTouchPoints for the rare
  // browser that lacks matchMedia.
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
      {/* Zone dividers — faint dashed vertical lines */}
      <line
        x1={THIRD} y1="0" x2={THIRD} y2={VIEWBOX.height}
        stroke="white" strokeWidth="1" strokeDasharray="5 8" opacity="0.25"
      />
      <line
        x1={THIRD * 2} y1="0" x2={THIRD * 2} y2={VIEWBOX.height}
        stroke="white" strokeWidth="1" strokeDasharray="5 8" opacity="0.25"
      />

      {/* ── Left zone: HOLD ← ── */}
      <g transform={`translate(${THIRD / 2}, 555)`}>
        <rect x="-32" y="-20" width="64" height="36" rx="5" fill="black" opacity="0.35" />
        {/* Arrow */}
        <text
          textAnchor="middle" y="-4"
          fontSize="20" fill="white" fontFamily="sans-serif" fontWeight="bold"
        >←</text>
        <text
          textAnchor="middle" y="12"
          fontSize="9" fill="white" fontFamily="sans-serif" opacity="0.85" letterSpacing="1"
        >HOLD</text>
      </g>

      {/* ── Centre zone: TAP + poop shape ── */}
      <g transform={`translate(${VIEWBOX.width / 2}, 555)`}>
        <rect x="-30" y="-20" width="60" height="36" rx="5" fill="black" opacity="0.35" />
        {/* Tiny angular poop (our Picasso turd, miniaturised) */}
        <polygon points="-5,4 -4,-1 4,-1 5,4"  fill="#7A4020" />
        <polygon points="-3,-1 -2,-5 2,-5 3,-1" fill="#8B5030" />
        <polygon points="-2,-5 0,-8 2,-5"       fill="#9B6040" />
        <text
          textAnchor="middle" y="12"
          fontSize="9" fill="white" fontFamily="sans-serif" opacity="0.85" letterSpacing="1"
        >TAP</text>
      </g>

      {/* ── Right zone: HOLD → ── */}
      <g transform={`translate(${THIRD * 2 + THIRD / 2}, 555)`}>
        <rect x="-32" y="-20" width="64" height="36" rx="5" fill="black" opacity="0.35" />
        <text
          textAnchor="middle" y="-4"
          fontSize="20" fill="white" fontFamily="sans-serif" fontWeight="bold"
        >→</text>
        <text
          textAnchor="middle" y="12"
          fontSize="9" fill="white" fontFamily="sans-serif" opacity="0.85" letterSpacing="1"
        >HOLD</text>
      </g>
    </g>
  );
}
