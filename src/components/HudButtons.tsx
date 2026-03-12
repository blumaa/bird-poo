import { useRef, useEffect } from 'react';

interface HudButtonsProps {
  onShowScores: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
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

function SpeakerIcon({ x, y, muted }: { x: number; y: number; muted: boolean }) {
  const cx = x + W / 2;
  const cy = y + H / 2;
  return (
    <g>
      {/* Speaker body */}
      <polygon
        points={`${cx - 6},${cy - 3} ${cx - 2},${cy - 3} ${cx + 3},${cy - 7} ${cx + 3},${cy + 7} ${cx - 2},${cy + 3} ${cx - 6},${cy + 3}`}
        fill="#F5E6C8"
      />
      {muted ? (
        /* X mark when muted */
        <>
          <line x1={cx + 5} y1={cy - 4} x2={cx + 11} y2={cy + 4} stroke="#F5E6C8" strokeWidth="2.5" strokeLinecap="round" />
          <line x1={cx + 11} y1={cy - 4} x2={cx + 5} y2={cy + 4} stroke="#F5E6C8" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : (
        /* Sound waves */
        <>
          <path d={`M ${cx + 5},${cy - 3} Q ${cx + 8},${cy} ${cx + 5},${cy + 3}`} stroke="#F5E6C8" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d={`M ${cx + 8},${cy - 5} Q ${cx + 12},${cy} ${cx + 8},${cy + 5}`} stroke="#F5E6C8" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
    </g>
  );
}

export function HudButtons({ onShowScores, onToggleMute, isMuted, viewBoxHeight }: HudButtonsProps) {
  const scoresRef = useRef<SVGGElement>(null);
  const muteRef = useRef<SVGGElement>(null);
  const onShowScoresRef = useRef(onShowScores);
  const onToggleMuteRef = useRef(onToggleMute);
  onShowScoresRef.current = onShowScores;
  onToggleMuteRef.current = onToggleMute;

  const extraBottom = (viewBoxHeight - 600) / 2;
  const y = 600 + extraBottom - 40;
  const muteX = 8 + W + 8; // position mute button next to scores button

  useEffect(() => {
    const scoresEl = scoresRef.current;
    const muteEl = muteRef.current;
    if (!scoresEl || !muteEl) return;

    const scoresHandler = (e: TouchEvent) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
      onShowScoresRef.current();
    };

    const muteHandler = (e: TouchEvent) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
      onToggleMuteRef.current();
    };

    scoresEl.addEventListener('touchstart', scoresHandler, { passive: false });
    muteEl.addEventListener('touchstart', muteHandler, { passive: false });
    return () => {
      scoresEl.removeEventListener('touchstart', scoresHandler);
      muteEl.removeEventListener('touchstart', muteHandler);
    };
  }, []);

  return (
    <>
      {/* Scores button */}
      <g
        ref={scoresRef}
        data-hud-button
        onClick={onShowScores}
        style={{ cursor: 'pointer' }}
      >
        <rect x={11} y={y + 3} width={W} height={H} rx={R} fill="#1A1A1A" />
        <rect x={8} y={y} width={W} height={H} rx={R} fill="#0D5C55" stroke="#1A1A1A" strokeWidth="2" />
        <StarIcon x={8} y={y} />
      </g>

      {/* Mute button */}
      <g
        ref={muteRef}
        data-hud-button
        onClick={onToggleMute}
        style={{ cursor: 'pointer' }}
      >
        <rect x={muteX + 3} y={y + 3} width={W} height={H} rx={R} fill="#1A1A1A" />
        <rect x={muteX} y={y} width={W} height={H} rx={R} fill={isMuted ? '#8B1A1A' : '#0D5C55'} stroke="#1A1A1A" strokeWidth="2" />
        <SpeakerIcon x={muteX} y={y} muted={isMuted} />
      </g>
    </>
  );
}
