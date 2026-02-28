import { VIEWBOX } from '../utils/constants';

interface GameOverOverlayProps {
  score: number;
  level: number;
  onRestart: () => void;
}

export function GameOverOverlay({ score, level, onRestart }: GameOverOverlayProps) {
  return (
    <g>
      <rect
        x="0"
        y="0"
        width={VIEWBOX.width}
        height={VIEWBOX.height}
        fill="rgba(0, 0, 0, 0.7)"
      />

      <rect
        x={VIEWBOX.width / 2 - 120}
        y={VIEWBOX.height / 2 - 120}
        width="240"
        height="240"
        rx="15"
        fill="#fff"
        stroke="#333"
        strokeWidth="3"
      />

      <text
        x={VIEWBOX.width / 2}
        y={VIEWBOX.height / 2 - 70}
        textAnchor="middle"
        fontSize="32"
        fontWeight="bold"
        fill="#E74C3C"
        fontFamily="sans-serif"
      >
        Game Over
      </text>

      <text
        x={VIEWBOX.width / 2}
        y={VIEWBOX.height / 2 - 20}
        textAnchor="middle"
        fontSize="18"
        fill="#333"
        fontFamily="sans-serif"
      >
        Final Score: {score}
      </text>

      <text
        x={VIEWBOX.width / 2}
        y={VIEWBOX.height / 2 + 10}
        textAnchor="middle"
        fontSize="16"
        fill="#666"
        fontFamily="sans-serif"
      >
        Level Reached: {level}
      </text>

      <g onClick={onRestart} style={{ cursor: 'pointer' }}>
        <rect
          x={VIEWBOX.width / 2 - 70}
          y={VIEWBOX.height / 2 + 40}
          width="140"
          height="50"
          rx="10"
          fill="#4CAF50"
          stroke="#2E7D32"
          strokeWidth="2"
        />
        <text
          x={VIEWBOX.width / 2}
          y={VIEWBOX.height / 2 + 72}
          textAnchor="middle"
          fontSize="18"
          fontWeight="bold"
          fill="#fff"
          fontFamily="sans-serif"
        >
          Play Again
        </text>
      </g>
    </g>
  );
}
