import { VIEWBOX } from '../utils/constants';
import { Bird } from './Bird';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <g>
      <rect x="0" y="0" width={VIEWBOX.width} height={VIEWBOX.height} fill="#87CEEB" />

      <text
        x={VIEWBOX.width / 2}
        y="150"
        textAnchor="middle"
        fontSize="56"
        fontWeight="bold"
        fill="#8B4513"
        fontFamily="sans-serif"
      >
        Bird Poo
      </text>

      <text
        x={VIEWBOX.width / 2}
        y="200"
        textAnchor="middle"
        fontSize="16"
        fill="#333"
        fontFamily="sans-serif"
      >
        You are the bird! Poop on the humans!
      </text>

      {/* Bird preview - uses actual Bird component */}
      <Bird x={VIEWBOX.width / 2} y={VIEWBOX.height / 2} direction="right" isPlaying={true} />

      <g onClick={onStart} style={{ cursor: 'pointer' }}>
        <rect
          x={VIEWBOX.width / 2 - 80}
          y="380"
          width="160"
          height="60"
          rx="12"
          fill="#4CAF50"
          stroke="#2E7D32"
          strokeWidth="3"
        />
        <text
          x={VIEWBOX.width / 2}
          y="420"
          textAnchor="middle"
          fontSize="24"
          fontWeight="bold"
          fill="#fff"
          fontFamily="sans-serif"
        >
          START
        </text>
      </g>

      <text
        x={VIEWBOX.width / 2}
        y="480"
        textAnchor="middle"
        fontSize="12"
        fill="#666"
        fontFamily="sans-serif"
      >
        Arrow keys to fly, SPACE to poop!
      </text>
      <text
        x={VIEWBOX.width / 2}
        y="500"
        textAnchor="middle"
        fontSize="12"
        fill="#666"
        fontFamily="sans-serif"
      >
        Mobile: Tap left/right to move, center to poop
      </text>
    </g>
  );
}
