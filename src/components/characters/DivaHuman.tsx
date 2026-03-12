import { memo, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { CharacterProps } from './SuitHuman';

type ViewState = 'side' | 'front' | 'shooting' | 'vomiting' | 'crying' | 'running';

// ---------------------------------------------------------------------------
// Diva cubist head helpers
// ---------------------------------------------------------------------------

function DivaSideHead({ transform }: { transform?: string }) {
  return (
    <g transform={transform}>
      {/* Head polygon — narrower, more angular */}
      <polygon points="-4,0 -2,-12 7,-14 13,-8 13,4 7,10 -2,8" fill="#E8C49A" stroke="#111" strokeWidth="2" />
      {/* Shadow plane */}
      <polygon points="-4,0 -2,-12 3,-12 1,8 -2,8" fill="#C4975C" />
      {/* Dramatic upswept bouffant hair — stacked angular polygons */}
      <polygon points="-6,-10 -4,-28 6,-32 12,-26 10,-10" fill="#1A0A2E" stroke="#111" strokeWidth="2" />
      <polygon points="-2,-26 6,-32 12,-26 8,-22" fill="#4A2068" stroke="#111" strokeWidth="1" />
      <polygon points="-4,-18 -2,-28 4,-24 2,-16" fill="#4A2068" opacity="0.7" />
      {/* Ear */}
      <polygon points="-5,-2 -8,0 -5,4 -2,2" fill="#C4975C" stroke="#111" strokeWidth="1" />
      {/* Eye with eye shadow */}
      <polygon points="3,-9 5,-11 7,-10" fill="#4A2068" opacity="0.6" />
      <polygon points="3,-8 7,-10 11,-7 7,-4" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
      <circle cx="7" cy="-7" r="2" fill="#111" />
      <circle cx="7.8" cy="-7.5" r="0.6" fill="#F5ECD7" />
      {/* Beauty mark */}
      <circle cx="10" cy="-4" r="0.8" fill="#111" />
      {/* Nose */}
      <polyline points="13,-6 16,-2 14,0" stroke="#C4975C" strokeWidth="1.5" fill="none" strokeLinejoin="miter" />
      {/* Bold lips */}
      <polygon points="10,3 14,2 16,4 14,6 10,5" fill="#CC2244" stroke="#111" strokeWidth="1" />
      {/* Pearl necklace */}
      <circle cx="2" cy="8" r="1.5" fill="#F5F0E0" stroke="#CCC" strokeWidth="0.5" />
      <circle cx="6" cy="9" r="1.5" fill="#F5F0E0" stroke="#CCC" strokeWidth="0.5" />
      <circle cx="10" cy="8" r="1.5" fill="#F5F0E0" stroke="#CCC" strokeWidth="0.5" />
    </g>
  );
}

function DivaFrontHead({ transform }: { transform?: string }) {
  return (
    <g transform={transform}>
      {/* Left plane */}
      <polygon points="0,-12 -9,-8 -9,8 0,10" fill="#C4975C" stroke="#111" strokeWidth="2" />
      {/* Right plane */}
      <polygon points="0,-12 9,-10 9,8 0,10" fill="#E8C49A" stroke="#111" strokeWidth="2" />
      {/* Bouffant front view */}
      <polygon points="-10,-10 -8,-30 0,-34 8,-30 10,-10" fill="#1A0A2E" stroke="#111" strokeWidth="2" />
      <polygon points="-6,-28 0,-34 8,-30 4,-26" fill="#4A2068" stroke="#111" strokeWidth="1" />
      {/* Eye shadow + eyes */}
      <polygon points="-8,-5 -5,-7 -3,-5" fill="#4A2068" opacity="0.6" />
      <polygon points="-8,-4 -4,-6 -2,-3 -6,-1" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
      <circle cx="-5" cy="-4" r="1.5" fill="#111" />
      <polygon points="2,-7 5,-9 7,-6" fill="#4A2068" opacity="0.6" />
      <polygon points="2,-6 6,-8 10,-5 6,-2" fill="#F5ECD7" stroke="#111" strokeWidth="1.5" />
      <circle cx="6" cy="-5" r="1.5" fill="#111" />
      {/* Beauty mark */}
      <circle cx="8" cy="-2" r="0.8" fill="#111" />
      {/* Nose */}
      <polyline points="-1,-2 0,3 2,-2" stroke="#C4975C" strokeWidth="1.5" fill="none" />
      {/* Bold lips */}
      <polygon points="-4,6 -1,5 0,7 1,5 4,6 2,9 -2,9" fill="#CC2244" stroke="#111" strokeWidth="1" />
      {/* Pearl necklace */}
      <circle cx="-4" cy="10" r="1.5" fill="#F5F0E0" stroke="#CCC" strokeWidth="0.5" />
      <circle cx="0" cy="11" r="1.5" fill="#F5F0E0" stroke="#CCC" strokeWidth="0.5" />
      <circle cx="4" cy="10" r="1.5" fill="#F5F0E0" stroke="#CCC" strokeWidth="0.5" />
    </g>
  );
}

// ---------------------------------------------------------------------------
// Diva body — burgundy gown with A-line silhouette
// ---------------------------------------------------------------------------
function DivaBody() {
  return (
    <>
      {/* Bodice — tighter trapezoid */}
      <polygon points="-6,-14 8,-14 10,2 -8,2" fill="#8B1A4A" stroke="#111" strokeWidth="2" />
      {/* Draped neckline accent */}
      <polygon points="-3,-14 1,-8 5,-14" fill="#D4447C" stroke="#111" strokeWidth="1" />
      {/* Shadow panel */}
      <polygon points="-6,-14 -2,-14 -4,2 -8,2" fill="#5C0E32" />
    </>
  );
}

function DivaDress() {
  return (
    <>
      {/* A-line skirt — wide trapezoid */}
      <polygon points="-8,2 10,2 16,26 -14,26" fill="#8B1A4A" stroke="#111" strokeWidth="2" />
      {/* Side shadow panel */}
      <polygon points="-8,2 -4,2 -10,26 -14,26" fill="#5C0E32" />
      {/* Highlight slash across hip */}
      <polygon points="2,6 8,4 10,10 4,12" fill="#D4447C" opacity="0.7" />
    </>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const DivaHuman = memo(function DivaHuman({
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

  // Walking animation — elegant sway, dress hides leg motion but arms swing
  useEffect(() => {
    if (!isPlaying || viewState !== 'side') return;
    if (!leftLegRef.current || !rightLegRef.current || !leftArmRef.current || !rightArmRef.current) return;

    gsap.set(leftLegRef.current, { rotation: 0, transformOrigin: '-3px 2px' });
    gsap.set(rightLegRef.current, { rotation: 0, transformOrigin: '3px 2px' });
    gsap.set(leftArmRef.current, { rotation: 0, transformOrigin: '-4px -10px' });
    gsap.set(rightArmRef.current, { rotation: 0, transformOrigin: '6px -10px' });

    const tl = gsap.timeline({ repeat: -1 });
    walkingTlRef.current = tl;

    const swingAngle = 12; // Subtler leg swing (hidden by dress)
    const armSwing = 14;
    const duration = 0.20;

    tl.to(leftLegRef.current, { rotation: swingAngle, duration, ease: 'sine.inOut' }, 0)
      .to(rightLegRef.current, { rotation: -swingAngle, duration, ease: 'sine.inOut' }, 0)
      .to(leftArmRef.current, { rotation: armSwing, duration, ease: 'sine.inOut' }, 0)
      .to(rightArmRef.current, { rotation: -armSwing, duration, ease: 'sine.inOut' }, 0)
      .to(leftLegRef.current, { rotation: -swingAngle, duration, ease: 'sine.inOut' })
      .to(rightLegRef.current, { rotation: swingAngle, duration, ease: 'sine.inOut' }, '<')
      .to(leftArmRef.current, { rotation: -armSwing, duration, ease: 'sine.inOut' }, '<')
      .to(rightArmRef.current, { rotation: armSwing, duration, ease: 'sine.inOut' }, '<');

    return () => {
      tl.kill();
      walkingTlRef.current = null;
    };
  }, [isPlaying, viewState, currentDirection]);

  return (
    <g ref={shakeRef} style={{ opacity, transition: 'opacity 0.5s ease' }}>
      {/* Shooting — umbrella thrust upward */}
      {viewState === 'shooting' && (
        <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          {/* Dress covers legs in shooting pose */}
          <DivaDress />
          {/* Shoes peeking out */}
          <polygon points="-12,25 -4,25 -4,29 -12,29" fill="#8B1A4A" />
          <polygon points="4,25 12,25 12,29 4,29" fill="#8B1A4A" />
          <DivaBody />
          {/* Left arm — dramatic back of hand to forehead */}
          <path d="M -4 -10 L -6 -22" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="-8,-22 -4,-24 -2,-20 -6,-18" fill="#111" />
          <DivaSideHead transform="translate(4, -26) rotate(-10)" />
          {/* Right arm + umbrella thrust upward */}
          <path d="M 6 -10 L 6 -28" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          {/* Opera glove on hand */}
          <polygon points="2,-28 6,-30 10,-28 8,-24 2,-24" fill="#111" stroke="#111" strokeWidth="1" />
          {/* Closed umbrella */}
          <line x1="6" y1="-28" x2="6" y2="-52" stroke="#6B3FA0" strokeWidth="2.5" />
          <polygon points="4,-52 6,-56 8,-52" fill="#6B3FA0" stroke="#111" strokeWidth="1" />
          {/* Crook handle */}
          <path d="M 4,-28 Q 2,-30 4,-32" stroke="#C4975C" strokeWidth="2" fill="none" />
        </g>
      )}

      {/* Vomiting — musical notes and rose petals */}
      {viewState === 'vomiting' && (
        <g transform={`translate(${x}, ${y})`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          {/* Dress in vomit pose */}
          <polygon points="-10,10 8,10 14,26 -16,26" fill="#8B1A4A" stroke="#111" strokeWidth="2" />
          <polygon points="-12,25 -4,25 -4,29 -12,29" fill="#8B1A4A" />
          <polygon points="-4,25 6,25 6,29 -4,29" fill="#8B1A4A" />
          <g transform="rotate(30)">
            <DivaBody />
          </g>
          <path d="M -5 -5 L 5 10" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="3,8 7,10 5,14 1,12" fill="#111" />
          <path d="M 10 -5 L 20 10" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="18,8 22,10 20,14 16,12" fill="#111" />
          <DivaSideHead transform="translate(16, -15) rotate(40)" />
          {/* Musical notes and petals vomit */}
          <g transform="translate(28, 2)">
            {/* Musical note — eighth note */}
            <circle cx="-2" cy="2" r="2.5" fill="#4A2068" stroke="#111" strokeWidth="1" />
            <line x1="0" y1="2" x2="0" y2="-8" stroke="#4A2068" strokeWidth="1.5" />
            <path d="M 0,-8 Q 4,-6 4,-4" stroke="#4A2068" strokeWidth="1.5" fill="none" />
            {/* Rose petal */}
            <polygon points="6,-4 12,-6 14,0 10,4" fill="#D4447C" opacity="0.8" stroke="#111" strokeWidth="1" />
            {/* Another note */}
            <circle cx="-4" cy="10" r="2" fill="#CC2244" opacity="0.7" stroke="#111" strokeWidth="1" />
            <line x1="-2" y1="10" x2="-2" y2="4" stroke="#CC2244" strokeWidth="1" opacity="0.7" />
            {/* Petal */}
            <polygon points="4,8 8,6 10,12 6,14" fill="#D4447C" opacity="0.6" />
          </g>
        </g>
      )}

      {/* Crying */}
      {viewState === 'crying' && (
        <g transform={`translate(${x}, ${y})`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          {/* Dress */}
          <polygon points="-10,8 10,8 16,26 -14,26" fill="#8B1A4A" stroke="#111" strokeWidth="2" />
          <polygon points="-10,8 -6,8 -12,26 -14,26" fill="#5C0E32" />
          <polygon points="-12,25 -4,25 -4,29 -12,29" fill="#8B1A4A" />
          <polygon points="4,25 12,25 12,29 4,29" fill="#8B1A4A" />
          {/* Bodice */}
          <polygon points="-8,-14 8,-14 10,8 -10,8" fill="#8B1A4A" stroke="#111" strokeWidth="2" />
          <polygon points="-3,-14 1,-8 5,-14" fill="#D4447C" stroke="#111" strokeWidth="1" />
          {/* Arms up — opera gloves covering face */}
          <path d="M -8 -10 L -8 -24" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <path d="M 8 -10 L 8 -24" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="-10,-24 -8,-27 -6,-24 -8,-21" fill="#111" stroke="#333" strokeWidth="0.5" />
          <polygon points="6,-24 8,-27 10,-24 8,-21" fill="#111" stroke="#333" strokeWidth="0.5" />
          <DivaFrontHead transform="translate(0, -40)" />
          {/* Tears */}
          <polygon points="-5,-26 -4,-22 -3,-26 -4,-29" fill="#5BA8C8" opacity="0.9" />
          <polygon points="3,-26 4,-22 5,-26 4,-29" fill="#5BA8C8" opacity="0.9" />
          <polygon points="-6,-18 -5,-14 -4,-18 -5,-21" fill="#5BA8C8" opacity="0.7" />
          <polygon points="4,-18 5,-14 6,-18 5,-21" fill="#5BA8C8" opacity="0.7" />
        </g>
      )}

      {/* Running — dress hitches up, hair streams back */}
      {viewState === 'running' && (
        <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`}>
          <polygon points="-10,28 24,28 28,32 -14,32" fill="rgba(0,0,0,0.2)" />
          {/* Legs visible — dress hitched up */}
          <path d="M 5 5 L 20 14 L 30 20" stroke="#E8C49A" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="26,18 38,18 38,22 26,22" fill="#8B1A4A" transform="rotate(-20, 32, 20)" />
          {/* Hitched dress */}
          <polygon points="-8,2 10,2 14,16 -10,16" fill="#8B1A4A" stroke="#111" strokeWidth="2" />
          <polygon points="-8,2 -4,2 -8,16 -10,16" fill="#5C0E32" />
          <g transform="rotate(-20)">
            <DivaBody />
          </g>
          <path d="M -5 0 L -15 -5 L -20 5" stroke="#E8C49A" strokeWidth="5" strokeLinecap="square" fill="none" />
          <polygon points="-26,3 -14,3 -14,7 -26,7" fill="#8B1A4A" transform="rotate(15, -20, 5)" />
          {/* Arms with opera gloves */}
          <path d="M -2 -18 L 14 -10" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="12,-12 18,-8 16,-4 10,-8" fill="#111" stroke="#333" strokeWidth="0.5" />
          <path d="M 4 -18 L -10 -28" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="-14,-30 -8,-26 -6,-30 -12,-34" fill="#111" stroke="#333" strokeWidth="0.5" />
          {/* Umbrella trailing behind */}
          <line x1="-12" y1="-28" x2="-30" y2="-22" stroke="#6B3FA0" strokeWidth="2" />
          <DivaSideHead transform="translate(6, -34) rotate(-12)" />
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
          {/* Full dress front */}
          <polygon points="-10,8 10,8 16,26 -16,26" fill="#8B1A4A" stroke="#111" strokeWidth="2" />
          <polygon points="-10,8 -6,8 -14,26 -16,26" fill="#5C0E32" />
          <polygon points="4,12 10,10 12,18 6,20" fill="#D4447C" opacity="0.7" />
          <polygon points="-12,25 -4,25 -4,29 -12,29" fill="#8B1A4A" />
          <polygon points="4,25 12,25 12,29 4,29" fill="#8B1A4A" />
          {/* Bodice front */}
          <polygon points="-10,-14 10,-14 10,8 -10,8" fill="#8B1A4A" stroke="#111" strokeWidth="2" />
          <line x1="0" y1="-14" x2="0" y2="8" stroke="#5C0E32" strokeWidth="1.5" />
          <polygon points="-4,-14 0,-8 4,-14" fill="#D4447C" stroke="#111" strokeWidth="1" />
          {/* Arms with opera gloves */}
          <path d="M -10 -10 L -14 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <path d="M 10 -10 L 14 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
          <polygon points="-16,2 -12,4 -10,8 -14,6" fill="#111" stroke="#333" strokeWidth="0.5" />
          <polygon points="10,4 14,2 16,6 12,8" fill="#111" stroke="#333" strokeWidth="0.5" />
          <DivaFrontHead transform="translate(0, -30)" />
        </g>
      )}

      {/* Side view (normal walking) */}
      {viewState === 'side' && (
        <g transform={`translate(${x}, ${y}) scale(${scaleX}, 1)`}>
          <polygon points="-14,28 14,28 18,32 -18,32" fill="rgba(0,0,0,0.2)" />
          {/* Dress hides legs but they still animate for subtle motion */}
          <g ref={rightLegRef}>
            {/* Shoe peek */}
            <polygon points="4,25 12,25 12,29 4,29" fill="#8B1A4A" />
          </g>
          {/* A-line dress */}
          <DivaDress />
          <DivaBody />
          {/* Left arm — opera glove */}
          <g ref={leftArmRef}>
            <path d="M -4 -10 L -10 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
            <polygon points="-12,2 -10,5 -8,2 -10,-1" fill="#111" stroke="#333" strokeWidth="0.5" />
          </g>
          <g ref={leftLegRef}>
            {/* Shoe peek */}
            <polygon points="-12,25 -4,25 -4,29 -12,29" fill="#8B1A4A" />
          </g>
          {/* Right arm — opera glove, holding umbrella down like a cane */}
          <g ref={rightArmRef}>
            <path d="M 6 -10 L 12 4" stroke="#111" strokeWidth="4" strokeLinecap="square" fill="none" />
            <polygon points="10,2 12,5 14,2 12,-1" fill="#111" stroke="#333" strokeWidth="0.5" />
            {/* Umbrella as walking cane */}
            <line x1="12" y1="2" x2="14" y2="24" stroke="#6B3FA0" strokeWidth="2" />
            <path d="M 10,2 Q 8,0 10,-2" stroke="#C4975C" strokeWidth="1.5" fill="none" />
          </g>
          <DivaSideHead transform="translate(4, -28)" />
        </g>
      )}
    </g>
  );
});
