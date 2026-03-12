import { memo, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { CharacterProps } from './SuitHuman';

type ViewState = 'side' | 'front' | 'shooting' | 'vomiting' | 'crying' | 'running';

// ---------------------------------------------------------------------------
// Chef cubist head helpers
// ---------------------------------------------------------------------------

function ChefSideHead({ transform }: { transform?: string }) {
  return (
    <g transform={transform}>
      {/* Head polygon — stockier profile */}
      <polygon points="-5,0 -3,-12 8,-14 15,-8 15,5 8,11 -3,9" fill="#D4A574" stroke="#111" strokeWidth="2" />
      {/* Shadow plane */}
      <polygon points="-5,0 -3,-12 3,-12 1,9 -3,9" fill="#A87848" />
      {/* Tall toque hat — angular cubist chef hat */}
      <polygon points="-6,-12 -4,-40 2,-44 10,-42 14,-38 12,-12" fill="#F5F0E0" stroke="#111" strokeWidth="2" />
      <polygon points="-4,-40 2,-44 10,-42 8,-38 0,-40" fill="#E8E0D0" stroke="#111" strokeWidth="1" />
      {/* Hat band */}
      <line x1="-6" y1="-12" x2="12" y2="-12" stroke="#111" strokeWidth="2" />
      {/* Ear */}
      <polygon points="-6,-2 -9,0 -6,4 -3,2" fill="#A87848" stroke="#111" strokeWidth="1" />
      {/* Eye — frontal almond on profile */}
      <polygon points="4,-8 8,-10 12,-7 8,-4" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
      <circle cx="8" cy="-7" r="2" fill="#111" />
      <circle cx="8.8" cy="-7.5" r="0.6" fill="#F5ECD7" />
      {/* Bushy cubist mustache */}
      <polygon points="10,0 18,-2 20,2 18,5 12,4 10,2" fill="#3A2010" stroke="#111" strokeWidth="1.5" />
      {/* Nose */}
      <polyline points="14,-6 19,-2 16,0" stroke="#A87848" strokeWidth="2" fill="none" strokeLinejoin="miter" />
      {/* Mouth (hidden behind mustache, just a hint) */}
      <line x1="13" y1="6" x2="17" y2="5" stroke="#8B1A1A" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function ChefFrontHead({ transform }: { transform?: string }) {
  return (
    <g transform={transform}>
      {/* Left plane */}
      <polygon points="0,-12 -11,-8 -11,9 0,11" fill="#A87848" stroke="#111" strokeWidth="2" />
      {/* Right plane */}
      <polygon points="0,-12 11,-10 11,9 0,11" fill="#D4A574" stroke="#111" strokeWidth="2" />
      {/* Toque front view */}
      <polygon points="-12,-12 -10,-38 0,-42 10,-38 12,-12" fill="#F5F0E0" stroke="#111" strokeWidth="2" />
      <polygon points="-10,-38 0,-42 10,-38 6,-36 -6,-36" fill="#E8E0D0" stroke="#111" strokeWidth="1" />
      <line x1="-12" y1="-12" x2="12" y2="-12" stroke="#111" strokeWidth="2" />
      {/* Left eye */}
      <polygon points="-8,-4 -4,-6 -2,-3 -6,-1" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
      <circle cx="-5" cy="-4" r="1.5" fill="#111" />
      {/* Right eye */}
      <polygon points="2,-6 6,-8 10,-5 6,-2" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
      <circle cx="6" cy="-5" r="1.5" fill="#111" />
      {/* Nose */}
      <polyline points="-1,-2 0,4 2,-2" stroke="#A87848" strokeWidth="1.5" fill="none" />
      {/* Big front mustache */}
      <polygon points="-8,4 -4,2 0,4 4,2 8,4 6,8 -6,8" fill="#3A2010" stroke="#111" strokeWidth="1.5" />
      {/* Mouth hint */}
      <line x1="-3" y1="9" x2="3" y2="9" stroke="#8B1A1A" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Chef body
// ---------------------------------------------------------------------------
function ChefBody() {
  return (
    <>
      {/* Wider double-breasted coat */}
      <polygon points="-8,-14 10,-14 12,10 -10,10" fill="#F0EDE5" stroke="#111" strokeWidth="2" />
      {/* Double-breast buttons left column */}
      <circle cx="-2" cy="-6" r="1.5" fill="#111" />
      <circle cx="-2" cy="0" r="1.5" fill="#111" />
      <circle cx="-2" cy="6" r="1.5" fill="#111" />
      {/* Double-breast buttons right column */}
      <circle cx="4" cy="-6" r="1.5" fill="#111" />
      <circle cx="4" cy="0" r="1.5" fill="#111" />
      <circle cx="4" cy="6" r="1.5" fill="#111" />
      {/* Tomato red neckerchief */}
      <polygon points="-4,-14 1,-6 6,-14" fill="#D4442A" stroke="#111" strokeWidth="1.5" />
      <polygon points="-1,-8 1,-6 3,-8 1,-14" fill="#B8361E" />
    </>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ChefHuman = memo(function ChefHuman({
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

  // Walking animation — stockier build, slightly slower stride
  useEffect(() => {
    if (!isPlaying || viewState !== 'side') return;
    if (!leftLegRef.current || !rightLegRef.current || !leftArmRef.current || !rightArmRef.current) return;

    gsap.set(leftLegRef.current, { rotation: 0, transformOrigin: '-3px 7px' });
    gsap.set(rightLegRef.current, { rotation: 0, transformOrigin: '3px 7px' });
    gsap.set(leftArmRef.current, { rotation: 0, transformOrigin: '-5px -10px' });
    gsap.set(rightArmRef.current, { rotation: 0, transformOrigin: '7px -10px' });

    const tl = gsap.timeline({ repeat: -1 });
    walkingTlRef.current = tl;

    const swingAngle = 15;
    const duration = 0.22;

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
      {/* Shooting — frying pan held up */}
      {viewState === 'shooting' && (
        <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          {/* Legs */}
          <path d="M 3 10 L 5 20 L 8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="2,25 14,25 14,29 2,29" fill="#3A2010" />
          <path d="M -3 10 L -5 20 L -8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-14,25 -2,25 -2,29 -14,29" fill="#3A2010" />
          <ChefBody />
          {/* Left arm holding up */}
          <path d="M -4 -10 L 2 -24" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <ChefSideHead transform="translate(4, -26) rotate(-10)" />
          {/* Right arm + frying pan */}
          <path d="M 6 -10 L 6 -28" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          {/* Frying pan */}
          <ellipse cx="6" cy="-36" rx="10" ry="4" fill="#555" stroke="#111" strokeWidth="2" />
          <rect x="4" y="-30" width="4" height="8" fill="#8B5E3C" stroke="#111" strokeWidth="1.5" />
          <polygon points="2,-28 6,-30 10,-28 8,-24 2,-24" fill="#D4A574" stroke="#111" strokeWidth="1" />
        </g>
      )}

      {/* Vomiting — food-shaped polygons */}
      {viewState === 'vomiting' && (
        <g transform={`translate(${x}, ${y})`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          <path d="M -5 10 L -8 22 L -10 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <path d="M 5 10 L 2 22 L 0 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-16,25 -4,25 -4,29 -16,29" fill="#3A2010" />
          <polygon points="-6,25 6,25 6,29 -6,29" fill="#3A2010" />
          <g transform="rotate(30)">
            <ChefBody />
          </g>
          <path d="M -5 -5 L 5 10" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <path d="M 10 -5 L 20 10" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <ChefSideHead transform="translate(16, -15) rotate(40)" />
          {/* Vomit: food-shaped angular polygons */}
          <g transform="translate(28, 2)">
            {/* Carrot shape */}
            <polygon points="-2,-4 4,-8 6,0 0,4" fill="#E87830" opacity="0.85" stroke="#111" strokeWidth="1" />
            {/* Tomato shape */}
            <polygon points="6,0 12,-4 16,0 14,6 8,6" fill="#D4442A" opacity="0.8" stroke="#111" strokeWidth="1" />
            {/* Fish shape */}
            <polygon points="-4,6 2,4 6,8 2,12 -4,10" fill="#AAC8D8" opacity="0.7" stroke="#111" strokeWidth="1" />
          </g>
        </g>
      )}

      {/* Crying */}
      {viewState === 'crying' && (
        <g transform={`translate(${x}, ${y})`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          <path d="M -5 10 L -5 22 L -8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <path d="M 5 10 L 5 22 L 8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-14,25 -2,25 -2,29 -14,29" fill="#3A2010" />
          <polygon points="2,25 14,25 14,29 2,29" fill="#3A2010" />
          <polygon points="-10,-14 10,-14 12,10 -12,10" fill="#F0EDE5" stroke="#111" strokeWidth="2" />
          <polygon points="-4,-14 1,-6 6,-14" fill="#D4442A" stroke="#111" strokeWidth="1.5" />
          {/* Arms up covering face */}
          <path d="M -8 -10 L -8 -24" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <path d="M 8 -10 L 8 -24" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="-10,-24 -8,-27 -6,-24 -8,-21" fill="#D4A574" stroke="#111" strokeWidth="1" />
          <polygon points="6,-24 8,-27 10,-24 8,-21" fill="#D4A574" stroke="#111" strokeWidth="1" />
          <ChefFrontHead transform="translate(0, -40)" />
          {/* Tears */}
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
          <path d="M 5 7 L 20 14 L 30 20" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="26,18 38,18 38,22 26,22" fill="#3A2010" transform="rotate(-20, 32, 20)" />
          <g transform="rotate(-20)">
            <ChefBody />
          </g>
          <path d="M -5 0 L -15 -5 L -20 5" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-26,3 -14,3 -14,7 -26,7" fill="#3A2010" transform="rotate(15, -20, 5)" />
          <path d="M -2 -18 L 14 -10" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="12,-12 18,-8 16,-4 10,-8" fill="#D4A574" stroke="#111" strokeWidth="1" />
          <path d="M 4 -18 L -10 -28" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="-14,-30 -8,-26 -6,-30 -12,-34" fill="#D4A574" stroke="#111" strokeWidth="1" />
          <ChefSideHead transform="translate(6, -34) rotate(-12)" />
          {/* Speed lines */}
          <line x1="36" y1="-8" x2="50" y2="-10" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="38" y1="2" x2="56" y2="2" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="36" y1="12" x2="50" y2="10" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {/* Front view (turning) */}
      {viewState === 'front' && (
        <g transform={`translate(${x}, ${y})`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          <path d="M -5 10 L -5 22 L -8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <path d="M 5 10 L 5 22 L 8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-14,25 -2,25 -2,29 -14,29" fill="#3A2010" />
          <polygon points="2,25 14,25 14,29 2,29" fill="#3A2010" />
          <polygon points="-12,-14 12,-14 12,10 -12,10" fill="#F0EDE5" stroke="#111" strokeWidth="2" />
          <line x1="0" y1="-14" x2="0" y2="10" stroke="#E0D8C8" strokeWidth="1.5" />
          <polygon points="-4,-14 0,-6 4,-14" fill="#D4442A" stroke="#111" strokeWidth="1.5" />
          {/* Buttons */}
          <circle cx="-3" cy="-4" r="1.5" fill="#111" />
          <circle cx="-3" cy="2" r="1.5" fill="#111" />
          <circle cx="3" cy="-4" r="1.5" fill="#111" />
          <circle cx="3" cy="2" r="1.5" fill="#111" />
          {/* Arms */}
          <path d="M -12 -10 L -16 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <path d="M 12 -10 L 16 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="-18,2 -14,4 -12,8 -16,6" fill="#D4A574" stroke="#111" strokeWidth="1" />
          <polygon points="12,4 16,2 18,6 14,8" fill="#D4A574" stroke="#111" strokeWidth="1" />
          <ChefFrontHead transform="translate(0, -30)" />
        </g>
      )}

      {/* Side view (normal walking) */}
      {viewState === 'side' && (
        <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          <g ref={rightLegRef}>
            <path d="M 3 10 L 5 20 L 8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
            <polygon points="2,25 14,25 14,29 2,29" fill="#3A2010" />
          </g>
          <ChefBody />
          <g ref={leftArmRef}>
            <path d="M -5 -10 L -11 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
            <polygon points="-13,2 -11,5 -9,2 -11,-1" fill="#D4A574" stroke="#111" strokeWidth="1" />
          </g>
          <g ref={leftLegRef}>
            <path d="M -3 10 L -5 20 L -8 26" stroke="#111" strokeWidth="5" strokeLinecap="square" fill="none" />
            <polygon points="-14,25 -2,25 -2,29 -14,29" fill="#3A2010" />
          </g>
          <g ref={rightArmRef}>
            <path d="M 7 -10 L 13 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
            <polygon points="11,2 13,5 15,2 13,-1" fill="#D4A574" stroke="#111" strokeWidth="1" />
          </g>
          <ChefSideHead transform="translate(4, -28)" />
        </g>
      )}
    </g>
  );
});
