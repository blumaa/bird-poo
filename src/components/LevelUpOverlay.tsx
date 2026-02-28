import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { VIEWBOX } from '../utils/constants';

interface LevelUpOverlayProps {
  level: number;
  onComplete: () => void;
}

// Generate drip positions once per component instance
function generateDrips() {
  return Array.from({ length: 8 }).map((_, i) => ({
    x: -80 + i * 20 + (i % 3) * 3, // Deterministic offset
    delay: (i % 5) * 0.1,           // Deterministic delay
  }));
}

export function LevelUpOverlay({ level, onComplete }: LevelUpOverlayProps) {
  const textRef = useRef<SVGTextElement>(null);
  const containerRef = useRef<SVGGElement>(null);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  // Generate drips once using useMemo
  const drips = useMemo(() => generateDrips(), []);

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        onCompleteRef.current();
      },
    });

    // Initial pop in
    tl.fromTo(
      containerRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1.2, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
    )
    // Settle
    .to(containerRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' })
    // Hold
    .to(containerRef.current, { duration: 1 })
    // Melt down and fade
    .to(containerRef.current, {
      y: 150,
      scaleY: 1.5,
      scaleX: 0.8,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.in',
    });

    return () => {
      tl.kill();
    };
  }, []); // No deps - uses refs for callbacks

  return (
    <g ref={containerRef} transform={`translate(${VIEWBOX.width / 2}, ${VIEWBOX.height / 2 - 50})`}>
      {/* Glow effect */}
      <defs>
        <filter id="levelGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="levelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFA500" />
          <stop offset="100%" stopColor="#FF6347" />
        </linearGradient>
      </defs>

      {/* Background burst */}
      <circle cx="0" cy="0" r="80" fill="#FFD700" opacity="0.3" />
      <circle cx="0" cy="0" r="60" fill="#FFA500" opacity="0.3" />

      {/* Main text */}
      <text
        ref={textRef}
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="48"
        fontWeight="bold"
        fontFamily="sans-serif"
        fill="url(#levelGradient)"
        stroke="#8B4513"
        strokeWidth="2"
        filter="url(#levelGlow)"
      >
        LEVEL {level}!
      </text>

      {/* Subtitle */}
      <text
        x="0"
        y="35"
        textAnchor="middle"
        fontSize="16"
        fontFamily="sans-serif"
        fill="#fff"
        stroke="#333"
        strokeWidth="0.5"
      >
        Keep it up!
      </text>

      {/* Drip effects */}
      {drips.map((drip, i) => (
        <Drip key={i} x={drip.x} delay={drip.delay} />
      ))}
    </g>
  );
}

function Drip({ x, delay }: { x: number; delay: number }) {
  const dripRef = useRef<SVGEllipseElement>(null);

  useEffect(() => {
    if (!dripRef.current) return;

    const tl = gsap.timeline({ delay: 0.5 + delay });

    tl.fromTo(
      dripRef.current,
      { y: 20, scaleY: 0, opacity: 1 },
      { y: 100, scaleY: 3, opacity: 0, duration: 1, ease: 'power2.in' }
    );

    return () => {
      tl.kill();
    };
  }, [delay]);

  return (
    <ellipse
      ref={dripRef}
      cx={x}
      cy={20}
      rx="4"
      ry="8"
      fill="url(#levelGradient)"
      opacity="0.8"
    />
  );
}
