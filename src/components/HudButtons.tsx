import { useRef, useEffect } from 'react';

interface HudButtonsProps {
  onShowScores: () => void;
  viewBoxHeight: number;
}

const W = 42;
const H = 28;
const R = 4;

function StarIcon({ x, y }: { x: number; y: number }) {
  const cx = x + W / 2;
  const cy = y + H / 2;
  const points = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i * 72 - 90) * (Math.PI / 180);
    const innerAngle = ((i * 72 + 36) - 90) * (Math.PI / 180);
    points.push(`${cx + 7 * Math.cos(outerAngle)},${cy + 7 * Math.sin(outerAngle)}`);
    points.push(`${cx + 3 * Math.cos(innerAngle)},${cy + 3 * Math.sin(innerAngle)}`);
  }
  return <polygon points={points.join(' ')} fill="#F5E6C8" />;
}

export function HudButtons({ onShowScores, viewBoxHeight }: HudButtonsProps) {
  const ref = useRef<SVGGElement>(null);
  const onShowScoresRef = useRef(onShowScores);
  onShowScoresRef.current = onShowScores;

  const extraBottom = (viewBoxHeight - 600) / 2;
  const y = 600 + extraBottom - 40;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handler = (e: TouchEvent) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
      onShowScoresRef.current();
    };

    el.addEventListener('touchstart', handler, { passive: false });
    return () => el.removeEventListener('touchstart', handler);
  }, []);

  return (
    <g
      ref={ref}
      data-hud-button
      onClick={onShowScores}
      style={{ cursor: 'pointer' }}
    >
      {/* Hard shadow */}
      <rect x={11} y={y + 3} width={W} height={H} rx={R} fill="#1A1A1A" />
      {/* Button face */}
      <rect x={8} y={y} width={W} height={H} rx={R} fill="#0D5C55" stroke="#1A1A1A" strokeWidth="2" />
      {/* Icon */}
      <StarIcon x={8} y={y} />
    </g>
  );
}
