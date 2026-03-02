// SVG-native buttons — live inside the <svg> so they scale with the viewBox.
// Positioned in the bottom-left of the 400×600 viewBox.

interface HudButtonsProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onShowScores: () => void;
}

const W = 42;
const H = 28;
const Y = 560;
const R = 4; // corner radius

function SvgButton({
  x,
  y,
  label,
  bg,
  onClick,
}: {
  x: number;
  y: number;
  label: string;
  bg: string;
  onClick: () => void;
}) {
  const handleTouch = (e: React.TouchEvent) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <g
      onClick={onClick}
      onTouchEnd={handleTouch}
      style={{ cursor: 'pointer' }}
    >
      {/* Hard shadow */}
      <rect x={x + 3} y={y + 3} width={W} height={H} rx={R} fill="#1A1A1A" />
      {/* Button face */}
      <rect x={x} y={y} width={W} height={H} rx={R} fill={bg} stroke="#1A1A1A" strokeWidth="2" />
      {/* Label */}
      <text
        x={x + W / 2}
        y={y + H / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="14"
        fontFamily="Arial, sans-serif"
        fill="#F5E6C8"
      >
        {label}
      </text>
    </g>
  );
}

export function HudButtons({ isPaused, onPause, onResume, onShowScores }: HudButtonsProps) {
  return (
    <g>
      <SvgButton
        x={8}
        y={Y}
        label={isPaused ? '▶' : '⏸'}
        bg="#1B2A4A"
        onClick={isPaused ? onResume : onPause}
      />
      <SvgButton
        x={56}
        y={Y}
        label="★"
        bg="#0D5C55"
        onClick={onShowScores}
      />
    </g>
  );
}
