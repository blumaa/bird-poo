import { VIEWBOX } from '../utils/constants';
import { Bird } from './Bird';

interface StartScreenProps {
  onStart: () => void;
  viewBoxHeight?: number;
}

export function StartScreen({ onStart, viewBoxHeight = VIEWBOX.height }: StartScreenProps) {
  const cx = VIEWBOX.width / 2;
  const extraTop = (viewBoxHeight - VIEWBOX.height) / 2;

  return (
    <g>
      {/* === Deep teal background === */}
      <rect x="0" y={-extraTop} width={VIEWBOX.width} height={viewBoxHeight} fill="#0D3B38" />


      {/* === Ben-Day dot band behind title area === */}
      <defs>
        <pattern id="benday-title" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#0D5C55" />
          <circle cx="7" cy="7" r="4" fill="#F5E6C8" />
        </pattern>
      </defs>
      <rect x="6" y="90" width={VIEWBOX.width - 12} height="110" fill="url(#benday-title)" />
      {/* Top border of dot band */}
      <line x1="6" y1="90" x2={VIEWBOX.width - 6} y2="90" stroke="#1A1A1A" strokeWidth="2.5" />
      {/* Bottom border of dot band */}
      <line x1="6" y1="200" x2={VIEWBOX.width - 6} y2="200" stroke="#1A1A1A" strokeWidth="2.5" />

      {/* === "BIRD POO" title === */}
      <text
        x={cx}
        y="158"
        textAnchor="middle"
        fontSize="64"
        fontFamily="Impact, 'Arial Black', sans-serif"
        fontWeight="bold"
        fill="#F5C518"
        stroke="#1A1A1A"
        strokeWidth="3.5"
        paintOrder="stroke"
        letterSpacing="4"
      >
        BIRD POO
      </text>

      {/* === Speech bubble for subtitle === */}
      {/* Bubble body */}
      <rect
        x={cx - 120}
        y="210"
        width="240"
        height="38"
        rx="6"
        ry="6"
        fill="#F4603A"
        stroke="#1A1A1A"
        strokeWidth="2.5"
      />
      {/* Bubble tail — pointing down toward bird */}
      <polygon
        points={`${cx - 10},248 ${cx + 10},248 ${cx},266`}
        fill="#F4603A"
        stroke="#1A1A1A"
        strokeWidth="2.5"
      />
      {/* Cover the bubble-border where the tail meets the body */}
      <line
        x1={cx - 9} y1="248"
        x2={cx + 9} y2="248"
        stroke="#F4603A"
        strokeWidth="3"
      />
      {/* Subtitle text inside bubble */}
      <text
        x={cx}
        y="236"
        textAnchor="middle"
        fontSize="15"
        fontFamily="Impact, 'Arial Black', sans-serif"
        fontWeight="bold"
        fill="#F5E6C8"
        letterSpacing="1"
      >
        POOP ON THE HUMANS!
      </text>

      {/* === Bird preview — centered in the lower half === */}
      <Bird
        x={VIEWBOX.width / 2}
        y={VIEWBOX.height / 2}
        direction="right"
        isPlaying={true}
      />

      {/* === Control hints — above START button === */}
      <rect
        x={cx - 140}
        y="378"
        width="280"
        height="36"
        rx="6"
        fill="#1B2A4A"
        stroke="#F5E6C8"
        strokeWidth="1.5"
        opacity="0.85"
      />
      <text
        x={cx}
        y="402"
        textAnchor="middle"
        fontSize="13"
        fontFamily="Impact, 'Arial Black', sans-serif"
        fill="#F5C518"
        letterSpacing="1"
        className="controls-desktop"
      >
        Arrow keys to fly  •  SPACE to poop
      </text>
      <text
        x={cx}
        y="402"
        textAnchor="middle"
        fontSize="13"
        fontFamily="Impact, 'Arial Black', sans-serif"
        fill="#F5C518"
        letterSpacing="1"
        className="controls-touch"
      >
        Swipe to move  •  Tap to poop
      </text>

      {/* === START button === */}
      <g onClick={onStart} style={{ cursor: 'pointer' }}>
        {/* Hard shadow */}
        <rect
          x={cx - 78}
          y="448"
          width="160"
          height="52"
          fill="#1A1A1A"
        />
        {/* Button face */}
        <rect
          x={cx - 82}
          y="444"
          width="160"
          height="52"
          fill="#F5C518"
          stroke="#1A1A1A"
          strokeWidth="3"
        />
        <text
          x={cx - 2}
          y="478"
          textAnchor="middle"
          fontSize="26"
          fontFamily="Impact, 'Arial Black', sans-serif"
          fontWeight="bold"
          fill="#1A1A1A"
          letterSpacing="6"
        >
          START
        </text>
      </g>
    </g>
  );
}
