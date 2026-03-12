import { memo, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { CharacterProps } from './SuitHuman';

type ViewState = 'side' | 'front' | 'shooting' | 'vomiting' | 'crying' | 'running';

// ---------------------------------------------------------------------------
// Tourist cubist head helpers
// ---------------------------------------------------------------------------

function TouristSideHead({ transform }: { transform?: string }) {
  return (
    <g transform={transform}>
      {/* Head polygon — profile */}
      <polygon points="-4,0 -2,-12 8,-14 14,-8 14,4 8,10 -2,8" fill="#F2B4A0" stroke="#111" strokeWidth="2" />
      {/* Shadow plane — sunburnt darker */}
      <polygon points="-4,0 -2,-12 4,-12 2,8 -2,8" fill="#D48A70" />
      {/* Yellow bucket hat */}
      <polygon points="-8,-8 -6,-18 12,-18 14,-8" fill="#F5D040" stroke="#111" strokeWidth="2" />
      <polygon points="-10,-8 16,-8 18,-6 -12,-6" fill="#F5D040" stroke="#111" strokeWidth="1.5" />
      {/* Sandy blonde hair peeking out */}
      <polygon points="-6,-8 -4,-12 2,-12 0,-8" fill="#D4B060" />
      {/* Angular sunglasses */}
      <polygon points="3,-8 8,-10 13,-7 8,-4" fill="#222" stroke="#111" strokeWidth="1.5" />
      <polygon points="3,-6 8,-4 13,-7" fill="#334" />
      {/* Ear */}
      <polygon points="-5,-2 -8,0 -5,4 -2,2" fill="#D48A70" stroke="#111" strokeWidth="1" />
      {/* Nose */}
      <polyline points="14,-6 18,-2 15,0" stroke="#D48A70" strokeWidth="2" fill="none" strokeLinejoin="miter" />
      {/* Goofy grin */}
      <path d="M 11,4 Q 14,8 17,4" stroke="#8B1A1A" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
}

function TouristFrontHead({ transform }: { transform?: string }) {
  return (
    <g transform={transform}>
      {/* Left plane */}
      <polygon points="0,-12 -10,-8 -10,8 0,10" fill="#D48A70" stroke="#111" strokeWidth="2" />
      {/* Right plane */}
      <polygon points="0,-12 10,-10 10,8 0,10" fill="#F2B4A0" stroke="#111" strokeWidth="2" />
      {/* Bucket hat front */}
      <polygon points="-12,-8 -10,-18 10,-18 12,-8" fill="#F5D040" stroke="#111" strokeWidth="2" />
      <polygon points="-14,-8 14,-8 16,-6 -16,-6" fill="#F5D040" stroke="#111" strokeWidth="1.5" />
      {/* Sandy hair */}
      <polygon points="-8,-8 -6,-12 6,-12 8,-8" fill="#D4B060" />
      {/* Sunglasses — both lenses */}
      <polygon points="-9,-4 -5,-6 -2,-3 -6,-1" fill="#222" stroke="#111" strokeWidth="1.5" />
      <polygon points="2,-6 6,-8 10,-5 6,-2" fill="#222" stroke="#111" strokeWidth="1.5" />
      <line x1="-2" y1="-4" x2="2" y2="-5" stroke="#111" strokeWidth="1.5" />
      {/* Nose */}
      <polyline points="-1,-2 0,4 2,-2" stroke="#D48A70" strokeWidth="1.5" fill="none" />
      {/* Grin */}
      <path d="M -4,7 Q 0,11 4,7" stroke="#8B1A1A" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Tourist body
// ---------------------------------------------------------------------------
function TouristBody() {
  return (
    <>
      {/* Hawaiian shirt */}
      <polygon points="-6,-14 8,-14 10,8 -8,8" fill="#E85D20" stroke="#111" strokeWidth="2" />
      {/* Leaf pattern polygons */}
      <polygon points="-4,-10 -1,-12 2,-8 -1,-6" fill="#2AAA6A" opacity="0.7" />
      <polygon points="3,-4 6,-6 8,-2 5,0" fill="#2AAA6A" opacity="0.7" />
      <polygon points="-5,0 -2,-2 0,2 -3,4" fill="#2AAA6A" opacity="0.7" />
      {/* Open collar */}
      <polygon points="-2,-14 1,-8 4,-14" fill="#F2B4A0" stroke="#111" strokeWidth="1" />
    </>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const TouristHuman = memo(function TouristHuman({
  x,
  y,
  direction,
  isPlaying,
  humanState = 'walking',
  humanReaction = 'none',
  isRespawning: _isRespawning = false,
  opacity = 1,
}: CharacterProps) {
  const [viewState, setViewState] = useState<ViewState>('side');
  const viewStateRef = useRef<ViewState>('side');
  const [currentDirection, setCurrentDirection] = useState(direction);
  const prevDirectionRef = useRef(direction);

  viewStateRef.current = viewState;
  const scaleX = currentDirection === 'left' ? -1 : 1;

  const shakeRef = useRef<SVGGElement>(null);
  const leftLegRef = useRef<SVGGElement>(null);
  const rightLegRef = useRef<SVGGElement>(null);
  const leftArmRef = useRef<SVGGElement>(null);
  const rightArmRef = useRef<SVGGElement>(null);
  const walkingTlRef = useRef<gsap.core.Timeline | null>(null);

  // Handle reaction state
  useEffect(() => {
    if (humanReaction !== 'none') {
      setViewState(humanReaction);
      if (walkingTlRef.current) walkingTlRef.current.pause();
    } else {
      const vs = viewStateRef.current;
      if (vs === 'vomiting' || vs === 'crying' || vs === 'running') {
        setViewState('side');
        if (walkingTlRef.current && isPlaying) walkingTlRef.current.play();
      }
    }
  }, [humanReaction, isPlaying]);

  // Shake when hit
  useEffect(() => {
    if (humanReaction === 'none' || !shakeRef.current) return;
    const tl = gsap.timeline();
    tl.to(shakeRef.current, { x: -10, duration: 0.05, ease: 'power2.out' })
      .to(shakeRef.current, { x: 10, duration: 0.05 })
      .to(shakeRef.current, { x: -8, duration: 0.05 })
      .to(shakeRef.current, { x: 8, duration: 0.05 })
      .to(shakeRef.current, { x: -5, duration: 0.05 })
      .to(shakeRef.current, { x: 5, duration: 0.05 })
      .to(shakeRef.current, { x: 0, duration: 0.05 });
    return () => { tl.kill(); };
  }, [humanReaction]);

  // Handle shooting state
  useEffect(() => {
    if (humanReaction !== 'none') return;
    const vs = viewStateRef.current;
    if (humanState === 'shooting' && vs !== 'front') {
      setViewState('shooting');
      if (walkingTlRef.current) walkingTlRef.current.pause();
    } else if (humanState === 'walking' && vs === 'shooting') {
      setViewState('side');
      if (walkingTlRef.current && isPlaying) walkingTlRef.current.play();
    }
  }, [humanState, isPlaying, humanReaction]);

  // Direction change with turn
  useEffect(() => {
    if (prevDirectionRef.current !== direction && isPlaying && humanState !== 'shooting') {
      setViewState('front');
      if (walkingTlRef.current) walkingTlRef.current.pause();
      const turnTimeout = setTimeout(() => {
        setCurrentDirection(direction);
        setViewState('side');
        if (walkingTlRef.current && isPlaying) walkingTlRef.current.play();
      }, 500);
      prevDirectionRef.current = direction;
      return () => clearTimeout(turnTimeout);
    }
  }, [direction, isPlaying, humanState]);

  // Walking animation — taller build, bouncier stride
  useEffect(() => {
    if (!isPlaying || viewState !== 'side') return;
    if (!leftLegRef.current || !rightLegRef.current || !leftArmRef.current || !rightArmRef.current) return;

    gsap.set(leftLegRef.current, { rotation: 0, transformOrigin: '-3px 5px' });
    gsap.set(rightLegRef.current, { rotation: 0, transformOrigin: '3px 5px' });
    gsap.set(leftArmRef.current, { rotation: 0, transformOrigin: '-4px -10px' });
    gsap.set(rightArmRef.current, { rotation: 0, transformOrigin: '6px -10px' });

    const tl = gsap.timeline({ repeat: -1 });
    walkingTlRef.current = tl;

    const swingAngle = 20;
    const duration = 0.16;

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
      {/* Shooting — water gun held up */}
      {viewState === 'shooting' && (
        <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          {/* Legs with bermuda shorts visible */}
          <path d="M 3 8 L 5 14" stroke="#F5D040" strokeWidth="6" strokeLinecap="square" fill="none" />
          <path d="M 5 14 L 5 20 L 8 26" stroke="#F2B4A0" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="2,25 14,25 14,29 2,29" fill="#4488BB" />
          <path d="M -3 8 L -5 14" stroke="#F5D040" strokeWidth="6" strokeLinecap="square" fill="none" />
          <path d="M -5 14 L -5 20 L -8 26" stroke="#F2B4A0" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-14,25 -2,25 -2,29 -14,29" fill="#4488BB" />
          <TouristBody />
          <path d="M -4 -10 L 2 -24" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <TouristSideHead transform="translate(4, -26) rotate(-10)" />
          <path d="M 6 -10 L 6 -28" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          {/* Water gun */}
          <polygon points="2,-28 12,-28 14,-22 2,-22" fill="#44BB44" stroke="#111" strokeWidth="2" />
          <polygon points="4,-28 8,-28 8,-42 4,-42" fill="#4488BB" stroke="#111" strokeWidth="2" />
          <polygon points="4,-42 8,-42 10,-44 2,-44" fill="#66AADD" stroke="#111" strokeWidth="1" />
          <polygon points="2,-28 6,-30 10,-28 8,-24 2,-24" fill="#F2B4A0" stroke="#111" strokeWidth="1" />
        </g>
      )}

      {/* Vomiting — tropical cocktail polygons */}
      {viewState === 'vomiting' && (
        <g transform={`translate(${x}, ${y})`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          <path d="M -5 8 L -8 14" stroke="#F5D040" strokeWidth="6" strokeLinecap="square" fill="none" />
          <path d="M -8 14 L -8 22 L -10 26" stroke="#F2B4A0" strokeWidth="5" strokeLinecap="square" fill="none" />
          <path d="M 5 8 L 2 14" stroke="#F5D040" strokeWidth="6" strokeLinecap="square" fill="none" />
          <path d="M 2 14 L 2 22 L 0 26" stroke="#F2B4A0" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-16,25 -4,25 -4,29 -16,29" fill="#4488BB" />
          <polygon points="-6,25 6,25 6,29 -6,29" fill="#4488BB" />
          <g transform="rotate(30)">
            <TouristBody />
          </g>
          <path d="M -5 -5 L 5 10" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <path d="M 10 -5 L 20 10" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <TouristSideHead transform="translate(16, -15) rotate(40)" />
          {/* Tropical cocktail vomit */}
          <g transform="translate(28, 2)">
            {/* Cocktail glass shape */}
            <polygon points="-4,-6 4,-6 2,4 -2,4" fill="#FF6B9D" opacity="0.85" stroke="#111" strokeWidth="1" />
            {/* Pineapple chunk */}
            <polygon points="6,-2 12,-6 14,0 10,4" fill="#F5D040" opacity="0.8" stroke="#111" strokeWidth="1" />
            {/* Palm leaf */}
            <polygon points="-6,4 0,8 -2,14 -8,12" fill="#2AAA6A" opacity="0.7" stroke="#111" strokeWidth="1" />
          </g>
        </g>
      )}

      {/* Crying */}
      {viewState === 'crying' && (
        <g transform={`translate(${x}, ${y})`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          <path d="M -5 8 L -5 14" stroke="#F5D040" strokeWidth="6" strokeLinecap="square" fill="none" />
          <path d="M -5 14 L -5 22 L -8 26" stroke="#F2B4A0" strokeWidth="5" strokeLinecap="square" fill="none" />
          <path d="M 5 8 L 5 14" stroke="#F5D040" strokeWidth="6" strokeLinecap="square" fill="none" />
          <path d="M 5 14 L 5 22 L 8 26" stroke="#F2B4A0" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-14,25 -2,25 -2,29 -14,29" fill="#4488BB" />
          <polygon points="2,25 14,25 14,29 2,29" fill="#4488BB" />
          <polygon points="-8,-14 8,-14 10,8 -10,8" fill="#E85D20" stroke="#111" strokeWidth="2" />
          <polygon points="-2,-14 1,-8 4,-14" fill="#F2B4A0" stroke="#111" strokeWidth="1" />
          {/* Leaf patterns on shirt */}
          <polygon points="-4,-8 -1,-10 2,-6 -1,-4" fill="#2AAA6A" opacity="0.7" />
          <polygon points="3,-2 6,-4 8,0 5,2" fill="#2AAA6A" opacity="0.7" />
          <path d="M -8 -10 L -8 -24" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <path d="M 8 -10 L 8 -24" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="-10,-24 -8,-27 -6,-24 -8,-21" fill="#F2B4A0" stroke="#111" strokeWidth="1" />
          <polygon points="6,-24 8,-27 10,-24 8,-21" fill="#F2B4A0" stroke="#111" strokeWidth="1" />
          <TouristFrontHead transform="translate(0, -40)" />
          <polygon points="-5,-26 -4,-22 -3,-26 -4,-29" fill="#4A7AB0" opacity="0.9" />
          <polygon points="3,-26 4,-22 5,-26 4,-29" fill="#4A7AB0" opacity="0.9" />
          <polygon points="-6,-18 -5,-14 -4,-18 -5,-21" fill="#4A7AB0" opacity="0.7" />
          <polygon points="4,-18 5,-14 6,-18 5,-21" fill="#4A7AB0" opacity="0.7" />
        </g>
      )}

      {/* Running */}
      {viewState === 'running' && (
        <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`}>
          <polygon points="-10,28 24,28 28,32 -14,32" fill="rgba(0,0,0,0.2)" />
          <path d="M 5 5 L 20 14 L 30 20" stroke="#F2B4A0" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="26,18 38,18 38,22 26,22" fill="#4488BB" transform="rotate(-20, 32, 20)" />
          <g transform="rotate(-20)">
            <TouristBody />
          </g>
          <path d="M -5 0 L -15 -5 L -20 5" stroke="#F2B4A0" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-26,3 -14,3 -14,7 -26,7" fill="#4488BB" transform="rotate(15, -20, 5)" />
          <path d="M -2 -18 L 14 -10" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="12,-12 18,-8 16,-4 10,-8" fill="#F2B4A0" stroke="#111" strokeWidth="1" />
          <path d="M 4 -18 L -10 -28" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="-14,-30 -8,-26 -6,-30 -12,-34" fill="#F2B4A0" stroke="#111" strokeWidth="1" />
          <TouristSideHead transform="translate(6, -34) rotate(-12)" />
          <line x1="36" y1="-8" x2="50" y2="-10" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="38" y1="2" x2="56" y2="2" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36" y1="12" x2="50" y2="10" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* Front view (turning) */}
      {viewState === 'front' && (
        <g transform={`translate(${x}, ${y})`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          <path d="M -5 8 L -5 14" stroke="#F5D040" strokeWidth="6" strokeLinecap="square" fill="none" />
          <path d="M -5 14 L -5 22 L -8 26" stroke="#F2B4A0" strokeWidth="5" strokeLinecap="square" fill="none" />
          <path d="M 5 8 L 5 14" stroke="#F5D040" strokeWidth="6" strokeLinecap="square" fill="none" />
          <path d="M 5 14 L 5 22 L 8 26" stroke="#F2B4A0" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-14,25 -2,25 -2,29 -14,29" fill="#4488BB" />
          <polygon points="2,25 14,25 14,29 2,29" fill="#4488BB" />
          <polygon points="-10,-14 10,-14 10,8 -10,8" fill="#E85D20" stroke="#111" strokeWidth="2" />
          <line x1="0" y1="-14" x2="0" y2="8" stroke="#C84A10" strokeWidth="1.5" />
          <polygon points="-4,-14 0,-8 4,-14" fill="#F2B4A0" stroke="#111" strokeWidth="1" />
          {/* Leaf patterns */}
          <polygon points="-6,-6 -3,-8 0,-4 -3,-2" fill="#2AAA6A" opacity="0.7" />
          <polygon points="2,-4 5,-6 8,-2 5,0" fill="#2AAA6A" opacity="0.7" />
          <path d="M -10 -10 L -14 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <path d="M 10 -10 L 14 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="-16,2 -12,4 -10,8 -14,6" fill="#F2B4A0" stroke="#111" strokeWidth="1" />
          <polygon points="10,4 14,2 16,6 12,8" fill="#F2B4A0" stroke="#111" strokeWidth="1" />
          <TouristFrontHead transform="translate(0, -30)" />
        </g>
      )}

      {/* Side view (normal walking) */}
      {viewState === 'side' && (
        <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          <g ref={rightLegRef}>
            {/* Bermuda shorts */}
            <path d="M 3 8 L 5 14" stroke="#F5D040" strokeWidth="6" strokeLinecap="square" fill="none" />
            {/* Bare legs */}
            <path d="M 5 14 L 5 20 L 8 26" stroke="#F2B4A0" strokeWidth="5" strokeLinecap="square" fill="none" />
            {/* Blue flip-flops */}
            <polygon points="2,25 14,25 14,29 2,29" fill="#4488BB" />
          </g>
          <TouristBody />
          <g ref={leftArmRef}>
            <path d="M -4 -10 L -10 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
            <polygon points="-12,2 -10,5 -8,2 -10,-1" fill="#F2B4A0" stroke="#111" strokeWidth="1" />
          </g>
          <g ref={leftLegRef}>
            <path d="M -3 8 L -5 14" stroke="#F5D040" strokeWidth="6" strokeLinecap="square" fill="none" />
            <path d="M -5 14 L -5 20 L -8 26" stroke="#F2B4A0" strokeWidth="5" strokeLinecap="square" fill="none" />
            <polygon points="-14,25 -2,25 -2,29 -14,29" fill="#4488BB" />
          </g>
          <g ref={rightArmRef}>
            <path d="M 6 -10 L 12 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
            <polygon points="10,2 12,5 14,2 12,-1" fill="#F2B4A0" stroke="#111" strokeWidth="1" />
          </g>
          <TouristSideHead transform="translate(4, -28)" />
        </g>
      )}
    </g>
  );
});
