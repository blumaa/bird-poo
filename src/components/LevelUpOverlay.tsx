import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { VIEWBOX } from '../utils/constants';

interface LevelUpOverlayProps {
  level: number;
  onComplete: () => void;
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

/** Build a starburst polygon path with `points` outer spikes.
 *  Each spike alternates between outerR and innerR. */
function starburstPath(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  const total = points * 2;
  const coords: string[] = [];

  for (let i = 0; i < total; i++) {
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    coords.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return coords.join(' ') + ' Z';
}

/** Build an SVG path for a rounded rectangle. */
function roundedRect(x: number, y: number, w: number, h: number, r: number): string {
  return [
    `M${x + r},${y}`,
    `L${x + w - r},${y}`,
    `Q${x + w},${y} ${x + w},${y + r}`,
    `L${x + w},${y + h - r}`,
    `Q${x + w},${y + h} ${x + w - r},${y + h}`,
    `L${x + r},${y + h}`,
    `Q${x},${y + h} ${x},${y + h - r}`,
    `L${x},${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    'Z',
  ].join(' ');
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A single five-pointed star centered at (cx, cy). */
function CartoonStar({ cx, cy, size }: { cx: number; cy: number; size: number }) {
  const path = starburstPath(cx, cy, size, size * 0.42, 5);
  return (
    <path
      d={path}
      fill="#F5C518"
      stroke="#1A1A1A"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function LevelUpOverlay({ level, onComplete }: LevelUpOverlayProps) {
  const containerRef = useRef<SVGGElement>(null);
  const onCompleteRef = useRef(onComplete);

  onCompleteRef.current = onComplete;

  // Preserved animation timeline — identical to original
  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        onCompleteRef.current();
      },
    });

    tl.fromTo(
      containerRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1.2, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' }
    )
      .to(containerRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' })
      .to(containerRef.current, { duration: 1 })
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
  }, []);

  // Layout constants — all relative to the local (0,0) origin of the <g>
  const burstOuterR = 115;
  const burstInnerR = 82;
  const burstPoints = 16;

  const panelW = 200;
  const panelH = 90;
  const panelX = -(panelW / 2);
  const panelY = -panelH / 2 + 4;
  const panelRadius = 14;

  // Star row geometry
  const starRowY = -panelH / 2 - 16;
  const starSpacing = 28;
  const starCount = 5;
  const starOffsets = Array.from({ length: starCount }, (_, i) => (i - 2) * starSpacing);

  // Shadow offset for the panel
  const shadowOffset = 5;

  return (
    <g
      ref={containerRef}
      transform={`translate(${VIEWBOX.width / 2}, ${VIEWBOX.height / 2 - 50})`}
    >
      {/* ------------------------------------------------------------------
          Layer 1: 16-point starburst background
      ------------------------------------------------------------------ */}
      <path
        d={starburstPath(0, 0, burstOuterR, burstInnerR, burstPoints)}
        fill="#F5C518"
        stroke="#1A1A1A"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Inner starburst accent ring — slightly smaller, navy fill */}
      <path
        d={starburstPath(0, 0, burstInnerR - 10, burstInnerR - 28, burstPoints)}
        fill="#1B2A4A"
        stroke="#1A1A1A"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* ------------------------------------------------------------------
          Layer 2: Stars row above panel
      ------------------------------------------------------------------ */}
      {starOffsets.map((dx, i) => (
        <CartoonStar key={i} cx={dx} cy={starRowY} size={10} />
      ))}

      {/* ------------------------------------------------------------------
          Layer 3: Panel drop-shadow (coral, offset)
      ------------------------------------------------------------------ */}
      <path
        d={roundedRect(panelX + shadowOffset, panelY + shadowOffset, panelW, panelH, panelRadius)}
        fill="#1A1A1A"
      />

      {/* ------------------------------------------------------------------
          Layer 4: Main panel — coral fill, bold black outline
      ------------------------------------------------------------------ */}
      <path
        d={roundedRect(panelX, panelY, panelW, panelH, panelRadius)}
        fill="#F4603A"
        stroke="#1A1A1A"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* ------------------------------------------------------------------
          Layer 5: Text — "LEVEL UP!"
          paintOrder="stroke" renders the thick stroke behind the fill
          so the gold fill stays fully visible.
      ------------------------------------------------------------------ */}
      <text
        x="0"
        y="-8"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="38"
        fontFamily="Impact, Arial Black, sans-serif"
        fontWeight="900"
        fill="#F5C518"
        stroke="#1A1A1A"
        strokeWidth="5"
        strokeLinejoin="round"
        paintOrder="stroke"
        letterSpacing="2"
      >
        LEVEL UP!
      </text>

      {/* ------------------------------------------------------------------
          Layer 6: Text — "LEVEL {level}" subtitle
      ------------------------------------------------------------------ */}
      <text
        x="0"
        y="28"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="22"
        fontFamily="Impact, Arial Black, sans-serif"
        fontWeight="900"
        fill="#F5E6C8"
        stroke="#1A1A1A"
        strokeWidth="4"
        strokeLinejoin="round"
        paintOrder="stroke"
        letterSpacing="3"
      >
        LEVEL {level}
      </text>

      {/* ------------------------------------------------------------------
          Layer 7: Stars row below panel
      ------------------------------------------------------------------ */}
      {starOffsets.map((dx, i) => (
        <CartoonStar key={i} cx={dx} cy={panelY + panelH + 18} size={10} />
      ))}
    </g>
  );
}
