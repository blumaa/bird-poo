import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { HumanState, HumanReaction } from '../types/game';

interface HumanProps {
  x: number;
  y: number;
  direction: 'left' | 'right';
  isPlaying: boolean;
  humanState?: HumanState;
  humanReaction?: HumanReaction;
  isRespawning?: boolean;
  opacity?: number;
}

type ViewState = 'side' | 'front' | 'shooting' | 'vomiting' | 'crying' | 'running';

// ---------------------------------------------------------------------------
// Picasso cubist head helpers
// ---------------------------------------------------------------------------

/** Profile head facing right with a frontal eye — the classic Picasso move. */
function PicassoSideHead({ transform }: { transform?: string }) {
  return (
    <g transform={transform}>
      {/* Head polygon — profile shape */}
      <polygon points="-4,0 -2,-12 8,-14 14,-8 14,4 8,10 -2,8" fill="#E8C49A" stroke="#111" strokeWidth="2" />
      {/* Shadow plane — rear third of face */}
      <polygon points="-4,0 -2,-12 4,-12 2,8 -2,8" fill="#C49060" />
      {/* Angular hair cap */}
      <polygon points="-4,-8 -2,-14 10,-16 14,-10 10,-12 0,-13" fill="#5D3010" stroke="#111" strokeWidth="1.5" />
      {/* Ear — small diamond */}
      <polygon points="-5,-2 -8,0 -5,4 -2,2" fill="#C49060" stroke="#111" strokeWidth="1" />
      {/* Eye — frontal almond placed on profile temple (Picasso simultaneity) */}
      <polygon points="4,-8 8,-10 12,-7 8,-4" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
      <circle cx="8" cy="-7" r="2" fill="#111" />
      <circle cx="8.8" cy="-7.5" r="0.6" fill="#F5ECD7" />
      {/* Nose — angular L on profile edge */}
      <polyline points="14,-8 18,-4 15,-2" stroke="#C49060" strokeWidth="2" fill="none" strokeLinejoin="miter" />
      {/* Mouth — bold horizontal slash */}
      <line x1="12" y1="4" x2="16" y2="3" stroke="#8B1A1A" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

/** Front-facing head with two eyes on split geometric planes — Cubist simultaneity. */
function PicassoFrontHead({ transform }: { transform?: string }) {
  return (
    <g transform={transform}>
      {/* Left plane (profile-ish, darker) */}
      <polygon points="0,-12 -10,-8 -10,8 0,10" fill="#C49060" stroke="#111" strokeWidth="2" />
      {/* Right plane (frontal, lighter) */}
      <polygon points="0,-12 10,-10 10,8 0,10" fill="#E8C49A" stroke="#111" strokeWidth="2" />
      {/* Angular hair band */}
      <polygon points="-10,-8 -8,-14 0,-16 8,-14 10,-10 4,-12 -4,-12" fill="#5D3010" stroke="#111" strokeWidth="1.5" />
      {/* Left eye — oddly placed, profile-ish */}
      <polygon points="-8,-4 -4,-6 -2,-3 -6,-1" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
      <circle cx="-5" cy="-4" r="1.5" fill="#111" />
      {/* Right eye — frontal almond */}
      <polygon points="2,-6 6,-8 10,-5 6,-2" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
      <circle cx="6" cy="-5" r="1.5" fill="#111" />
      {/* Nose — angular V */}
      <polyline points="-1,-2 0,4 2,-2" stroke="#C49060" strokeWidth="1.5" fill="none" />
      {/* Mouth — angular W-shape */}
      <polyline points="-5,7 -2,5 0,8 2,5 5,7" stroke="#8B1A1A" strokeWidth="2" fill="none" strokeLinejoin="round" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Shared suit body (side profile)
// ---------------------------------------------------------------------------
function SuitBody() {
  return (
    <>
      {/* Cobalt angular jacket — irregular quadrilateral */}
      <polygon points="-6,-14 8,-14 10,8 -8,8" fill="#1A3A7A" stroke="#111" strokeWidth="2" />
      {/* Lapel shadow facet */}
      <polygon points="-6,-14 -2,-14 0,-6 -8,2" fill="#0E2456" stroke="#111" strokeWidth="1" />
      {/* Collar — cream triangle */}
      <polygon points="-2,-14 2,-10 6,-14" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
      {/* Tie — angular strip */}
      <polygon points="1,-10 3,6 -1,6" fill="#8B1A1A" stroke="#111" strokeWidth="1" />
    </>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Human({
  x,
  y,
  direction,
  isPlaying,
  humanState = 'walking',
  humanReaction = 'none',
  isRespawning: _isRespawning = false,
  opacity = 1,
}: HumanProps) {
  const [viewState, setViewState] = useState<ViewState>('side');
  const viewStateRef = useRef<ViewState>('side');
  const [currentDirection, setCurrentDirection] = useState(direction);
  const prevDirectionRef = useRef(direction);

  // Keep ref in sync so effects can read current viewState without listing it as dep
  viewStateRef.current = viewState;
  const scaleX = currentDirection === 'left' ? -1 : 1;

  const shakeRef = useRef<SVGGElement>(null);
  const leftLegRef = useRef<SVGGElement>(null);
  const rightLegRef = useRef<SVGGElement>(null);
  const leftArmRef = useRef<SVGGElement>(null);
  const rightArmRef = useRef<SVGGElement>(null);
  const walkingTlRef = useRef<gsap.core.Timeline | null>(null);

  // Handle reaction state (overrides other states)
  useEffect(() => {
    if (humanReaction !== 'none') {
      setViewState(humanReaction);
      if (walkingTlRef.current) {
        walkingTlRef.current.pause();
      }
    } else {
      const vs = viewStateRef.current;
      if (vs === 'vomiting' || vs === 'crying' || vs === 'running') {
        setViewState('side');
        if (walkingTlRef.current && isPlaying) {
          walkingTlRef.current.play();
        }
      }
    }
  }, [humanReaction, isPlaying]);

  // Shake when hit by poo
  useEffect(() => {
    if (humanReaction === 'none' || !shakeRef.current) return;
    const tl = gsap.timeline();
    tl.to(shakeRef.current, { x: -10, duration: 0.05, ease: 'power2.out' })
      .to(shakeRef.current, { x:  10, duration: 0.05 })
      .to(shakeRef.current, { x:  -8, duration: 0.05 })
      .to(shakeRef.current, { x:   8, duration: 0.05 })
      .to(shakeRef.current, { x:  -5, duration: 0.05 })
      .to(shakeRef.current, { x:   5, duration: 0.05 })
      .to(shakeRef.current, { x:   0, duration: 0.05 });
    return () => { tl.kill(); };
  }, [humanReaction]);

  // Handle shooting state
  useEffect(() => {
    if (humanReaction !== 'none') return;
    const vs = viewStateRef.current;
    if (humanState === 'shooting' && vs !== 'front') {
      setViewState('shooting');
      if (walkingTlRef.current) {
        walkingTlRef.current.pause();
      }
    } else if (humanState === 'walking' && vs === 'shooting') {
      setViewState('side');
      if (walkingTlRef.current && isPlaying) {
        walkingTlRef.current.play();
      }
    }
  }, [humanState, isPlaying, humanReaction]);

  // Handle direction change with turn animation
  useEffect(() => {
    if (prevDirectionRef.current !== direction && isPlaying && humanState !== 'shooting') {
      setViewState('front');
      if (walkingTlRef.current) {
        walkingTlRef.current.pause();
      }
      const turnTimeout = setTimeout(() => {
        setCurrentDirection(direction);
        setViewState('side');
        if (walkingTlRef.current && isPlaying) {
          walkingTlRef.current.play();
        }
      }, 500);
      prevDirectionRef.current = direction;
      return () => clearTimeout(turnTimeout);
    }
  }, [direction, isPlaying, humanState]);

  // Walking animation
  useEffect(() => {
    if (!isPlaying || viewState !== 'side') return;
    if (!leftLegRef.current || !rightLegRef.current || !leftArmRef.current || !rightArmRef.current) return;

    gsap.set(leftLegRef.current, { rotation: 0, transformOrigin: '-3px 5px' });
    gsap.set(rightLegRef.current, { rotation: 0, transformOrigin: '3px 5px' });
    gsap.set(leftArmRef.current, { rotation: 0, transformOrigin: '-4px -10px' });
    gsap.set(rightArmRef.current, { rotation: 0, transformOrigin: '6px -10px' });

    const tl = gsap.timeline({ repeat: -1 });
    walkingTlRef.current = tl;

    const swingAngle = 18;
    const duration = 0.18;

    tl.to(leftLegRef.current, { rotation: swingAngle, duration, ease: 'sine.inOut' }, 0)
      .to(rightLegRef.current, { rotation: -swingAngle, duration, ease: 'sine.inOut' }, 0)
      .to(leftArmRef.current, { rotation: swingAngle, duration, ease: 'sine.inOut' }, 0)
      .to(rightArmRef.current, { rotation: -swingAngle, duration, ease: 'sine.inOut' }, 0)
      .to(leftLegRef.current, { rotation: -swingAngle, duration, ease: 'sine.inOut' })
      .to(rightLegRef.current, { rotation: swingAngle, duration, ease: 'sine.inOut' }, '<')
      .to(leftArmRef.current, { rotation: -swingAngle, duration, ease: 'sine.inOut' }, '<')
      .to(rightArmRef.current, { rotation: swingAngle, duration, ease: 'sine.inOut' }, '<');

    return () => {
      tl.kill();
      walkingTlRef.current = null;
    };
  }, [isPlaying, viewState, currentDirection]);

  return (
    <g ref={shakeRef} style={{ opacity, transition: 'opacity 0.5s ease' }}>
      {/* Shooting view */}
      {viewState === 'shooting' && (
        <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          <path d="M 3 8 L 5 20 L 8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="2,25 14,25 14,29 2,29" fill="#111" />
          <path d="M -3 8 L -5 20 L -8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-14,25 -2,25 -2,29 -14,29" fill="#111" />
          <SuitBody />
          <path d="M -4 -10 L 2 -24" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <PicassoSideHead transform="translate(4, -26) rotate(-10)" />
          <path d="M 6 -10 L 6 -28" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="2,-28 12,-28 12,-20 2,-20" fill="#888" stroke="#111" strokeWidth="2" />
          <polygon points="4,-28 10,-28 10,-44 4,-44" fill="#AAA" stroke="#111" strokeWidth="2" />
          <polygon points="4,-28 6,-28 6,-44 4,-44" fill="#CCC" />
          <path d="M 2,-24 L -2,-24 L -2,-20 L 2,-20" stroke="#111" strokeWidth="1.5" fill="none" />
          <polygon points="2,-28 6,-30 10,-28 8,-24 2,-24" fill="#E8C49A" stroke="#111" strokeWidth="1" />
        </g>
      )}

      {/* Vomiting reaction */}
      {viewState === 'vomiting' && (
        <g transform={`translate(${x}, ${y})`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          <path d="M -5 8 L -8 22 L -10 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <path d="M 5 8 L 2 22 L 0 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-16,25 -4,25 -4,29 -16,29" fill="#111" />
          <polygon points="-6,25 6,25 6,29 -6,29" fill="#111" />
          <g transform="rotate(30)">
            <polygon points="-6,-14 8,-14 10,8 -8,8" fill="#1A3A7A" stroke="#111" strokeWidth="2" />
            <polygon points="-2,-14 2,-10 6,-14" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
            <polygon points="1,-10 3,6 -1,6" fill="#8B1A1A" stroke="#111" strokeWidth="1" />
          </g>
          <path d="M -5 -5 L 5 10" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <path d="M 10 -5 L 20 10" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <PicassoSideHead transform="translate(16, -15) rotate(40)" />
          <g transform="translate(28, 2)">
            <polygon points="-6,0 0,-8 6,0 4,8 -4,8" fill="#5A9A20" opacity="0.85" stroke="#111" strokeWidth="1" />
            <polygon points="4,2 12,-4 14,4 8,10" fill="#7ABA30" opacity="0.8" stroke="#111" strokeWidth="1" />
            <polygon points="-4,6 2,10 0,16 -6,14" fill="#5A9A20" opacity="0.7" />
          </g>
        </g>
      )}

      {/* Crying reaction */}
      {viewState === 'crying' && (
        <g transform={`translate(${x}, ${y})`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          <path d="M -5 8 L -5 22 L -8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <path d="M 5 8 L 5 22 L 8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-14,25 -2,25 -2,29 -14,29" fill="#111" />
          <polygon points="2,25 14,25 14,29 2,29" fill="#111" />
          <polygon points="-8,-14 8,-14 10,8 -10,8" fill="#1A3A7A" stroke="#111" strokeWidth="2" />
          <polygon points="-2,-14 2,-10 6,-14" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
          <polygon points="0,-10 2,6 -2,6" fill="#8B1A1A" stroke="#111" strokeWidth="1" />
          <path d="M -8 -10 L -8 -24" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <path d="M 8 -10 L 8 -24" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="-10,-24 -8,-27 -6,-24 -8,-21" fill="#E8C49A" stroke="#111" strokeWidth="1" />
          <polygon points="6,-24 8,-27 10,-24 8,-21" fill="#E8C49A" stroke="#111" strokeWidth="1" />
          <PicassoFrontHead transform="translate(0, -40)" />
          <polygon points="-5,-26 -4,-22 -3,-26 -4,-29" fill="#4A7AB0" opacity="0.9" />
          <polygon points="3,-26 4,-22 5,-26 4,-29" fill="#4A7AB0" opacity="0.9" />
          <polygon points="-6,-18 -5,-14 -4,-18 -5,-21" fill="#4A7AB0" opacity="0.7" />
          <polygon points="4,-18 5,-14 6,-18 5,-21" fill="#4A7AB0" opacity="0.7" />
        </g>
      )}

      {/* Running reaction */}
      {viewState === 'running' && (
        <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`}>
          <polygon points="-10,28 24,28 28,32 -14,32" fill="rgba(0,0,0,0.2)" />
          <path d="M 5 5 L 20 14 L 30 20" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="26,18 38,18 38,22 26,22" fill="#111" transform="rotate(-20, 32, 20)" />
          <g transform="rotate(-20)">
            <polygon points="-6,-14 8,-14 10,8 -8,8" fill="#1A3A7A" stroke="#111" strokeWidth="2" />
            <polygon points="-2,-14 2,-10 6,-14" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
            <polygon points="1,-10 3,6 -1,6" fill="#8B1A1A" stroke="#111" strokeWidth="1" />
          </g>
          <path d="M -5 0 L -15 -5 L -20 5" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-26,3 -14,3 -14,7 -26,7" fill="#111" transform="rotate(15, -20, 5)" />
          <path d="M -2 -18 L 14 -10" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="12,-12 18,-8 16,-4 10,-8" fill="#E8C49A" stroke="#111" strokeWidth="1" />
          <path d="M 4 -18 L -10 -28" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="-14,-30 -8,-26 -6,-30 -12,-34" fill="#E8C49A" stroke="#111" strokeWidth="1" />
          <PicassoSideHead transform="translate(6, -34) rotate(-12)" />
          <line x1="36" y1="-8" x2="50" y2="-10" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="38" y1="2" x2="56" y2="2" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36" y1="12" x2="50" y2="10" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* Front view (turning) */}
      {viewState === 'front' && (
        <g transform={`translate(${x}, ${y})`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          <path d="M -5 8 L -5 22 L -8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <path d="M 5 8 L 5 22 L 8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-14,25 -2,25 -2,29 -14,29" fill="#111" />
          <polygon points="2,25 14,25 14,29 2,29" fill="#111" />
          <polygon points="-10,-14 10,-14 10,8 -10,8" fill="#1A3A7A" stroke="#111" strokeWidth="2" />
          <line x1="0" y1="-14" x2="0" y2="8" stroke="#0E2456" strokeWidth="1.5" />
          <polygon points="-4,-14 0,-10 4,-14" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
          <polygon points="-1,-10 1,-10 3,6 -3,6" fill="#8B1A1A" stroke="#111" strokeWidth="1" />
          <path d="M -10 -10 L -14 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <path d="M 10 -10 L 14 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="-16,2 -12,4 -10,8 -14,6" fill="#E8C49A" stroke="#111" strokeWidth="1" />
          <polygon points="10,4 14,2 16,6 12,8" fill="#E8C49A" stroke="#111" strokeWidth="1" />
          <PicassoFrontHead transform="translate(0, -30)" />
        </g>
      )}

      {/* Side view (normal walking) */}
      {viewState === 'side' && (
        <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          <g ref={rightLegRef}>
            <path d="M 3 8 L 5 20 L 8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
            <polygon points="2,25 14,25 14,29 2,29" fill="#111" />
          </g>
          <SuitBody />
          <g ref={leftArmRef}>
            <path d="M -4 -10 L -10 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
            <polygon points="-12,2 -10,5 -8,2 -10,-1" fill="#E8C49A" stroke="#111" strokeWidth="1" />
          </g>
          <g ref={leftLegRef}>
            <path d="M -3 8 L -5 20 L -8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
            <polygon points="-14,25 -2,25 -2,29 -14,29" fill="#111" />
          </g>
          <g ref={rightArmRef}>
            <path d="M 6 -10 L 12 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
            <polygon points="10,2 12,5 14,2 12,-1" fill="#E8C49A" stroke="#111" strokeWidth="1" />
          </g>
          <PicassoSideHead transform="translate(4, -28)" />
        </g>
      )}
    </g>
  );
}
